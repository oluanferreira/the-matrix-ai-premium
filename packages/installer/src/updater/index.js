/**
 * LMAS Updater — Smart Patch System
 *
 * Applies incremental updates without full reinstallation.
 * Preserves user customizations via category-aware smart merge.
 *
 * @module packages/installer/src/updater
 * @version 2.0.0
 *
 * Categories (merge strategies):
 *   framework  → overwrite (always)
 *   hook       → add/update (never delete user hooks)
 *   rule       → overwrite
 *   agent      → overwrite (preserve MEMORY.md)
 *   settings   → merge (preserve user hooks, add new permissions)
 *   squad      → add only (never delete user squads)
 *   command    → add/update
 *   template   → overwrite
 *   user-doc   → NEVER TOUCH
 *   config     → merge (preserve user keys)
 */

'use strict';

const fs = require('fs-extra');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');
const os = require('os');

// NPM package name for the premium product
const NPM_PACKAGE = 'the-matrix-ai-premium';

// Registry URL
const NPM_REGISTRY = `https://registry.npmjs.org/${NPM_PACKAGE}`;

/**
 * File category → merge strategy mapping
 * Patterns are matched against relative paths from package root
 */
const CATEGORY_MAP = [
  // NEVER TOUCH — user content
  { pattern: /^docs\/stories\//,           category: 'user-doc' },
  { pattern: /^docs\/PROJECT-CHECKPOINT/,  category: 'user-doc' },
  { pattern: /^projects\//,                category: 'user-doc' },
  { pattern: /^\.env/,                     category: 'user-doc' },

  // Hooks — add/update, never delete
  { pattern: /^\.claude\/hooks\/.*\.cjs$/, category: 'hook' },

  // Settings — smart merge
  { pattern: /^\.claude\/settings\.json$/, category: 'settings-permissions' },

  // Rules — overwrite
  { pattern: /^\.claude\/rules\//,         category: 'rule' },

  // Commands — add/update
  { pattern: /^\.claude\/commands\//,      category: 'command' },

  // Agent definitions — overwrite but preserve MEMORY.md
  { pattern: /MEMORY\.md$/,                category: 'user-doc' },
  { pattern: /^\.lmas-core\/development\/agents\//, category: 'agent' },

  // Framework core — always overwrite
  { pattern: /^\.lmas-core\//,            category: 'framework' },
  { pattern: /^bin\//,                    category: 'framework' },
  { pattern: /^packages\//,              category: 'framework' },
  { pattern: /^scripts\//,               category: 'framework' },

  // Squads — add only
  { pattern: /^squads\//,                 category: 'squad' },

  // Config files — merge
  { pattern: /core-config\.yaml$/,        category: 'config' },
];

/**
 * Merge strategies per category
 */
const STRATEGIES = {
  'framework':             'overwrite',
  'hook':                  'add-update',
  'rule':                  'overwrite',
  'agent':                 'overwrite',
  'settings-permissions':  'merge-permissions',
  'command':               'add-update',
  'squad':                 'add-only',
  'template':              'overwrite',
  'config':                'merge-config',
  'user-doc':              'never',
};

/**
 * Hook event mapping — same as ide-config-generator.js
 */
const HOOK_EVENT_MAP = {
  'synapse-engine.cjs':             { event: 'UserPromptSubmit', matcher: null, timeout: 10 },
  'checkpoint-context.cjs':         { event: 'UserPromptSubmit', matcher: null, timeout: 5 },
  'session-tracker.cjs':            { event: 'UserPromptSubmit', matcher: null, timeout: 5 },
  'checkpoint-reminder.cjs':        { event: 'PostToolUse', matcher: null, timeout: 5 },
  'state-sync.cjs':                 { event: 'PostToolUse', matcher: null, timeout: 8 },
  'precompact-session-digest.cjs':  { event: 'PreCompact', matcher: null, timeout: 10 },
};

const DEFAULT_HOOK_CONFIG = { event: 'UserPromptSubmit', matcher: null, timeout: 10 };

// ─── Status enums ───

const UpdateStatus = {
  UP_TO_DATE: 'up_to_date',
  UPDATE_AVAILABLE: 'update_available',
  CHECK_FAILED: 'check_failed',
};

const FileAction = {
  NEW: 'new',
  UPDATED: 'updated',
  PRESERVED: 'preserved',
  SKIPPED: 'skipped',
  UNCHANGED: 'unchanged',
};

// ─── Main class ───

class LMASUpdater {
  constructor(projectRoot, options = {}) {
    this.projectRoot = path.resolve(projectRoot);
    this.lmasCoreDir = path.join(this.projectRoot, '.lmas-core');
    this.lmasDir = path.join(this.projectRoot, '.lmas');
    this.options = {
      verbose: options.verbose === true,
      force: options.force === true,
      timeout: options.timeout || 30000,
    };
    this.backupDir = null;
    this.tempDir = null;
  }

  // ─── Check ───

  async checkForUpdates() {
    const result = {
      status: UpdateStatus.CHECK_FAILED,
      installed: null,
      latest: null,
      hasUpdate: false,
      changelog: null,
      error: null,
    };

    try {
      result.installed = this.getInstalledVersion();
      if (!result.installed) {
        result.error = 'LMAS not installed (no version.json or core-config.yaml found)';
        return result;
      }

      const npmInfo = await this.fetchNpmInfo();
      if (!npmInfo) {
        result.error = 'Could not reach NPM registry. Check your internet connection.';
        return result;
      }

      result.latest = npmInfo.version;
      result.changelog = npmInfo.changelog || null;
      result.tarballUrl = npmInfo.tarball;

      const cmp = this.compareVersions(result.installed, result.latest);
      if (cmp >= 0 && !this.options.force) {
        result.status = UpdateStatus.UP_TO_DATE;
        result.hasUpdate = false;
      } else {
        result.status = UpdateStatus.UPDATE_AVAILABLE;
        result.hasUpdate = true;
      }

      return result;
    } catch (error) {
      result.error = error.message;
      return result;
    }
  }

  getInstalledVersion() {
    // Try version.json
    const versionPath = path.join(this.lmasCoreDir, 'version.json');
    if (fs.existsSync(versionPath)) {
      try {
        const info = fs.readJsonSync(versionPath);
        if (info.version) return info.version;
      } catch { /* fall through */ }
    }

    // Try core-config.yaml
    const configPath = path.join(this.lmasCoreDir, 'core-config.yaml');
    if (fs.existsSync(configPath)) {
      try {
        const content = fs.readFileSync(configPath, 'utf8');
        const match = content.match(/version:\s*['"]?([^'"\s]+)/);
        if (match) return match[1];
      } catch { /* fall through */ }
    }

    // Try package.json in project root (for framework-dev mode)
    const pkgPath = path.join(this.projectRoot, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = fs.readJsonSync(pkgPath);
        if (pkg.name === NPM_PACKAGE || pkg.name === 'the-matrix-ai') return pkg.version;
      } catch { /* fall through */ }
    }

    return null;
  }

  async fetchNpmInfo() {
    return new Promise((resolve) => {
      const req = https.get(NPM_REGISTRY + '/latest', { timeout: this.options.timeout }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve({
              version: json.version,
              tarball: json.dist?.tarball || null,
              changelog: json.description || null,
            });
          } catch { resolve(null); }
        });
      });
      req.on('error', () => resolve(null));
      req.on('timeout', () => { req.destroy(); resolve(null); });
    });
  }

  compareVersions(v1, v2) {
    const p1 = v1.replace(/^v/, '').split('.').map(Number);
    const p2 = v2.replace(/^v/, '').split('.').map(Number);
    for (let i = 0; i < 3; i++) {
      if ((p1[i] || 0) > (p2[i] || 0)) return 1;
      if ((p1[i] || 0) < (p2[i] || 0)) return -1;
    }
    return 0;
  }

  // ─── Update ───

  async update(options = {}) {
    const dryRun = options.dryRun === true;
    const onProgress = options.onProgress || (() => {});

    const result = {
      success: false,
      dryRun,
      previousVersion: null,
      newVersion: null,
      filesUpdated: 0,
      filesNew: 0,
      filesPreserved: 0,
      filesSkipped: 0,
      hooksRegistered: 0,
      fileDetails: [],
      error: null,
      rollbackAvailable: false,
    };

    try {
      // 1. Check for updates
      onProgress('checking', 'Checking for updates...');
      const check = await this.checkForUpdates();

      if (!check.hasUpdate && !this.options.force) {
        result.success = true;
        result.previousVersion = check.installed;
        result.newVersion = check.installed;
        result.error = 'Already up to date';
        return result;
      }

      result.previousVersion = check.installed;
      result.newVersion = check.latest;

      // 2. Download package to temp
      onProgress('downloading', `Downloading v${check.latest}...`);
      this.tempDir = await this.downloadAndExtract(check.tarballUrl || check.latest);

      if (!this.tempDir) {
        result.error = 'Failed to download update package';
        return result;
      }

      // 3. Scan files and plan actions
      onProgress('analyzing', 'Analyzing changes...');
      const plan = this.planUpdate(this.tempDir);

      if (dryRun) {
        result.success = true;
        result.fileDetails = plan;
        result.filesNew = plan.filter(f => f.action === FileAction.NEW).length;
        result.filesUpdated = plan.filter(f => f.action === FileAction.UPDATED).length;
        result.filesPreserved = plan.filter(f => f.action === FileAction.PRESERVED).length;
        result.filesSkipped = plan.filter(f => f.action === FileAction.SKIPPED).length;
        await this.cleanup();
        return result;
      }

      // 4. Backup
      onProgress('backup', 'Creating backup...');
      await this.createBackup();
      result.rollbackAvailable = true;

      // 5. Apply changes
      onProgress('applying', 'Applying update...');
      const applied = await this.applyPlan(plan);
      result.filesNew = applied.new;
      result.filesUpdated = applied.updated;
      result.filesPreserved = applied.preserved;
      result.filesSkipped = applied.skipped;
      result.fileDetails = plan;

      // 6. Clean stale hooks + register new ones
      onProgress('hooks', 'Registering hooks...');
      await this.cleanStaleHooks();
      result.hooksRegistered = await this.registerHooks();

      // 7. Update version
      onProgress('version', 'Updating version info...');
      await this.updateVersion(check.latest);

      // 8. Validate
      onProgress('validating', 'Validating...');
      const valid = await this.postValidate();

      if (!valid.success) {
        onProgress('rollback', 'Validation failed, rolling back...');
        await this.rollback();
        result.error = `Validation failed: ${valid.error}`;
        await this.cleanup();
        return result;
      }

      // 9. Done
      result.success = true;
      result.rollbackAvailable = false;
      onProgress('complete', 'Update complete!');

      await this.cleanup();
      return result;
    } catch (error) {
      result.error = error.message;
      if (result.rollbackAvailable) {
        try {
          await this.rollback();
          result.error += ' (rolled back)';
        } catch (rbErr) {
          result.error += ` (rollback failed: ${rbErr.message})`;
        }
      }
      await this.cleanup();
      return result;
    }
  }

  // ─── Download & Extract ───

  async downloadAndExtract(versionOrUrl) {
    const tempBase = path.join(os.tmpdir(), `matrix-update-${Date.now()}`);
    await fs.ensureDir(tempBase);

    try {
      // Use npm pack to download the package
      const packCmd = `npm pack ${NPM_PACKAGE}@latest --pack-destination "${tempBase}"`;
      this.log(`Running: ${packCmd}`);

      execSync(packCmd, {
        cwd: tempBase,
        stdio: 'pipe',
        timeout: 120000,
      });

      // Find the downloaded .tgz file
      const files = await fs.readdir(tempBase);
      const tgz = files.find(f => f.endsWith('.tgz'));
      if (!tgz) throw new Error('No .tgz file found after npm pack');

      // Extract
      const tgzPath = path.join(tempBase, tgz);
      const extractDir = path.join(tempBase, 'extracted');
      await fs.ensureDir(extractDir);

      execSync(`tar -xzf "${tgzPath}" -C "${extractDir}"`, {
        stdio: 'pipe',
        timeout: 30000,
      });

      // npm pack extracts to a 'package/' subdirectory
      const packageDir = path.join(extractDir, 'package');
      if (await fs.pathExists(packageDir)) {
        return packageDir;
      }

      // Fallback: check if files are directly in extractDir
      return extractDir;
    } catch (error) {
      this.log(`Download failed: ${error.message}`);
      await fs.remove(tempBase).catch(() => {});
      return null;
    }
  }

  // ─── Plan ───

  planUpdate(packageDir) {
    const plan = [];

    const scan = (dir, relBase = '') => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const relPath = relBase ? `${relBase}/${entry.name}` : entry.name;
        const fullSrc = path.join(dir, entry.name);
        const fullDst = path.join(this.projectRoot, relPath);

        if (entry.isDirectory()) {
          // Skip node_modules, .git, etc.
          if (['node_modules', '.git', 'apps', 'supabase', 'tests'].includes(entry.name)) continue;
          scan(fullSrc, relPath);
          continue;
        }

        const category = this.getCategory(relPath);
        const strategy = STRATEGIES[category] || 'overwrite';

        // Determine action
        let action;
        if (strategy === 'never') {
          action = FileAction.SKIPPED;
        } else if (!fs.existsSync(fullDst)) {
          action = FileAction.NEW;
        } else if (strategy === 'add-only' && fs.existsSync(fullDst)) {
          action = FileAction.PRESERVED;
        } else {
          // Check if file changed
          try {
            const srcContent = fs.readFileSync(fullSrc, 'utf8');
            const dstContent = fs.readFileSync(fullDst, 'utf8');
            if (srcContent === dstContent) {
              action = FileAction.UNCHANGED;
            } else {
              action = FileAction.UPDATED;
            }
          } catch {
            action = FileAction.UPDATED;
          }
        }

        plan.push({
          relPath,
          src: fullSrc,
          dst: fullDst,
          category,
          strategy,
          action,
        });
      }
    };

    scan(packageDir);
    return plan;
  }

  getCategory(relPath) {
    const normalized = relPath.replace(/\\/g, '/');
    for (const { pattern, category } of CATEGORY_MAP) {
      if (pattern.test(normalized)) return category;
    }
    return 'framework'; // default
  }

  // ─── Apply ───

  async applyPlan(plan) {
    const counts = { new: 0, updated: 0, preserved: 0, skipped: 0 };

    for (const file of plan) {
      switch (file.action) {
        case FileAction.NEW:
          await fs.ensureDir(path.dirname(file.dst));
          await fs.copy(file.src, file.dst);
          counts.new++;
          this.log(`+ ${file.relPath} (${file.category})`);
          break;

        case FileAction.UPDATED:
          if (file.strategy === 'merge-permissions') {
            await this.mergeSettingsPermissions(file.src, file.dst);
          } else if (file.strategy === 'merge-config') {
            await this.mergeConfig(file.src, file.dst);
          } else {
            // overwrite or add-update
            await fs.ensureDir(path.dirname(file.dst));
            await fs.copy(file.src, file.dst, { overwrite: true });
          }
          counts.updated++;
          this.log(`~ ${file.relPath} (${file.strategy})`);
          break;

        case FileAction.PRESERVED:
          counts.preserved++;
          this.log(`= ${file.relPath} (preserved)`);
          break;

        case FileAction.SKIPPED:
          counts.skipped++;
          break;

        case FileAction.UNCHANGED:
          // Nothing to do
          break;
      }
    }

    return counts;
  }

  // ─── Merge strategies ───

  async mergeSettingsPermissions(srcPath, dstPath) {
    try {
      const srcSettings = await fs.readJson(srcPath);
      let dstSettings = {};

      if (await fs.pathExists(dstPath)) {
        dstSettings = await fs.readJson(dstPath);
      }

      // Only update permissions (deny/allow), preserve everything else
      const merged = { ...dstSettings };
      if (srcSettings.permissions) {
        merged.permissions = srcSettings.permissions;
      }
      // Preserve hooks, language, and any other user settings
      // hooks from settings.json are secondary to settings.local.json

      await fs.writeJson(dstPath, merged, { spaces: 2 });
    } catch (error) {
      this.log(`Merge failed for settings.json: ${error.message}, overwriting`);
      await fs.copy(srcPath, dstPath, { overwrite: true });
    }
  }

  async mergeConfig(srcPath, dstPath) {
    // For YAML configs, overwrite but this could be enhanced later
    // to preserve user-added keys
    await fs.copy(srcPath, dstPath, { overwrite: true });
  }

  // ─── Hook Cleanup ───

  /**
   * Remove stale hook entries from settings.local.json where the
   * referenced .cjs file no longer exists on disk.
   * Prevents validation failures from phantom hooks.
   */
  async cleanStaleHooks() {
    const hooksDir = path.join(this.projectRoot, '.claude', 'hooks');
    const settingsPath = path.join(this.projectRoot, '.claude', 'settings.local.json');

    if (!await fs.pathExists(settingsPath)) return;

    let settings;
    try { settings = await fs.readJson(settingsPath); } catch { return; }
    if (!settings.hooks) return;

    let cleaned = 0;
    for (const [event, entries] of Object.entries(settings.hooks)) {
      if (!Array.isArray(entries)) continue;
      settings.hooks[event] = entries.filter(entry => {
        if (!Array.isArray(entry.hooks)) return true;
        const valid = entry.hooks.every(h => {
          if (!h.command) return true;
          const match = h.command.match(/[\\/]([^\\/]+\.cjs)/);
          if (!match) return true;
          const hookFile = path.join(hooksDir, match[1]);
          if (fs.existsSync(hookFile)) return true;
          this.log(`Cleaned stale hook: ${match[1]} (${event})`);
          cleaned++;
          return false;
        });
        return valid;
      });
    }

    if (cleaned > 0) {
      await fs.writeJson(settingsPath, settings, { spaces: 2 });
      this.log(`Removed ${cleaned} stale hook(s) from settings.local.json`);
    }
  }

  // ─── Hook Registration ───

  async registerHooks() {
    const hooksDir = path.join(this.projectRoot, '.claude', 'hooks');
    const settingsPath = path.join(this.projectRoot, '.claude', 'settings.local.json');

    if (!await fs.pathExists(hooksDir)) return 0;

    const isWindows = process.platform === 'win32';

    // Read existing settings.local.json
    let settings = {};
    if (await fs.pathExists(settingsPath)) {
      try { settings = await fs.readJson(settingsPath); } catch { settings = {}; }
    }
    if (!settings.hooks) settings.hooks = {};

    // Find all .cjs hook files
    const allFiles = await fs.readdir(hooksDir);
    const hookFiles = allFiles.filter(f => f.endsWith('.cjs'));

    let registered = 0;

    for (const hookFileName of hookFiles) {
      const hookConfig = HOOK_EVENT_MAP[hookFileName] || DEFAULT_HOOK_CONFIG;
      const eventName = hookConfig.event;

      if (!Array.isArray(settings.hooks[eventName])) {
        settings.hooks[eventName] = [];
      }

      // Build command (Windows: absolute path, Unix: $CLAUDE_PROJECT_DIR)
      const hookFilePath = path.join(hooksDir, hookFileName);
      const hookCommand = isWindows
        ? `node "${hookFilePath.replace(/\\/g, '\\\\')}"`
        : `node "$CLAUDE_PROJECT_DIR/.claude/hooks/${hookFileName}"`;

      // Check if already registered
      const hookBaseName = hookFileName.replace('.cjs', '');
      const alreadyRegistered = settings.hooks[eventName].some(entry => {
        if (Array.isArray(entry.hooks)) {
          return entry.hooks.some(h => h.command && h.command.includes(hookBaseName));
        }
        return false;
      });

      if (!alreadyRegistered) {
        const hookEntry = {
          hooks: [{
            type: 'command',
            command: hookCommand,
            timeout: hookConfig.timeout,
          }],
        };
        if (hookConfig.matcher) {
          hookEntry.matcher = hookConfig.matcher;
        }
        settings.hooks[eventName].push(hookEntry);
        registered++;
        this.log(`Hook registered: ${hookFileName} → ${eventName}`);
      }
    }

    if (registered > 0) {
      await fs.ensureDir(path.dirname(settingsPath));
      await fs.writeJson(settingsPath, settings, { spaces: 2 });
    }

    return registered;
  }

  // ─── Backup & Rollback ───

  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const version = this.getInstalledVersion() || 'unknown';
    this.backupDir = path.join(this.lmasDir, 'backups', `pre-update-${version}-${timestamp}`);
    await fs.ensureDir(this.backupDir);

    // Backup critical files
    const toBackup = [
      '.claude/settings.json',
      '.claude/settings.local.json',
      '.claude/hooks',
      '.lmas-core/version.json',
      '.lmas-core/core-config.yaml',
    ];

    for (const rel of toBackup) {
      const src = path.join(this.projectRoot, rel);
      const dst = path.join(this.backupDir, rel);
      if (await fs.pathExists(src)) {
        await fs.copy(src, dst);
      }
    }

    // Keep max 3 backups
    const backupsDir = path.join(this.lmasDir, 'backups');
    if (await fs.pathExists(backupsDir)) {
      const dirs = (await fs.readdir(backupsDir))
        .filter(d => d.startsWith('pre-update-'))
        .sort()
        .reverse();
      for (const old of dirs.slice(3)) {
        await fs.remove(path.join(backupsDir, old)).catch(() => {});
      }
    }

    this.log(`Backup created: ${this.backupDir}`);
  }

  async rollback() {
    if (!this.backupDir || !await fs.pathExists(this.backupDir)) {
      throw new Error('No backup available');
    }

    // Restore each backed up item
    const items = await this.listRecursive(this.backupDir);
    for (const item of items) {
      const rel = path.relative(this.backupDir, item);
      const dst = path.join(this.projectRoot, rel);
      await fs.ensureDir(path.dirname(dst));
      await fs.copy(item, dst, { overwrite: true });
    }

    this.log('Rollback complete');
  }

  async listRecursive(dir) {
    const result = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        result.push(...await this.listRecursive(full));
      } else {
        result.push(full);
      }
    }
    return result;
  }

  // ─── Version ───

  async updateVersion(newVersion) {
    const versionPath = path.join(this.lmasCoreDir, 'version.json');
    const info = {
      version: newVersion,
      installedAt: null,
      updatedAt: new Date().toISOString(),
      mode: 'smart-update',
    };

    // Preserve installedAt from existing
    if (await fs.pathExists(versionPath)) {
      try {
        const existing = await fs.readJson(versionPath);
        info.installedAt = existing.installedAt || info.updatedAt;
      } catch { info.installedAt = info.updatedAt; }
    } else {
      info.installedAt = info.updatedAt;
    }

    await fs.ensureDir(path.dirname(versionPath));
    await fs.writeJson(versionPath, info, { spaces: 2 });
  }

  // ─── Validation ───

  async postValidate() {
    const checks = [];

    // 1. All hooks referenced in settings.local.json exist
    const settingsPath = path.join(this.projectRoot, '.claude', 'settings.local.json');
    if (await fs.pathExists(settingsPath)) {
      try {
        const settings = await fs.readJson(settingsPath);
        if (settings.hooks) {
          for (const [event, entries] of Object.entries(settings.hooks)) {
            for (const entry of entries) {
              if (!Array.isArray(entry.hooks)) continue;
              for (const h of entry.hooks) {
                if (!h.command) continue;
                // Extract hook filename from command
                const match = h.command.match(/hooks[/\\]([^"]+\.cjs)/);
                if (match) {
                  const hookPath = path.join(this.projectRoot, '.claude', 'hooks', match[1]);
                  if (!await fs.pathExists(hookPath)) {
                    checks.push({ ok: false, msg: `Hook missing: ${match[1]} (${event})` });
                  } else {
                    checks.push({ ok: true, msg: `Hook exists: ${match[1]}` });
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        checks.push({ ok: false, msg: `settings.local.json parse error: ${error.message}` });
      }
    }

    // 2. version.json exists and has version
    const versionPath = path.join(this.lmasCoreDir, 'version.json');
    if (await fs.pathExists(versionPath)) {
      try {
        const info = await fs.readJson(versionPath);
        checks.push({ ok: !!info.version, msg: `version.json: ${info.version || 'MISSING VERSION'}` });
      } catch {
        checks.push({ ok: false, msg: 'version.json corrupted' });
      }
    }

    // 3. core-config.yaml exists
    const configPath = path.join(this.lmasCoreDir, 'core-config.yaml');
    checks.push({
      ok: await fs.pathExists(configPath),
      msg: `core-config.yaml: ${await fs.pathExists(configPath) ? 'exists' : 'MISSING'}`,
    });

    const failed = checks.filter(c => !c.ok);
    return {
      success: failed.length === 0,
      checks,
      error: failed.length > 0 ? failed.map(f => f.msg).join('; ') : null,
    };
  }

  // ─── Cleanup ───

  async cleanup() {
    if (this.tempDir) {
      // tempDir is inside a parent temp directory
      const tempBase = path.dirname(path.dirname(this.tempDir));
      if (tempBase.includes('matrix-update-')) {
        await fs.remove(tempBase).catch(() => {});
      }
      this.tempDir = null;
    }
  }

  // ─── Logging ───

  log(message) {
    if (this.options.verbose) {
      console.log(`  [updater] ${message}`);
    }
  }
}

// ─── Formatters ───

function formatCheckResult(result, options = {}) {
  const c = options.colors !== false ? {
    reset: '\x1b[0m', bold: '\x1b[1m', green: '\x1b[32m',
    yellow: '\x1b[33m', red: '\x1b[31m', cyan: '\x1b[36m', dim: '\x1b[2m',
  } : { reset: '', bold: '', green: '', yellow: '', red: '', cyan: '', dim: '' };

  const lines = [''];

  if (result.installed) {
    lines.push(`  📦 Instalado: ${c.cyan}v${result.installed}${c.reset}`);
  } else {
    lines.push(`  📦 Instalado: ${c.red}não encontrado${c.reset}`);
  }

  if (result.latest) {
    lines.push(`  📦 Disponível: ${c.cyan}v${result.latest}${c.reset}`);
  }

  lines.push('');

  switch (result.status) {
    case UpdateStatus.UP_TO_DATE:
      lines.push(`  ${c.green}✓ Atualizado!${c.reset}`);
      break;
    case UpdateStatus.UPDATE_AVAILABLE:
      lines.push(`  ${c.yellow}⬆ Update disponível!${c.reset}`);
      lines.push(`  Execute ${c.cyan}matrix update${c.reset} para atualizar.`);
      break;
    case UpdateStatus.CHECK_FAILED:
      lines.push(`  ${c.red}✗ Erro: ${result.error}${c.reset}`);
      break;
  }

  lines.push('');
  return lines.join('\n');
}

function formatUpdateResult(result, options = {}) {
  const c = options.colors !== false ? {
    reset: '\x1b[0m', bold: '\x1b[1m', green: '\x1b[32m',
    yellow: '\x1b[33m', red: '\x1b[31m', cyan: '\x1b[36m', dim: '\x1b[2m',
  } : { reset: '', bold: '', green: '', yellow: '', red: '', cyan: '', dim: '' };

  const lines = [''];

  if (result.success && result.error === 'Already up to date') {
    lines.push(`  ${c.green}✓ Já está na versão mais recente (v${result.newVersion})${c.reset}`);
    lines.push('');
    return lines.join('\n');
  }

  if (result.success) {
    if (result.dryRun) {
      lines.push(`  ${c.bold}📋 Preview (dry-run) — v${result.previousVersion} → v${result.newVersion}${c.reset}`);
    } else {
      lines.push(`  ${c.green}${c.bold}✅ Matrix atualizada: v${result.previousVersion} → v${result.newVersion}${c.reset}`);
    }

    lines.push('');

    if (result.filesNew > 0) {
      lines.push(`  ${c.green}+ ${result.filesNew} arquivo(s) novo(s)${c.reset}`);
    }
    if (result.filesUpdated > 0) {
      lines.push(`  ${c.yellow}~ ${result.filesUpdated} arquivo(s) atualizado(s)${c.reset}`);
    }
    if (result.filesPreserved > 0) {
      lines.push(`  ${c.cyan}= ${result.filesPreserved} arquivo(s) preservado(s)${c.reset}`);
    }
    if (result.hooksRegistered > 0) {
      lines.push(`  ${c.green}⚡ ${result.hooksRegistered} hook(s) registrado(s)${c.reset}`);
    }

    // Show file details if available
    if (result.fileDetails && result.fileDetails.length > 0) {
      const notable = result.fileDetails.filter(f =>
        f.action === FileAction.NEW || f.action === FileAction.UPDATED
      );
      if (notable.length > 0 && notable.length <= 20) {
        lines.push('');
        lines.push(`  ${c.dim}Arquivos:${c.reset}`);
        for (const f of notable) {
          const sym = f.action === FileAction.NEW ? '+' : '~';
          lines.push(`    ${c.dim}${sym}${c.reset} ${f.relPath}`);
        }
      }
    }

    if (!result.dryRun) {
      lines.push('');
      lines.push(`  ${c.dim}Backup disponível em .lmas/backups/${c.reset}`);
    }
  } else {
    lines.push(`  ${c.red}${c.bold}✗ Update falhou${c.reset}`);
    lines.push(`  ${c.red}${result.error}${c.reset}`);
  }

  lines.push('');
  return lines.join('\n');
}

module.exports = {
  LMASUpdater,
  UpdateStatus,
  FileAction,
  formatCheckResult,
  formatUpdateResult,
};
