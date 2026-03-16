import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
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

    // Transition to LoginScene after 2 seconds
    setTimeout(() => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      setTimeout(() => {
        this.scene.start('LoginScene');
      }, 600);
    }, 1500);
  }
}
