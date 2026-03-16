const fs = require('fs');
const path = require('path');

const VISUAL_DIR = path.join(__dirname, '../../apps/visual');

describe('Story 2.2: First 5 Agent Sprites (Core Team)', () => {
  describe('agent-config.ts (AC: 4)', () => {
    let configSource;

    beforeAll(() => {
      configSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/data/agent-config.ts'),
        'utf8',
      );
    });

    test('file exists', () => {
      expect(fs.existsSync(
        path.join(VISUAL_DIR, 'src/client/data/agent-config.ts'),
      )).toBe(true);
    });

    test('exports AgentDisplayConfig interface', () => {
      expect(configSource).toContain('export interface AgentDisplayConfig');
    });

    test('exports CORE_AGENTS array', () => {
      expect(configSource).toContain('export const CORE_AGENTS');
    });

    test('exports CORE_AGENT_MAP lookup', () => {
      expect(configSource).toContain('export const CORE_AGENT_MAP');
    });

    test('exports CORE_AGENT_IDS set', () => {
      expect(configSource).toContain('export const CORE_AGENT_IDS');
    });

    test('has Neo config', () => {
      expect(configSource).toContain("displayName: 'Neo'");
      expect(configSource).toContain("spriteKey: 'neo'");
    });

    test('has Oracle config', () => {
      expect(configSource).toContain("displayName: 'Oracle'");
      expect(configSource).toContain("spriteKey: 'oracle'");
    });

    test('has Trinity config', () => {
      expect(configSource).toContain("displayName: 'Trinity'");
      expect(configSource).toContain("spriteKey: 'trinity'");
    });

    test('has Smith config', () => {
      expect(configSource).toContain("displayName: 'Smith'");
      expect(configSource).toContain("spriteKey: 'smith'");
    });

    test('has Morpheus config', () => {
      expect(configSource).toContain("displayName: 'Morpheus'");
      expect(configSource).toContain("spriteKey: 'morpheus'");
    });

    test('CORE_AGENTS has exactly 5 agents', () => {
      // Extract CORE_AGENTS array specifically
      const coreBlock = configSource.match(/export const CORE_AGENTS[\s\S]*?\];/);
      expect(coreBlock).not.toBeNull();
      const coreMatches = coreBlock[0].match(/agentId: AGENT_IDS\./g);
      expect(coreMatches).not.toBeNull();
      expect(coreMatches.length).toBe(5);
    });

    test('imports AGENT_IDS from shared', () => {
      expect(configSource).toContain("from '@/shared/agent-ids'");
    });

    test('has wing property for each agent', () => {
      expect(configSource).toContain("wing: 'software-dev'");
      expect(configSource).toContain("wing: 'central'");
    });

    test('has role property for each agent', () => {
      expect(configSource).toContain("role: 'Full Stack Developer'");
      expect(configSource).toContain("role: 'Master Orchestrator'");
    });

    test('has matrixName property for each agent', () => {
      expect(configSource).toContain("matrixName: 'The One'");
      expect(configSource).toContain("matrixName: 'Agent Smith'");
      expect(configSource).toContain("matrixName: 'Morpheus'");
    });
  });

  describe('ConstructScene agent integration (AC: 4, 5)', () => {
    let sceneSource;

    beforeAll(() => {
      sceneSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/scenes/ConstructScene.ts'),
        'utf8',
      );
    });

    test('imports AgentFactory', () => {
      expect(sceneSource).toContain("from '@/client/objects/AgentFactory'");
    });

    test('imports AGENT_CONFIG_MAP', () => {
      expect(sceneSource).toContain("from '@/client/data/agent-config'");
    });

    test('imports Agent', () => {
      expect(sceneSource).toContain("import { Agent }");
    });

    test('has agentFactory property', () => {
      expect(sceneSource).toContain('agentFactory');
    });

    test('creates agents from spawn data', () => {
      expect(sceneSource).toContain('agentFactory.createFromSpawns');
    });

    test('has fallback createAllAgents', () => {
      expect(sceneSource).toContain('agentFactory.createAllAgents');
    });

    test('sets display name initial for agents', () => {
      expect(sceneSource).toContain('AGENT_CONFIG_MAP');
      expect(sceneSource).toContain('setIcon');
    });

    test('logs agent count', () => {
      expect(sceneSource).toContain('agentes criados');
    });

    test('has getAgentFactory method', () => {
      expect(sceneSource).toContain('getAgentFactory()');
    });

    test('has getAgent method', () => {
      expect(sceneSource).toContain('getAgent(agentId: string)');
    });
  });

  describe('spawn positions match map data (AC: 4)', () => {
    let mapData;

    beforeAll(() => {
      const mapPath = path.join(VISUAL_DIR, 'public/assets/tilesets/office.ldtk.json');
      mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
    });

    test('map has AgentSpawns layer', () => {
      const level = mapData.levels[0];
      const spawnsLayer = level.layerInstances.find(l => l.__identifier === 'AgentSpawns');
      expect(spawnsLayer).toBeDefined();
    });

    test('Neo (dev) has spawn point', () => {
      const spawns = mapData.levels[0].layerInstances
        .find(l => l.__identifier === 'AgentSpawns').entityInstances;
      const neo = spawns.find(e =>
        e.fieldInstances.some(f => f.__identifier === 'agentId' && f.__value === 'dev'),
      );
      expect(neo).toBeDefined();
    });

    test('Oracle (qa) has spawn point', () => {
      const spawns = mapData.levels[0].layerInstances
        .find(l => l.__identifier === 'AgentSpawns').entityInstances;
      const oracle = spawns.find(e =>
        e.fieldInstances.some(f => f.__identifier === 'agentId' && f.__value === 'qa'),
      );
      expect(oracle).toBeDefined();
    });

    test('Trinity (pm) has spawn point', () => {
      const spawns = mapData.levels[0].layerInstances
        .find(l => l.__identifier === 'AgentSpawns').entityInstances;
      const trinity = spawns.find(e =>
        e.fieldInstances.some(f => f.__identifier === 'agentId' && f.__value === 'pm'),
      );
      expect(trinity).toBeDefined();
    });

    test('Smith has spawn point in corridor', () => {
      const spawns = mapData.levels[0].layerInstances
        .find(l => l.__identifier === 'AgentSpawns').entityInstances;
      const smith = spawns.find(e =>
        e.fieldInstances.some(f => f.__identifier === 'agentId' && f.__value === 'smith'),
      );
      expect(smith).toBeDefined();
      // Corridor is x: 17-22 tiles → 272-352 px
      expect(smith.__worldX).toBeGreaterThanOrEqual(272);
      expect(smith.__worldX).toBeLessThanOrEqual(352);
    });

    test('Morpheus has spawn point in Morpheus Room', () => {
      const spawns = mapData.levels[0].layerInstances
        .find(l => l.__identifier === 'AgentSpawns').entityInstances;
      const morpheus = spawns.find(e =>
        e.fieldInstances.some(f => f.__identifier === 'agentId' && f.__value === 'lmas-master'),
      );
      expect(morpheus).toBeDefined();
      // Morpheus Room is y: 22-28 tiles → 352-448 px
      expect(morpheus.__worldY).toBeGreaterThanOrEqual(352);
      expect(morpheus.__worldY).toBeLessThanOrEqual(448);
    });

    test('all 5 core agents have distinct spawn positions', () => {
      const spawns = mapData.levels[0].layerInstances
        .find(l => l.__identifier === 'AgentSpawns').entityInstances;
      const coreIds = ['dev', 'qa', 'pm', 'smith', 'lmas-master'];
      const positions = new Set();

      for (const id of coreIds) {
        const agent = spawns.find(e =>
          e.fieldInstances.some(f => f.__identifier === 'agentId' && f.__value === id),
        );
        expect(agent).toBeDefined();
        positions.add(`${agent.__worldX},${agent.__worldY}`);
      }
      expect(positions.size).toBe(5);
    });
  });

  describe('Agent class sprite support (AC: 2, 3)', () => {
    let agentSource;

    beforeAll(() => {
      agentSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/objects/Agent.ts'),
        'utf8',
      );
    });

    test('supports spriteKey in config', () => {
      expect(agentSource).toContain('spriteKey?: string');
    });

    test('checks texture existence before creating sprite', () => {
      expect(agentSource).toContain('scene.textures.exists');
    });

    test('creates Phaser.GameObjects.Sprite when texture exists', () => {
      expect(agentSource).toContain('scene.add.sprite');
    });

    test('falls back to procedural sprite', () => {
      expect(agentSource).toContain('createProceduralSprite');
    });

    test('uses 64x96 sprite dimensions', () => {
      expect(agentSource).toContain('SPRITE_WIDTH = 64');
      expect(agentSource).toContain('SPRITE_HEIGHT = 96');
    });

    test('has animation state machine', () => {
      expect(agentSource).toContain('ANIMATION_TRANSITIONS');
      expect(agentSource).toContain('setAnimationState');
    });

    test('plays Aseprite-keyed animations', () => {
      expect(agentSource).toContain('`${this.agentId}-${state}`');
    });
  });

  describe('asset pipeline structure (AC: 6, 7)', () => {
    test('sprites directory exists or can be created', () => {
      const spritesDir = path.join(VISUAL_DIR, 'public/assets/sprites');
      // Directory may not exist yet (created when sprites are added)
      // Just verify the parent directory exists
      expect(fs.existsSync(path.join(VISUAL_DIR, 'public/assets'))).toBe(true);
    });

    test('tilesets directory exists with map data', () => {
      expect(fs.existsSync(
        path.join(VISUAL_DIR, 'public/assets/tilesets/office.ldtk.json'),
      )).toBe(true);
    });

    test('placeholder tileset exists', () => {
      expect(fs.existsSync(
        path.join(VISUAL_DIR, 'public/assets/tilesets/placeholder-tileset.png'),
      )).toBe(true);
    });
  });
});
