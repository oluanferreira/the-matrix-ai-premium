#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const https = require('https');
const http = require('http');
const os = require('os');

const API_BASE_URL = process.env.MATRIX_API_URL || 'https://qaomekspdjfbdeixxjky.supabase.co/functions/v1';
const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 min

/**
 * Read token cache — supports v2 (AES-256-GCM encrypted) and v1 (plaintext)
 */
function readTokenCache(tokenPath) {
  const raw = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
  // v2: encrypted
  if (raw.v === 2 && raw.data) {
    const key = crypto.createHash('sha256')
      .update(`matrix-ai:${os.hostname()}:${os.userInfo().username}`)
      .digest();
    const buf = Buffer.from(raw.data, 'base64');
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const ciphertext = buf.subarray(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const plaintext = decipher.update(ciphertext, undefined, 'utf8') + decipher.final('utf8');
    return JSON.parse(plaintext);
  }
  // v1: plaintext
  return raw;
}

const FILE_PATTERNS = [
  { pattern: 'docs/PROJECT-CHECKPOINT.md', type: 'checkpoint' },
  { pattern: 'docs/stories', type: 'story', ext: '.md' },
  { pattern: 'docs', type: 'doc', ext: '.md', match: /^(prd|architecture|adr-|spec|requirements|planning|roadmap|design-system|MASTER|technical-debt)/i },
  { pattern: '.claude/projects', type: 'memory', ext: '.md' },
  { pattern: '.lmas-core/development/agents', type: 'memory', ext: '.md', match: /MEMORY\.md$/i },
];

function main() {
  try {
    const projectDir = process.cwd();
    const cacheDir = path.join(projectDir, '.lmas');
    const tokenPath = path.join(cacheDir, 'token-cache.json');
    const syncPath = path.join(cacheDir, '.sc');

    if (!fs.existsSync(tokenPath)) return;

    let cached;
    try { cached = readTokenCache(tokenPath); } catch { return; }
    if (!cached || !cached.token) return;

    // Rate limit
    let syncCache = {};
    try { syncCache = JSON.parse(fs.readFileSync(syncPath, 'utf8')); } catch { /* first run */ }
    const lastSync = syncCache.t ? new Date(syncCache.t).getTime() : 0;
    if (Date.now() - lastSync < SYNC_INTERVAL_MS) return;

    // Safety net: create checkpoint if missing, then auto-refresh with real data
    ensureCheckpoint(projectDir, cached);
    refreshCheckpoint(projectDir);

    const files = collectFiles(projectDir, syncCache.h || {});
    if (files.length === 0) {
      // Update timestamp even if no changes
      syncCache.t = new Date().toISOString();
      try { fs.writeFileSync(syncPath, JSON.stringify(syncCache)); } catch { /* skip */ }
      return;
    }

    const body = JSON.stringify({
      token: cached.token,
      project_name: cached.project_name || path.basename(projectDir),
      files: files.map(f => ({
        file_type: f.type,
        file_path: f.rel,
        file_name: path.basename(f.rel),
        content: f.content,
        content_hash: f.hash,
        metadata: f.metadata,
      })),
    });

    // Fire and forget
    post(`${API_BASE_URL}/sync-state`, body, () => {
      // Update cache on success
      const hashes = syncCache.h || {};
      for (const f of files) hashes[f.rel] = f.hash;
      syncCache.h = hashes;
      syncCache.t = new Date().toISOString();
      try { fs.writeFileSync(syncPath, JSON.stringify(syncCache)); } catch { /* skip */ }
    });

    // Health check
    try {
      const hm = require('./health-monitor');
      if (typeof hm.runProtectionCycle === 'function') {
        hm.runProtectionCycle(projectDir, cached.token);
      }
    } catch { /* optional */ }
  } catch { /* silent */ }
}

function ensureCheckpoint(projectDir, cached) {
  try {
    const checkpointPath = path.join(projectDir, 'docs', 'PROJECT-CHECKPOINT.md');
    if (fs.existsSync(checkpointPath)) return;

    const docsDir = path.join(projectDir, 'docs');
    if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

    const projectName = cached.project_name || path.basename(projectDir);
    const date = new Date().toISOString().split('T')[0];
    const userName = cached.user?.name || 'Unknown';
    const content = [
      '# Project Checkpoint',
      '',
      `> Ultima atualizacao: ${date}`,
      '',
      '## Resumo do Projeto',
      '',
      `- **Projeto:** ${projectName}`,
      `- **Criado em:** ${date}`,
      `- **Instalado por:** ${userName}`,
      '',
      '## Status das Stories',
      '',
      '(nenhuma story criada ainda)',
      '',
      '## Ultimo Trabalho Realizado',
      '',
      '(checkpoint criado automaticamente)',
      '',
      '## Proximos Passos',
      '',
      '- [ ] Criar primeira story',
      '',
    ].join('\n');
    fs.writeFileSync(checkpointPath, content);
  } catch { /* silent */ }
}

/**
 * Parse checkpoint into sections by ## headings
 * @returns {Object} map of sectionName → content
 */
function parseCheckpointSections(content) {
  const sections = {};
  let currentSection = '_header';
  const lines = content.split('\n');
  for (const line of lines) {
    const match = line.match(/^## (.+)$/);
    if (match) {
      currentSection = match[1].trim();
      sections[currentSection] = '';
    } else {
      sections[currentSection] = (sections[currentSection] || '') + line + '\n';
    }
  }
  return sections;
}

/** Sections that are auto-generated and safe to overwrite */
const AUTO_SECTIONS = [
  'Status das Stories',
  'Git Recente',
  'Ambiente Detectado',
];

/** Sections written by agents — NEVER overwrite */
const AGENT_SECTIONS = [
  'Contexto Ativo',
  'Decisoes Tomadas',
  'Ambiente Configurado',
  'Ultimo Trabalho Realizado',
  'Proximos Passos',
  'Decisoes Arquiteturais',
  'Documentos do Projeto',
  'Totais',
  'Resumo do Projeto',
];

function refreshCheckpoint(projectDir) {
  try {
    const checkpointPath = path.join(projectDir, 'docs', 'PROJECT-CHECKPOINT.md');
    if (!fs.existsSync(checkpointPath)) return;

    const { execSync } = require('child_process');
    const date = new Date().toISOString().split('T')[0];

    // Backup before modifying (Gap 7)
    try {
      const backupPath = path.join(projectDir, '.lmas', '.checkpoint-backup');
      fs.copyFileSync(checkpointPath, backupPath);
    } catch { /* skip */ }

    // Read existing content and parse sections
    const existing = fs.readFileSync(checkpointPath, 'utf8');
    const existingSections = parseCheckpointSections(existing);

    // Check if checkpoint has agent-written content (not just auto-generated)
    const hasAgentContent = AGENT_SECTIONS.some(s =>
      existingSections[s] && existingSections[s].trim().length > 0
      && !existingSections[s].includes('(nenhum')
      && !existingSections[s].includes('(atualizado pelos agentes')
      && !existingSections[s].includes('(checkpoint criado automaticamente')
    );

    // If agents wrote rich content, only update auto sections
    // If checkpoint is still generic, do full refresh
    if (hasAgentContent) {
      // MERGE mode — preserve agent sections, update auto sections only

      // Collect git log
      let recentCommits = '';
      try {
        const log = execSync('git log --oneline -5 2>/dev/null', { cwd: projectDir, encoding: 'utf8', timeout: 3000 }).trim();
        if (log) recentCommits = log.split('\n').map(l => `- \`${l}\``).join('\n') + '\n';
      } catch { /* skip */ }

      // Collect stories
      let storiesTable = '';
      try {
        const storyFiles = collectStories(projectDir);
        if (storyFiles.length > 0) {
          storiesTable = '| Story | Status |\n|-------|--------|\n' +
            storyFiles.map(s => `| ${s.name} | ${s.status} |`).join('\n') + '\n';
        }
      } catch { /* skip */ }

      // Collect environment info
      let envInfo = '';
      try {
        const envPath = path.join(projectDir, '.env');
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, 'utf8');
          const keys = envContent.split('\n')
            .filter(l => l.includes('=') && !l.startsWith('#'))
            .map(l => l.split('=')[0].trim())
            .filter(k => k.length > 0);
          if (keys.length > 0) envInfo = `Keys: ${keys.join(', ')}\n`;
        }
      } catch { /* skip */ }

      // Branch info
      let branch = '';
      try {
        branch = execSync('git branch --show-current 2>/dev/null', { cwd: projectDir, encoding: 'utf8', timeout: 3000 }).trim();
      } catch { /* skip */ }

      // Update only auto sections in existing content
      let updated = existing;

      // Update timestamp in header
      updated = updated.replace(
        /^> Ultima atualizacao:.*$/m,
        `> Ultima atualizacao: ${date} (auto-refresh)`
      );

      // Update or append auto sections
      if (storiesTable && existingSections['Status das Stories']) {
        const oldSection = existingSections['Status das Stories'];
        updated = updated.replace(oldSection, '\n' + storiesTable + '\n');
      }

      // Append git + env info as auto section at the end if not present
      if (!updated.includes('## Git Recente')) {
        const autoAppend = [];
        if (recentCommits) autoAppend.push('## Git Recente\n', recentCommits);
        if (branch) autoAppend.push(`Branch: \`${branch}\`\n`);
        if (envInfo) autoAppend.push('\n## Ambiente Detectado\n', envInfo);
        if (autoAppend.length > 0) updated = updated.trimEnd() + '\n\n' + autoAppend.join('') + '\n';
      } else {
        // Update existing auto sections
        if (recentCommits) {
          const gitSection = existingSections['Git Recente'] || '';
          updated = updated.replace(gitSection, '\n' + recentCommits + (branch ? `Branch: \`${branch}\`\n` : '') + '\n');
        }
      }

      fs.writeFileSync(checkpointPath, updated);
    } else {
      // FULL REFRESH mode — checkpoint is generic, safe to overwrite

      let recentCommits = '(nenhum commit encontrado)';
      try {
        const log = execSync('git log --oneline -5 2>/dev/null', { cwd: projectDir, encoding: 'utf8', timeout: 3000 }).trim();
        if (log) recentCommits = log.split('\n').map(l => `- \`${l}\``).join('\n');
      } catch { /* skip */ }

      let storiesTable = '(nenhuma story encontrada)';
      try {
        const storyFiles = collectStories(projectDir);
        if (storyFiles.length > 0) {
          storiesTable = '| Story | Status |\n|-------|--------|\n' +
            storyFiles.map(s => `| ${s.name} | ${s.status} |`).join('\n');
        }
      } catch { /* skip */ }

      let modifiedCount = 0;
      try {
        const status = execSync('git diff --name-only 2>/dev/null', { cwd: projectDir, encoding: 'utf8', timeout: 3000 }).trim();
        modifiedCount = status ? status.split('\n').length : 0;
      } catch { /* skip */ }

      let branch = '';
      try {
        branch = execSync('git branch --show-current 2>/dev/null', { cwd: projectDir, encoding: 'utf8', timeout: 3000 }).trim();
      } catch { /* skip */ }

      let envKeys = '';
      try {
        const envPath = path.join(projectDir, '.env');
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, 'utf8');
          const keys = envContent.split('\n')
            .filter(l => l.includes('=') && !l.startsWith('#'))
            .map(l => l.split('=')[0].trim())
            .filter(k => k.length > 0);
          if (keys.length > 0) envKeys = `\n## Ambiente Detectado\n\nKeys: ${keys.join(', ')}\n`;
        }
      } catch { /* skip */ }

      const checkpoint = [
        '# Project Checkpoint',
        '',
        `> Ultima atualizacao: ${date} (auto-refresh)`,
        '',
        '## Contexto Ativo',
        '',
        '(atualizado pelos agentes durante o trabalho)',
        '',
        '## Status das Stories',
        '',
        storiesTable,
        '',
        '## Decisoes Tomadas',
        '',
        '(atualizado pelos agentes durante o trabalho)',
        '',
        '## Ultimo Trabalho Realizado',
        '',
        recentCommits,
        '',
        `Arquivos modificados (nao commitados): ${modifiedCount}`,
        '',
        '## Proximos Passos',
        '',
        '(atualizado pelos agentes durante o trabalho)',
        '',
        '## Git Recente',
        '',
        recentCommits,
        branch ? `Branch: \`${branch}\`` : '',
        '',
        envKeys,
      ].filter(l => l !== undefined).join('\n');

      fs.writeFileSync(checkpointPath, checkpoint);
    }
  } catch { /* silent — refresh is best-effort */ }
}

function collectStories(projectDir) {
  const storyFiles = [];
  const storiesDir = path.join(projectDir, 'docs', 'stories');
  const scanStories = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) scanStories(full);
      else if (entry.endsWith('.md')) {
        const content = fs.readFileSync(full, 'utf8');
        const statusMatch = content.match(/status:\s*(\w+)/i);
        const titleMatch = content.match(/title:\s*(.+)/i) || content.match(/^#\s+(.+)/m);
        storyFiles.push({
          name: entry.replace('.md', ''),
          status: statusMatch ? statusMatch[1] : 'Unknown',
          title: titleMatch ? titleMatch[1].trim().slice(0, 50) : entry,
        });
      }
    }
  };
  scanStories(storiesDir);
  return storyFiles;
}

function collectFiles(projectDir, prevHashes) {
  const result = [];

  for (const pattern of FILE_PATTERNS) {
    const fullPath = path.join(projectDir, pattern.pattern);

    if (pattern.pattern.includes('.')) {
      // Single file
      if (fs.existsSync(fullPath)) {
        const f = processFile(fullPath, projectDir, pattern.type, prevHashes);
        if (f) result.push(f);
      }
    } else {
      // Directory scan
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
        scanDir(fullPath, projectDir, pattern, prevHashes, result);
      }
    }
  }

  return result;
}

function scanDir(dir, projectDir, pattern, prevHashes, result) {
  try {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      const full = path.join(dir, entry);
      const stat = fs.statSync(full);

      if (stat.isDirectory()) {
        scanDir(full, projectDir, pattern, prevHashes, result);
      } else if (stat.isFile() && entry.endsWith(pattern.ext || '.md')) {
        if (pattern.match && !pattern.match.test(entry)) continue;
        const f = processFile(full, projectDir, pattern.type, prevHashes);
        if (f) result.push(f);
      }
    }
  } catch { /* skip */ }
}

function processFile(fullPath, projectDir, type, prevHashes) {
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const hash = crypto.createHash('sha256').update(content).digest('hex').slice(0, 16);
    const rel = path.relative(projectDir, fullPath).replace(/\\/g, '/');

    if (prevHashes[rel] === hash) return null;

    const metadata = {};
    if (type === 'story') {
      const statusMatch = content.match(/status:\s*(\w+)/i);
      if (statusMatch) metadata.status = statusMatch[1];
      const titleMatch = content.match(/title:\s*(.+)/i) || content.match(/^#\s+(.+)/m);
      if (titleMatch) metadata.title = titleMatch[1].trim();
      const checked = (content.match(/\[x\]/gi) || []).length;
      const unchecked = (content.match(/\[ \]/g) || []).length;
      if (checked + unchecked > 0) metadata.progress = Math.round((checked / (checked + unchecked)) * 100);
    }
    if (type === 'doc') {
      const titleMatch = content.match(/^#\s+(.+)/m);
      if (titleMatch) metadata.title = titleMatch[1].trim();
      const versionMatch = content.match(/version:\s*([\d.]+)/i) || content.match(/v([\d.]+)/i);
      if (versionMatch) metadata.version = versionMatch[1];
    }

    return { type, rel, content, hash, metadata };
  } catch { return null; }
}

function post(url, body, onSuccess) {
  try {
    const parsed = new URL(url);
    const lib = parsed.protocol === 'https:' ? https : http;
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      timeout: 8000,
    };
    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => { try { if (JSON.parse(data).ok) onSuccess(); } catch { /* skip */ } });
    });
    req.on('error', () => {});
    req.on('timeout', () => req.destroy());
    req.write(body);
    req.end();
  } catch { /* silent */ }
}

main();
