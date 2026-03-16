import Phaser from 'phaser';
import { GAME_CONFIG } from '@/client/config';

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
 * Tela de login — "Escolha sua pílula" (cosmética).
 * Code rain, texto typewriter, botões pílula vermelha/azul.
 * Sem autenticação real no v1.0 (apenas cosmético).
 */
export class LoginScene extends Phaser.Scene {
  private columns: CodeRainColumn[] = [];
  private typewriterText: Phaser.GameObjects.Text | null = null;
  private currentLine = 0;
  private currentChar = 0;
  private typewriterTimer: Phaser.Time.TimerEvent | null = null;
  private pillsVisible = false;
  private redPill: Phaser.GameObjects.Container | null = null;
  private bluePill: Phaser.GameObjects.Container | null = null;

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
          this.showPills();
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

  private showPills(): void {
    this.pillsVisible = true;
    const { width, height } = this.cameras.main;
    const pillY = height * 0.65;

    // Pílula vermelha — entrar no Construct
    this.redPill = this.createPill(width / 2 - 40, pillY, 0xFF0000, 'Pílula Vermelha');
    this.redPill.setInteractive(
      new Phaser.Geom.Rectangle(-16, -8, 32, 16),
      Phaser.Geom.Rectangle.Contains,
    );
    this.redPill.on('pointerdown', () => this.enterConstruct());
    this.redPill.on('pointerover', () => this.redPill?.setScale(1.2));
    this.redPill.on('pointerout', () => this.redPill?.setScale(1));

    // Pílula azul — fechar/escurecer
    this.bluePill = this.createPill(width / 2 + 40, pillY, 0x0000FF, 'Pílula Azul');
    this.bluePill.setInteractive(
      new Phaser.Geom.Rectangle(-16, -8, 32, 16),
      Phaser.Geom.Rectangle.Contains,
    );
    this.bluePill.on('pointerdown', () => this.closeDarken());
    this.bluePill.on('pointerover', () => this.bluePill?.setScale(1.2));
    this.bluePill.on('pointerout', () => this.bluePill?.setScale(1));

    // Rótulos
    this.add.text(width / 2 - 40, pillY + 14, 'Entrar', {
      fontSize: '6px', color: '#FF0000', fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.add.text(width / 2 + 40, pillY + 14, 'Sair', {
      fontSize: '6px', color: '#0000FF', fontFamily: 'monospace',
    }).setOrigin(0.5);
  }

  private createPill(x: number, y: number, color: number, _name: string): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // Formato da pílula (cápsula = retângulo arredondado)
    const pill = this.add.graphics();
    pill.fillStyle(color, 1);
    pill.fillRoundedRect(-12, -6, 24, 12, 6);
    pill.lineStyle(1, 0xFFFFFF, 0.5);
    pill.strokeRoundedRect(-12, -6, 24, 12, 6);
    container.add(pill);

    // Efeito de brilho
    const shine = this.add.graphics();
    shine.fillStyle(0xFFFFFF, 0.3);
    shine.fillEllipse(-4, -2, 6, 3);
    container.add(shine);

    return container;
  }

  private enterConstruct(): void {
    // Efeito de transição glitch
    this.cameras.main.shake(500, 0.02);
    this.cameras.main.flash(500, 0, 255, 65);

    this.time.delayedCall(600, () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
    });

    this.time.delayedCall(1200, () => {
      this.scene.start('ConstructScene');
    });
  }

  private closeDarken(): void {
    this.cameras.main.fadeOut(1000, 0, 0, 0);
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
