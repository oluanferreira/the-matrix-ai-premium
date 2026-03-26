#!/usr/bin/env node
'use strict';

/**
 * careful-guard.cjs — Destructive Command Guardrails for LMAS
 *
 * Hook Type: PreToolUse (matcher: Bash)
 * Format: stdin/stdout CLI (Claude Code hooks protocol)
 *
 * Behavior:
 * - Reads JSON from stdin: { tool_name, tool_input: { command } }
 * - Detects destructive patterns (rm -rf, DROP TABLE, git push --force, etc.)
 * - exit(0) = allow, exit(2) = block with reason on stdout
 * - Fail-open: any internal error → exit(0)
 *
 * Absorbed from gstack /careful pattern.
 */

const fs = require('fs');

/**
 * stripInertContent — Remove conteudo inerte antes de checar patterns destrutivos.
 * Conteudo inerte: heredocs, strings em contextos nao-executaveis, pipes para
 * ferramentas de analise. Isso elimina falsos positivos como:
 *   git commit -m "fix: rm -rf cleanup"
 *   node -e "console.log('DROP TABLE')"
 *   cat file.sql | grep "DROP TABLE"
 */
function stripInertContent(command) {
  let stripped = command;

  // 1. Remove heredoc bodies (<<EOF ... EOF, <<'EOF' ... EOF, <<-EOF ... EOF)
  stripped = stripped.replace(/<<-?\s*['"]?(\w+)['"]?\s*\n[\s\S]*?\n\s*\1\b/g, '<<HEREDOC_STRIPPED');

  // 2. Remove string args of commit messages: git commit -m "..." or --message="..."
  stripped = stripped.replace(/\bgit\s+commit\b[^|;]*?(?:-[a-zA-Z]*m\s+|--message[= ])(["'])(?:(?!\1).)*\1/g, 'git commit -m STRIPPED');

  // 3. Remove string args of node -e / node --eval / python -c
  stripped = stripped.replace(/\b(node|python3?)\s+(-e|--eval|-c)\s+(["'])(?:(?!\3).)*\3/g, '$1 $2 STRIPPED');

  // 4. Remove content after pipes to analysis/read-only tools
  // NOTE: sed excluded — GNU sed -e 'e cmd' can execute shell commands
  stripped = stripped.replace(/\|\s*(grep|egrep|fgrep|rg|ag|awk|sort|uniq|head|tail|wc|cat|less|more|tee|cut|tr|xargs\s+grep)\b[^|;]*/g, '| ANALYSIS_PIPE');

  return stripped;
}

const DESTRUCTIVE_PATTERNS = [
  // File deletion
  { pattern: /\brm\s+(-[a-zA-Z]*r[a-zA-Z]*f|--recursive)\b/i, label: 'rm -rf (recursive delete)', risk: 'Data loss — deletes files permanently' },
  { pattern: /\brm\s+(-[a-zA-Z]*f[a-zA-Z]*r)\b/i, label: 'rm -fr (recursive delete)', risk: 'Data loss — deletes files permanently' },

  // Database destruction
  { pattern: /\bDROP\s+(TABLE|DATABASE|SCHEMA|INDEX)\b/i, label: 'DROP TABLE/DATABASE', risk: 'Irreversible data loss' },
  { pattern: /\bTRUNCATE\s+(TABLE\s+)?\w/i, label: 'TRUNCATE', risk: 'Deletes all rows without logging' },
  { pattern: /\bDELETE\s+FROM\s+\w+(?!.*\bWHERE\b)/is, label: 'DELETE without WHERE', risk: 'Deletes ALL rows in table' },
  { pattern: /\bsupabase\s+db\s+reset\b/i, label: 'supabase db reset', risk: 'Destroys and recreates entire local database' },

  // Git destruction
  { pattern: /\bgit\s+push\b.*--force/i, label: 'git push --force', risk: 'Rewrites remote history — can lose others\' work' },
  { pattern: /\bgit\s+push\b.*\s-[a-zA-Z]*f\b/i, label: 'git push -f', risk: 'Rewrites remote history — can lose others\' work' },
  { pattern: /\bgit\s+reset\s+--hard\b/i, label: 'git reset --hard', risk: 'Discards all uncommitted changes permanently' },
  { pattern: /\bgit\s+(checkout|restore)\s+\.\s*$/m, label: 'git checkout/restore .', risk: 'Discards all uncommitted file changes' },
  { pattern: /\bgit\s+clean\s+(-[a-zA-Z]*f)/i, label: 'git clean -f', risk: 'Removes untracked files permanently' },
  { pattern: /\bgit\s+branch\s+(-[a-zA-Z]*D)\b/i, label: 'git branch -D', risk: 'Force-deletes branch without merge check' },
  { pattern: /\bgit\s+stash\s+(drop|clear)\b/i, label: 'git stash drop/clear', risk: 'Destroys stashed changes permanently' },

  // Indirect execution
  { pattern: /\beval\s+["']/i, label: 'eval (indirect execution)', risk: 'Executes arbitrary string as command — inspect content' },
  { pattern: /\bbash\s+-c\s+["']/i, label: 'bash -c (indirect execution)', risk: 'Executes arbitrary string in subshell — inspect content' },

  // Container destruction
  { pattern: /\bkubectl\s+delete\b/i, label: 'kubectl delete', risk: 'Removes Kubernetes resources — may impact production' },
  { pattern: /\bdocker\s+(rm|rmi)\s+(-[a-zA-Z]*f)/i, label: 'docker rm -f', risk: 'Force-removes running containers/images' },
  { pattern: /\bdocker\s+system\s+prune/i, label: 'docker system prune', risk: 'Removes all unused containers, images, and volumes' },
];

// Safe exceptions — these patterns look destructive but are routine cleanup
const SAFE_EXCEPTIONS = [
  /\brm\s+(-[a-zA-Z]*r[a-zA-Z]*f?|--recursive)\s+["']?(node_modules|\.next|dist|__pycache__|\.cache|build|\.turbo|coverage|\.output|\.nuxt|\.expo|out)(\s|$|")/i,
  /\brm\s+(-[a-zA-Z]*r[a-zA-Z]*f?|--recursive)\s+["']?\.lmas(\s|$|")/i,
  /\brm\s+(-[a-zA-Z]*r[a-zA-Z]*f?|--recursive)\s+["']?\/tmp\//i,
  /\brm\s+(-[a-zA-Z]*f)\s+.*\.(log|tmp|bak|swp)\b/i,
  /\bgit\s+clean\s+(-[a-zA-Z]*f).*(-e|--exclude)/i,
  // git commit — safe only if not chained with other commands (no &&, ||, ; after)
  /^\s*(git\s+add\s+[^;&|]+\s*&&\s*)?git\s+commit\s+(-[a-zA-Z]*m\b|--message|-F\b|--file)\b[^;&|]*$/i,
  // grep/rg — searching for patterns, not executing them
  /^\s*(grep|rg|ag|findstr)\s/i,
  // echo/printf — safe only as standalone command (no chaining via && || ;)
  /^\s*(echo|printf)\s[^;&]*$/i,
  // git read-only operations — never destructive
  /^\s*git\s+(log|show|diff|blame|shortlog|describe|tag\s+-l|branch\s+-[avrl]|remote\s+-v|status|stash\s+list)\b/i,
  // node/python inline eval — scripting, not shell destruction
  /^\s*(node|python3?)\s+(-e|--eval|-c)\s/i,
  // echo/printf with file redirect — safe only if no chaining after
  /^\s*(echo|printf)\s[^;&|]*>\s*[^;&|]*$/i,
];

function main() {
  try {
    // Read JSON from stdin
    let input;
    try {
      const data = fs.readFileSync(0, 'utf8');
      input = JSON.parse(data);
    } catch { process.exit(0); }

    const toolName = input.tool_name || '';
    const toolInput = input.tool_input || {};

    // Only check Bash commands
    if (toolName !== 'Bash') process.exit(0);

    const command = toolInput.command;
    if (!command || typeof command !== 'string') process.exit(0);

    // Check safe exceptions first (against original command)
    if (SAFE_EXCEPTIONS.some(p => p.test(command))) process.exit(0);

    // Strip inert content before checking destructive patterns
    const stripped = stripInertContent(command);

    // Check destructive patterns against stripped command
    for (const { pattern, label, risk } of DESTRUCTIVE_PATTERNS) {
      if (pattern.test(stripped)) {
        const truncated = command.length > 200 ? command.substring(0, 200) + '...' : command;
        process.stdout.write(
          `CAREFUL GUARD: Comando destrutivo detectado!\n\n` +
          `Padrao: ${label}\n` +
          `Risco: ${risk}\n` +
          `Comando: ${truncated}\n\n` +
          `Bloqueado por seguranca. Confirme manualmente se necessario.`
        );
        process.exit(2); // BLOCK
      }
    }

    // No destructive pattern found — allow
    process.exit(0);
  } catch {
    process.exit(0); // FAIL-OPEN
  }
}

main();
