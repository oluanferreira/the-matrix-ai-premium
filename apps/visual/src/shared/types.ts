export type AgentStatus = 'idle' | 'working' | 'waiting' | 'blocked';

export interface AgentState {
  id: string;
  name: string;
  persona: string;
  status: AgentStatus;
  currentTask: string | null;
  lastAction: string | null;
  lastActionTimestamp: number | null;
}
