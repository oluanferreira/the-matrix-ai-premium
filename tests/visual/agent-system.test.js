const fs = require('fs');
const path = require('path');

const VISUAL_DIR = path.join(__dirname, '../../apps/visual');

describe('Story 2.1: Base Character Sprite System', () => {
  describe('Agent class (AC: 1, 6)', () => {
    let agentSource;

    beforeAll(() => {
      agentSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/objects/Agent.ts'),
        'utf8',
      );
    });

    test('file exists', () => {
      expect(fs.existsSync(path.join(VISUAL_DIR, 'src/client/objects/Agent.ts'))).toBe(true);
    });

    test('extends Phaser.GameObjects.Container', () => {
      expect(agentSource).toContain('extends Phaser.GameObjects.Container');
    });

    test('has agentId property', () => {
      expect(agentSource).toContain('agentId: string');
    });

    test('accepts position (x, y) in constructor', () => {
      expect(agentSource).toContain('config.x');
      expect(agentSource).toContain('config.y');
    });

    test('creates sprite or placeholder rectangle', () => {
      expect(agentSource).toContain('scene.textures.exists');
      expect(agentSource).toContain('scene.add.sprite');
      expect(agentSource).toContain('scene.add.rectangle');
    });

    test('has moveTo method', () => {
      expect(agentSource).toContain('moveTo(x: number, y: number)');
    });

    test('has setTask and getTask methods', () => {
      expect(agentSource).toContain('setTask(task');
      expect(agentSource).toContain('getTask()');
    });

    test('has destroy method with cleanup', () => {
      expect(agentSource).toContain('destroy(');
      expect(agentSource).toContain('statusIndicator.destroy');
      expect(agentSource).toContain('speechBubble.destroy');
    });

    test('defines AgentConfig interface', () => {
      expect(agentSource).toContain('export interface AgentConfig');
    });

    test('has unique color per agent role', () => {
      expect(agentSource).toContain('getAgentColor');
      expect(agentSource).toContain('dev: 0x00FF41');
      expect(agentSource).toContain('smith: 0xFF0000');
    });
  });

  describe('animation state machine (AC: 2, 7)', () => {
    let agentSource;

    beforeAll(() => {
      agentSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/objects/Agent.ts'),
        'utf8',
      );
    });

    test('defines AnimationState type with all states', () => {
      expect(agentSource).toContain("'idle'");
      expect(agentSource).toContain("'working'");
      expect(agentSource).toContain("'walk-down'");
      expect(agentSource).toContain("'walk-up'");
      expect(agentSource).toContain("'walk-left'");
      expect(agentSource).toContain("'walk-right'");
    });

    test('defines ANIMATION_TRANSITIONS mapping', () => {
      expect(agentSource).toContain('ANIMATION_TRANSITIONS');
    });

    test('has getAnimationState method', () => {
      expect(agentSource).toContain('getAnimationState()');
    });

    test('has setAnimationState method with validation', () => {
      expect(agentSource).toContain('setAnimationState(state');
      expect(agentSource).toContain('validTransitions');
    });

    test('validates transitions before applying', () => {
      expect(agentSource).toContain('validTransitions.includes(state)');
      expect(agentSource).toContain('return false');
    });

    test('idle can transition to all states', () => {
      // Parse the transition map from source
      const idleMatch = agentSource.match(/'idle':\s*\[([^\]]+)\]/);
      expect(idleMatch).not.toBeNull();
      const targets = idleMatch[1];
      expect(targets).toContain('working');
      expect(targets).toContain('walk-down');
      expect(targets).toContain('walk-up');
      expect(targets).toContain('walk-left');
      expect(targets).toContain('walk-right');
    });

    test('working can transition back to idle', () => {
      const workingMatch = agentSource.match(/'working':\s*\[([^\]]+)\]/);
      expect(workingMatch).not.toBeNull();
      expect(workingMatch[1]).toContain('idle');
    });

    test('default state is idle', () => {
      expect(agentSource).toContain("currentAnimation: AnimationState = 'idle'");
    });

    test('uses Aseprite animation key format', () => {
      expect(agentSource).toContain('`${this.agentId}-${state}`');
    });
  });

  describe('StatusIndicator (AC: 3)', () => {
    let statusSource;

    beforeAll(() => {
      statusSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/objects/StatusIndicator.ts'),
        'utf8',
      );
    });

    test('file exists', () => {
      expect(fs.existsSync(
        path.join(VISUAL_DIR, 'src/client/objects/StatusIndicator.ts'),
      )).toBe(true);
    });

    test('extends Phaser.GameObjects.Graphics', () => {
      expect(statusSource).toContain('extends Phaser.GameObjects.Graphics');
    });

    test('defines AgentVisualStatus type', () => {
      expect(statusSource).toContain("export type AgentVisualStatus");
    });

    test('has all 4 status colors', () => {
      expect(statusSource).toContain('working:');
      expect(statusSource).toContain('waiting:');
      expect(statusSource).toContain('blocked:');
      expect(statusSource).toContain('idle:');
    });

    test('green for working status', () => {
      expect(statusSource).toContain('working: 0x00FF41');
    });

    test('has setStatus and getStatus methods', () => {
      expect(statusSource).toContain('setStatus(status');
      expect(statusSource).toContain('getStatus()');
    });

    test('pulse effect for blocked status', () => {
      expect(statusSource).toContain("status === 'blocked'");
      expect(statusSource).toContain('pulseTimer');
    });

    test('draws glow border', () => {
      expect(statusSource).toContain('strokeRoundedRect');
      expect(statusSource).toContain('lineStyle');
    });
  });

  describe('floating icon (AC: 4)', () => {
    let agentSource;

    beforeAll(() => {
      agentSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/objects/Agent.ts'),
        'utf8',
      );
    });

    test('has floatingIcon text object', () => {
      expect(agentSource).toContain('floatingIcon');
    });

    test('positions above sprite head', () => {
      expect(agentSource).toContain('-SPRITE_HEIGHT / 2 - 10');
    });

    test('has setIcon and clearIcon methods', () => {
      expect(agentSource).toContain('setIcon(icon: string)');
      expect(agentSource).toContain('clearIcon()');
    });
  });

  describe('SpeechBubble (AC: 5)', () => {
    let bubbleSource;

    beforeAll(() => {
      bubbleSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/objects/SpeechBubble.ts'),
        'utf8',
      );
    });

    test('file exists', () => {
      expect(fs.existsSync(
        path.join(VISUAL_DIR, 'src/client/objects/SpeechBubble.ts'),
      )).toBe(true);
    });

    test('extends Phaser.GameObjects.Container', () => {
      expect(bubbleSource).toContain('extends Phaser.GameObjects.Container');
    });

    test('has show method with text parameter', () => {
      expect(bubbleSource).toContain('show(text: string');
    });

    test('has hide method', () => {
      expect(bubbleSource).toContain('hide()');
    });

    test('has isShowing method', () => {
      expect(bubbleSource).toContain('isShowing()');
    });

    test('auto-dismisses after timeout', () => {
      expect(bubbleSource).toContain('AUTO_DISMISS_MS');
      expect(bubbleSource).toContain('dismissTimer');
    });

    test('has pixel art background with border', () => {
      expect(bubbleSource).toContain('fillRoundedRect');
      expect(bubbleSource).toContain('strokeRoundedRect');
      expect(bubbleSource).toContain('BACKGROUND');
      expect(bubbleSource).toContain('BORDER');
    });

    test('has speech tail triangle', () => {
      expect(bubbleSource).toContain('fillTriangle');
      expect(bubbleSource).toContain('TAIL_SIZE');
    });

    test('uses Matrix green color', () => {
      expect(bubbleSource).toContain('#00FF41');
    });
  });

  describe('AgentFactory (complementar)', () => {
    let factorySource;

    beforeAll(() => {
      factorySource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/objects/AgentFactory.ts'),
        'utf8',
      );
    });

    test('file exists', () => {
      expect(fs.existsSync(
        path.join(VISUAL_DIR, 'src/client/objects/AgentFactory.ts'),
      )).toBe(true);
    });

    test('has createFromSpawns method', () => {
      expect(factorySource).toContain('createFromSpawns(spawns');
    });

    test('has createAllAgents fallback', () => {
      expect(factorySource).toContain('createAllAgents()');
    });

    test('has getAgent method', () => {
      expect(factorySource).toContain('getAgent(agentId');
    });

    test('has getAllAgents method', () => {
      expect(factorySource).toContain('getAllAgents()');
    });

    test('has getAgentCount method', () => {
      expect(factorySource).toContain('getAgentCount()');
    });

    test('has destroyAll cleanup', () => {
      expect(factorySource).toContain('destroyAll()');
    });

    test('uses AGENT_IDS for all 19 agents', () => {
      expect(factorySource).toContain('AGENT_IDS');
    });
  });

  describe('agent integration with scene', () => {
    test('Agent.ts uses StatusIndicator', () => {
      const source = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/objects/Agent.ts'), 'utf8',
      );
      expect(source).toContain("from '@/client/objects/StatusIndicator'");
    });

    test('Agent.ts uses SpeechBubble', () => {
      const source = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/objects/Agent.ts'), 'utf8',
      );
      expect(source).toContain("from '@/client/objects/SpeechBubble'");
    });

    test('AgentFactory uses Agent', () => {
      const source = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/objects/AgentFactory.ts'), 'utf8',
      );
      expect(source).toContain("from '@/client/objects/Agent'");
    });

    test('AgentFactory uses AgentSpawn type', () => {
      const source = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/objects/AgentFactory.ts'), 'utf8',
      );
      expect(source).toContain('AgentSpawn');
    });
  });

  describe('sprite specs compliance', () => {
    let agentSource;

    beforeAll(() => {
      agentSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/objects/Agent.ts'),
        'utf8',
      );
    });

    test('uses 16x32 sprite dimensions', () => {
      expect(agentSource).toContain('SPRITE_WIDTH = 16');
      expect(agentSource).toContain('SPRITE_HEIGHT = 32');
    });
  });
});
