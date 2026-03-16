import type { Agent } from '@/client/objects/Agent';
import type { AgentFactory } from '@/client/objects/AgentFactory';
import {
  SMITH_PATROL_PHRASES,
  SMITH_INSPECT_PHRASES,
  SMITH_VERDICT_PHRASES,
  VERDICT_COLORS,
} from '@/client/data/matrix-phrases';
import type { SmithVerdictLevel } from '@/client/data/matrix-phrases';

export type SmithState = 'PATROL' | 'INSPECT' | 'VERDICT' | 'RETURN';

const PATROL_SPEED = 0.8;
const VERDICT_DISPLAY_MS = 4000;
const PATROL_PAUSE_MS = 2000;

export interface SmithWaypoint {
  x: number;
  y: number;
  pauseMs?: number;
}

/**
 * Smith patrol behavior controller.
 * State machine: PATROL → INSPECT → VERDICT → RETURN
 * Navigates waypoints in the corridor, inspects agents on delivery events.
 */
export class SmithPatrol {
  private smith: Agent;
  private agentFactory: AgentFactory;
  private state: SmithState = 'PATROL';
  private waypoints: SmithWaypoint[] = [];
  private currentWaypointIndex = 0;
  private targetAgent: Agent | null = null;
  private verdictTimer: ReturnType<typeof setTimeout> | null = null;
  private pauseTimer: ReturnType<typeof setTimeout> | null = null;
  private isPaused = false;
  private currentVerdict: SmithVerdictLevel | null = null;

  constructor(smith: Agent, agentFactory: AgentFactory, waypoints: SmithWaypoint[]) {
    this.smith = smith;
    this.agentFactory = agentFactory;
    this.waypoints = waypoints;
  }

  getState(): SmithState {
    return this.state;
  }

  getWaypoints(): SmithWaypoint[] {
    return this.waypoints;
  }

  getCurrentWaypointIndex(): number {
    return this.currentWaypointIndex;
  }

  /**
   * Called each frame. Handles state machine transitions and movement.
   */
  update(): void {
    switch (this.state) {
      case 'PATROL':
        this.updatePatrol();
        break;
      case 'INSPECT':
        this.updateInspect();
        break;
      case 'VERDICT':
        // Waiting for verdict timer
        break;
      case 'RETURN':
        this.updateReturn();
        break;
    }
  }

  /**
   * Trigger inspection of a specific agent (from SSE smith-verdict event).
   */
  triggerInspection(targetAgentId: string, verdict: SmithVerdictLevel): void {
    const target = this.agentFactory.getAgent(targetAgentId);
    if (!target) return;

    this.targetAgent = target;
    this.currentVerdict = verdict;
    this.state = 'INSPECT';

    const phrase = this.randomPhrase(SMITH_INSPECT_PHRASES);
    this.smith.say(phrase, 3000);
  }

  private updatePatrol(): void {
    if (this.isPaused) return;
    if (this.waypoints.length === 0) return;

    const target = this.waypoints[this.currentWaypointIndex];
    const dx = target.x - this.smith.x;
    const dy = target.y - this.smith.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 2) {
      // Arrived at waypoint
      const pauseMs = target.pauseMs ?? PATROL_PAUSE_MS;
      this.isPaused = true;

      // Occasionally say a patrol phrase
      if (Math.random() < 0.3) {
        this.smith.say(this.randomPhrase(SMITH_PATROL_PHRASES), 3000);
      }

      this.pauseTimer = setTimeout(() => {
        this.isPaused = false;
        this.currentWaypointIndex = (this.currentWaypointIndex + 1) % this.waypoints.length;
      }, pauseMs);

      this.smith.setAnimationState('idle');
    } else {
      // Move toward waypoint
      this.moveToward(target.x, target.y, PATROL_SPEED);
    }
  }

  private updateInspect(): void {
    if (!this.targetAgent) {
      this.state = 'PATROL';
      return;
    }

    const dx = this.targetAgent.x - this.smith.x;
    const dy = this.targetAgent.y - this.smith.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 24) {
      // Arrived near target agent — deliver verdict
      this.smith.setAnimationState('idle');
      this.state = 'VERDICT';
      this.deliverVerdict();
    } else {
      this.moveToward(this.targetAgent.x, this.targetAgent.y + 16, PATROL_SPEED);
    }
  }

  private deliverVerdict(): void {
    if (!this.currentVerdict) {
      this.state = 'RETURN';
      return;
    }

    const phrases = SMITH_VERDICT_PHRASES[this.currentVerdict];
    const phrase = this.randomPhrase(phrases ?? ['...']);
    this.smith.say(`${this.currentVerdict}: ${phrase}`, VERDICT_DISPLAY_MS);

    this.verdictTimer = setTimeout(() => {
      this.state = 'RETURN';
      this.targetAgent = null;
      this.currentVerdict = null;
    }, VERDICT_DISPLAY_MS);
  }

  private updateReturn(): void {
    // Return to nearest patrol waypoint
    if (this.waypoints.length === 0) {
      this.state = 'PATROL';
      return;
    }

    const target = this.waypoints[this.currentWaypointIndex];
    const dx = target.x - this.smith.x;
    const dy = target.y - this.smith.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 2) {
      this.state = 'PATROL';
      this.smith.setAnimationState('idle');
    } else {
      this.moveToward(target.x, target.y, PATROL_SPEED);
    }
  }

  private moveToward(targetX: number, targetY: number, speed: number): void {
    const dx = targetX - this.smith.x;
    const dy = targetY - this.smith.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist === 0) return;

    const vx = (dx / dist) * speed;
    const vy = (dy / dist) * speed;

    this.smith.setPosition(this.smith.x + vx, this.smith.y + vy);

    // Set walk animation
    if (Math.abs(dx) > Math.abs(dy)) {
      this.smith.setAnimationState(dx < 0 ? 'walk-left' : 'walk-right');
    } else {
      this.smith.setAnimationState(dy < 0 ? 'walk-up' : 'walk-down');
    }
  }

  private randomPhrase(phrases: string[]): string {
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  destroy(): void {
    if (this.verdictTimer) clearTimeout(this.verdictTimer);
    if (this.pauseTimer) clearTimeout(this.pauseTimer);
  }
}
