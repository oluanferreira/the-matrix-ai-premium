import { EventEmitter } from 'events';
import { GitReader } from '@/server/services/GitReader';
import type { GitCommit } from '@/server/services/GitReader';

const DEFAULT_POLL_INTERVAL_MS = 10_000; // 10 seconds

/**
 * Polls git for new commits at configurable intervals.
 * Emits 'newCommit' when a new commit is detected.
 */
export class GitPoller extends EventEmitter {
  private gitReader: GitReader;
  private pollInterval: number;
  private timer: ReturnType<typeof setInterval> | null = null;
  private lastCommitHash: string | null = null;

  constructor(cwd: string, pollIntervalMs: number = DEFAULT_POLL_INTERVAL_MS) {
    super();
    this.gitReader = new GitReader(cwd);
    this.pollInterval = pollIntervalMs;
  }

  start(): void {
    // Get initial commit hash
    this.lastCommitHash = this.gitReader.getLatestCommitHash();

    this.timer = setInterval(() => {
      this.poll();
    }, this.pollInterval);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  poll(): void {
    const currentHash = this.gitReader.getLatestCommitHash();
    if (!currentHash) return;

    if (this.lastCommitHash && currentHash !== this.lastCommitHash) {
      const commits = this.gitReader.getRecentCommits(5);
      const newCommits = this.getNewCommits(commits);
      for (const commit of newCommits) {
        this.emit('newCommit', commit);
      }
    }
    this.lastCommitHash = currentHash;
  }

  private getNewCommits(commits: GitCommit[]): GitCommit[] {
    if (!this.lastCommitHash) return [];
    const newOnes: GitCommit[] = [];
    for (const commit of commits) {
      if (commit.hash === this.lastCommitHash) break;
      newOnes.push(commit);
    }
    return newOnes;
  }

  getPollInterval(): number {
    return this.pollInterval;
  }
}
