import { SSEClient } from '@/client/systems/SSEClient';
import type { AgentFactory } from '@/client/objects/AgentFactory';
import type { AgentVisualStatus } from '@/client/objects/StatusIndicator';

export interface AgentStatusEvent {
  agentId: string;
  status: AgentVisualStatus;
  task?: string;
  timestamp: number;
}

export interface AgentDeliveryEvent {
  agentId: string;
  commitHash: string;
  message: string;
  storyId?: string;
  timestamp: number;
}

export interface SmithVerdictEvent {
  targetAgentId: string;
  verdict: string;
  findings: number;
  timestamp: number;
}

export interface AgentTaskEvent {
  agentId: string;
  task: string | null;
  timestamp: number;
}

export interface WorkflowUpdateEvent {
  storyId: string;
  phase: string;
  agentId: string;
  timestamp: number;
}

/**
 * Client-side state manager.
 * Receives SSE events and updates Agent game objects in real-time.
 */
export class AgentStateManager {
  private sseClient: SSEClient;
  private agentFactory: AgentFactory;

  constructor(sseClient: SSEClient, agentFactory: AgentFactory) {
    this.sseClient = sseClient;
    this.agentFactory = agentFactory;
    this.bindEvents();
  }

  private bindEvents(): void {
    this.sseClient.on('agent-status', (data) => {
      this.handleAgentStatus(data as unknown as AgentStatusEvent);
    });

    this.sseClient.on('agent-task', (data) => {
      this.handleAgentTask(data as unknown as AgentTaskEvent);
    });

    this.sseClient.on('agent-delivery', (data) => {
      this.handleAgentDelivery(data as unknown as AgentDeliveryEvent);
    });

    this.sseClient.on('smith-verdict', (data) => {
      this.handleSmithVerdict(data as unknown as SmithVerdictEvent);
    });

    this.sseClient.on('workflow-update', (data) => {
      this.handleWorkflowUpdate(data as unknown as WorkflowUpdateEvent);
    });
  }

  private handleAgentStatus(event: AgentStatusEvent): void {
    const agent = this.agentFactory.getAgent(event.agentId);
    if (!agent) return;

    agent.setStatus(event.status);
    if (event.task) {
      agent.setTask(event.task);
    }
  }

  private handleAgentTask(event: AgentTaskEvent): void {
    const agent = this.agentFactory.getAgent(event.agentId);
    if (!agent) return;

    agent.setTask(event.task);
  }

  private handleAgentDelivery(event: AgentDeliveryEvent): void {
    const agent = this.agentFactory.getAgent(event.agentId);
    if (!agent) return;

    agent.say(`Delivered: ${event.message.substring(0, 30)}`, 5000);
    agent.setStatus('working');
  }

  private handleSmithVerdict(event: SmithVerdictEvent): void {
    const smith = this.agentFactory.getAgent('smith');
    if (smith) {
      smith.say(`${event.verdict}: ${event.findings} findings`, 5000);
    }

    const target = this.agentFactory.getAgent(event.targetAgentId);
    if (target) {
      const status = event.verdict === 'APPROVED' ? 'working' : 'blocked';
      target.setStatus(status as AgentVisualStatus);
    }
  }

  private handleWorkflowUpdate(event: WorkflowUpdateEvent): void {
    const agent = this.agentFactory.getAgent(event.agentId);
    if (!agent) return;

    agent.say(`${event.phase}`, 3000);
    agent.setStatus('working');
  }

  destroy(): void {
    this.sseClient.disconnect();
  }
}
