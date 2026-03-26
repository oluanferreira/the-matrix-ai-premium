#!/usr/bin/env node
'use strict';

/**
 * freeze-scope.cjs — Edit Scope Lock for LMAS
 *
 * Hook Type: PreToolUse (matcher: Edit, Write, NotebookEdit)
 * Format: stdin/stdout CLI (Claude Code hooks protocol)
 *
 * Behavior:
 * - When freeze is active, only allows edits to files within allowed paths.
 * - Activated by: creating .lmas/freeze-scope.json (via *freeze command)
 * - Deactivated by: deleting that file (via *unfreeze) or auto-expire (1h)
 * - exit(0) = allow, exit(2) = block with reason on stdout
 * - Fail-open: any internal error or no freeze active → exit(0)
 *
 * State file format (.lmas/freeze-scope.json):
 * {
 *   "active": true,
 *   "paths": ["src/auth/", "src/lib/supabase.ts"],
 *   "activatedAt": "2026-03-24T..."
 * }
 *
 * Absorbed from gstack /freeze pattern.
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const STATE_FILE = path.join(PROJECT_ROOT, '.lmas', 'freeze-scope.json');
const TIMEOUT_MS = 60 * 60 * 1000; // 1 hour auto-expire

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

    // Only check Edit, Write, NotebookEdit
    if (toolName !== 'Edit' && toolName !== 'Write' && toolName !== 'NotebookEdit') {
      process.exit(0);
    }

    // Load freeze state
    const state = loadFreezeState();
    if (!state) process.exit(0); // No freeze active — allow all

    // Get file path from tool input
    const filePath = toolInput.file_path || toolInput.path || '';
    if (!filePath) process.exit(0);

    // Check if file is within allowed paths
    if (isFileAllowed(filePath, state.paths)) {
      process.exit(0); // Within scope — allow
    }

    // File is OUTSIDE allowed scope — block
    process.stdout.write(
      `FREEZE SCOPE ATIVO: Edicao bloqueada!\n\n` +
      `Arquivo: ${filePath}\n` +
      `Paths permitidos: ${state.paths.join(', ')}\n\n` +
      `O freeze-scope restringe edicoes durante debugging focado.\n` +
      `Use *unfreeze para desativar ou edite apenas dentro dos paths permitidos.\n` +
      `Auto-expira em 1h desde ativacao.`
    );
    process.exit(2); // BLOCK
  } catch {
    process.exit(0); // FAIL-OPEN
  }
}

function loadFreezeState() {
  try {
    if (!fs.existsSync(STATE_FILE)) return null;
    const data = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    if (!data.active || !Array.isArray(data.paths) || data.paths.length === 0) return null;

    // Auto-expire after timeout
    if (data.activatedAt) {
      const elapsed = Date.now() - new Date(data.activatedAt).getTime();
      if (elapsed > TIMEOUT_MS) {
        try { fs.unlinkSync(STATE_FILE); } catch {}
        return null;
      }
    }

    return data;
  } catch {
    return null; // Fail-open
  }
}

function isFileAllowed(filePath, allowedPaths) {
  if (!filePath || !allowedPaths) return true;
  const normalized = filePath.replace(/\\/g, '/');

  // Extract relative path from PROJECT_ROOT for consistent matching
  const projectNorm = PROJECT_ROOT.replace(/\\/g, '/');
  const rel = normalized.startsWith(projectNorm)
    ? normalized.slice(projectNorm.length).replace(/^\//, '')
    : normalized;

  return allowedPaths.some(pattern => {
    const normalizedPattern = pattern.replace(/\\/g, '/');

    // Exact prefix match (most common: "src/auth/")
    if (!normalizedPattern.includes('*')) {
      return rel.startsWith(normalizedPattern) || rel === normalizedPattern;
    }

    // Escape regex metacharacters BEFORE converting globs
    const escaped = normalizedPattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\\\*\\\*/g, '{{GLOBSTAR}}')
      .replace(/\\\*/g, '[^/]*')
      .replace(/{{GLOBSTAR}}/g, '.*');
    return new RegExp('^' + escaped).test(rel);
  });
}

main();
