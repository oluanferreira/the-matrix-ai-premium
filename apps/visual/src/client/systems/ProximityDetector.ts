import type { Agent } from '@/client/objects/Agent';

const PROXIMITY_THRESHOLD = 48;

export interface ProximityEvent {
  agentId: string;
  agent: Agent;
  distance: number;
}

/**
 * Detects proximity between player and agents each frame.
 * Emits callbacks when agents enter/leave proximity range (48px).
 * Story 4.5: Proximity Interaction.
 */
export class ProximityDetector {
  private player: Agent;
  private agents: Map<string, Agent>;
  private nearbyAgents: Set<string> = new Set();
  private onEnter: (event: ProximityEvent) => void;
  private onLeave: (agentId: string) => void;
  private threshold: number;

  constructor(
    player: Agent,
    agents: Map<string, Agent>,
    onEnter: (event: ProximityEvent) => void,
    onLeave: (agentId: string) => void,
    threshold = PROXIMITY_THRESHOLD,
  ) {
    this.player = player;
    this.agents = agents;
    this.onEnter = onEnter;
    this.onLeave = onLeave;
    this.threshold = threshold;
  }

  update(): void {
    const currentNearby = new Set<string>();

    for (const [agentId, agent] of this.agents) {
      if (agentId === 'player') continue;

      const dist = this.distanceTo(agent);

      if (dist < this.threshold) {
        currentNearby.add(agentId);

        // Newly entered proximity
        if (!this.nearbyAgents.has(agentId)) {
          this.onEnter({ agentId, agent, distance: dist });
        }
      }
    }

    // Check for agents that left proximity
    for (const agentId of this.nearbyAgents) {
      if (!currentNearby.has(agentId)) {
        this.onLeave(agentId);
      }
    }

    this.nearbyAgents = currentNearby;
  }

  isNearby(agentId: string): boolean {
    return this.nearbyAgents.has(agentId);
  }

  getNearbyAgents(): string[] {
    return Array.from(this.nearbyAgents);
  }

  getThreshold(): number {
    return this.threshold;
  }

  private distanceTo(agent: Agent): number {
    const dx = this.player.x - agent.x;
    const dy = this.player.y - agent.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
