import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.text(width / 2, height / 2, 'The Construct', {
      fontSize: '16px',
      color: '#00FF41',
      fontFamily: 'monospace',
    }).setOrigin(0.5);
  }
}
