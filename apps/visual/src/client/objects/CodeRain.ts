import Phaser from 'phaser';

const KATAKANA = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
const DIGITS = '0123456789';
const CHARS = KATAKANA + DIGITS;
const CHAR_SIZE = 6;
const COL_SPACING = 7;

interface RainColumn {
  x: number;
  y: number;
  speed: number;
  chars: string[];
  length: number;
}

/**
 * Code rain effect rendered in window areas of the tilemap.
 * Columns of falling katakana/numeric characters — classic Matrix aesthetic.
 * Story 5.3 AC: 1.
 */
export class CodeRain {
  private scene: Phaser.Scene;
  private columns: RainColumn[] = [];
  private graphics: Phaser.GameObjects.Graphics;
  private textPool: Phaser.GameObjects.Text[] = [];
  private windowAreas: { x: number; y: number; width: number; height: number }[];
  private enabled = true;

  constructor(
    scene: Phaser.Scene,
    windowAreas: { x: number; y: number; width: number; height: number }[],
  ) {
    this.scene = scene;
    this.windowAreas = windowAreas;
    this.graphics = scene.add.graphics().setDepth(1);

    this.initColumns();
  }

  private initColumns(): void {
    for (const area of this.windowAreas) {
      const numCols = Math.floor(area.width / COL_SPACING);
      for (let i = 0; i < numCols; i++) {
        const length = 4 + Math.floor(Math.random() * 8);
        const chars: string[] = [];
        for (let j = 0; j < length; j++) {
          chars.push(CHARS[Math.floor(Math.random() * CHARS.length)]);
        }

        this.columns.push({
          x: area.x + i * COL_SPACING,
          y: area.y - Math.random() * area.height,
          speed: 0.2 + Math.random() * 0.5,
          chars,
          length,
        });
      }
    }
  }

  update(): void {
    if (!this.enabled) return;

    this.graphics.clear();

    for (const col of this.columns) {
      col.y += col.speed;

      // Find which window area this column belongs to
      const area = this.windowAreas.find(a =>
        col.x >= a.x && col.x < a.x + a.width,
      );
      if (!area) continue;

      // Reset when column passes bottom of window
      if (col.y > area.y + area.height + col.length * CHAR_SIZE) {
        col.y = area.y - col.length * CHAR_SIZE;
        // Randomize chars
        for (let i = 0; i < col.chars.length; i++) {
          col.chars[i] = CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }

      // Draw characters (only those within the window area)
      for (let i = 0; i < col.chars.length; i++) {
        const charY = col.y + i * CHAR_SIZE;
        if (charY < area.y || charY > area.y + area.height) continue;

        // Head character is bright, tail fades
        const brightness = i === col.chars.length - 1 ? 1 : (i / col.chars.length) * 0.6;
        const green = Math.floor(100 + brightness * 155);
        const color = (green << 8); // 0x00GG00

        this.graphics.fillStyle(color, 0.7);
        this.graphics.fillRect(col.x, charY, CHAR_SIZE - 1, CHAR_SIZE - 1);
      }
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) this.graphics.clear();
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  destroy(): void {
    this.graphics.destroy();
    for (const text of this.textPool) {
      text.destroy();
    }
  }
}
