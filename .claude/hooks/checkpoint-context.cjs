/**
 * LMAS Checkpoint Context Injection Hook
 *
 * Fires on UserPromptSubmit — injects checkpoint summary into context.
 * Only injects ONCE per session (first prompt). Subsequent prompts skip.
 *
 * MULTI-PROJECT MODE (v2):
 * If projects/ directory exists, lists all available projects with brief
 * checkpoint summaries. The agent then asks the user which project to work on.
 * Project binding lives in the CONVERSATION CONTEXT (isolated per session),
 * NOT in the filesystem (shared). This prevents race conditions between
 * concurrent sessions working on different projects.
 *
 * LEGACY MODE:
 * If projects/ does not exist, reads docs/PROJECT-CHECKPOINT.md as before.
 *
 * Output goes to stdout — Claude Code includes it in the conversation context.
 */

const path = require('path');
const fs = require('fs');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

function main() {
  try {
    const projectDir = PROJECT_ROOT;
    const sessionMarker = path.join(projectDir, '.lmas', '.ctx-session');

    // Only inject once per session (check by PID-based marker)
    const sessionId = `${process.ppid}`;
    try {
      if (fs.existsSync(sessionMarker)) {
        const existing = fs.readFileSync(sessionMarker, 'utf8').trim();
        if (existing === sessionId) return;
      }
    } catch { /* proceed */ }

    // Mark session as injected
    try {
      const lmasDir = path.join(projectDir, '.lmas');
      if (!fs.existsSync(lmasDir)) fs.mkdirSync(lmasDir, { recursive: true });
      fs.writeFileSync(sessionMarker, sessionId);
    } catch { /* proceed anyway */ }

    // Detect multi-project mode
    const projectsDir = path.join(projectDir, 'projects');
    if (fs.existsSync(projectsDir) && hasSubProjects(projectsDir)) {
      const output = generateMultiProjectContext(projectsDir);
      if (output) process.stdout.write(output);
      return;
    }

    // Legacy: single checkpoint in docs/
    const checkpointPath = path.join(projectDir, 'docs', 'PROJECT-CHECKPOINT.md');
    if (!fs.existsSync(checkpointPath)) return;

    const content = fs.readFileSync(checkpointPath, 'utf8');
    if (!content || content.trim().length < 50) return;

    const summary = generateSummary(content);
    if (summary) process.stdout.write(summary);
  } catch { /* silent */ }
}

/**
 * Check if projects/ has at least one subdirectory with a checkpoint or .project.yaml
 */
function hasSubProjects(projectsDir) {
  try {
    const entries = fs.readdirSync(projectsDir);
    return entries.some(entry => {
      if (entry.startsWith('_') || entry.startsWith('.')) return false;
      const full = path.join(projectsDir, entry);
      if (!fs.statSync(full).isDirectory()) return false;
      return fs.existsSync(path.join(full, '.project.yaml')) ||
             fs.existsSync(path.join(full, 'PROJECT-CHECKPOINT.md'));
    });
  } catch { return false; }
}

/**
 * Multi-project mode: list all projects with brief checkpoint excerpts
 */
function generateMultiProjectContext(projectsDir) {
  const lines = [];
  lines.push('<multi-project-context>');
  lines.push('MODO MULTI-PROJETO ATIVO');
  lines.push('');
  lines.push('PROJETOS DISPONIVEIS:');

  try {
    const entries = fs.readdirSync(projectsDir).sort();
    let projectCount = 0;

    for (const entry of entries) {
      if (entry.startsWith('_') || entry.startsWith('.')) continue;
      const projDir = path.join(projectsDir, entry);
      if (!fs.statSync(projDir).isDirectory()) continue;

      // Read .project.yaml for name and code_path
      let name = entry;
      let codePath = '';
      let description = '';
      try {
        const yamlPath = path.join(projDir, '.project.yaml');
        if (fs.existsSync(yamlPath)) {
          const yaml = fs.readFileSync(yamlPath, 'utf8');
          const nameMatch = yaml.match(/^name:\s*"?(.+?)"?\s*$/m);
          const codeMatch = yaml.match(/^code_path:\s*"?(.+?)"?\s*$/m);
          const descMatch = yaml.match(/^description:\s*"?(.+?)"?\s*$/m);
          if (nameMatch) name = nameMatch[1];
          if (codeMatch) codePath = codeMatch[1];
          if (descMatch) description = descMatch[1];
        }
      } catch { /* skip */ }

      // Read checkpoint for active context (brief)
      let activeCtx = '';
      let storyCount = 0;
      try {
        const cpPath = path.join(projDir, 'PROJECT-CHECKPOINT.md');
        if (fs.existsSync(cpPath)) {
          const cp = fs.readFileSync(cpPath, 'utf8');
          // Count stories
          const storyMatches = cp.match(/\| .+? \| (Draft|Ready|InProgress|InReview|Done) \|/g);
          storyCount = storyMatches ? storyMatches.length : 0;
          // Get active context (first non-placeholder line)
          const ctxMatch = cp.match(/## Contexto Ativo\n+((?:(?!##).)+)/s);
          if (ctxMatch) {
            const ctx = ctxMatch[1].trim();
            if (!ctx.includes('(atualizado pelos agentes')) {
              activeCtx = ctx.split('\n')[0].trim().slice(0, 80);
            }
          }
        }
      } catch { /* skip */ }

      // Format project line
      let line = `- **${entry}**: ${name}`;
      if (storyCount > 0) line += ` (${storyCount} stories)`;
      if (codePath && codePath !== '.') line += ` [code: ${codePath}]`;
      if (activeCtx) line += ` — ${activeCtx}`;
      else if (description) line += ` — ${description}`;
      lines.push(line);
      projectCount++;
    }

    if (projectCount === 0) return null;

    lines.push('');
    lines.push('INSTRUCAO PARA O AGENTE:');
    lines.push('- Se o usuario JA mencionou qual projeto, use-o diretamente');
    lines.push('- Se NAO mencionou, pergunte: "Qual projeto? (lmas/clawin/i5x)"');
    lines.push('- Armazene o projeto ativo NO CONTEXTO desta conversa');
    lines.push('- Leia checkpoint de: projects/{projeto}/PROJECT-CHECKPOINT.md');
    lines.push('- Leia stories de: projects/{projeto}/stories/');
    lines.push('- Leia PRDs de: projects/{projeto}/prd/');
    lines.push('- Para codigo, use o code_path do .project.yaml');
    lines.push('</multi-project-context>');

    return lines.join('\n') + '\n';
  } catch { return null; }
}

/**
 * Legacy: single-project summary from docs/PROJECT-CHECKPOINT.md
 */
function generateSummary(content) {
  const lines = [];
  lines.push('<checkpoint-context>');

  const sections = {};
  let currentSection = '_header';
  for (const line of content.split('\n')) {
    const match = line.match(/^## (.+)$/);
    if (match) {
      currentSection = match[1].trim();
      sections[currentSection] = '';
    } else {
      sections[currentSection] = (sections[currentSection] || '') + line + '\n';
    }
  }

  const ctx = sections['Contexto Ativo']?.trim();
  if (ctx && !ctx.includes('(atualizado pelos agentes')) {
    lines.push('CONTEXTO ATIVO:');
    lines.push(...ctx.split('\n').filter(l => l.trim()).slice(0, 5));
  }

  const dec = sections['Decisoes Tomadas']?.trim();
  if (dec && !dec.includes('(atualizado pelos agentes')) {
    lines.push('');
    lines.push('DECISOES:');
    lines.push(...dec.split('\n').filter(l => l.trim()).slice(0, 5));
  }

  const next = sections['Proximos Passos']?.trim();
  if (next && !next.includes('(atualizado pelos agentes')) {
    lines.push('');
    lines.push('PROXIMOS PASSOS:');
    lines.push(...next.split('\n').filter(l => l.trim()).slice(0, 5));
  }

  const last = sections['Ultimo Trabalho Realizado']?.trim();
  if (last && !last.includes('(checkpoint criado automaticamente')) {
    lines.push('');
    lines.push('ULTIMO TRABALHO:');
    lines.push(...last.split('\n').filter(l => l.trim()).slice(0, 3));
  }

  const git = sections['Git Recente']?.trim();
  if (git) {
    lines.push('');
    lines.push('GIT:');
    lines.push(...git.split('\n').filter(l => l.trim()).slice(0, 3));
  }

  lines.push('</checkpoint-context>');
  if (lines.length <= 2) return null;
  return lines.join('\n') + '\n';
}

main();
