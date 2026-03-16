import Phaser from 'phaser';

/**
 * Floating "..." bubble over an agent when player is nearby.
 * Clicking the bubble opens the DeliveryScreen.
 * Story 4.5: Proximity Interaction.
 */
export class InteractionBubble {
  private scene: Phaser.Scene;
  private bubbles: Map<string, Phaser.GameObjects.Container> = new Map();
  private onClick: (agentId: string) => void;

  constructor(scene: Phaser.Scene, onClick: (agentId: string) => void) {
    this.scene = scene;
    this.onClick = onClick;
  }

  show(agentId: string, x: number, y: number): void {
    if (this.bubbles.has(agentId)) return;

    const container = this.scene.add.container(x, y - 16);
    container.setDepth(20);

    // Background
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x0D0208, 0.9);
    bg.fillRoundedRect(-10, -6, 20, 12, 4);
    bg.lineStyle(1, 0x00FF41, 0.8);
    bg.strokeRoundedRect(-10, -6, 20, 12, 4);
    container.add(bg);

    // "..." text
    const dots = this.scene.add.text(0, 0, '...', {
      fontSize: '8px',
      color: '#00FF41',
      fontFamily: 'monospace',
    }).setOrigin(0.5);
    container.add(dots);

    // Floating animation
    this.scene.tweens.add({
      targets: container,
      y: container.y - 3,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Interactive
    container.setInteractive(
      new Phaser.Geom.Rectangle(-10, -6, 20, 12),
      Phaser.Geom.Rectangle.Contains,
    );
    container.on('pointerdown', () => {
      this.onClick(agentId);
    });
    container.on('pointerover', () => {
      container.setScale(1.2);
    });
    container.on('pointerout', () => {
      container.setScale(1);
    });

    this.bubbles.set(agentId, container);
  }

  hide(agentId: string): void {
    const bubble = this.bubbles.get(agentId);
    if (bubble) {
      this.scene.tweens.killTweensOf(bubble);
      bubble.destroy();
      this.bubbles.delete(agentId);
    }
  }

  hideAll(): void {
    for (const [agentId] of this.bubbles) {
      this.hide(agentId);
    }
  }

  isVisible(agentId: string): boolean {
    return this.bubbles.has(agentId);
  }

  updatePosition(agentId: string, x: number, y: number): void {
    const bubble = this.bubbles.get(agentId);
    if (bubble) {
      bubble.setPosition(x, y - 16);
    }
  }

  destroy(): void {
    this.hideAll();
  }
}
