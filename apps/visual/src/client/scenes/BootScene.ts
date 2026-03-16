import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  private pendingTimeouts: ReturnType<typeof setTimeout>[] = [];
  private skipHandler: ((e: KeyboardEvent | MouseEvent) => void) | null = null;
  private skipped = false;

  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    this.add.text(width / 2, height / 2, 'The Construct', {
      fontSize: '16px',
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

    // Cleanup on scene shutdown
    this.events.on('shutdown', () => this.cleanup());

    // Transition to LoginScene after 2 seconds
    const t1 = setTimeout(() => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      const t2 = setTimeout(() => {
        this.scene.start('LoginScene');
      }, 600);
      this.pendingTimeouts.push(t2);
    }, 1500);
    this.pendingTimeouts.push(t1);
  }

  private skipToProjectSelect(): void {
    if (this.skipped) return;
    this.skipped = true;
    this.cleanup();
    this.scene.start('ProjectSelectScene');
  }

  private cleanup(): void {
    for (const t of this.pendingTimeouts) clearTimeout(t);
    this.pendingTimeouts = [];
    if (this.skipHandler) {
      document.removeEventListener('keydown', this.skipHandler);
      document.removeEventListener('click', this.skipHandler);
      this.skipHandler = null;
    }
  }
}
