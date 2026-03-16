import type Phaser from 'phaser';
import { Agent } from '@/client/objects/Agent';
import type { AgentConfig } from '@/client/objects/Agent';
import type { AgentSpawn } from '@/client/systems/LDtkParser';
import { AGENT_IDS } from '@/shared/agent-ids';
import { AGENT_CONFIG_MAP } from '@/client/data/agent-config';

/**
 * Factory for creating Agent instances from spawn data.
 */
export class AgentFactory {
  private scene: Phaser.Scene;
  private agents: Map<string, Agent> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Create Agent instances from LDtk spawn points.
   */
  createFromSpawns(spawns: AgentSpawn[]): Map<string, Agent> {
    for (const spawn of spawns) {
      const displayConfig = AGENT_CONFIG_MAP[spawn.agentId];
      const spriteKey = `sprite-${spawn.agentId}`;
      const config: AgentConfig = {
        agentId: spawn.agentId,
        x: spawn.x,
        y: spawn.y,
        spriteKey: this.scene.textures.exists(spriteKey) ? spriteKey : undefined,
        alwaysSeated: displayConfig?.alwaysSeated,
        alpha: displayConfig?.alpha,
      };
      const agent = new Agent(this.scene, config);
      this.agents.set(spawn.agentId, agent);
    }
    return this.agents;
  }

  /**
   * Create all 19 agents at default positions (fallback if no spawns).
   */
  createAllAgents(): Map<string, Agent> {
    let index = 0;
    for (const [, agentId] of Object.entries(AGENT_IDS)) {
      if (!this.agents.has(agentId)) {
        const spriteKey = `sprite-${agentId}`;
        const config: AgentConfig = {
          agentId,
          x: 100 + (index % 10) * 80,
          y: 100 + Math.floor(index / 10) * 120,
          spriteKey: this.scene.textures.exists(spriteKey) ? spriteKey : undefined,
        };
        const agent = new Agent(this.scene, config);
        this.agents.set(agentId, agent);
        index++;
      }
    }
    return this.agents;
  }

  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  getAllAgents(): Map<string, Agent> {
    return this.agents;
  }

  getAgentCount(): number {
    return this.agents.size;
  }

  destroyAll(): void {
    for (const [, agent] of this.agents) {
      agent.destroy();
    }
    this.agents.clear();
  }
}
