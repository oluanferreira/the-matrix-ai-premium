const fs = require('fs');
const path = require('path');

const VISUAL_DIR = path.join(__dirname, '../../apps/visual');

describe('Story 2.3: Remaining Agent Sprites (Full Team)', () => {
  describe('agent-config.ts — all 19 agents', () => {
    let configSource;

    beforeAll(() => {
      configSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/data/agent-config.ts'),
        'utf8',
      );
    });

    test('exports REMAINING_AGENTS array', () => {
      expect(configSource).toContain('export const REMAINING_AGENTS');
    });

    test('exports ALL_AGENTS array', () => {
      expect(configSource).toContain('export const ALL_AGENTS');
    });

    test('exports AGENT_CONFIG_MAP lookup', () => {
      expect(configSource).toContain('export const AGENT_CONFIG_MAP');
    });

    test('REMAINING_AGENTS has exactly 14 agents', () => {
      const block = configSource.match(/export const REMAINING_AGENTS[\s\S]*?\];/);
      expect(block).not.toBeNull();
      const matches = block[0].match(/agentId: AGENT_IDS\./g);
      expect(matches).not.toBeNull();
      expect(matches.length).toBe(14);
    });

    test('ALL_AGENTS combines core + remaining = 19', () => {
      expect(configSource).toContain('[...CORE_AGENTS, ...REMAINING_AGENTS]');
    });

    // Software Dev Wing agents
    test('has Architect config', () => {
      expect(configSource).toContain("displayName: 'Architect'");
      expect(configSource).toContain("spriteKey: 'architect'");
    });

    test('has Keymaker config', () => {
      expect(configSource).toContain("displayName: 'Keymaker'");
      expect(configSource).toContain("spriteKey: 'keymaker'");
    });

    test('has Niobe config', () => {
      expect(configSource).toContain("displayName: 'Niobe'");
      expect(configSource).toContain("spriteKey: 'niobe'");
    });

    test('has Link config', () => {
      expect(configSource).toContain("displayName: 'Link'");
      expect(configSource).toContain("spriteKey: 'link'");
    });

    test('has Tank config', () => {
      expect(configSource).toContain("displayName: 'Tank'");
      expect(configSource).toContain("spriteKey: 'tank'");
    });

    test('has Sati config', () => {
      expect(configSource).toContain("displayName: 'Sati'");
      expect(configSource).toContain("spriteKey: 'sati'");
    });

    test('has Operator config', () => {
      expect(configSource).toContain("displayName: 'Operator'");
      expect(configSource).toContain("spriteKey: 'operator'");
    });

    // Marketing Wing agents
    test('has Lock config', () => {
      expect(configSource).toContain("displayName: 'Lock'");
      expect(configSource).toContain("spriteKey: 'lock'");
    });

    test('has Mouse config', () => {
      expect(configSource).toContain("displayName: 'Mouse'");
      expect(configSource).toContain("spriteKey: 'mouse'");
    });

    test('has Sparks config', () => {
      expect(configSource).toContain("displayName: 'Sparks'");
      expect(configSource).toContain("spriteKey: 'sparks'");
    });

    test('has Merovingian config', () => {
      expect(configSource).toContain("displayName: 'Merovingian'");
      expect(configSource).toContain("spriteKey: 'merovingian'");
    });

    test('has Persephone config', () => {
      expect(configSource).toContain("displayName: 'Persephone'");
      expect(configSource).toContain("spriteKey: 'persephone'");
    });

    test('has Ghost config', () => {
      expect(configSource).toContain("displayName: 'Ghost'");
      expect(configSource).toContain("spriteKey: 'ghost'");
    });

    test('has Seraph config', () => {
      expect(configSource).toContain("displayName: 'Seraph'");
      expect(configSource).toContain("spriteKey: 'seraph'");
    });
  });

  describe('wing assignments (AC: 3)', () => {
    let configSource;

    beforeAll(() => {
      configSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/data/agent-config.ts'),
        'utf8',
      );
    });

    test('has marketing wing type', () => {
      expect(configSource).toContain("wing: 'marketing'");
    });

    test('7 marketing wing agents', () => {
      const marketingMatches = configSource.match(/wing: 'marketing'/g);
      expect(marketingMatches).not.toBeNull();
      expect(marketingMatches.length).toBe(7);
    });

    test('10 software-dev wing agents (in agent arrays)', () => {
      // Exclude the interface type declaration line
      const agentArrays = configSource.match(/export const (?:CORE_AGENTS|REMAINING_AGENTS)[\s\S]*?\];/g);
      expect(agentArrays).not.toBeNull();
      const combined = agentArrays.join('\n');
      const devMatches = combined.match(/wing: 'software-dev'/g);
      expect(devMatches).not.toBeNull();
      expect(devMatches.length).toBe(10);
    });

    test('2 central agents', () => {
      const centralMatches = configSource.match(/wing: 'central'/g);
      expect(centralMatches).not.toBeNull();
      expect(centralMatches.length).toBe(2);
    });
  });

  describe('Operator always seated (AC: 4)', () => {
    let configSource;
    let agentSource;

    beforeAll(() => {
      configSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/data/agent-config.ts'),
        'utf8',
      );
      agentSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/objects/Agent.ts'),
        'utf8',
      );
    });

    test('Operator has alwaysSeated: true in config', () => {
      expect(configSource).toContain('alwaysSeated: true');
    });

    test('AgentConfig interface has alwaysSeated property', () => {
      expect(agentSource).toContain('alwaysSeated?: boolean');
    });

    test('Agent class stores alwaysSeated', () => {
      expect(agentSource).toContain('readonly alwaysSeated');
    });

    test('blocks walking for always-seated agents', () => {
      expect(agentSource).toContain("this.alwaysSeated && state.startsWith('walk-')");
    });

    test('moveTo returns false for always-seated agents', () => {
      expect(agentSource).toContain('if (this.alwaysSeated) return false');
    });
  });

  describe('Ghost transparency (AC: 5)', () => {
    let configSource;
    let agentSource;

    beforeAll(() => {
      configSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/data/agent-config.ts'),
        'utf8',
      );
      agentSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/objects/Agent.ts'),
        'utf8',
      );
    });

    test('Ghost has alpha: 0.6 in config', () => {
      expect(configSource).toContain('alpha: 0.6');
    });

    test('AgentConfig interface has alpha property', () => {
      expect(agentSource).toContain('alpha?: number');
    });

    test('Agent applies custom alpha', () => {
      expect(agentSource).toContain('config.alpha');
      expect(agentSource).toContain('setAlpha');
    });
  });

  describe('AgentFactory integration (AC: 6)', () => {
    let factorySource;

    beforeAll(() => {
      factorySource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/objects/AgentFactory.ts'),
        'utf8',
      );
    });

    test('imports AGENT_CONFIG_MAP', () => {
      expect(factorySource).toContain("from '@/client/data/agent-config'");
    });

    test('passes alwaysSeated from config to agent', () => {
      expect(factorySource).toContain('alwaysSeated: displayConfig?.alwaysSeated');
    });

    test('passes alpha from config to agent', () => {
      expect(factorySource).toContain('alpha: displayConfig?.alpha');
    });
  });

  describe('all 19 agents in map spawns (AC: 3)', () => {
    let mapData;

    beforeAll(() => {
      const mapPath = path.join(VISUAL_DIR, 'public/assets/tilesets/office.ldtk.json');
      mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
    });

    test('map has 19 agent spawn points', () => {
      const spawns = mapData.levels[0].layerInstances
        .find(l => l.__identifier === 'AgentSpawns').entityInstances;
      expect(spawns.length).toBe(19);
    });

    const devWingAgents = ['dev', 'qa', 'architect', 'pm', 'po', 'sm', 'analyst', 'data-engineer', 'ux-design-expert', 'devops'];
    const mktWingAgents = ['marketing-chief', 'copywriter', 'social-media-manager', 'traffic-manager', 'content-strategist', 'content-researcher', 'content-reviewer'];

    test('Dev Wing agents are in left side of map (x < 272)', () => {
      const spawns = mapData.levels[0].layerInstances
        .find(l => l.__identifier === 'AgentSpawns').entityInstances;
      for (const agentId of devWingAgents) {
        const agent = spawns.find(e =>
          e.fieldInstances.some(f => f.__identifier === 'agentId' && f.__value === agentId),
        );
        expect(agent).toBeDefined();
        expect(agent.__worldX).toBeLessThan(272); // Before corridor (x: 17 tiles * 16px)
      }
    });

    test('Marketing Wing agents are in right side of map (x > 352)', () => {
      const spawns = mapData.levels[0].layerInstances
        .find(l => l.__identifier === 'AgentSpawns').entityInstances;
      for (const agentId of mktWingAgents) {
        const agent = spawns.find(e =>
          e.fieldInstances.some(f => f.__identifier === 'agentId' && f.__value === agentId),
        );
        expect(agent).toBeDefined();
        expect(agent.__worldX).toBeGreaterThan(352); // After corridor (x: 22 tiles * 16px)
      }
    });

    test('all 19 agents have unique positions', () => {
      const spawns = mapData.levels[0].layerInstances
        .find(l => l.__identifier === 'AgentSpawns').entityInstances;
      const positions = new Set(spawns.map(s => `${s.__worldX},${s.__worldY}`));
      expect(positions.size).toBe(19);
    });
  });
});
