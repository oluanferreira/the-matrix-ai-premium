const fs = require('fs');
const path = require('path');

const VISUAL_DIR = path.join(__dirname, '../../apps/visual');

describe('Story 1.3: Office Tilemap & Static Scene', () => {
  describe('tileset assets (AC: 1, 4, 5)', () => {
    test('placeholder tileset PNG exists', () => {
      expect(
        fs.existsSync(path.join(VISUAL_DIR, 'public/assets/tilesets/placeholder-tileset.png')),
      ).toBe(true);
    });

    test('tileset generator script exists', () => {
      expect(
        fs.existsSync(path.join(VISUAL_DIR, 'scripts/generate-placeholder-tileset.cjs')),
      ).toBe(true);
    });
  });

  describe('LDtk map (AC: 2)', () => {
    let mapData;

    beforeAll(() => {
      mapData = JSON.parse(
        fs.readFileSync(path.join(VISUAL_DIR, 'public/assets/tilesets/office.ldtk.json'), 'utf8'),
      );
    });

    test('map file exists and is valid JSON', () => {
      expect(mapData).toBeDefined();
      expect(mapData.levels).toBeDefined();
    });

    test('has correct grid size (16x16)', () => {
      expect(mapData.defaultGridSize).toBe(16);
    });

    test('has correct map dimensions (40x30 tiles = 640x480px)', () => {
      const level = mapData.levels[0];
      expect(level.pxWid).toBe(640);
      expect(level.pxHei).toBe(480);
    });

    test('has all 5 required layers', () => {
      const level = mapData.levels[0];
      const layerNames = level.layerInstances.map((l) => l.__identifier);
      expect(layerNames).toContain('Floor');
      expect(layerNames).toContain('Furniture');
      expect(layerNames).toContain('Walls');
      expect(layerNames).toContain('Collisions');
      expect(layerNames).toContain('AgentSpawns');
    });

    test('Floor layer has tiles', () => {
      const level = mapData.levels[0];
      const floor = level.layerInstances.find((l) => l.__identifier === 'Floor');
      expect(floor.gridTiles.length).toBeGreaterThan(0);
    });

    test('Walls layer has tiles', () => {
      const level = mapData.levels[0];
      const walls = level.layerInstances.find((l) => l.__identifier === 'Walls');
      expect(walls.gridTiles.length).toBeGreaterThan(0);
    });

    test('Furniture layer has tiles', () => {
      const level = mapData.levels[0];
      const furniture = level.layerInstances.find((l) => l.__identifier === 'Furniture');
      expect(furniture.gridTiles.length).toBeGreaterThan(0);
    });

    test('Collisions layer has IntGrid CSV', () => {
      const level = mapData.levels[0];
      const collisions = level.layerInstances.find((l) => l.__identifier === 'Collisions');
      expect(collisions.intGridCsv.length).toBe(40 * 30);
    });

    test('AgentSpawns has 19 entities', () => {
      const level = mapData.levels[0];
      const spawns = level.layerInstances.find((l) => l.__identifier === 'AgentSpawns');
      expect(spawns.entityInstances.length).toBe(19);
    });

    test('each agent spawn has agentId field', () => {
      const level = mapData.levels[0];
      const spawns = level.layerInstances.find((l) => l.__identifier === 'AgentSpawns');
      spawns.entityInstances.forEach((entity) => {
        const agentIdField = entity.fieldInstances.find((f) => f.__identifier === 'agentId');
        expect(agentIdField).toBeDefined();
        expect(typeof agentIdField.__value).toBe('string');
        expect(agentIdField.__value.length).toBeGreaterThan(0);
      });
    });

    test('layout has Dev Wing (left) and Marketing Wing (right)', () => {
      const level = mapData.levels[0];
      const spawns = level.layerInstances.find((l) => l.__identifier === 'AgentSpawns');

      const devSpawn = spawns.entityInstances.find((e) =>
        e.fieldInstances.some((f) => f.__value === 'dev'),
      );
      const mktSpawn = spawns.entityInstances.find((e) =>
        e.fieldInstances.some((f) => f.__value === 'marketing-chief'),
      );

      // Dev wing on left side (x < 320)
      expect(devSpawn.__worldX).toBeLessThan(320);
      // Marketing wing on right side (x >= 320)
      expect(mktSpawn.__worldX).toBeGreaterThanOrEqual(320);
    });

    test('Smith is in the corridor (center)', () => {
      const level = mapData.levels[0];
      const spawns = level.layerInstances.find((l) => l.__identifier === 'AgentSpawns');

      const smith = spawns.entityInstances.find((e) =>
        e.fieldInstances.some((f) => f.__value === 'smith'),
      );

      // Smith should be in center corridor area
      expect(smith.__worldX).toBeGreaterThan(240);
      expect(smith.__worldX).toBeLessThan(400);
    });

    test('Morpheus is in bottom room', () => {
      const level = mapData.levels[0];
      const spawns = level.layerInstances.find((l) => l.__identifier === 'AgentSpawns');

      const morpheus = spawns.entityInstances.find((e) =>
        e.fieldInstances.some((f) => f.__value === 'lmas-master'),
      );

      // Morpheus should be in bottom area (y > 300)
      expect(morpheus.__worldY).toBeGreaterThan(300);
    });
  });

  describe('ConstructScene (AC: 3)', () => {
    let sceneSource;

    beforeAll(() => {
      sceneSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/scenes/ConstructScene.ts'),
        'utf8',
      );
    });

    test('file exists', () => {
      expect(
        fs.existsSync(path.join(VISUAL_DIR, 'src/client/scenes/ConstructScene.ts')),
      ).toBe(true);
    });

    test('has scene key "ConstructScene"', () => {
      expect(sceneSource).toContain("key: 'ConstructScene'");
    });

    test('loads tileset image in preload', () => {
      expect(sceneSource).toContain('load.image');
      expect(sceneSource).toContain('tileset');
    });

    test('loads office map JSON in preload', () => {
      expect(sceneSource).toContain('load.json');
      expect(sceneSource).toContain('office-map');
    });

    test('uses LDtkParser', () => {
      expect(sceneSource).toContain('LDtkParser');
      expect(sceneSource).toContain('renderTileLayer');
    });

    test('renders Floor, Furniture, Walls layers', () => {
      expect(sceneSource).toContain("'Floor'");
      expect(sceneSource).toContain("'Furniture'");
      expect(sceneSource).toContain("'Walls'");
    });

    test('parses collisions', () => {
      expect(sceneSource).toContain('parseCollisions');
    });

    test('parses agent spawns', () => {
      expect(sceneSource).toContain('parseAgentSpawns');
    });

    test('uses CameraController', () => {
      expect(sceneSource).toContain('CameraController');
    });

    test('calls cameraController.update() in update loop', () => {
      expect(sceneSource).toContain('cameraController?.update()');
    });
  });

  describe('LDtkParser (AC: 3)', () => {
    let parserSource;

    beforeAll(() => {
      parserSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/systems/LDtkParser.ts'),
        'utf8',
      );
    });

    test('file exists', () => {
      expect(
        fs.existsSync(path.join(VISUAL_DIR, 'src/client/systems/LDtkParser.ts')),
      ).toBe(true);
    });

    test('has renderTileLayer method', () => {
      expect(parserSource).toContain('renderTileLayer');
    });

    test('has parseCollisions method', () => {
      expect(parserSource).toContain('parseCollisions');
    });

    test('has parseAgentSpawns method', () => {
      expect(parserSource).toContain('parseAgentSpawns');
    });

    test('has findLayer method', () => {
      expect(parserSource).toContain('findLayer');
    });

    test('exports TypeScript interfaces', () => {
      expect(parserSource).toContain('export interface LDtkTile');
      expect(parserSource).toContain('export interface LDtkLayer');
      expect(parserSource).toContain('export interface LDtkLevel');
      expect(parserSource).toContain('export interface AgentSpawn');
    });
  });

  describe('CameraController (AC: 6, 7)', () => {
    let cameraSource;

    beforeAll(() => {
      cameraSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/systems/CameraController.ts'),
        'utf8',
      );
    });

    test('file exists', () => {
      expect(
        fs.existsSync(path.join(VISUAL_DIR, 'src/client/systems/CameraController.ts')),
      ).toBe(true);
    });

    test('sets camera bounds', () => {
      expect(cameraSource).toContain('setBounds');
    });

    test('supports drag scrolling', () => {
      expect(cameraSource).toContain('isDragging');
      expect(cameraSource).toContain('pointerdown');
      expect(cameraSource).toContain('pointermove');
    });

    test('supports keyboard scrolling (arrow keys)', () => {
      expect(cameraSource).toContain('createCursorKeys');
      expect(cameraSource).toContain('cursors');
    });

    test('supports mouse wheel zoom', () => {
      expect(cameraSource).toContain('wheel');
      expect(cameraSource).toContain('zoomMin');
      expect(cameraSource).toContain('zoomMax');
    });

    test('has fitToMap method for initial view', () => {
      expect(cameraSource).toContain('fitToMap');
      expect(cameraSource).toContain('centerOn');
    });

    test('has update method for per-frame keyboard input', () => {
      expect(cameraSource).toContain('update():');
    });

    test('has destroy method for cleanup', () => {
      expect(cameraSource).toContain('destroy():');
    });
  });

  describe('BootScene transition', () => {
    let bootSource;

    beforeAll(() => {
      bootSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/scenes/BootScene.ts'),
        'utf8',
      );
    });

    test('transitions to LoginScene (Story 5.4: Boot→Login→ProjectSelect→Construct)', () => {
      expect(bootSource).toContain("scene.start('LoginScene')");
    });
  });

  describe('main.ts scene registration', () => {
    let mainSource;

    beforeAll(() => {
      mainSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/main.ts'),
        'utf8',
      );
    });

    test('imports ConstructScene', () => {
      expect(mainSource).toContain('ConstructScene');
    });

    test('registers ConstructScene in scene array', () => {
      expect(mainSource).toContain('ConstructScene');
      // Story 5.4: scene array now includes LoginScene and ProjectSelectScene
      expect(mainSource).toContain('LoginScene');
      expect(mainSource).toContain('ProjectSelectScene');
    });
  });

  describe('map generator script', () => {
    test('office map generator exists', () => {
      expect(
        fs.existsSync(path.join(VISUAL_DIR, 'scripts/generate-office-map.cjs')),
      ).toBe(true);
    });
  });
});
