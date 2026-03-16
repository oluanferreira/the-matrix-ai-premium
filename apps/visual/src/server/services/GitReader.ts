import { execSync } from 'child_process';

export interface GitCommit {
  hash: string;
  message: string;
  author: string;
  timestamp: number;
  storyId: string | null;
  agentId: string | null;
}

export interface GitStatus {
  branch: string;
  modifiedFiles: string[];
  stagedFiles: string[];
  untrackedFiles: string[];
}

/**
 * Reads git activity via child_process.
 * Zero external deps — uses Node.js stdlib only.
 */
export class GitReader {
  private cwd: string;

  constructor(cwd: string) {
    this.cwd = cwd;
  }

  // ── Git Log ──

  getRecentCommits(count: number = 20): GitCommit[] {
    const output = this.exec(`git log --oneline --format="%H|%s|%an|%aI" -${count}`);
    if (!output) return [];

    return output.trim().split('\n')
      .filter(line => line.trim())
      .map(line => this.parseCommitLine(line))
      .filter((c): c is GitCommit => c !== null);
  }

  parseCommitLine(line: string): GitCommit | null {
    const parts = line.split('|');
    if (parts.length < 4) return null;

    const [hash, message, author, dateStr] = parts;
    const storyId = this.extractStoryId(message);
    const agentId = this.extractAgentId(message);

    return {
      hash: hash.trim(),
      message: message.trim(),
      author: author.trim(),
      timestamp: new Date(dateStr.trim()).getTime(),
      storyId,
      agentId,
    };
  }

  // ── Git Status ──

  getStatus(): GitStatus {
    const branch = this.getCurrentBranch();
    const statusOutput = this.exec('git status --porcelain');
    const lines = (statusOutput ?? '').trim().split('\n').filter(l => l.trim());

    const modifiedFiles: string[] = [];
    const stagedFiles: string[] = [];
    const untrackedFiles: string[] = [];

    for (const line of lines) {
      const staged = line.charAt(0);
      const unstaged = line.charAt(1);
      const file = line.substring(3).trim();

      if (staged === '?' && unstaged === '?') {
        untrackedFiles.push(file);
      } else {
        if (staged !== ' ' && staged !== '?') stagedFiles.push(file);
        if (unstaged !== ' ' && unstaged !== '?') modifiedFiles.push(file);
      }
    }

    return { branch, modifiedFiles, stagedFiles, untrackedFiles };
  }

  // ── Git Branch ──

  getCurrentBranch(): string {
    const output = this.exec('git branch --show-current');
    return (output ?? 'unknown').trim();
  }

  // ── Commit → Agent Mapping ──

  extractStoryId(message: string): string | null {
    // Match [Story X.Y] or [Story X.Y.Z]
    const match = message.match(/\[Story\s+([\d.]+)\]/i);
    return match ? match[1] : null;
  }

  extractAgentId(message: string): string | null {
    // Match Co-Authored-By patterns
    const coAuthorMatch = message.match(/Co-Authored-By:\s*(.+?)(?:\s*<|$)/i);
    if (coAuthorMatch) {
      const name = coAuthorMatch[1].trim().toLowerCase();
      if (name.includes('claude') || name.includes('neo')) return 'dev';
      if (name.includes('oracle')) return 'qa';
    }

    // Match conventional commit prefixes to infer agent
    if (message.startsWith('feat:') || message.startsWith('fix:') || message.startsWith('refactor:')) return 'dev';
    if (message.startsWith('test:')) return 'qa';
    if (message.startsWith('docs:')) return 'dev';
    if (message.startsWith('chore:')) return 'dev';

    return null;
  }

  // ── Latest Commit Hash ──

  getLatestCommitHash(): string | null {
    const output = this.exec('git rev-parse HEAD');
    return output ? output.trim() : null;
  }

  // ── Helper ──

  private exec(command: string): string | null {
    try {
      return execSync(command, {
        cwd: this.cwd,
        encoding: 'utf8',
        timeout: 5000,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
    } catch {
      return null;
    }
  }
}
