import Phaser from 'phaser';

export interface LDtkTile {
  px: [number, number];
  src: [number, number];
  f: number;
  t: number;
  d: number[];
}

export interface LDtkEntity {
  __identifier: string;
  __grid: [number, number];
  __worldX: number;
  __worldY: number;
  width: number;
  height: number;
  fieldInstances: Array<{
    __identifier: string;
    __type: string;
    __value: unknown;
  }>;
}

export interface LDtkLayer {
  __identifier: string;
  __type: string;
  __gridSize: number;
  __cWid: number;
  __cHei: number;
  gridTiles?: LDtkTile[];
  intGridCsv?: number[];
  entityInstances?: LDtkEntity[];
}

export interface LDtkLevel {
  identifier: string;
  uid: number;
  pxWid: number;
  pxHei: number;
  layerInstances: LDtkLayer[];
}

export interface LDtkProject {
  defaultGridSize: number;
  levels: LDtkLevel[];
}

export interface AgentSpawn {
  agentId: string;
  x: number;
  y: number;
}

/**
 * Manual LDtk parser (ADR-7).
 * Converts LDtk JSON layers into Phaser game objects.
 * No external plugin dependency.
 */
export class LDtkParser {
  private scene: Phaser.Scene;
  private tilesetKey: string;

  constructor(scene: Phaser.Scene, tilesetKey: string) {
    this.scene = scene;
    this.tilesetKey = tilesetKey;
  }

  /**
   * Render a tile layer as Phaser images.
   * Returns a container with all tile sprites for depth sorting.
   */
  renderTileLayer(layer: LDtkLayer, depth: number): Phaser.GameObjects.Container {
    const container = this.scene.add.container(0, 0);
    container.setDepth(depth);
    container.name = layer.__identifier;

    const tiles = layer.gridTiles ?? [];
    const texture = this.scene.textures.get(this.tilesetKey);
    const gridSize = layer.__gridSize;

    // Create frames for each unique tile if not already created
    const createdFrames = new Set<number>();
    for (const tile of tiles) {
      const frameKey = `tile_${tile.t}`;
      if (!createdFrames.has(tile.t) && !texture.has(frameKey)) {
        texture.add(frameKey, 0, tile.src[0], tile.src[1], gridSize, gridSize);
        createdFrames.add(tile.t);
      }
    }

    for (const tile of tiles) {
      const frameKey = `tile_${tile.t}`;
      const image = this.scene.add.image(
        tile.px[0] + gridSize / 2,
        tile.px[1] + gridSize / 2,
        this.tilesetKey,
        frameKey,
      );
      container.add(image);
    }

    return container;
  }

  /**
   * Parse collision IntGrid layer into a 2D boolean array.
   */
  parseCollisions(layer: LDtkLayer): boolean[][] {
    const csv = layer.intGridCsv ?? [];
    const cols = layer.__cWid;
    const rows = layer.__cHei;
    const grid: boolean[][] = [];

    for (let y = 0; y < rows; y++) {
      grid[y] = [];
      for (let x = 0; x < cols; x++) {
        grid[y][x] = csv[y * cols + x] !== 0;
      }
    }

    return grid;
  }

  /**
   * Parse AgentSpawns entity layer.
   */
  parseAgentSpawns(layer: LDtkLayer): AgentSpawn[] {
    const entities = layer.entityInstances ?? [];
    return entities.map((entity) => {
      const agentIdField = entity.fieldInstances.find(
        (f) => f.__identifier === 'agentId',
      );
      return {
        agentId: (agentIdField?.__value as string) ?? 'unknown',
        x: entity.__worldX,
        y: entity.__worldY,
      };
    });
  }

  /**
   * Find a layer by identifier in a level.
   */
  findLayer(level: LDtkLevel, identifier: string): LDtkLayer | undefined {
    return level.layerInstances.find((l) => l.__identifier === identifier);
  }
}
