import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    const title = this.add.text(width / 2, height / 2, 'The Construct', {
      fontSize: '16px',
      color: '#00FF41',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Fade out and transition to ConstructScene
    this.time.delayedCall(1500, () => {
      this.tweens.add({
        targets: title,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          this.scene.start('LoginScene');
        },
      });
    });
  }
}
