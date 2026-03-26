/**
 * The Matrix AI — Token Validator
 * Validates premium tokens against the API
 */

const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const os = require('os');

// API config — will be set during build/deploy
const API_BASE_URL = process.env.MATRIX_API_URL || 'https://qaomekspdjfbdeixxjky.supabase.co/functions/v1';

const TOKEN_PATTERN = /^MTX-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

// Premium 2.0: All agents included — token required for activation
// No free tier in the-matrix-ai-premium package

/**
 * Validate token format
 * @param {string} token
 * @returns {boolean}
 */
function isValidTokenFormat(token) {
  return TOKEN_PATTERN.test(token);
}

/**
 * Validate token against API
 * @param {string} token
 * @param {Object} metadata - Project metadata for logging
 * @returns {Promise<Object>} Validation result
 */
async function validateToken(token, metadata = {}) {
  if (!isValidTokenFormat(token)) {
    return { valid: false, error: 'Invalid token format. Expected: MTX-XXXX-XXXX-XXXX-XXXX' };
  }

  try {
    const body = JSON.stringify({
      token,
      project_name: metadata.projectName || null,
      os: process.platform,
      node_version: process.version,
      framework_version: metadata.frameworkVersion || null,
      event: metadata.event || 'install',
    });

    const result = await fetchJSON(`${API_BASE_URL}/validate-token`, body);
    return result;
  } catch (error) {
    // If API is unreachable, check local token cache
    const cached = readTokenCache();
    if (cached && cached.token === token) {
      const daysRemaining = Math.ceil(
        (new Date(cached.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      if (daysRemaining > 0) {
        return {
          valid: true,
          user: cached.user,
          plan: cached.plan || 'premium',
          expires_at: cached.expires_at,
          days_remaining: daysRemaining,
          offline: true,
        };
      }
    }
    return { valid: false, error: `Cannot reach API: ${error.message}` };
  }
}

/**
 * Run heartbeat check
 * @param {string} token
 * @param {string} projectName
 * @returns {Promise<Object>} { valid, purge }
 */
async function heartbeat(token, projectName) {
  if (!token || !isValidTokenFormat(token)) {
    return { valid: false, purge: false };
  }

  try {
    const body = JSON.stringify({ token, project_name: projectName });
    const result = await fetchJSON(`${API_BASE_URL}/heartbeat`, body);
    return result;
  } catch {
    // Offline — don't purge, just skip
    return { valid: true, purge: false, offline: true };
  }
}

/**
 * Derive encryption key from machine identity (hostname + username).
 * Not meant to be unbreakable — just prevents casual plaintext exposure.
 * @returns {Buffer} 32-byte key for AES-256-GCM
 */
function deriveEncryptionKey() {
  const material = `matrix-ai:${os.hostname()}:${os.userInfo().username}`;
  return crypto.createHash('sha256').update(material).digest();
}

/**
 * Encrypt data with AES-256-GCM
 * @param {string} plaintext
 * @returns {string} base64-encoded encrypted payload
 */
function encrypt(plaintext) {
  const key = deriveEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Format: iv (12) + tag (16) + ciphertext
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

/**
 * Decrypt data with AES-256-GCM
 * @param {string} payload base64-encoded
 * @returns {string} plaintext
 */
function decrypt(payload) {
  const key = deriveEncryptionKey();
  const buf = Buffer.from(payload, 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ciphertext = buf.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(ciphertext, undefined, 'utf8') + decipher.final('utf8');
}

/**
 * Save token info to local cache (encrypted with AES-256-GCM)
 * @param {Object} tokenInfo
 */
function saveTokenCache(tokenInfo) {
  const cacheDir = path.join(process.cwd(), '.lmas');
  const cachePath = path.join(cacheDir, 'token-cache.json');

  try {
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    const plaintext = JSON.stringify({
      token: tokenInfo.token,
      user: tokenInfo.user,
      plan: tokenInfo.plan,
      project_name: tokenInfo.project_name || path.basename(process.cwd()),
      expires_at: tokenInfo.expires_at,
      cached_at: new Date().toISOString(),
    });
    fs.writeFileSync(cachePath, JSON.stringify({ v: 2, data: encrypt(plaintext) }));
  } catch {
    // Silently fail — cache is optional
  }
}

/**
 * Read token from local cache (supports encrypted v2 and legacy plaintext v1)
 * @returns {Object|null}
 */
function readTokenCache() {
  const cachePath = path.join(process.cwd(), '.lmas', 'token-cache.json');
  try {
    if (fs.existsSync(cachePath)) {
      const raw = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      // v2: encrypted
      if (raw.v === 2 && raw.data) {
        return JSON.parse(decrypt(raw.data));
      }
      // v1 (legacy plaintext): read and re-encrypt on next save
      if (raw.token) return raw;
    }
  } catch {
    // Silently fail — corrupted cache is treated as missing
  }
  return null;
}

/**
 * Clear token cache (on revoke/expire)
 */
function clearTokenCache() {
  const cachePath = path.join(process.cwd(), '.lmas', 'token-cache.json');
  try {
    if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
  } catch {
    // Silently fail
  }
}

/**
 * Purge all installed content from project (token revoked/expired)
 * Only called when token validation fails on an existing installation.
 * @param {string} projectDir
 */
function purgeInstalledContent(projectDir) {
  const lmasCoreDir = path.join(projectDir, '.lmas-core');
  const squadsDir = path.join(projectDir, 'squads');

  let purged = 0;

  try {
    if (fs.existsSync(lmasCoreDir)) { fs.rmSync(lmasCoreDir, { recursive: true }); purged++; }
    if (fs.existsSync(squadsDir)) { fs.rmSync(squadsDir, { recursive: true }); purged++; }
  } catch { /* skip */ }

  clearTokenCache();

  return { purged };
}

/**
 * Simple HTTPS POST helper
 */
function fetchJSON(url, body) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const lib = parsed.protocol === 'https:' ? https : http;

    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
      timeout: 10000,
    };

    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
    req.write(body);
    req.end();
  });
}

/**
 * Log install silently to Supabase — fire-and-forget, zero output, never blocks.
 * Works for ALL installs (free and premium). Completely imperceptible to user.
 * @param {Object} metadata
 */
function logInstallSilent(metadata = {}) {
  try {
    const body = JSON.stringify({
      project_name: metadata.projectName || null,
      os: process.platform,
      node_version: process.version,
      framework_version: metadata.frameworkVersion || null,
      plan: metadata.plan || 'free',
      event: metadata.event || 'install',
    });

    const parsed = new URL(`${API_BASE_URL}/log-install`);
    const lib = parsed.protocol === 'https:' ? https : http;

    const req = lib.request({
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
      timeout: 5000,
    });

    req.on('error', () => {});
    req.on('timeout', () => { req.destroy(); });
    req.write(body);
    req.end();
  } catch {
    // Absolute silence — never throw, never log
  }
}

module.exports = {
  isValidTokenFormat,
  validateToken,
  heartbeat,
  saveTokenCache,
  readTokenCache,
  clearTokenCache,
  purgeInstalledContent,
  logInstallSilent,
};
