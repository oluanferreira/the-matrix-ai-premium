import Phaser from 'phaser';
import type { Agent } from '@/client/objects/Agent';

const TILE_SIZE = 16;
const PLAYER_SPEED = 3.6; // pixels per frame (~216px/s at 60fps) — scaled for 960x540 resolution

export interface PlayerControllerConfig {
  collisionGrid: boolean[][];
  mapWidth: number;
  mapHeight: number;
}

/**
 * Controle do avatar do player (dono) via WASD/setas.
 * Move o sprite, toca animações de caminhada e verifica colisão por tile.
 */
export class PlayerController {
  private scene: Phaser.Scene;
  private player: Agent;
  private collisionGrid: boolean[][];
  private mapWidth: number;
  private mapHeight: number;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  private wasd: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key } | null = null;

  constructor(scene: Phaser.Scene, player: Agent, config: PlayerControllerConfig) {
    this.scene = scene;
    this.player = player;
    this.collisionGrid = config.collisionGrid;
    this.mapWidth = config.mapWidth;
    this.mapHeight = config.mapHeight;

    this.setupInput();
  }

  private setupInput(): void {
    if (!this.scene.input.keyboard) return;

    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.wasd = {
      W: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  update(): void {
    if (!this.cursors && !this.wasd) return;

    let dx = 0;
    let dy = 0;

    const left = this.cursors?.left.isDown || this.wasd?.A.isDown;
    const right = this.cursors?.right.isDown || this.wasd?.D.isDown;
    const up = this.cursors?.up.isDown || this.wasd?.W.isDown;
    const down = this.cursors?.down.isDown || this.wasd?.S.isDown;

    if (left) dx -= PLAYER_SPEED;
    if (right) dx += PLAYER_SPEED;
    if (up) dy -= PLAYER_SPEED;
    if (down) dy += PLAYER_SPEED;

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      const factor = PLAYER_SPEED / Math.sqrt(dx * dx + dy * dy);
      dx *= factor;
      dy *= factor;
    }

    if (dx === 0 && dy === 0) {
      this.player.setAnimationState('idle');
      return;
    }

    // Set walk animation based on dominant direction
    if (Math.abs(dx) > Math.abs(dy)) {
      this.player.setAnimationState(dx < 0 ? 'walk-left' : 'walk-right');
    } else {
      this.player.setAnimationState(dy < 0 ? 'walk-up' : 'walk-down');
    }

    // Calculate new position
    const newX = this.player.x + dx;
    const newY = this.player.y + dy;

    // Check collision for new position
    if (this.canMoveTo(newX, newY)) {
      this.player.setPosition(newX, newY);
    } else if (this.canMoveTo(newX, this.player.y)) {
      // Slide along X axis
      this.player.setPosition(newX, this.player.y);
    } else if (this.canMoveTo(this.player.x, newY)) {
      // Slide along Y axis
      this.player.setPosition(this.player.x, newY);
    }
  }

  private canMoveTo(x: number, y: number): boolean {
    // Clamp to map bounds
    if (x < 0 || y < 0 || x >= this.mapWidth || y >= this.mapHeight) {
      return false;
    }

    // Check collision grid at feet position (bottom-center of sprite)
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);

    if (tileY < 0 || tileY >= this.collisionGrid.length) return false;
    if (tileX < 0 || tileX >= (this.collisionGrid[0]?.length ?? 0)) return false;

    // true in collision grid means blocked
    return !this.collisionGrid[tileY][tileX];
  }

  getPlayer(): Agent {
    return this.player;
  }

  destroy(): void {
    // Keys are managed by scene, no cleanup needed
  }
}
