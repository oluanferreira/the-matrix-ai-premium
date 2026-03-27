#!/usr/bin/env node
'use strict';

/**
 * Shared Token Reader — AES-256-GCM decryption for token-cache.json
 *
 * Single source of truth for token decryption logic.
 * Used by: session-tracker.cjs, state-sync.cjs, checkpoint-context.cjs
 *
 * Supports:
 * - v2: AES-256-GCM encrypted (current)
 * - v1: plaintext JSON (legacy fallback)
 *
 * RULES:
 * - ZERO console.log
 * - NEVER throw — returns null on any error
 * - NEVER block
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

/**
 * Read and decrypt token from cache file.
 * @param {string} tokenPath - Full path to token-cache.json
 * @returns {object|null} Decrypted token object { token, project_name, ... } or null
 */
function readTokenCache(tokenPath) {
  try {
    if (!fs.existsSync(tokenPath)) return null;
    const raw = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));

    if (raw.v === 2 && raw.data) {
      const key = crypto.createHash('sha256')
        .update(`matrix-ai:${os.hostname()}:${os.userInfo().username}`)
        .digest();
      const buf = Buffer.from(raw.data, 'base64');
      const iv = buf.subarray(0, 12);
      const tag = buf.subarray(12, 28);
      const ct = buf.subarray(28);
      const d = crypto.createDecipheriv('aes-256-gcm', key, iv);
      d.setAuthTag(tag);
      const decrypted = JSON.parse(d.update(ct, undefined, 'utf8') + d.final('utf8'));
      return decrypted && decrypted.token ? decrypted : null;
    }

    // v1 fallback (plaintext)
    return raw && raw.token ? raw : null;
  } catch {
    return null;
  }
}

/**
 * Read unified session ID from .lmas/.session-id
 * Falls back to generating one if file doesn't exist.
 * @param {string} lmasDir - Path to .lmas directory
 * @returns {string} Session ID
 */
function getSessionId(lmasDir) {
  try {
    const sessionIdPath = path.join(lmasDir, '.session-id');
    if (fs.existsSync(sessionIdPath)) {
      const id = fs.readFileSync(sessionIdPath, 'utf8').trim();
      if (id.length > 0) return id;
    }
  } catch { /* fallback */ }
  return `${process.ppid}-${Date.now().toString(36)}`;
}

module.exports = { readTokenCache, getSessionId };
