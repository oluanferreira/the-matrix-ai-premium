import { ALL_AGENTS, AGENT_CONFIG_MAP } from '@/client/data/agent-config';
import type { AgentVisualStatus } from '@/client/objects/StatusIndicator';

const STATUS_BORDER_COLORS: Record<AgentVisualStatus, string> = {
  working: '#00FF41',
  waiting: '#FFD700',
  blocked: '#FF0000',
  idle: '#808080',
};

const PORTRAIT_SIZE = 24;
const PORTRAIT_GAP = 4;

export interface ColonistBarCallbacks {
  onAgentClick: (agentId: string) => void;
  onAgentFilter: (agentId: string | null) => void;
}

/**
 * Top bar with mini-portraits of all 19 agents.
 * Shows status via colored border. Click to center camera or filter feed.
 */
export class ColonistBar {
  private container: HTMLDivElement;
  private portraits: Map<string, HTMLDivElement> = new Map();
  private callbacks: ColonistBarCallbacks;
  private activeFilter: string | null = null;

  constructor(callbacks: ColonistBarCallbacks) {
    this.callbacks = callbacks;

    this.container = document.createElement('div');
    this.container.id = 'colonist-bar';
    this.applyContainerStyles();

    this.createPortraits();
    document.body.appendChild(this.container);
    this.injectStyles();
  }

  private applyContainerStyles(): void {
    const s = this.container.style;
    s.position = 'fixed';
    s.top = '0';
    s.left = '0';
    s.width = '100%';
    s.height = `${PORTRAIT_SIZE + 12}px`;
    s.backgroundColor = 'rgba(13, 2, 8, 0.85)';
    s.borderBottom = '1px solid #00FF41';
    s.display = 'flex';
    s.alignItems = 'center';
    s.justifyContent = 'center';
    s.gap = `${PORTRAIT_GAP}px`;
    s.padding = '4px 8px';
    s.zIndex = '900';
    s.fontFamily = '"Courier New", monospace';
  }

  private injectStyles(): void {
    if (document.getElementById('colonist-bar-styles')) return;

    const style = document.createElement('style');
    style.id = 'colonist-bar-styles';
    style.textContent = `
      .colonist-portrait {
        width: ${PORTRAIT_SIZE}px;
        height: ${PORTRAIT_SIZE}px;
        border: 2px solid #808080;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: #00FF41;
        font-family: monospace;
        transition: border-color 0.3s, transform 0.1s;
        position: relative;
        flex-shrink: 0;
      }
      .colonist-portrait:hover {
        transform: scale(1.2);
        z-index: 1;
      }
      .colonist-portrait.active-filter {
        box-shadow: 0 0 6px rgba(0, 255, 65, 0.6);
      }
      .colonist-portrait .portrait-label {
        position: absolute;
        bottom: -14px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 7px;
        color: #008F11;
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.2s;
        pointer-events: none;
      }
      .colonist-portrait:hover .portrait-label {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  }

  private createPortraits(): void {
    for (const agent of ALL_AGENTS) {
      const portrait = document.createElement('div');
      portrait.className = 'colonist-portrait';
      portrait.title = agent.displayName;

      // Initial letter as placeholder
      const color = this.getAgentColor(agent.agentId);
      portrait.style.backgroundColor = color;
      portrait.textContent = agent.displayName.charAt(0);

      const label = document.createElement('span');
      label.className = 'portrait-label';
      label.textContent = agent.displayName;
      portrait.appendChild(label);

      // Click → center camera on agent
      portrait.addEventListener('click', () => {
        this.callbacks.onAgentClick(agent.agentId);
      });

      // Right-click → filter activity feed
      portrait.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (this.activeFilter === agent.agentId) {
          this.clearFilter();
        } else {
          this.setFilter(agent.agentId);
        }
      });

      this.portraits.set(agent.agentId, portrait);
      this.container.appendChild(portrait);
    }
  }

  updateStatus(agentId: string, status: AgentVisualStatus): void {
    const portrait = this.portraits.get(agentId);
    if (!portrait) return;

    portrait.style.borderColor = STATUS_BORDER_COLORS[status];
  }

  setFilter(agentId: string): void {
    // Clear previous
    if (this.activeFilter) {
      this.portraits.get(this.activeFilter)?.classList.remove('active-filter');
    }

    this.activeFilter = agentId;
    this.portraits.get(agentId)?.classList.add('active-filter');
    this.callbacks.onAgentFilter(agentId);
  }

  clearFilter(): void {
    if (this.activeFilter) {
      this.portraits.get(this.activeFilter)?.classList.remove('active-filter');
    }
    this.activeFilter = null;
    this.callbacks.onAgentFilter(null);
  }

  getActiveFilter(): string | null {
    return this.activeFilter;
  }

  private getAgentColor(agentId: string): string {
    const colors: Record<string, string> = {
      dev: '#0D2808', qa: '#0A1C1E', architect: '#081A08',
      pm: '#1A0820', po: '#1A1800', sm: '#1A0808',
      analyst: '#081A18', 'data-engineer': '#081418', 'ux-design-expert': '#1A1A08',
      devops: '#1A0808', 'marketing-chief': '#1A1008', copywriter: '#180818',
      'social-media-manager': '#081418', 'traffic-manager': '#1A1208',
      'content-strategist': '#100818', 'content-researcher': '#081410',
      'content-reviewer': '#181008', smith: '#1A0000', 'lmas-master': '#1A1A1A',
    };
    return colors[agentId] ?? '#0D0208';
  }

  destroy(): void {
    this.container.remove();
    document.getElementById('colonist-bar-styles')?.remove();
  }
}
