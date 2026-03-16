import { LMASDataReader } from '@/server/services/LMASDataReader';
import { FileWatcher } from '@/server/watchers/FileWatcher';
import type { AgentState } from '@/server/services/LMASDataReader';
import type { FileChangeEvent } from '@/server/watchers/FileWatcher';
import { EventEmitter } from 'events';

/**
 * Aggregates agent state from multiple data sources.
 * Maintains a live AgentState[] updated via FileWatcher events.
 */
export class StateManager extends EventEmitter {
  private dataReader: LMASDataReader;
  private fileWatcher: FileWatcher;
  private agentStates: AgentState[] = [];

  constructor(projectRoot: string) {
    super();
    this.dataReader = new LMASDataReader(projectRoot);
    this.fileWatcher = new FileWatcher(projectRoot);

    this.fileWatcher.on('change', (_events: FileChangeEvent[]) => {
      this.refresh();
    });
  }

  start(): void {
    this.refresh();
    this.fileWatcher.start();
  }

  stop(): void {
    this.fileWatcher.stop();
  }

  refresh(): void {
    this.agentStates = this.dataReader.getAgentStates();
    this.emit('stateUpdate', this.agentStates);
  }

  getStates(): AgentState[] {
    return this.agentStates;
  }

  getAgentState(agentId: string): AgentState | undefined {
    return this.agentStates.find(s => s.agentId === agentId);
  }

  getActiveAgent(): string | null {
    return this.dataReader.detectActiveAgent();
  }
}
