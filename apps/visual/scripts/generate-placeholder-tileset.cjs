/**
 * Generate placeholder tileset PNG for development.
 * Creates colored 16x16 tiles matching the Matrix palette.
 * Replace with real Aseprite tileset when ready.
 *
 * Usage: node scripts/generate-placeholder-tileset.js
 *
 * Tile indices (row-major, 8 tiles per row):
 *   0: floor-dark      1: floor-carpet   2: wall-top      3: wall-side
 *   4: door             5: window         6: desk          7: chair
 *   8: monitor          9: plant         10: empty        11: spawn-marker
 */

const { createCanvas } = (() => {
  // Pure JS bitmap PNG writer — zero deps
  // Generates uncompressed PNG using zlib deflate from Node stdlib
  const zlib = require('zlib');

  function createCanvas(w, h) {
    const data = Buffer.alloc(w * h * 4, 0);
    return {
      width: w,
      height: h,
      data,
      fillRect(x, y, rw, rh, r, g, b, a = 255) {
        for (let dy = 0; dy < rh; dy++) {
          for (let dx = 0; dx < rw; dx++) {
            const px = x + dx;
            const py = y + dy;
            if (px >= 0 && px < w && py >= 0 && py < h) {
              const idx = (py * w + px) * 4;
              data[idx] = r;
              data[idx + 1] = g;
              data[idx + 2] = b;
              data[idx + 3] = a;
            }
          }
        }
      },
      toPNG() {
        // Build raw RGBA scanlines with filter byte
        const raw = Buffer.alloc(h * (1 + w * 4));
        for (let y = 0; y < h; y++) {
          raw[y * (1 + w * 4)] = 0; // filter: none
          data.copy(raw, y * (1 + w * 4) + 1, y * w * 4, (y + 1) * w * 4);
        }
        const deflated = zlib.deflateSync(raw);

        const chunks = [];

        // Signature
        chunks.push(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));

        // IHDR
        const ihdr = Buffer.alloc(13);
        ihdr.writeUInt32BE(w, 0);
        ihdr.writeUInt32BE(h, 4);
        ihdr[8] = 8; // bit depth
        ihdr[9] = 6; // color type: RGBA
        ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
        chunks.push(makeChunk('IHDR', ihdr));

        // IDAT
        chunks.push(makeChunk('IDAT', deflated));

        // IEND
        chunks.push(makeChunk('IEND', Buffer.alloc(0)));

        return Buffer.concat(chunks);
      },
    };
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBytes = Buffer.from(type, 'ascii');
    const crcData = Buffer.concat([typeBytes, data]);

    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(crcData) >>> 0, 0);

    return Buffer.concat([len, typeBytes, data, crc]);
  }

  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc ^= buf[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
      }
    }
    return crc ^ 0xffffffff;
  }

  return { createCanvas };
})();

const fs = require('fs');
const path = require('path');

// Tile colors (Matrix palette)
const TILES = [
  { name: 'floor-dark',    color: [13, 2, 8] },
  { name: 'floor-carpet',  color: [20, 8, 15] },
  { name: 'wall-top',      color: [0, 59, 0] },
  { name: 'wall-side',     color: [0, 40, 0] },
  { name: 'door',          color: [0, 143, 17] },
  { name: 'window',        color: [10, 189, 198] },
  { name: 'desk',          color: [40, 30, 20] },
  { name: 'chair',         color: [30, 20, 15] },
  { name: 'monitor',       color: [0, 255, 65] },
  { name: 'plant',         color: [0, 100, 10] },
  { name: 'empty',         color: [0, 0, 0, 0] },
  { name: 'spawn-marker',  color: [234, 0, 217] },
];

const TILE_SIZE = 16;
const COLS = 8;
const ROWS = Math.ceil(TILES.length / COLS);

const canvas = createCanvas(COLS * TILE_SIZE, ROWS * TILE_SIZE);

TILES.forEach((tile, i) => {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  const x = col * TILE_SIZE;
  const y = row * TILE_SIZE;
  const [r, g, b, a] = tile.color.length === 4 ? tile.color : [...tile.color, 255];

  // Fill tile background
  canvas.fillRect(x, y, TILE_SIZE, TILE_SIZE, r, g, b, a);

  // Add subtle border for visibility
  if (a > 0) {
    const br = Math.min(r + 20, 255);
    const bg = Math.min(g + 20, 255);
    const bb = Math.min(b + 20, 255);
    canvas.fillRect(x, y, TILE_SIZE, 1, br, bg, bb);
    canvas.fillRect(x, y, 1, TILE_SIZE, br, bg, bb);
  }

  // Add detail patterns for furniture tiles
  if (tile.name === 'desk') {
    canvas.fillRect(x + 2, y + 2, 12, 12, 50, 40, 30);
  } else if (tile.name === 'monitor') {
    canvas.fillRect(x + 3, y + 2, 10, 8, 0, 200, 50);
    canvas.fillRect(x + 6, y + 10, 4, 4, 30, 30, 30);
  } else if (tile.name === 'chair') {
    canvas.fillRect(x + 4, y + 4, 8, 8, 40, 30, 25);
  } else if (tile.name === 'plant') {
    canvas.fillRect(x + 5, y + 8, 6, 6, 0, 80, 5);
    canvas.fillRect(x + 6, y + 3, 4, 5, 0, 130, 15);
  }
});

const outPath = path.join(__dirname, '../public/assets/tilesets/placeholder-tileset.png');
fs.writeFileSync(outPath, canvas.toPNG());

console.log(`Placeholder tileset generated: ${outPath}`);
console.log(`Size: ${COLS * TILE_SIZE}x${ROWS * TILE_SIZE} (${TILES.length} tiles)`);
