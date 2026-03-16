import { AGENT_CONFIG_MAP } from '@/client/data/agent-config';
import type { AgentVisualStatus } from '@/client/objects/StatusIndicator';

const STATUS_LABELS: Record<AgentVisualStatus, string> = {
  working: 'Working',
  waiting: 'Waiting',
  blocked: 'Blocked',
  idle: 'Idle',
};

/**
 * Lightweight HTML tooltip that appears on agent hover.
 * Shows agent name + current status.
 */
export class AgentTooltip {
  private el: HTMLDivElement;

  constructor() {
    this.el = document.createElement('div');
    this.el.id = 'agent-tooltip';
    this.applyStyles();
    this.el.style.display = 'none';
    document.body.appendChild(this.el);
  }

  private applyStyles(): void {
    const s = this.el.style;
    s.position = 'fixed';
    s.backgroundColor = '#0D0208';
    s.border = '1px solid #00FF41';
    s.color = '#00FF41';
    s.fontFamily = '"Courier New", monospace';
    s.fontSize = '11px';
    s.padding = '4px 8px';
    s.pointerEvents = 'none';
    s.zIndex = '999';
    s.whiteSpace = 'nowrap';
    s.boxShadow = '0 2px 8px rgba(0, 255, 65, 0.2)';
  }

  show(agentId: string, status: AgentVisualStatus, screenX: number, screenY: number): void {
    const config = AGENT_CONFIG_MAP[agentId];
    const name = config?.displayName ?? agentId;
    const statusLabel = STATUS_LABELS[status];

    this.el.textContent = `${name} — ${statusLabel}`;
    this.el.style.left = `${screenX + 12}px`;
    this.el.style.top = `${screenY - 8}px`;
    this.el.style.display = 'block';
  }

  hide(): void {
    this.el.style.display = 'none';
  }

  isVisible(): boolean {
    return this.el.style.display !== 'none';
  }

  destroy(): void {
    this.el.remove();
  }
}
