import Phaser from 'phaser';

export type AgentVisualStatus = 'working' | 'waiting' | 'blocked' | 'idle';

const STATUS_COLORS: Record<AgentVisualStatus, number> = {
  working: 0x00FF41,  // Green
  waiting: 0xFFD700,  // Yellow
  blocked: 0xFF0000,  // Red
  idle: 0x808080,     // Gray
};

/**
 * Visual status indicator — colored glow/border around agent sprite.
 */
export class StatusIndicator extends Phaser.GameObjects.Graphics {
  private currentStatus: AgentVisualStatus = 'idle';
  private glowAlpha = 0.4;
  private pulseTimer: Phaser.Time.TimerEvent | null = null;
  private spriteWidth: number;
  private spriteHeight: number;

  constructor(scene: Phaser.Scene, spriteWidth: number, spriteHeight: number) {
    super(scene);
    this.spriteWidth = spriteWidth;
    this.spriteHeight = spriteHeight;
    scene.add.existing(this);
    this.drawGlow();
  }

  setStatus(status: AgentVisualStatus): void {
    if (this.currentStatus === status) return;
    this.currentStatus = status;
    this.drawGlow();

    // Pulse for blocked status
    if (this.pulseTimer) {
      this.pulseTimer.destroy();
      this.pulseTimer = null;
    }

    if (status === 'blocked') {
      this.pulseTimer = this.scene.time.addEvent({
        delay: 500,
        loop: true,
        callback: () => {
          this.glowAlpha = this.glowAlpha === 0.4 ? 0.8 : 0.4;
          this.drawGlow();
        },
      });
    } else {
      this.glowAlpha = 0.4;
    }
  }

  getStatus(): AgentVisualStatus {
    return this.currentStatus;
  }

  private drawGlow(): void {
    this.clear();
    const color = STATUS_COLORS[this.currentStatus];
    const padding = 2;

    this.lineStyle(2, color, this.glowAlpha);
    this.strokeRoundedRect(
      -this.spriteWidth / 2 - padding,
      -this.spriteHeight / 2 - padding,
      this.spriteWidth + padding * 2,
      this.spriteHeight + padding * 2,
      2,
    );
  }

  destroy(fromScene?: boolean): void {
    if (this.pulseTimer) {
      this.pulseTimer.destroy();
      this.pulseTimer = null;
    }
    super.destroy(fromScene);
  }
}
