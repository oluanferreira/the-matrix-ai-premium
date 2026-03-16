import { AGENT_CONFIG_MAP } from '@/client/data/agent-config';

const MAX_ENTRIES = 50;

export interface ActivityEntry {
  timestamp: number;
  agentId: string;
  action: string;
}

/**
 * Bottom activity feed — scrollable log of agent actions.
 * FIFO 50 entries. Filterable by agent.
 */
export class ActivityFeed {
  private container: HTMLDivElement;
  private listEl: HTMLDivElement;
  private entries: ActivityEntry[] = [];
  private activeFilter: string | null = null;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'activity-feed';
    this.applyContainerStyles();

    const header = document.createElement('div');
    header.id = 'activity-feed-header';
    header.textContent = '> Activity Log';
    header.style.fontSize = '10px';
    header.style.color = '#008F11';
    header.style.marginBottom = '4px';
    header.style.textTransform = 'uppercase';
    header.style.letterSpacing = '1px';
    this.container.appendChild(header);

    this.listEl = document.createElement('div');
    this.listEl.id = 'activity-feed-list';
    this.listEl.style.overflowY = 'auto';
    this.listEl.style.flex = '1';
    this.container.appendChild(this.listEl);

    document.body.appendChild(this.container);
    this.injectStyles();
  }

  private applyContainerStyles(): void {
    const s = this.container.style;
    s.position = 'fixed';
    s.bottom = '0';
    s.left = '0';
    s.width = '100%';
    s.height = '120px';
    s.backgroundColor = 'rgba(13, 2, 8, 0.85)';
    s.borderTop = '1px solid #00FF41';
    s.color = '#00FF41';
    s.fontFamily = '"Courier New", monospace';
    s.fontSize = '11px';
    s.padding = '6px 12px';
    s.zIndex = '900';
    s.display = 'flex';
    s.flexDirection = 'column';
  }

  private injectStyles(): void {
    if (document.getElementById('activity-feed-styles')) return;

    const style = document.createElement('style');
    style.id = 'activity-feed-styles';
    style.textContent = `
      #activity-feed-list::-webkit-scrollbar {
        width: 4px;
      }
      #activity-feed-list::-webkit-scrollbar-track {
        background: #0D0208;
      }
      #activity-feed-list::-webkit-scrollbar-thumb {
        background: #00FF41;
        border-radius: 2px;
      }
      .feed-entry {
        padding: 1px 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .feed-time {
        color: #008F11;
      }
      .feed-agent {
        color: #0ABDC6;
      }
      .feed-action {
        color: #00FF41;
      }
    `;
    document.head.appendChild(style);
  }

  addEntry(entry: ActivityEntry): void {
    this.entries.push(entry);

    // FIFO: remove oldest if over limit
    if (this.entries.length > MAX_ENTRIES) {
      this.entries.shift();
    }

    this.render();
  }

  setFilter(agentId: string | null): void {
    this.activeFilter = agentId;
    this.render();
  }

  getFilter(): string | null {
    return this.activeFilter;
  }

  getEntryCount(): number {
    return this.entries.length;
  }

  private render(): void {
    const filtered = this.activeFilter
      ? this.entries.filter(e => e.agentId === this.activeFilter)
      : this.entries;

    this.listEl.innerHTML = filtered
      .slice(-30) // Show last 30 for performance
      .map(entry => {
        const time = this.formatTime(entry.timestamp);
        const config = AGENT_CONFIG_MAP[entry.agentId];
        const name = config?.displayName ?? entry.agentId;
        return `<div class="feed-entry"><span class="feed-time">[${time}]</span> <span class="feed-agent">@${name}</span> — <span class="feed-action">${this.escapeHtml(entry.action)}</span></div>`;
      })
      .join('');

    // Auto-scroll to bottom
    this.listEl.scrollTop = this.listEl.scrollHeight;
  }

  private formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  clear(): void {
    this.entries = [];
    this.listEl.innerHTML = '';
  }

  destroy(): void {
    this.container.remove();
    document.getElementById('activity-feed-styles')?.remove();
  }
}
