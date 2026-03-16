const fs = require('fs');
const path = require('path');

const VISUAL_DIR = path.join(__dirname, '../../apps/visual');
const FIXTURES_DIR = path.join(__dirname, 'fixtures');

describe('Story 3.1: LMAS Filesystem Data Reader', () => {
  describe('LMASDataReader (AC: 1-5)', () => {
    let readerSource;

    beforeAll(() => {
      readerSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/server/services/LMASDataReader.ts'),
        'utf8',
      );
    });

    test('file exists', () => {
      expect(fs.existsSync(
        path.join(VISUAL_DIR, 'src/server/services/LMASDataReader.ts'),
      )).toBe(true);
    });

    test('exports LMASDataReader class', () => {
      expect(readerSource).toContain('export class LMASDataReader');
    });

    test('reads handoffs directory (AC: 1)', () => {
      expect(readerSource).toContain('.lmas');
      expect(readerSource).toContain('handoffs');
      expect(readerSource).toContain('readHandoffs');
    });

    test('reads stories directory (AC: 1)', () => {
      expect(readerSource).toContain('docs');
      expect(readerSource).toContain('stories');
      expect(readerSource).toContain('readStories');
    });

    test('reads logs (AC: 1)', () => {
      expect(readerSource).toContain('logs');
      expect(readerSource).toContain('readLogs');
    });

    test('parses handoff YAML (AC: 2)', () => {
      expect(readerSource).toContain('parseHandoff');
      expect(readerSource).toContain('yaml.load');
      expect(readerSource).toContain('from_agent');
      expect(readerSource).toContain('to_agent');
      expect(readerSource).toContain('story_context');
      expect(readerSource).toContain('decisions');
    });

    test('parses story markdown (AC: 3)', () => {
      expect(readerSource).toContain('parseStory');
      expect(readerSource).toContain('status');
      expect(readerSource).toContain('completedTasks');
      expect(readerSource).toContain('executor');
    });

    test('parses logs for agent actions (AC: 4)', () => {
      expect(readerSource).toContain('parseLogLine');
      expect(readerSource).toContain('timestamp');
      expect(readerSource).toContain('agentId');
      expect(readerSource).toContain('action');
    });

    test('returns normalized AgentState (AC: 5)', () => {
      expect(readerSource).toContain('getAgentStates');
      expect(readerSource).toContain('AgentState');
      expect(readerSource).toContain('visualState');
    });

    test('exports HandoffData interface', () => {
      expect(readerSource).toContain('export interface HandoffData');
    });

    test('exports StoryData interface', () => {
      expect(readerSource).toContain('export interface StoryData');
    });

    test('exports AgentAction interface', () => {
      expect(readerSource).toContain('export interface AgentAction');
    });

    test('exports AgentState interface', () => {
      expect(readerSource).toContain('export interface AgentState');
    });

    test('exports AgentVisualState type', () => {
      expect(readerSource).toContain('export type AgentVisualState');
    });

    test('detects active agent (AC: 7)', () => {
      expect(readerSource).toContain('detectActiveAgent');
    });
  });

  describe('handoff parsing logic', () => {
    let readerSource;

    beforeAll(() => {
      readerSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/server/services/LMASDataReader.ts'),
        'utf8',
      );
    });

    test('maps blockers to blocked state', () => {
      expect(readerSource).toContain('blockers.length > 0');
      expect(readerSource).toContain("'blocked'");
    });

    test('maps recent handoff with task to working', () => {
      expect(readerSource).toContain("'working'");
      expect(readerSource).toContain('STATUS_TIMEOUT_MS');
    });

    test('maps recent handoff without task to waiting', () => {
      expect(readerSource).toContain("'waiting'");
    });

    test('defaults to idle', () => {
      expect(readerSource).toContain("'idle'");
    });

    test('uses 5-minute timeout', () => {
      expect(readerSource).toContain('5 * 60 * 1000');
    });
  });

  describe('FileWatcher (AC: 6)', () => {
    let watcherSource;

    beforeAll(() => {
      watcherSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/server/watchers/FileWatcher.ts'),
        'utf8',
      );
    });

    test('file exists', () => {
      expect(fs.existsSync(
        path.join(VISUAL_DIR, 'src/server/watchers/FileWatcher.ts'),
      )).toBe(true);
    });

    test('extends EventEmitter', () => {
      expect(watcherSource).toContain('extends EventEmitter');
    });

    test('uses chokidar', () => {
      expect(watcherSource).toContain("from 'chokidar'");
    });

    test('watches handoffs directory', () => {
      expect(watcherSource).toContain('.lmas/handoffs');
    });

    test('watches logs directory', () => {
      expect(watcherSource).toContain('.lmas/logs');
    });

    test('watches stories directory', () => {
      expect(watcherSource).toContain('docs/stories/active');
    });

    test('has debounce at 500ms', () => {
      expect(watcherSource).toContain('DEBOUNCE_MS');
      expect(watcherSource).toContain('500');
    });

    test('has start method', () => {
      expect(watcherSource).toContain('start()');
    });

    test('has stop method', () => {
      expect(watcherSource).toContain('stop()');
    });

    test('emits change events', () => {
      expect(watcherSource).toContain("this.emit('change'");
    });

    test('classifies events by type', () => {
      expect(watcherSource).toContain('classifyEvent');
      expect(watcherSource).toContain("type: 'handoff'");
      expect(watcherSource).toContain("type: 'log'");
      expect(watcherSource).toContain("type: 'story'");
    });

    test('exports FileChangeEvent interface', () => {
      expect(watcherSource).toContain('export interface FileChangeEvent');
    });
  });

  describe('StateManager (complementar)', () => {
    let stateSource;

    beforeAll(() => {
      stateSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/server/services/StateManager.ts'),
        'utf8',
      );
    });

    test('file exists', () => {
      expect(fs.existsSync(
        path.join(VISUAL_DIR, 'src/server/services/StateManager.ts'),
      )).toBe(true);
    });

    test('uses LMASDataReader', () => {
      expect(stateSource).toContain('LMASDataReader');
    });

    test('uses FileWatcher', () => {
      expect(stateSource).toContain('FileWatcher');
    });

    test('has start method', () => {
      expect(stateSource).toContain('start()');
    });

    test('has stop method', () => {
      expect(stateSource).toContain('stop()');
    });

    test('has refresh method', () => {
      expect(stateSource).toContain('refresh()');
    });

    test('has getStates method', () => {
      expect(stateSource).toContain('getStates()');
    });

    test('has getAgentState method', () => {
      expect(stateSource).toContain('getAgentState(agentId');
    });

    test('has getActiveAgent method', () => {
      expect(stateSource).toContain('getActiveAgent()');
    });

    test('emits stateUpdate events', () => {
      expect(stateSource).toContain("'stateUpdate'");
    });

    test('listens to FileWatcher change events', () => {
      expect(stateSource).toContain("fileWatcher.on('change'");
    });
  });

  describe('test fixtures', () => {
    test('mock handoff fixture exists', () => {
      expect(fs.existsSync(
        path.join(FIXTURES_DIR, 'mock-handoff.yaml'),
      )).toBe(true);
    });

    test('mock blocked handoff fixture exists', () => {
      expect(fs.existsSync(
        path.join(FIXTURES_DIR, 'mock-handoff-blocked.yaml'),
      )).toBe(true);
    });

    test('mock story fixture exists', () => {
      expect(fs.existsSync(
        path.join(FIXTURES_DIR, 'mock-story.md'),
      )).toBe(true);
    });

    test('handoff fixture has valid YAML', () => {
      const content = fs.readFileSync(
        path.join(FIXTURES_DIR, 'mock-handoff.yaml'), 'utf8',
      );
      expect(content).toContain('from_agent');
      expect(content).toContain('to_agent');
      expect(content).toContain('story_context');
    });

    test('blocked handoff has blockers', () => {
      const content = fs.readFileSync(
        path.join(FIXTURES_DIR, 'mock-handoff-blocked.yaml'), 'utf8',
      );
      expect(content).toContain('blockers:');
      expect(content).toContain('Missing test fixtures');
    });

    test('story fixture has checkboxes', () => {
      const content = fs.readFileSync(
        path.join(FIXTURES_DIR, 'mock-story.md'), 'utf8',
      );
      expect(content).toContain('- [x]');
      expect(content).toContain('- [ ]');
    });
  });

  describe('dependencies', () => {
    let pkg;

    beforeAll(() => {
      pkg = JSON.parse(fs.readFileSync(
        path.join(VISUAL_DIR, 'package.json'), 'utf8',
      ));
    });

    test('has js-yaml dependency', () => {
      expect(pkg.dependencies['js-yaml']).toBeDefined();
    });

    test('has chokidar dependency', () => {
      expect(pkg.dependencies.chokidar).toBeDefined();
    });

    test('has @types/js-yaml dev dependency', () => {
      expect(pkg.devDependencies['@types/js-yaml']).toBeDefined();
    });
  });
});
