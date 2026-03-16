const fs = require('fs');
const path = require('path');

const VISUAL_DIR = path.join(__dirname, '../../apps/visual');

describe('Player-Controlled Morpheus & Camera Follow', () => {
  describe('PlayerController', () => {
    let controllerSource;

    beforeAll(() => {
      controllerSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/systems/PlayerController.ts'),
        'utf8',
      );
    });

    test('file exists', () => {
      expect(fs.existsSync(
        path.join(VISUAL_DIR, 'src/client/systems/PlayerController.ts'),
      )).toBe(true);
    });

    test('exports PlayerController class', () => {
      expect(controllerSource).toContain('export class PlayerController');
    });

    test('exports PlayerControllerConfig interface', () => {
      expect(controllerSource).toContain('export interface PlayerControllerConfig');
    });

    test('accepts Agent as player', () => {
      expect(controllerSource).toContain("from '@/client/objects/Agent'");
      expect(controllerSource).toContain('player: Agent');
    });

    test('supports WASD keys', () => {
      expect(controllerSource).toContain('KeyCodes.W');
      expect(controllerSource).toContain('KeyCodes.A');
      expect(controllerSource).toContain('KeyCodes.S');
      expect(controllerSource).toContain('KeyCodes.D');
    });

    test('supports arrow keys (cursor keys)', () => {
      expect(controllerSource).toContain('createCursorKeys');
      expect(controllerSource).toContain('cursors');
    });

    test('has update method for per-frame input', () => {
      expect(controllerSource).toContain('update()');
    });

    test('checks both WASD and arrows in update', () => {
      expect(controllerSource).toContain('cursors?.left.isDown || this.wasd?.A.isDown');
      expect(controllerSource).toContain('cursors?.right.isDown || this.wasd?.D.isDown');
      expect(controllerSource).toContain('cursors?.up.isDown || this.wasd?.W.isDown');
      expect(controllerSource).toContain('cursors?.down.isDown || this.wasd?.S.isDown');
    });

    test('normalizes diagonal movement', () => {
      expect(controllerSource).toContain('Math.sqrt');
    });

    test('sets walk animation state based on direction', () => {
      expect(controllerSource).toContain("'walk-left'");
      expect(controllerSource).toContain("'walk-right'");
      expect(controllerSource).toContain("'walk-up'");
      expect(controllerSource).toContain("'walk-down'");
    });

    test('sets idle when no input', () => {
      expect(controllerSource).toContain("setAnimationState('idle')");
    });

    test('has collision detection', () => {
      expect(controllerSource).toContain('canMoveTo');
      expect(controllerSource).toContain('collisionGrid');
    });

    test('uses tile-based collision with TILE_SIZE', () => {
      expect(controllerSource).toContain('TILE_SIZE');
      expect(controllerSource).toContain('Math.floor');
    });

    test('checks map bounds', () => {
      expect(controllerSource).toContain('mapWidth');
      expect(controllerSource).toContain('mapHeight');
    });

    test('supports wall sliding (slide along axis)', () => {
      // When blocked diagonally, try each axis separately
      expect(controllerSource).toContain('canMoveTo(newX, this.player.y)');
      expect(controllerSource).toContain('canMoveTo(this.player.x, newY)');
    });

    test('has PLAYER_SPEED constant', () => {
      expect(controllerSource).toContain('PLAYER_SPEED');
    });

    test('has getPlayer method', () => {
      expect(controllerSource).toContain('getPlayer()');
    });

    test('has destroy method', () => {
      expect(controllerSource).toContain('destroy()');
    });
  });

  describe('CameraController follow mode', () => {
    let cameraSource;

    beforeAll(() => {
      cameraSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/systems/CameraController.ts'),
        'utf8',
      );
    });

    test('CameraControllerConfig has followTarget option', () => {
      expect(cameraSource).toContain('followTarget');
    });

    test('CameraControllerConfig has followLerp option', () => {
      expect(cameraSource).toContain('followLerp');
    });

    test('CameraControllerConfig has initialZoom option', () => {
      expect(cameraSource).toContain('initialZoom');
    });

    test('has startFollow method', () => {
      expect(cameraSource).toContain('startFollow(target');
      expect(cameraSource).toContain('camera.startFollow');
    });

    test('has stopFollow method', () => {
      expect(cameraSource).toContain('stopFollow()');
      expect(cameraSource).toContain('camera.stopFollow');
    });

    test('uses lerp for smooth follow', () => {
      expect(cameraSource).toContain('followLerp');
    });

    test('skips drag setup when follow target provided', () => {
      // When followTarget is set, setupDrag and setupKeyboard are skipped
      expect(cameraSource).toContain('if (config.followTarget)');
    });
  });

  describe('ConstructScene player integration', () => {
    let sceneSource;

    beforeAll(() => {
      sceneSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/scenes/ConstructScene.ts'),
        'utf8',
      );
    });

    test('imports PlayerController', () => {
      expect(sceneSource).toContain("from '@/client/systems/PlayerController'");
    });

    test('imports AGENT_IDS', () => {
      expect(sceneSource).toContain("from '@/shared/agent-ids'");
    });

    test('has playerController property', () => {
      expect(sceneSource).toContain('playerController');
    });

    test('creates player avatar (not Morpheus)', () => {
      expect(sceneSource).toContain("agentId: 'player'");
    });

    test('creates PlayerController with player avatar', () => {
      expect(sceneSource).toContain('new PlayerController(this, this.playerAvatar');
    });

    test('passes collision grid to PlayerController', () => {
      expect(sceneSource).toContain('collisionGrid: this.collisionGrid');
    });

    test('camera follows player avatar', () => {
      expect(sceneSource).toContain('followTarget: this.playerAvatar');
    });

    test('sets initial zoom for close view', () => {
      expect(sceneSource).toContain('initialZoom: 1');
    });

    test('updates player controller in update loop', () => {
      expect(sceneSource).toContain('playerController?.update()');
    });

    test('Morpheus is NPC companion (not player)', () => {
      expect(sceneSource).toContain('MorpheusCompanion');
      expect(sceneSource).toContain('morpheusCompanion');
    });
  });
});
