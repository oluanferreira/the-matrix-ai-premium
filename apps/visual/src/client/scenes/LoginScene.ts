import Phaser from 'phaser';

const CODE_RAIN_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789';
const TYPEWRITER_LINES = [
  'Acorde...',
  'A Matrix possui voce...',
  'Siga o coelho branco.',
];
const TYPEWRITER_CHAR_DELAY_MS = 80;
const TYPEWRITER_LINE_PAUSE_MS = 1500;

interface CodeRainColumn {
  x: number;
  chars: { y: number; char: string; alpha: number }[];
  speed: number;
  nextSpawnY: number;
}

/**
 * Tela de login — typewriter + code rain.
 * Após typewriter, transiciona para ProjectSelectScene (Story 5.4).
 * Uses setTimeout instead of Phaser timers for reliability.
 */
export class LoginScene extends Phaser.Scene {
  private columns: CodeRainColumn[] = [];
  private typewriterText: Phaser.GameObjects.Text | null = null;
  private currentLine = 0;
  private currentChar = 0;
  private typewriterInterval: ReturnType<typeof setInterval> | null = null;
  private pendingTimeouts: ReturnType<typeof setTimeout>[] = [];
  private skipHandler: ((e: KeyboardEvent | MouseEvent) => void) | null = null;
  private skipped = false;

  constructor() {
    super({ key: 'LoginScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    this.cameras.main.setBackgroundColor('#000000');
    this.initCodeRain(width, height);

    this.typewriterText = this.add.text(width / 2, height * 0.35, '', {
      fontSize: '10px',
      color: '#00FF41',
      fontFamily: 'monospace',
      resolution: 2,
    }).setOrigin(0.5);

    this.add.text(width / 2, height - 12, 'Pressione qualquer tecla para pular', {
      fontSize: '5px',
      color: '#005500',
      fontFamily: 'monospace',
      resolution: 2,
    }).setOrigin(0.5);

    // Skip on any key or click
    this.skipHandler = () => this.skipToProjectSelect();
    document.addEventListener('keydown', this.skipHandler);
    document.addEventListener('click', this.skipHandler);

    // Cleanup on scene shutdown (prevents leaked intervals/timeouts)
    this.events.on('shutdown', () => this.cleanup());

    this.startTypewriter();
  }

  private skipToProjectSelect(): void {
    if (this.skipped) return;
    this.skipped = true;
    this.cleanup();
    this.scene.start('ProjectSelectScene');
  }

  private cleanup(): void {
    if (this.typewriterInterval) {
      clearInterval(this.typewriterInterval);
      this.typewriterInterval = null;
    }
    for (const t of this.pendingTimeouts) clearTimeout(t);
    this.pendingTimeouts = [];
    if (this.skipHandler) {
      document.removeEventListener('keydown', this.skipHandler);
      document.removeEventListener('click', this.skipHandler);
      this.skipHandler = null;
    }
  }

  private initCodeRain(width: number, height: number): void {
    const colSpacing = 8;
    const numColumns = Math.ceil(width / colSpacing);

    for (let i = 0; i < numColumns; i++) {
      this.columns.push({
        x: i * colSpacing,
        chars: [],
        speed: 0.3 + Math.random() * 0.7,
        nextSpawnY: -Math.random() * height,
      });
    }
  }

  private startTypewriter(): void {
    this.typewriterInterval = setInterval(() => {
      if (this.currentLine >= TYPEWRITER_LINES.length) {
        if (this.typewriterInterval) clearInterval(this.typewriterInterval);
        this.transitionToProjectSelect();
        return;
      }

      const line = TYPEWRITER_LINES[this.currentLine];
      if (this.currentChar <= line.length) {
        const displayText = TYPEWRITER_LINES
          .slice(0, this.currentLine)
          .concat(line.substring(0, this.currentChar))
          .join('\n');
        this.typewriterText?.setText(displayText);
        this.currentChar++;
      } else {
        // Pausa antes da próxima linha
        if (this.typewriterInterval) clearInterval(this.typewriterInterval);
        const t = setTimeout(() => {
          this.currentLine++;
          this.currentChar = 0;
          this.startTypewriter();
        }, TYPEWRITER_LINE_PAUSE_MS);
        this.pendingTimeouts.push(t);
      }
    }, TYPEWRITER_CHAR_DELAY_MS);
  }

  private transitionToProjectSelect(): void {
    const t1 = setTimeout(() => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
    }, 800);
    this.pendingTimeouts.push(t1);

    const t2 = setTimeout(() => {
      this.scene.start('ProjectSelectScene');
    }, 1400);
    this.pendingTimeouts.push(t2);
  }

  update(): void {
    this.updateCodeRain();
  }

  private updateCodeRain(): void {
    const { height } = this.cameras.main;

    for (const col of this.columns) {
      col.nextSpawnY += col.speed;
      if (col.nextSpawnY >= 0) {
        const charIndex = Math.floor(Math.random() * CODE_RAIN_CHARS.length);
        col.chars.push({
          y: col.nextSpawnY,
          char: CODE_RAIN_CHARS[charIndex],
          alpha: 1,
        });
        col.nextSpawnY = -8;
      }

      for (const ch of col.chars) {
        ch.y += col.speed;
        ch.alpha -= 0.005;
      }

      col.chars = col.chars.filter(ch => ch.y < height + 16 && ch.alpha > 0);
    }
  }
}
