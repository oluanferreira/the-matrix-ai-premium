import Phaser from 'phaser';

const CODE_RAIN_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789';
const TYPEWRITER_LINES = [
  'Acorde...',
  'A Matrix possui você...',
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
 * Pílulas foram movidas para ProjectSelectScene.
 */
export class LoginScene extends Phaser.Scene {
  private columns: CodeRainColumn[] = [];
  private typewriterText: Phaser.GameObjects.Text | null = null;
  private currentLine = 0;
  private currentChar = 0;
  private typewriterTimer: Phaser.Time.TimerEvent | null = null;

  constructor() {
    super({ key: 'LoginScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Fundo preto
    this.cameras.main.setBackgroundColor('#000000');

    // Inicializar colunas de code rain
    this.initCodeRain(width, height);

    // Texto typewriter (centralizado)
    this.typewriterText = this.add.text(width / 2, height * 0.35, '', {
      fontSize: '10px',
      color: '#00FF41',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.startTypewriter();
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
    this.typewriterTimer = this.time.addEvent({
      delay: TYPEWRITER_CHAR_DELAY_MS,
      loop: true,
      callback: () => {
        if (this.currentLine >= TYPEWRITER_LINES.length) {
          this.typewriterTimer?.destroy();
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
          this.typewriterTimer?.destroy();
          this.time.delayedCall(TYPEWRITER_LINE_PAUSE_MS, () => {
            this.currentLine++;
            this.currentChar = 0;
            this.startTypewriter();
          });
        }
      },
    });
  }

  private transitionToProjectSelect(): void {
    this.time.delayedCall(800, () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
    });

    this.time.delayedCall(1400, () => {
      this.scene.start('ProjectSelectScene');
    });
  }

  update(): void {
    this.updateCodeRain();
  }

  private updateCodeRain(): void {
    const { height } = this.cameras.main;

    for (const col of this.columns) {
      // Spawnar novos caracteres
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

      // Atualizar caracteres existentes
      for (const ch of col.chars) {
        ch.y += col.speed;
        ch.alpha -= 0.005;
      }

      // Remover caracteres fora da tela ou apagados
      col.chars = col.chars.filter(ch => ch.y < height + 16 && ch.alpha > 0);
    }
  }
}
