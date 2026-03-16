const fs = require('fs');
const path = require('path');

const VISUAL_DIR = path.join(__dirname, '../../apps/visual');

describe('Story 5.1: Smith Patrol System', () => {
  describe('matrix-phrases.ts (AC: 3)', () => {
    let phrasesSource;

    beforeAll(() => {
      phrasesSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/data/matrix-phrases.ts'),
        'utf8',
      );
    });

    test('file exists', () => {
      expect(fs.existsSync(
        path.join(VISUAL_DIR, 'src/client/data/matrix-phrases.ts'),
      )).toBe(true);
    });

    test('exports SMITH_PATROL_PHRASES', () => {
      expect(phrasesSource).toContain('export const SMITH_PATROL_PHRASES');
    });

    test('exports SMITH_INSPECT_PHRASES', () => {
      expect(phrasesSource).toContain('export const SMITH_INSPECT_PHRASES');
    });

    test('exports SMITH_VERDICT_PHRASES', () => {
      expect(phrasesSource).toContain('export const SMITH_VERDICT_PHRASES');
    });

    test('has phrases for all 4 verdict levels', () => {
      expect(phrasesSource).toContain('CLEAN');
      expect(phrasesSource).toContain('CONTAINED');
      expect(phrasesSource).toContain('INFECTED');
      expect(phrasesSource).toContain('COMPROMISED');
    });

    test('exports SmithVerdictLevel type', () => {
      expect(phrasesSource).toContain('export type SmithVerdictLevel');
    });

    test('exports VERDICT_COLORS (AC: 5)', () => {
      expect(phrasesSource).toContain('export const VERDICT_COLORS');
    });

    test('CLEAN is green', () => {
      expect(phrasesSource).toContain("CLEAN: '#00FF41'");
    });

    test('CONTAINED is yellow', () => {
      expect(phrasesSource).toContain("CONTAINED: '#FFD700'");
    });

    test('INFECTED is orange', () => {
      expect(phrasesSource).toContain("INFECTED: '#FFA500'");
    });

    test('COMPROMISED is red', () => {
      expect(phrasesSource).toContain("COMPROMISED: '#FF0000'");
    });
  });

  describe('SmithPatrol (AC: 1, 2, 3, 7)', () => {
    let patrolSource;

    beforeAll(() => {
      patrolSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/objects/SmithPatrol.ts'),
        'utf8',
      );
    });

    test('file exists', () => {
      expect(fs.existsSync(
        path.join(VISUAL_DIR, 'src/client/objects/SmithPatrol.ts'),
      )).toBe(true);
    });

    test('exports SmithPatrol class', () => {
      expect(patrolSource).toContain('export class SmithPatrol');
    });

    test('exports SmithState type', () => {
      expect(patrolSource).toContain('export type SmithState');
    });

    test('has all 4 states: PATROL, INSPECT, VERDICT, RETURN', () => {
      expect(patrolSource).toContain("'PATROL'");
      expect(patrolSource).toContain("'INSPECT'");
      expect(patrolSource).toContain("'VERDICT'");
      expect(patrolSource).toContain("'RETURN'");
    });

    test('uses Agent type', () => {
      expect(patrolSource).toContain("from '@/client/objects/Agent'");
    });

    test('uses AgentFactory', () => {
      expect(patrolSource).toContain("from '@/client/objects/AgentFactory'");
    });

    test('uses matrix phrases', () => {
      expect(patrolSource).toContain("from '@/client/data/matrix-phrases'");
    });

    test('has waypoints system (AC: 1)', () => {
      expect(patrolSource).toContain('SmithWaypoint');
      expect(patrolSource).toContain('waypoints');
      expect(patrolSource).toContain('currentWaypointIndex');
    });

    test('has update method for per-frame logic', () => {
      expect(patrolSource).toContain('update()');
    });

    test('has getState method', () => {
      expect(patrolSource).toContain('getState()');
    });

    test('has triggerInspection method (AC: 2)', () => {
      expect(patrolSource).toContain('triggerInspection');
      expect(patrolSource).toContain('targetAgentId');
    });

    test('moves toward waypoints (AC: 1)', () => {
      expect(patrolSource).toContain('moveToward');
      expect(patrolSource).toContain('PATROL_SPEED');
    });

    test('pauses at waypoints', () => {
      expect(patrolSource).toContain('PATROL_PAUSE_MS');
      expect(patrolSource).toContain('isPaused');
    });

    test('walks to target agent during INSPECT (AC: 2)', () => {
      expect(patrolSource).toContain('updateInspect');
      expect(patrolSource).toContain('targetAgent');
    });

    test('uses in-character speech bubbles (AC: 3)', () => {
      expect(patrolSource).toContain('smith.say');
      expect(patrolSource).toContain('SMITH_PATROL_PHRASES');
      expect(patrolSource).toContain('SMITH_INSPECT_PHRASES');
    });

    test('delivers verdict with phrases (AC: 4)', () => {
      expect(patrolSource).toContain('deliverVerdict');
      expect(patrolSource).toContain('SMITH_VERDICT_PHRASES');
    });

    test('verdict display duration', () => {
      expect(patrolSource).toContain('VERDICT_DISPLAY_MS');
    });

    test('returns to patrol after verdict (AC: 7)', () => {
      expect(patrolSource).toContain("this.state = 'RETURN'");
    });

    test('sets walk animation based on direction', () => {
      expect(patrolSource).toContain("'walk-left'");
      expect(patrolSource).toContain("'walk-right'");
      expect(patrolSource).toContain("'walk-up'");
      expect(patrolSource).toContain("'walk-down'");
    });

    test('cycles through waypoints (wraps around)', () => {
      expect(patrolSource).toContain('this.waypoints.length');
    });

    test('has destroy method', () => {
      expect(patrolSource).toContain('destroy()');
      expect(patrolSource).toContain('clearTimeout');
    });
  });

  describe('VerdictOverlay (AC: 4, 5)', () => {
    let overlaySource;

    beforeAll(() => {
      overlaySource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/ui/VerdictOverlay.ts'),
        'utf8',
      );
    });

    test('file exists', () => {
      expect(fs.existsSync(
        path.join(VISUAL_DIR, 'src/client/ui/VerdictOverlay.ts'),
      )).toBe(true);
    });

    test('exports VerdictOverlay class', () => {
      expect(overlaySource).toContain('export class VerdictOverlay');
    });

    test('creates DOM overlay', () => {
      expect(overlaySource).toContain("document.createElement('div')");
      expect(overlaySource).toContain("'verdict-overlay'");
    });

    test('full screen overlay', () => {
      expect(overlaySource).toContain("width = '100%'");
      expect(overlaySource).toContain("height = '100%'");
    });

    test('shows verdict text (AC: 4)', () => {
      expect(overlaySource).toContain('verdict-text');
      expect(overlaySource).toContain('48px');
    });

    test('uses VERDICT_COLORS for color coding (AC: 5)', () => {
      expect(overlaySource).toContain('VERDICT_COLORS');
    });

    test('has pulse animation (AC: 4)', () => {
      expect(overlaySource).toContain('verdict-pulse');
      expect(overlaySource).toContain('@keyframes');
    });

    test('shows findings count', () => {
      expect(overlaySource).toContain('findings');
    });

    test('has show method', () => {
      expect(overlaySource).toContain('show(verdict');
    });

    test('has hide method', () => {
      expect(overlaySource).toContain('hide()');
    });

    test('auto-dismisses', () => {
      expect(overlaySource).toContain('DISPLAY_DURATION_MS');
      expect(overlaySource).toContain('setTimeout');
    });

    test('has destroy method', () => {
      expect(overlaySource).toContain('destroy()');
    });
  });
});
