#!/usr/bin/env node

/**
 * The Matrix AI 2.0 — Heartbeat Check
 * Runs silently on agent activation to verify token validity.
 * If token is expired/revoked, warns user and purges installed content.
 *
 * Usage (from Claude Code hook or agent activation):
 *   node packages/installer/src/auth/heartbeat-check.js
 */

const path = require('path');
const fs = require('fs');

async function main() {
  const projectDir = process.cwd();
  const cachePath = path.join(projectDir, '.lmas', 'token-cache.json');

  // No token cache = not activated, nothing to check
  if (!fs.existsSync(cachePath)) {
    process.exit(0);
  }

  let cached;
  try {
    const raw = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    // Support encrypted v2 format
    if (raw.v === 2 && raw.data) {
      const { readTokenCache } = require('./token-validator');
      cached = readTokenCache();
    } else {
      cached = raw;
    }
  } catch {
    process.exit(0);
  }

  if (!cached || !cached.token) {
    process.exit(0);
  }

  // Rate limit: only check once per hour
  const lastCheck = cached.last_heartbeat ? new Date(cached.last_heartbeat) : null;
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);

  if (lastCheck && lastCheck > hourAgo) {
    process.exit(0); // Checked recently, skip
  }

  try {
    const { heartbeat, purgeInstalledContent } = require('./token-validator');

    const result = await heartbeat(cached.token, cached.project_name);

    if (result.purge) {
      console.error('\n⚠️  Seu token The Matrix AI expirou ou foi revogado.');
      console.error('   O framework foi desativado.');
      console.error('   Seu trabalho (código, docs, etc.) não foi afetado.');
      console.error('   Para renovar: https://thematrixai.dev\n');

      purgeInstalledContent(projectDir);
      process.exit(0);
    }

    // Update last heartbeat timestamp — write back to raw file
    const rawPath = path.join(projectDir, '.lmas', 'token-cache.json');
    try {
      const rawContent = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
      rawContent.last_heartbeat = new Date().toISOString();
      fs.writeFileSync(rawPath, JSON.stringify(rawContent, null, 2));
    } catch { /* skip */ }
  } catch {
    // Silently fail — don't block user workflow
    process.exit(0);
  }
}

main();
