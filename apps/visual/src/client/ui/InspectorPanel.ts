import { AGENT_CONFIG_MAP } from '@/client/data/agent-config';
import type { Agent } from '@/client/objects/Agent';
import type { AgentVisualStatus } from '@/client/objects/StatusIndicator';

const STATUS_LABELS: Record<AgentVisualStatus, string> = {
  working: 'WORKING',
  waiting: 'WAITING',
  blocked: 'BLOCKED',
  idle: 'IDLE',
};

const STATUS_COLORS: Record<AgentVisualStatus, string> = {
  working: '#00FF41',
  waiting: '#FFD700',
  blocked: '#FF0000',
  idle: '#808080',
};

/**
 * DOM overlay inspector panel — Matrix terminal style.
 * Shows agent details when clicked. Slides in from the right.
 */
export class InspectorPanel {
  private container: HTMLDivElement;
  private contentEl: HTMLDivElement;
  private currentAgentId: string | null = null;
  private isOpen = false;
  private onCloseCallback: (() => void) | null = null;
  private escHandler: ((e: KeyboardEvent) => void) | null = null;
  private clickOutsideHandler: ((e: MouseEvent) => void) | null = null;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'inspector-panel';
    this.applyContainerStyles();

    this.contentEl = document.createElement('div');
    this.contentEl.id = 'inspector-content';
    this.container.appendChild(this.contentEl);

    document.body.appendChild(this.container);

    this.injectStyles();
  }

  private applyContainerStyles(): void {
    const s = this.container.style;
    s.position = 'fixed';
    s.top = '0';
    s.right = '0';
    s.width = '320px';
    s.height = '100vh';
    s.backgroundColor = '#0D0208';
    s.borderLeft = '2px solid #00FF41';
    s.color = '#00FF41';
    s.fontFamily = '"Courier New", monospace';
    s.fontSize = '13px';
    s.overflowY = 'auto';
    s.zIndex = '1000';
    s.transform = 'translateX(100%)';
    s.transition = 'transform 0.3s ease-in-out';
    s.padding = '16px';
    s.boxShadow = '-4px 0 20px rgba(0, 255, 65, 0.15)';
    s.display = 'none';
  }

  private injectStyles(): void {
    if (document.getElementById('inspector-panel-styles')) return;

    const style = document.createElement('style');
    style.id = 'inspector-panel-styles';
    style.textContent = `
      #inspector-panel::-webkit-scrollbar {
        width: 6px;
      }
      #inspector-panel::-webkit-scrollbar-track {
        background: #0D0208;
      }
      #inspector-panel::-webkit-scrollbar-thumb {
        background: #00FF41;
        border-radius: 3px;
      }
      #inspector-panel .inspector-header {
        border-bottom: 1px solid #00FF41;
        padding-bottom: 12px;
        margin-bottom: 12px;
      }
      #inspector-panel .inspector-name {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 4px;
      }
      #inspector-panel .inspector-matrix-name {
        font-size: 11px;
        color: #008F11;
        margin-bottom: 8px;
      }
      #inspector-panel .inspector-role {
        font-size: 11px;
        color: #0ABDC6;
      }
      #inspector-panel .inspector-section {
        margin-bottom: 12px;
      }
      #inspector-panel .inspector-label {
        font-size: 10px;
        color: #008F11;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 4px;
      }
      #inspector-panel .inspector-value {
        padding-left: 8px;
      }
      #inspector-panel .inspector-status {
        font-weight: bold;
        padding: 2px 8px;
        border: 1px solid;
        display: inline-block;
      }
      #inspector-panel .inspector-close {
        position: absolute;
        top: 12px;
        right: 12px;
        background: none;
        border: 1px solid #00FF41;
        color: #00FF41;
        font-family: monospace;
        font-size: 14px;
        cursor: pointer;
        padding: 2px 8px;
        transition: background 0.2s;
      }
      #inspector-panel .inspector-close:hover {
        background: rgba(0, 255, 65, 0.2);
      }
      #inspector-panel .inspector-details-btn {
        display: block;
        width: 100%;
        margin-top: 16px;
        padding: 8px;
        background: rgba(0, 255, 65, 0.1);
        border: 1px solid #00FF41;
        color: #00FF41;
        font-family: monospace;
        font-size: 12px;
        cursor: pointer;
        text-align: center;
        transition: background 0.2s;
      }
      #inspector-panel .inspector-details-btn:hover {
        background: rgba(0, 255, 65, 0.3);
      }
      #inspector-panel .inspector-action-item {
        font-size: 11px;
        padding: 2px 0;
        border-bottom: 1px solid rgba(0, 255, 65, 0.1);
      }
      #inspector-panel .inspector-action-time {
        color: #008F11;
        font-size: 10px;
      }
    `;
    document.head.appendChild(style);
  }

  open(agent: Agent): void {
    const agentId = agent.agentId;

    if (this.isOpen && this.currentAgentId === agentId) return;

    this.currentAgentId = agentId;
    this.renderContent(agent);

    this.container.style.display = 'block';
    // Force reflow before animation
    void this.container.offsetHeight;
    this.container.style.transform = 'translateX(0)';
    this.isOpen = true;

    this.bindCloseHandlers();
  }

  close(): void {
    if (!this.isOpen) return;

    this.container.style.transform = 'translateX(100%)';
    this.isOpen = false;
    this.currentAgentId = null;

    this.unbindCloseHandlers();

    setTimeout(() => {
      if (!this.isOpen) {
        this.container.style.display = 'none';
      }
    }, 300);

    this.onCloseCallback?.();
  }

  isVisible(): boolean {
    return this.isOpen;
  }

  getCurrentAgentId(): string | null {
    return this.currentAgentId;
  }

  onClose(callback: () => void): void {
    this.onCloseCallback = callback;
  }

  update(agent: Agent): void {
    if (this.isOpen && this.currentAgentId === agent.agentId) {
      this.renderContent(agent);
    }
  }

  private renderContent(agent: Agent): void {
    const config = AGENT_CONFIG_MAP[agent.agentId];
    const status = agent.getStatus();
    const task = agent.getTask();
    const lastSpeech = agent.getLastSpeech();

    const displayName = config?.displayName ?? agent.agentId;
    const matrixName = config?.matrixName ?? '';
    const role = config?.role ?? 'Agent';
    const wing = config?.wing ?? 'unknown';

    this.contentEl.innerHTML = `
      <button class="inspector-close" title="Close (ESC)">✕</button>

      <div class="inspector-header">
        <div class="inspector-name">${this.escapeHtml(displayName)}</div>
        <div class="inspector-matrix-name">${this.escapeHtml(matrixName)}</div>
        <div class="inspector-role">${this.escapeHtml(role)}</div>
      </div>

      <div class="inspector-section">
        <div class="inspector-label">Status</div>
        <div class="inspector-value">
          <span class="inspector-status" style="color: ${STATUS_COLORS[status]}; border-color: ${STATUS_COLORS[status]};">
            ${STATUS_LABELS[status]}
          </span>
        </div>
      </div>

      <div class="inspector-section">
        <div class="inspector-label">Wing</div>
        <div class="inspector-value">${this.escapeHtml(wing)}</div>
      </div>

      <div class="inspector-section">
        <div class="inspector-label">Current Task</div>
        <div class="inspector-value">${task ? this.escapeHtml(task) : '<span style="color: #808080;">None</span>'}</div>
      </div>

      <div class="inspector-section">
        <div class="inspector-label">Last Speech</div>
        <div class="inspector-value">${lastSpeech ? this.escapeHtml(lastSpeech) : '<span style="color: #808080;">—</span>'}</div>
      </div>

      <div class="inspector-section">
        <div class="inspector-label">Agent ID</div>
        <div class="inspector-value">@${this.escapeHtml(agent.agentId)}</div>
      </div>

      <button class="inspector-details-btn">[Ver detalhes]</button>
    `;

    // Bind close button
    const closeBtn = this.contentEl.querySelector('.inspector-close');
    closeBtn?.addEventListener('click', () => this.close());
  }

  private bindCloseHandlers(): void {
    this.unbindCloseHandlers();

    this.escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.close();
      }
    };
    document.addEventListener('keydown', this.escHandler);

    this.clickOutsideHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!this.container.contains(target) && !target.closest('canvas')) {
        this.close();
      }
    };
    // Delay to avoid closing on the same click that opened it
    setTimeout(() => {
      if (this.clickOutsideHandler) {
        document.addEventListener('mousedown', this.clickOutsideHandler);
      }
    }, 100);
  }

  private unbindCloseHandlers(): void {
    if (this.escHandler) {
      document.removeEventListener('keydown', this.escHandler);
      this.escHandler = null;
    }
    if (this.clickOutsideHandler) {
      document.removeEventListener('mousedown', this.clickOutsideHandler);
      this.clickOutsideHandler = null;
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  destroy(): void {
    this.unbindCloseHandlers();
    this.container.remove();
    const styles = document.getElementById('inspector-panel-styles');
    styles?.remove();
  }
}
