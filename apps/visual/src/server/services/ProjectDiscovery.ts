import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export interface ProjectInfo {
  name: string;
  path: string;
  lastActivity: number;
  storyCount: number;
  agentCount: number;
}

const LMAS_MARKERS = ['.lmas-core', 'core-config.yaml'] as const;
const DEFAULT_SCAN_DEPTH = 1;

/**
 * Discovers LMAS projects by scanning directories for .lmas-core/ or core-config.yaml.
 * Scan paths: LMAS_PROJECTS_PATH env var, parent workspace, home directory.
 */
export class ProjectDiscovery {
  private scanPaths: string[];

  constructor(defaultWorkspace?: string) {
    this.scanPaths = this.buildScanPaths(defaultWorkspace);
  }

  /**
   * Discover all LMAS projects from configured scan paths.
   */
  discoverProjects(): ProjectInfo[] {
    const seen = new Set<string>();
    const projects: ProjectInfo[] = [];

    for (const scanPath of this.scanPaths) {
      try {
        if (!fs.existsSync(scanPath) || !fs.statSync(scanPath).isDirectory()) {
          continue;
        }

        // Check if scanPath itself is an LMAS project
        if (this.isLMASProject(scanPath)) {
          const resolved = path.resolve(scanPath);
          if (!seen.has(resolved)) {
            seen.add(resolved);
            const info = this.buildProjectInfo(resolved);
            if (info) projects.push(info);
          }
        }

        // Scan child directories (1 level deep)
        const entries = fs.readdirSync(scanPath, { withFileTypes: true });
        for (const entry of entries) {
          if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
          const childPath = path.resolve(scanPath, entry.name);
          if (this.isLMASProject(childPath) && !seen.has(childPath)) {
            seen.add(childPath);
            const info = this.buildProjectInfo(childPath);
            if (info) projects.push(info);
          }
        }
      } catch (error) {
        // Skip inaccessible directories silently
        continue;
      }
    }

    // Sort by lastActivity (most recent first)
    projects.sort((a, b) => b.lastActivity - a.lastActivity);
    return projects;
  }

  /**
   * Validate that a path is a legitimate LMAS project directory.
   */
  validateProjectPath(projectPath: string): boolean {
    try {
      const resolved = path.resolve(projectPath);

      // Prevent path traversal
      if (resolved.includes('..')) return false;

      // Must exist and be a directory
      if (!fs.existsSync(resolved) || !fs.statSync(resolved).isDirectory()) {
        return false;
      }

      // Must contain LMAS markers
      return this.isLMASProject(resolved);
    } catch {
      return false;
    }
  }

  /**
   * Build project info from a validated project path.
   */
  getProjectInfo(projectPath: string): ProjectInfo | null {
    const resolved = path.resolve(projectPath);
    if (!this.validateProjectPath(resolved)) return null;
    return this.buildProjectInfo(resolved);
  }

  private isLMASProject(dirPath: string): boolean {
    return LMAS_MARKERS.some(marker => {
      try {
        return fs.existsSync(path.join(dirPath, marker));
      } catch {
        return false;
      }
    });
  }

  private buildProjectInfo(projectPath: string): ProjectInfo | null {
    try {
      const name = this.extractProjectName(projectPath);
      const lastActivity = this.getLastActivity(projectPath);
      const storyCount = this.countStories(projectPath);
      const agentCount = this.countAgents(projectPath);

      return {
        name,
        path: projectPath,
        lastActivity,
        storyCount,
        agentCount,
      };
    } catch {
      return null;
    }
  }

  private extractProjectName(projectPath: string): string {
    // Try to read name from core-config.yaml
    try {
      const configPath = path.join(projectPath, 'core-config.yaml');
      if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, 'utf-8');
        const config = yaml.load(content) as Record<string, unknown>;
        if (config?.project && typeof (config.project as Record<string, unknown>).name === 'string') {
          return (config.project as Record<string, unknown>).name as string;
        }
      }
    } catch {
      // Fall through to directory name
    }

    // Fallback: use directory name
    return path.basename(projectPath);
  }

  private getLastActivity(projectPath: string): number {
    const candidates = [
      path.join(projectPath, '.lmas', 'handoffs'),
      path.join(projectPath, '.lmas', 'logs'),
      path.join(projectPath, 'docs', 'stories', 'active'),
    ];

    let latest = 0;
    for (const candidate of candidates) {
      try {
        if (fs.existsSync(candidate)) {
          const stat = fs.statSync(candidate);
          if (stat.mtimeMs > latest) latest = stat.mtimeMs;
        }
      } catch {
        continue;
      }
    }

    // Fallback to project root mtime
    if (latest === 0) {
      try {
        latest = fs.statSync(projectPath).mtimeMs;
      } catch {
        latest = Date.now();
      }
    }

    return latest;
  }

  private countStories(projectPath: string): number {
    const storiesDir = path.join(projectPath, 'docs', 'stories', 'active');
    try {
      if (!fs.existsSync(storiesDir)) return 0;
      return fs.readdirSync(storiesDir).filter(f => f.endsWith('.md')).length;
    } catch {
      return 0;
    }
  }

  private countAgents(projectPath: string): number {
    const agentsDir = path.join(projectPath, '.lmas-core', 'development', 'agents');
    try {
      if (!fs.existsSync(agentsDir)) return 0;
      return fs.readdirSync(agentsDir).filter(f => f.endsWith('.md')).length;
    } catch {
      return 0;
    }
  }

  private buildScanPaths(defaultWorkspace?: string): string[] {
    const paths: string[] = [];

    // 1. LMAS_PROJECTS_PATH env var (highest priority)
    const envPaths = process.env.LMAS_PROJECTS_PATH;
    if (envPaths) {
      const separator = process.platform === 'win32' ? ';' : ':';
      paths.push(...envPaths.split(separator).filter(Boolean));
    }

    // 2. Default workspace (parent of server)
    if (defaultWorkspace) {
      paths.push(defaultWorkspace);
    }

    // 3. Current working directory (often the project root when running npm run dev)
    const cwd = process.cwd();
    if (cwd && cwd !== defaultWorkspace) {
      paths.push(cwd);
    }

    // 4. Parent of cwd (if npm run dev is called from apps/visual/)
    const cwdParent = path.dirname(cwd);
    const cwdGrandparent = path.dirname(cwdParent);
    if (cwdGrandparent && cwdGrandparent !== cwd) {
      paths.push(cwdGrandparent);
    }

    // 5. Home directory (shallow scan)
    const home = process.env.HOME ?? process.env.USERPROFILE;
    if (home) {
      paths.push(home);
    }

    return paths;
  }
}
