#!/usr/bin/env node
'use strict';

/**
 * session-tracker.cjs — Session Tracking + Analytics for LMAS
 *
 * Hook Type: UserPromptSubmit
 * Format: stdin/stdout CLI (Claude Code hooks protocol)
 *
 * Features:
 * - Session counting (touch file per PID, cleanup >2h)
 * - Skill usage logging (.lmas/analytics/skill-usage.jsonl)
 * - Log rotation (max 10MB)
 *
 * Output: silent (no stdout). Tracking only.
 * Always exit(0) — never blocks user prompts.
 *
 * Absorbed from gstack preamble pattern.
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const SESSIONS_DIR = path.join(PROJECT_ROOT, '.lmas', 'sessions');
const ANALYTICS_DIR = path.join(PROJECT_ROOT, '.lmas', 'analytics');
const USAGE_LOG = path.join(ANALYTICS_DIR, 'skill-usage.jsonl');
const MAX_LOG_SIZE = 10 * 1024 * 1024; // 10MB

function main() {
  try {
    // Read JSON from stdin (UserPromptSubmit: { prompt: "..." })
    let input;
    try {
      const data = fs.readFileSync(0, 'utf8');
      input = JSON.parse(data);
    } catch { process.exit(0); }

    // Touch session
    touchSession();

    // Detect skill usage from prompt (commands start with * or @)
    const prompt = input.prompt || input.user_prompt || input.message || '';
    const skillMatch = prompt.match(/^[*@](\S+)/);
    const skill = skillMatch ? skillMatch[1] : 'session';

    // Log usage
    logUsage(skill);

    process.exit(0);
  } catch {
    process.exit(0); // FAIL-OPEN
  }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function touchSession() {
  try {
    ensureDir(SESSIONS_DIR);
    const pid = String(process.ppid || process.pid || 'unknown');
    fs.writeFileSync(path.join(SESSIONS_DIR, pid), new Date().toISOString());

    // Cleanup sessions older than 2 hours
    const files = fs.readdirSync(SESSIONS_DIR);
    const now = Date.now();
    for (const f of files) {
      const fPath = path.join(SESSIONS_DIR, f);
      try {
        const stat = fs.statSync(fPath);
        if (now - stat.mtimeMs > 2 * 60 * 60 * 1000) {
          fs.unlinkSync(fPath);
        }
      } catch {}
    }
  } catch {}
}

function logUsage(skill) {
  try {
    ensureDir(ANALYTICS_DIR);

    // Log rotation
    if (fs.existsSync(USAGE_LOG)) {
      const stat = fs.statSync(USAGE_LOG);
      if (stat.size > MAX_LOG_SIZE) {
        const rotated = USAGE_LOG + '.old';
        try { fs.unlinkSync(rotated); } catch {}
        fs.renameSync(USAGE_LOG, rotated);
      }
    }

    const entry = JSON.stringify({
      ts: new Date().toISOString(),
      skill,
      pid: process.ppid || process.pid,
      repo: path.basename(PROJECT_ROOT)
    });
    fs.appendFileSync(USAGE_LOG, entry + '\n');
  } catch {}
}

main();
