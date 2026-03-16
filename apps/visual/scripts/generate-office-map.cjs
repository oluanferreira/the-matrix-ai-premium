/**
 * Generate the office LDtk-format JSON map with the full layout.
 * Layout: Software Dev Wing (left), Marketing Wing (right),
 * Central Corridor, Morpheus Room (bottom center).
 *
 * Usage: node scripts/generate-office-map.cjs
 *
 * Tile indices match placeholder-tileset.png:
 *   0: floor-dark, 1: floor-carpet, 2: wall-top, 3: wall-side
 *   4: door, 5: window, 6: desk, 7: chair
 *   8: monitor, 9: plant, 10: empty, 11: spawn-marker
 */

const fs = require('fs');
const path = require('path');

const COLS = 40;
const ROWS = 30;
const TILE = 16;
const TILESET_COLS = 8;

// Tile IDs
const T = {
  FLOOR_DARK: 0,
  FLOOR_CARPET: 1,
  WALL_TOP: 2,
  WALL_SIDE: 3,
  DOOR: 4,
  WINDOW: 5,
  DESK: 6,
  CHAIR: 7,
  MONITOR: 8,
  PLANT: 9,
  EMPTY: 10,
  SPAWN: 11,
};

function createGrid(cols, rows, fill) {
  return Array.from({ length: rows }, () => Array(cols).fill(fill));
}

function tileToSrc(tileId) {
  const col = tileId % TILESET_COLS;
  const row = Math.floor(tileId / TILESET_COLS);
  return [col * TILE, row * TILE];
}

// ── Build Floor Layer ──
const floor = createGrid(COLS, ROWS, T.FLOOR_DARK);

// Carpet for wings
for (let y = 2; y < 20; y++) {
  for (let x = 2; x < 17; x++) floor[y][x] = T.FLOOR_CARPET; // Dev wing
  for (let x = 23; x < 38; x++) floor[y][x] = T.FLOOR_CARPET; // Marketing wing
}
// Corridor floor
for (let y = 0; y < 24; y++) {
  for (let x = 17; x < 23; x++) floor[y][x] = T.FLOOR_DARK;
}
// Morpheus Room floor
for (let y = 22; y < 28; y++) {
  for (let x = 14; x < 26; x++) floor[y][x] = T.FLOOR_CARPET;
}

// ── Build Walls Layer ──
const walls = createGrid(COLS, ROWS, T.EMPTY);

// Dev Wing walls
for (let x = 1; x < 18; x++) { walls[1][x] = T.WALL_TOP; walls[20][x] = T.WALL_TOP; }
for (let y = 1; y < 21; y++) { walls[y][1] = T.WALL_SIDE; walls[y][17] = T.WALL_SIDE; }
walls[10][17] = T.DOOR; walls[11][17] = T.DOOR; // Dev wing door

// Marketing Wing walls
for (let x = 22; x < 39; x++) { walls[1][x] = T.WALL_TOP; walls[20][x] = T.WALL_TOP; }
for (let y = 1; y < 21; y++) { walls[y][22] = T.WALL_SIDE; walls[y][38] = T.WALL_SIDE; }
walls[10][22] = T.DOOR; walls[11][22] = T.DOOR; // Marketing wing door

// Morpheus Room walls
for (let x = 13; x < 27; x++) { walls[21][x] = T.WALL_TOP; walls[28][x] = T.WALL_TOP; }
for (let y = 21; y < 29; y++) { walls[y][13] = T.WALL_SIDE; walls[y][26] = T.WALL_SIDE; }
walls[21][19] = T.DOOR; walls[21][20] = T.DOOR; // Morpheus room door

// Windows on outer walls
[4, 8, 12, 16].forEach(x => { walls[1][x] = T.WINDOW; }); // Dev wing top
[26, 30, 34].forEach(x => { walls[1][x] = T.WINDOW; }); // Marketing wing top

// ── Build Furniture Layer ──
const furniture = createGrid(COLS, ROWS, T.EMPTY);

// Dev Wing: 10 desk+chair+monitor stations
const devDesks = [
  [4, 4], [4, 7], [4, 10], [4, 13], [4, 16],
  [10, 4], [10, 7], [10, 10], [10, 13], [10, 16],
];
devDesks.forEach(([x, y]) => {
  furniture[y][x] = T.DESK;
  furniture[y][x + 1] = T.MONITOR;
  furniture[y + 1][x] = T.CHAIR;
});

// Marketing Wing: 7 desk+chair+monitor stations
const mktDesks = [
  [25, 4], [25, 7], [25, 10], [25, 13],
  [31, 4], [31, 7], [31, 10],
];
mktDesks.forEach(([x, y]) => {
  furniture[y][x] = T.DESK;
  furniture[y][x + 1] = T.MONITOR;
  furniture[y + 1][x] = T.CHAIR;
});

// Morpheus Room: desk + monitors
furniture[24][18] = T.DESK;
furniture[24][19] = T.MONITOR;
furniture[24][20] = T.MONITOR;
furniture[24][21] = T.DESK;
furniture[25][19] = T.CHAIR;

// Plants
[[2, 2], [16, 2], [23, 2], [37, 2], [14, 22], [25, 22]].forEach(([x, y]) => {
  furniture[y][x] = T.PLANT;
});

// ── Build Collisions (IntGrid) ──
const collisions = createGrid(COLS, ROWS, 0);
for (let y = 0; y < ROWS; y++) {
  for (let x = 0; x < COLS; x++) {
    if (walls[y][x] === T.WALL_TOP || walls[y][x] === T.WALL_SIDE) collisions[y][x] = 1;
    if (furniture[y][x] === T.DESK || furniture[y][x] === T.MONITOR) collisions[y][x] = 1;
  }
}

// ── Build Agent Spawns (Entities) ──
const AGENTS = {
  // Dev Wing (10) — near their desks
  dev: { x: 4, y: 5 }, qa: { x: 4, y: 8 }, architect: { x: 4, y: 11 },
  pm: { x: 4, y: 14 }, po: { x: 4, y: 17 },
  sm: { x: 10, y: 5 }, analyst: { x: 10, y: 8 }, 'data-engineer': { x: 10, y: 11 },
  'ux-design-expert': { x: 10, y: 14 }, devops: { x: 10, y: 17 },
  // Marketing Wing (7)
  'marketing-chief': { x: 25, y: 5 }, copywriter: { x: 25, y: 8 },
  'social-media-manager': { x: 25, y: 11 }, 'traffic-manager': { x: 25, y: 14 },
  'content-strategist': { x: 31, y: 5 }, 'content-researcher': { x: 31, y: 8 },
  'content-reviewer': { x: 31, y: 11 },
  // Central
  smith: { x: 19, y: 10 }, // Corridor
  'lmas-master': { x: 19, y: 25 }, // Morpheus Room
};

const entityInstances = Object.entries(AGENTS).map(([agentId, pos]) => ({
  __identifier: 'AgentSpawn',
  __grid: [pos.x, pos.y],
  __pivot: [0.5, 1],
  __worldX: pos.x * TILE,
  __worldY: pos.y * TILE,
  width: TILE,
  height: TILE,
  fieldInstances: [
    { __identifier: 'agentId', __type: 'String', __value: agentId },
  ],
}));

// ── Convert grids to LDtk gridTiles format ──
function gridToTiles(grid) {
  const tiles = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const tileId = grid[y][x];
      if (tileId !== T.EMPTY) {
        const [srcX, srcY] = tileToSrc(tileId);
        tiles.push({
          px: [x * TILE, y * TILE],
          src: [srcX, srcY],
          f: 0,
          t: tileId,
          d: [y * COLS + x],
        });
      }
    }
  }
  return tiles;
}

// ── Assemble LDtk JSON ──
const ldtkMap = {
  __header__: {
    fileType: 'LDtk Project JSON',
    app: 'generate-office-map',
    schema: 'https://ldtk.io/json',
    appVersion: '1.5.3',
  },
  worldLayout: 'Free',
  worldGridWidth: COLS * TILE,
  worldGridHeight: ROWS * TILE,
  defaultGridSize: TILE,
  levels: [
    {
      identifier: 'The_Construct',
      uid: 0,
      worldX: 0,
      worldY: 0,
      pxWid: COLS * TILE,
      pxHei: ROWS * TILE,
      layerInstances: [
        {
          __identifier: 'AgentSpawns',
          __type: 'Entities',
          __gridSize: TILE,
          __cWid: COLS,
          __cHei: ROWS,
          entityInstances,
        },
        {
          __identifier: 'Collisions',
          __type: 'IntGrid',
          __gridSize: TILE,
          __cWid: COLS,
          __cHei: ROWS,
          intGridCsv: collisions.flat(),
        },
        {
          __identifier: 'Walls',
          __type: 'Tiles',
          __gridSize: TILE,
          __cWid: COLS,
          __cHei: ROWS,
          gridTiles: gridToTiles(walls),
        },
        {
          __identifier: 'Furniture',
          __type: 'Tiles',
          __gridSize: TILE,
          __cWid: COLS,
          __cHei: ROWS,
          gridTiles: gridToTiles(furniture),
        },
        {
          __identifier: 'Floor',
          __type: 'Tiles',
          __gridSize: TILE,
          __cWid: COLS,
          __cHei: ROWS,
          gridTiles: gridToTiles(floor),
        },
      ],
    },
  ],
};

const outPath = path.join(__dirname, '../public/assets/tilesets/office.ldtk.json');
fs.writeFileSync(outPath, JSON.stringify(ldtkMap, null, 2));

console.log(`Office map generated: ${outPath}`);
console.log(`Size: ${COLS}x${ROWS} tiles (${COLS * TILE}x${ROWS * TILE} px)`);
console.log(`Agents: ${Object.keys(AGENTS).length}`);
console.log(`Floor tiles: ${gridToTiles(floor).length}`);
console.log(`Wall tiles: ${gridToTiles(walls).length}`);
console.log(`Furniture tiles: ${gridToTiles(furniture).length}`);
