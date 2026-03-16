import Phaser from 'phaser';

const BUBBLE_CONFIG = {
  PADDING: 4,
  FONT_SIZE: 8,
  MAX_WIDTH: 80,
  BACKGROUND: 0x0D0208,
  BORDER: 0x00FF41,
  TEXT_COLOR: '#00FF41',
  AUTO_DISMISS_MS: 3000,
  TAIL_SIZE: 4,
} as const;

/**
 * Pixel art speech bubble that appears above an agent.
 * Shows/hides with configurable text. Auto-dismisses.
 */
export class SpeechBubble extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Graphics;
  private textObject: Phaser.GameObjects.Text;
  private dismissTimer: Phaser.Time.TimerEvent | null = null;

  constructor(scene: Phaser.Scene, offsetY: number) {
    super(scene, 0, offsetY);
    scene.add.existing(this);

    this.background = scene.add.graphics();
    this.textObject = scene.add.text(0, 0, '', {
      fontSize: `${BUBBLE_CONFIG.FONT_SIZE}px`,
      color: BUBBLE_CONFIG.TEXT_COLOR,
      fontFamily: 'monospace',
      wordWrap: { width: BUBBLE_CONFIG.MAX_WIDTH - BUBBLE_CONFIG.PADDING * 2 },
    });

    this.add(this.background);
    this.add(this.textObject);
    this.setVisible(false);
  }

  show(text: string, autoDismissMs?: number): void {
    this.textObject.setText(text);

    const textWidth = this.textObject.width;
    const textHeight = this.textObject.height;
    const bubbleWidth = textWidth + BUBBLE_CONFIG.PADDING * 2;
    const bubbleHeight = textHeight + BUBBLE_CONFIG.PADDING * 2;

    // Draw bubble background
    this.background.clear();
    this.background.fillStyle(BUBBLE_CONFIG.BACKGROUND, 0.9);
    this.background.fillRoundedRect(
      -bubbleWidth / 2, -bubbleHeight - BUBBLE_CONFIG.TAIL_SIZE,
      bubbleWidth, bubbleHeight,
      2,
    );
    this.background.lineStyle(1, BUBBLE_CONFIG.BORDER, 1);
    this.background.strokeRoundedRect(
      -bubbleWidth / 2, -bubbleHeight - BUBBLE_CONFIG.TAIL_SIZE,
      bubbleWidth, bubbleHeight,
      2,
    );

    // Draw tail
    this.background.fillStyle(BUBBLE_CONFIG.BACKGROUND, 0.9);
    this.background.fillTriangle(
      -BUBBLE_CONFIG.TAIL_SIZE / 2, -BUBBLE_CONFIG.TAIL_SIZE,
      BUBBLE_CONFIG.TAIL_SIZE / 2, -BUBBLE_CONFIG.TAIL_SIZE,
      0, 0,
    );

    // Position text
    this.textObject.setPosition(
      -textWidth / 2,
      -bubbleHeight - BUBBLE_CONFIG.TAIL_SIZE + BUBBLE_CONFIG.PADDING,
    );

    this.setVisible(true);

    // Auto-dismiss
    if (this.dismissTimer) {
      this.dismissTimer.destroy();
    }
    this.dismissTimer = this.scene.time.addEvent({
      delay: autoDismissMs ?? BUBBLE_CONFIG.AUTO_DISMISS_MS,
      callback: () => this.hide(),
    });
  }

  hide(): void {
    this.setVisible(false);
    if (this.dismissTimer) {
      this.dismissTimer.destroy();
      this.dismissTimer = null;
    }
  }

  isShowing(): boolean {
    return this.visible;
  }

  destroy(fromScene?: boolean): void {
    if (this.dismissTimer) {
      this.dismissTimer.destroy();
      this.dismissTimer = null;
    }
    super.destroy(fromScene);
  }
}
