import Phaser from 'phaser';
import { LDtkParser } from '@/client/systems/LDtkParser';
import { CameraController } from '@/client/systems/CameraController';
import type { LDtkProject, AgentSpawn } from '@/client/systems/LDtkParser';

/**
 * Main game scene — renders the office tilemap from LDtk data.
 * Loads placeholder tileset (replaced with real assets later).
 */
export class ConstructScene extends Phaser.Scene {
  private cameraController: CameraController | null = null;
  private agentSpawns: AgentSpawn[] = [];
  private collisionGrid: boolean[][] = [];

  constructor() {
    super({ key: 'ConstructScene' });
  }

  preload(): void {
    this.load.image('tileset', '/assets/tilesets/placeholder-tileset.png');
    this.load.json('office-map', '/assets/tilesets/office.ldtk.json');
  }

  create(): void {
    const mapData = this.cache.json.get('office-map') as LDtkProject;
    const level = mapData.levels[0];

    if (!level) {
      console.error('[ConstructScene] No level found in map data');
      return;
    }

    const parser = new LDtkParser(this, 'tileset');

    // Render layers in order (bottom to top)
    const floorLayer = parser.findLayer(level, 'Floor');
    const furnitureLayer = parser.findLayer(level, 'Furniture');
    const wallsLayer = parser.findLayer(level, 'Walls');
    const collisionsLayer = parser.findLayer(level, 'Collisions');
    const spawnsLayer = parser.findLayer(level, 'AgentSpawns');

    if (floorLayer) parser.renderTileLayer(floorLayer, 0);
    if (furnitureLayer) parser.renderTileLayer(furnitureLayer, 1);
    if (wallsLayer) parser.renderTileLayer(wallsLayer, 2);

    // Parse collision data for pathfinding (Story 5.1)
    if (collisionsLayer) {
      this.collisionGrid = parser.parseCollisions(collisionsLayer);
    }

    // Parse agent spawn points (Stories 2.x)
    if (spawnsLayer) {
      this.agentSpawns = parser.parseAgentSpawns(spawnsLayer);
      console.log(`[ConstructScene] ${this.agentSpawns.length} agent spawns loaded`);
    }

    // Setup camera
    this.cameraController = new CameraController(this, {
      mapWidth: level.pxWid,
      mapHeight: level.pxHei,
    });

    console.log(`[ConstructScene] Map loaded: ${level.pxWid}x${level.pxHei}px`);
  }

  update(): void {
    this.cameraController?.update();
  }

  getAgentSpawns(): AgentSpawn[] {
    return this.agentSpawns;
  }

  getCollisionGrid(): boolean[][] {
    return this.collisionGrid;
  }
}
