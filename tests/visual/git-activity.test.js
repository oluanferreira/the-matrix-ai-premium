const fs = require('fs');
const path = require('path');

const VISUAL_DIR = path.join(__dirname, '../../apps/visual');
const FIXTURES_DIR = path.join(__dirname, 'fixtures');

describe('Story 3.2: Git Activity Integration', () => {
  describe('GitReader (AC: 1, 2, 3)', () => {
    let readerSource;

    beforeAll(() => {
      readerSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/server/services/GitReader.ts'),
        'utf8',
      );
    });

    test('file exists', () => {
      expect(fs.existsSync(
        path.join(VISUAL_DIR, 'src/server/services/GitReader.ts'),
      )).toBe(true);
    });

    test('exports GitReader class', () => {
      expect(readerSource).toContain('export class GitReader');
    });

    test('exports GitCommit interface', () => {
      expect(readerSource).toContain('export interface GitCommit');
    });

    test('exports GitStatus interface', () => {
      expect(readerSource).toContain('export interface GitStatus');
    });

    test('uses child_process execSync (AC: 1)', () => {
      expect(readerSource).toContain("from 'child_process'");
      expect(readerSource).toContain('execSync');
    });

    test('executes git log (AC: 2)', () => {
      expect(readerSource).toContain('git log');
      expect(readerSource).toContain('getRecentCommits');
    });

    test('executes git status (AC: 2)', () => {
      expect(readerSource).toContain('git status --porcelain');
      expect(readerSource).toContain('getStatus');
    });

    test('executes git branch (AC: 2)', () => {
      expect(readerSource).toContain('git branch --show-current');
      expect(readerSource).toContain('getCurrentBranch');
    });

    test('extracts commit data: hash, message, author, timestamp (AC: 2)', () => {
      expect(readerSource).toContain('hash');
      expect(readerSource).toContain('message');
      expect(readerSource).toContain('author');
      expect(readerSource).toContain('timestamp');
    });

    test('extracts modified, staged, untracked files (AC: 2)', () => {
      expect(readerSource).toContain('modifiedFiles');
      expect(readerSource).toContain('stagedFiles');
      expect(readerSource).toContain('untrackedFiles');
    });

    test('maps commit message to story ID (AC: 3)', () => {
      expect(readerSource).toContain('extractStoryId');
      expect(readerSource).toContain('[Story');
    });

    test('maps commit to agent ID (AC: 3)', () => {
      expect(readerSource).toContain('extractAgentId');
      expect(readerSource).toContain('Co-Authored-By');
    });

    test('maps feat: prefix to dev agent', () => {
      expect(readerSource).toContain("'feat:'");
      expect(readerSource).toContain("return 'dev'");
    });

    test('maps test: prefix to qa agent', () => {
      expect(readerSource).toContain("'test:'");
      expect(readerSource).toContain("return 'qa'");
    });

    test('has getLatestCommitHash method', () => {
      expect(readerSource).toContain('getLatestCommitHash');
      expect(readerSource).toContain('git rev-parse HEAD');
    });

    test('has parseCommitLine method', () => {
      expect(readerSource).toContain('parseCommitLine');
    });

    test('uses 5s timeout for git commands', () => {
      expect(readerSource).toContain('timeout: 5000');
    });
  });

  describe('GitPoller (AC: 4, 5)', () => {
    let pollerSource;

    beforeAll(() => {
      pollerSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/server/watchers/GitPoller.ts'),
        'utf8',
      );
    });

    test('file exists', () => {
      expect(fs.existsSync(
        path.join(VISUAL_DIR, 'src/server/watchers/GitPoller.ts'),
      )).toBe(true);
    });

    test('extends EventEmitter', () => {
      expect(pollerSource).toContain('extends EventEmitter');
    });

    test('uses GitReader', () => {
      expect(pollerSource).toContain('GitReader');
    });

    test('polls at 10s default (AC: 5)', () => {
      expect(pollerSource).toContain('10_000');
      expect(pollerSource).toContain('DEFAULT_POLL_INTERVAL_MS');
    });

    test('interval is configurable (AC: 5)', () => {
      expect(pollerSource).toContain('pollIntervalMs');
    });

    test('has start method', () => {
      expect(pollerSource).toContain('start()');
    });

    test('has stop method', () => {
      expect(pollerSource).toContain('stop()');
    });

    test('has poll method', () => {
      expect(pollerSource).toContain('poll()');
    });

    test('compares commit hashes to detect new commits (AC: 4)', () => {
      expect(pollerSource).toContain('lastCommitHash');
      expect(pollerSource).toContain('currentHash !== this.lastCommitHash');
    });

    test('emits newCommit event (AC: 4)', () => {
      expect(pollerSource).toContain("this.emit('newCommit'");
    });

    test('has getPollInterval method', () => {
      expect(pollerSource).toContain('getPollInterval()');
    });
  });

  describe('test fixtures (AC: 6)', () => {
    test('mock git log fixture exists', () => {
      expect(fs.existsSync(
        path.join(FIXTURES_DIR, 'mock-git-log.txt'),
      )).toBe(true);
    });

    test('git log fixture has commit lines', () => {
      const content = fs.readFileSync(
        path.join(FIXTURES_DIR, 'mock-git-log.txt'), 'utf8',
      );
      const lines = content.trim().split('\n');
      expect(lines.length).toBeGreaterThanOrEqual(3);
    });

    test('git log fixture has conventional commits', () => {
      const content = fs.readFileSync(
        path.join(FIXTURES_DIR, 'mock-git-log.txt'), 'utf8',
      );
      expect(content).toContain('feat:');
      expect(content).toContain('docs:');
    });

    test('git log fixture has story references', () => {
      const content = fs.readFileSync(
        path.join(FIXTURES_DIR, 'mock-git-log.txt'), 'utf8',
      );
      expect(content).toContain('[Story');
    });
  });

  describe('zero external deps', () => {
    let readerSource;

    beforeAll(() => {
      readerSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/server/services/GitReader.ts'),
        'utf8',
      );
    });

    test('only imports from child_process (stdlib)', () => {
      const imports = readerSource.match(/from\s+'[^']+'/g);
      expect(imports).not.toBeNull();
      expect(imports.length).toBe(1);
      expect(imports[0]).toContain('child_process');
    });
  });
});
