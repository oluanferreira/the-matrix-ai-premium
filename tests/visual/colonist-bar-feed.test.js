const fs = require('fs');
const path = require('path');

const VISUAL_DIR = path.join(__dirname, '../../apps/visual');

describe('Story 4.2: Colonist Bar & Activity Feed', () => {
  describe('ColonistBar (AC: 1, 2, 3, 5)', () => {
    let barSource;

    beforeAll(() => {
      barSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/ui/ColonistBar.ts'),
        'utf8',
      );
    });

    test('file exists', () => {
      expect(fs.existsSync(
        path.join(VISUAL_DIR, 'src/client/ui/ColonistBar.ts'),
      )).toBe(true);
    });

    test('exports ColonistBar class', () => {
      expect(barSource).toContain('export class ColonistBar');
    });

    test('creates DOM container', () => {
      expect(barSource).toContain("document.createElement('div')");
      expect(barSource).toContain("'colonist-bar'");
    });

    test('fixed at top of screen', () => {
      expect(barSource).toContain("position = 'fixed'");
      expect(barSource).toContain("top = '0'");
    });

    test('imports ALL_AGENTS for all 19 portraits (AC: 1)', () => {
      expect(barSource).toContain('ALL_AGENTS');
      expect(barSource).toContain("from '@/client/data/agent-config'");
    });

    test('creates mini-portrait for each agent (AC: 1)', () => {
      expect(barSource).toContain('colonist-portrait');
      expect(barSource).toContain('createPortraits');
    });

    test('uses 24x24 portrait size (AC: 1)', () => {
      expect(barSource).toContain('PORTRAIT_SIZE');
      expect(barSource).toContain('24');
    });

    test('has colored status border (AC: 2)', () => {
      expect(barSource).toContain('STATUS_BORDER_COLORS');
      expect(barSource).toContain('borderColor');
    });

    test('has all 4 status border colors (AC: 2)', () => {
      expect(barSource).toContain("working: '#00FF41'");
      expect(barSource).toContain("waiting: '#FFD700'");
      expect(barSource).toContain("blocked: '#FF0000'");
      expect(barSource).toContain("idle: '#808080'");
    });

    test('updateStatus method changes border color (AC: 2)', () => {
      expect(barSource).toContain('updateStatus(agentId');
    });

    test('click triggers onAgentClick callback (AC: 3)', () => {
      expect(barSource).toContain('onAgentClick');
      expect(barSource).toContain("addEventListener('click'");
    });

    test('right-click filters feed (AC: 5)', () => {
      expect(barSource).toContain("addEventListener('contextmenu'");
      expect(barSource).toContain('onAgentFilter');
    });

    test('has filter toggle (click same agent clears filter)', () => {
      expect(barSource).toContain('clearFilter');
      expect(barSource).toContain('activeFilter');
    });

    test('has Matrix terminal style', () => {
      expect(barSource).toContain('0D0208');
      expect(barSource).toContain('#00FF41');
      expect(barSource).toContain('monospace');
    });

    test('shows label on hover', () => {
      expect(barSource).toContain('portrait-label');
      expect(barSource).toContain('displayName');
    });

    test('has destroy method', () => {
      expect(barSource).toContain('destroy()');
    });

    test('exports ColonistBarCallbacks interface', () => {
      expect(barSource).toContain('export interface ColonistBarCallbacks');
    });
  });

  describe('ActivityFeed (AC: 4, 5, 6)', () => {
    let feedSource;

    beforeAll(() => {
      feedSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/ui/ActivityFeed.ts'),
        'utf8',
      );
    });

    test('file exists', () => {
      expect(fs.existsSync(
        path.join(VISUAL_DIR, 'src/client/ui/ActivityFeed.ts'),
      )).toBe(true);
    });

    test('exports ActivityFeed class', () => {
      expect(feedSource).toContain('export class ActivityFeed');
    });

    test('exports ActivityEntry interface', () => {
      expect(feedSource).toContain('export interface ActivityEntry');
    });

    test('fixed at bottom of screen (AC: 4)', () => {
      expect(feedSource).toContain("position = 'fixed'");
      expect(feedSource).toContain("bottom = '0'");
    });

    test('has scrollable list (AC: 4)', () => {
      expect(feedSource).toContain("overflowY = 'auto'");
    });

    test('formats entries as [HH:MM] @agente — ação (AC: 4)', () => {
      expect(feedSource).toContain('formatTime');
      expect(feedSource).toContain('feed-time');
      expect(feedSource).toContain('feed-agent');
      expect(feedSource).toContain('feed-action');
    });

    test('has addEntry method', () => {
      expect(feedSource).toContain('addEntry(entry');
    });

    test('FIFO max 50 entries (AC: 6)', () => {
      expect(feedSource).toContain('MAX_ENTRIES');
      expect(feedSource).toContain('50');
      expect(feedSource).toContain('this.entries.shift()');
    });

    test('supports filter by agent (AC: 5)', () => {
      expect(feedSource).toContain('setFilter');
      expect(feedSource).toContain('activeFilter');
      expect(feedSource).toContain('this.entries.filter');
    });

    test('auto-scrolls to bottom', () => {
      expect(feedSource).toContain('scrollTop');
      expect(feedSource).toContain('scrollHeight');
    });

    test('uses AGENT_CONFIG_MAP for display names', () => {
      expect(feedSource).toContain('AGENT_CONFIG_MAP');
    });

    test('escapes HTML in entries', () => {
      expect(feedSource).toContain('escapeHtml');
    });

    test('has clear method', () => {
      expect(feedSource).toContain('clear()');
    });

    test('has destroy method', () => {
      expect(feedSource).toContain('destroy()');
    });

    test('has Matrix terminal style', () => {
      expect(feedSource).toContain('0D0208');
      expect(feedSource).toContain('#00FF41');
      expect(feedSource).toContain('monospace');
    });

    test('has Activity Log header', () => {
      expect(feedSource).toContain('Activity Log');
    });
  });

  describe('ConstructScene integration', () => {
    let sceneSource;

    beforeAll(() => {
      sceneSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/scenes/ConstructScene.ts'),
        'utf8',
      );
    });

    test('imports ColonistBar', () => {
      expect(sceneSource).toContain("from '@/client/ui/ColonistBar'");
    });

    test('imports ActivityFeed', () => {
      expect(sceneSource).toContain("from '@/client/ui/ActivityFeed'");
    });

    test('creates ColonistBar instance', () => {
      expect(sceneSource).toContain('new ColonistBar(');
    });

    test('creates ActivityFeed instance', () => {
      expect(sceneSource).toContain('new ActivityFeed()');
    });

    test('ColonistBar click centers camera on agent (AC: 3)', () => {
      expect(sceneSource).toContain('onAgentClick');
      expect(sceneSource).toContain('cameraController?.centerOn');
    });

    test('ColonistBar filter connects to ActivityFeed (AC: 5)', () => {
      expect(sceneSource).toContain('onAgentFilter');
      expect(sceneSource).toContain('activityFeed?.setFilter');
    });
  });
});
