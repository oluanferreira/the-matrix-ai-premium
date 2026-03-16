import type { Agent } from '@/client/objects/Agent';

const FOLLOW_DISTANCE = 28;
const FOLLOW_SPEED = 1.3;
const IDLE_DISTANCE = 20;

/**
 * Morpheus NPC companion — follows the player everywhere.
 * Walks behind the player, stops when player stops.
 * Responds to general chat messages (handled by ChatSystem, not here).
 */
export class MorpheusCompanion {
  private morpheus: Agent;
  private player: Agent;
  private isFollowing = true;

  constructor(morpheus: Agent, player: Agent) {
    this.morpheus = morpheus;
    this.player = player;
  }

  /**
   * Called each frame. Morpheus follows the player at a fixed offset.
   */
  update(): void {
    if (!this.isFollowing) return;

    const dx = this.player.x - this.morpheus.x;
    const dy = this.player.y - this.morpheus.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < IDLE_DISTANCE) {
      // Close enough — stand idle
      this.morpheus.setAnimationState('idle');
      return;
    }

    if (dist > FOLLOW_DISTANCE) {
      // Too far — walk toward player
      const speed = Math.min(FOLLOW_SPEED, dist - IDLE_DISTANCE);
      const vx = (dx / dist) * speed;
      const vy = (dy / dist) * speed;

      this.morpheus.setPosition(this.morpheus.x + vx, this.morpheus.y + vy);

      // Set walk animation based on dominant direction
      if (Math.abs(dx) > Math.abs(dy)) {
        this.morpheus.setAnimationState(dx < 0 ? 'walk-left' : 'walk-right');
      } else {
        this.morpheus.setAnimationState(dy < 0 ? 'walk-up' : 'walk-down');
      }
    } else {
      this.morpheus.setAnimationState('idle');
    }
  }

  getMorpheus(): Agent {
    return this.morpheus;
  }

  getPlayer(): Agent {
    return this.player;
  }

  /**
   * Temporarily stop following (e.g., during cutscene).
   */
  pauseFollow(): void {
    this.isFollowing = false;
    this.morpheus.setAnimationState('idle');
  }

  /**
   * Resume following the player.
   */
  resumeFollow(): void {
    this.isFollowing = true;
  }

  isCurrentlyFollowing(): boolean {
    return this.isFollowing;
  }

  destroy(): void {
    this.isFollowing = false;
  }
}
