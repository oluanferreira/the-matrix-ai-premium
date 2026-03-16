#!/usr/bin/env node

/**
 * The Matrix AI — Heartbeat Check
 * Runs silently on agent activation to verify premium token validity.
 * If token is expired/revoked, purges premium content.
 *
 * Usage (from Claude Code hook or agent activation):
 *   node packages/installer/src/auth/heartbeat-check.js
 */

const path = require('path');
const fs = require('fs');

async function main() {
  const projectDir = process.cwd();
  const cachePath = path.join(projectDir, '.lmas', 'token-cache.json');

  // No token cache = free user, nothing to check
  if (!fs.existsSync(cachePath)) {
    process.exit(0);
  }

  let cached;
  try {
    cached = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
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
    const { heartbeat, purgePremiumContent, clearTokenCache } = require('./token-validator');

    const result = await heartbeat(cached.token, cached.project_name);

    if (result.purge) {
      console.error('\n⚠️  Seu token The Matrix AI expirou ou foi revogado.');
      console.error('   Os agentes premium foram removidos.');
      console.error('   Seu trabalho (código, docs, etc.) não foi afetado.');
      console.error('   Para renovar: entre em contato com @oluanferreira\n');

      purgePremiumContent(projectDir);
      process.exit(0);
    }

    // Update last heartbeat timestamp
    cached.last_heartbeat = new Date().toISOString();
    fs.writeFileSync(cachePath, JSON.stringify(cached, null, 2));
  } catch {
    // Silently fail — don't block user workflow
    process.exit(0);
  }
}

main();
