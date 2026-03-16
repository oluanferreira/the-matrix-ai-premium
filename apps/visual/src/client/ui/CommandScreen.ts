const MATRIX_BG = '#0D0208';
const MATRIX_GREEN = '#00FF41';
const MATRIX_DIM = '#005500';
const MATRIX_RED = '#FF0000';
const MATRIX_YELLOW = '#FFD700';

interface DashboardData {
  agents: {
    states: AgentStateData[];
    health: { working: number; idle: number; blocked: number; waiting: number; total: number };
  };
  project: { name: string; storyCount: number; agentCount: number } | null;
  activeAgent: string | null;
  timestamp: number;
}

interface AgentStateData {
  agentId: string;
  visualState: 'working' | 'waiting' | 'blocked' | 'idle';
  currentTask: string | null;
  currentStory: string | null;
  lastAction: string | null;
  lastActionTime: number | null;
}

const STATUS_ICONS: Record<string, string> = {
  working: '▶',
  waiting: '⏸',
  blocked: '✖',
  idle: '○',
};

const STATUS_COLORS: Record<string, string> = {
  working: MATRIX_GREEN,
  waiting: MATRIX_YELLOW,
  blocked: MATRIX_RED,
  idle: MATRIX_DIM,
};

/**
 * Morpheus Room — Command Center (Story 4.4)
 * Fullscreen DOM overlay with Matrix terminal style.
 * Shows: active agents, current story, system metrics, terminal preview.
 * Read-only in v1.0 — observes only, never controls (CLI First).
 */
export class CommandScreen {
  private container: HTMLDivElement;
  private contentEl: HTMLDivElement;
  private isOpen = false;
  private refreshInterval: ReturnType<typeof setInterval> | null = null;
  private escHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'command-screen';
    this.applyContainerStyles();

    this.contentEl = document.createElement('div');
    this.contentEl.id = 'command-content';
    this.contentEl.style.padding = '16px';
    this.container.appendChild(this.contentEl);

    document.body.appendChild(this.container);
  }

  private applyContainerStyles(): void {
    const s = this.container.style;
    s.position = 'fixed';
    s.top = '0';
    s.left = '0';
    s.width = '100vw';
    s.height = '100vh';
    s.backgroundColor = MATRIX_BG;
    s.color = MATRIX_GREEN;
    s.fontFamily = '"Courier New", monospace';
    s.fontSize = '13px';
    s.overflowY = 'auto';
    s.zIndex = '2000';
    s.opacity = '0';
    s.pointerEvents = 'none';
    s.transition = 'opacity 0.3s ease';
  }

  async open(): Promise<void> {
    if (this.isOpen) return;
    this.isOpen = true;

    this.container.style.opacity = '1';
    this.container.style.pointerEvents = 'auto';

    // Bind ESC to close
    this.escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') this.close();
    };
    document.addEventListener('keydown', this.escHandler);

    // Initial render
    await this.refresh();

    // Auto-refresh every 5 seconds
    this.refreshInterval = setInterval(() => this.refresh(), 5000);
  }

  close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;

    this.container.style.opacity = '0';
    this.container.style.pointerEvents = 'none';

    if (this.escHandler) {
      document.removeEventListener('keydown', this.escHandler);
      this.escHandler = null;
    }

    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  getIsOpen(): boolean {
    return this.isOpen;
  }

  destroy(): void {
    this.close();
    this.container.remove();
  }

  private async refresh(): Promise<void> {
    try {
      const response = await fetch('/api/dashboard');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json() as DashboardData;
      this.render(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown';
      this.contentEl.innerHTML = this.renderError(message);
    }
  }

  private render(data: DashboardData): void {
    const projectName = data.project?.name ?? 'Nenhum projeto selecionado';
    const now = new Date(data.timestamp);
    const timeStr = now.toLocaleTimeString('pt-BR');

    this.contentEl.innerHTML = `
      ${this.renderHeader(projectName, timeStr)}
      ${this.renderHealthBar(data.agents.health)}
      ${this.renderAgentList(data.agents.states)}
      ${this.renderMetrics(data)}
      ${this.renderTerminalPreview(data)}
      ${this.renderBackButton()}
    `;

    // Bind back button
    const backBtn = this.contentEl.querySelector('#cmd-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.close());
    }
  }

  private renderHeader(projectName: string, time: string): string {
    return `
      <div style="border-bottom: 1px solid ${MATRIX_GREEN}; padding-bottom: 12px; margin-bottom: 16px;">
        <div style="font-size: 18px; letter-spacing: 2px;">
          ┌─ MORPHEUS ROOM ─ COMMAND CENTER ─┐
        </div>
        <div style="color: ${MATRIX_DIM}; margin-top: 4px;">
          Projeto: ${this.esc(projectName)} | ${time}
        </div>
      </div>
    `;
  }

  private renderHealthBar(health: DashboardData['agents']['health']): string {
    const total = health.total || 1;
    const pctWork = Math.round((health.working / total) * 100);
    const pctWait = Math.round((health.waiting / total) * 100);
    const pctBlock = Math.round((health.blocked / total) * 100);
    const pctIdle = Math.round((health.idle / total) * 100);

    return `
      <div style="margin-bottom: 16px;">
        <div style="margin-bottom: 4px;">── HEALTH ──</div>
        <div style="display: flex; height: 8px; border: 1px solid ${MATRIX_DIM}; border-radius: 2px; overflow: hidden;">
          <div style="width: ${pctWork}%; background: ${MATRIX_GREEN};"></div>
          <div style="width: ${pctWait}%; background: ${MATRIX_YELLOW};"></div>
          <div style="width: ${pctBlock}%; background: ${MATRIX_RED};"></div>
          <div style="width: ${pctIdle}%; background: #333;"></div>
        </div>
        <div style="display: flex; gap: 12px; margin-top: 4px; font-size: 11px; color: ${MATRIX_DIM};">
          <span style="color: ${MATRIX_GREEN};">▶ ${health.working} working</span>
          <span style="color: ${MATRIX_YELLOW};">⏸ ${health.waiting} waiting</span>
          <span style="color: ${MATRIX_RED};">✖ ${health.blocked} blocked</span>
          <span>○ ${health.idle} idle</span>
        </div>
      </div>
    `;
  }

  private renderAgentList(agents: AgentStateData[]): string {
    if (agents.length === 0) {
      return `
        <div style="margin-bottom: 16px;">
          <div style="margin-bottom: 4px;">── AGENTES ATIVOS ──</div>
          <div style="color: ${MATRIX_DIM};">Nenhum dado de agente disponível.</div>
        </div>
      `;
    }

    // Sort: working first, then waiting, blocked, idle
    const order = ['working', 'waiting', 'blocked', 'idle'];
    const sorted = [...agents].sort((a, b) =>
      order.indexOf(a.visualState) - order.indexOf(b.visualState),
    );

    const rows = sorted.map(agent => {
      const icon = STATUS_ICONS[agent.visualState] ?? '?';
      const color = STATUS_COLORS[agent.visualState] ?? MATRIX_DIM;
      const task = agent.currentTask ? this.esc(agent.currentTask) : '—';
      const story = agent.currentStory ? this.esc(agent.currentStory) : '';
      const storyBadge = story ? `<span style="color: ${MATRIX_DIM};">[${story}]</span>` : '';

      return `
        <div style="display: flex; align-items: center; gap: 8px; padding: 2px 0;">
          <span style="color: ${color}; width: 12px;">${icon}</span>
          <span style="width: 100px;">@${this.esc(agent.agentId)}</span>
          <span style="flex: 1; color: ${MATRIX_DIM}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${task} ${storyBadge}</span>
        </div>
      `;
    }).join('');

    return `
      <div style="margin-bottom: 16px;">
        <div style="margin-bottom: 4px;">── AGENTES ATIVOS ──</div>
        ${rows}
      </div>
    `;
  }

  private renderMetrics(data: DashboardData): string {
    const storyCount = data.project?.storyCount ?? 0;
    const agentCount = data.project?.agentCount ?? 0;
    const activeAgent = data.activeAgent ? `@${this.esc(data.activeAgent)}` : 'nenhum';

    // Find last activity
    let lastActivity = 'nenhuma';
    const withTime = data.agents.states.filter(s => s.lastActionTime);
    if (withTime.length > 0) {
      const latest = withTime.sort((a, b) => (b.lastActionTime ?? 0) - (a.lastActionTime ?? 0))[0];
      if (latest.lastAction && latest.lastActionTime) {
        const ago = this.formatTimeAgo(latest.lastActionTime);
        lastActivity = `@${this.esc(latest.agentId)}: ${this.esc(latest.lastAction)} (${ago})`;
      }
    }

    return `
      <div style="margin-bottom: 16px;">
        <div style="margin-bottom: 4px;">── MÉTRICAS ──</div>
        <div style="display: grid; grid-template-columns: 140px 1fr; gap: 2px 8px;">
          <span style="color: ${MATRIX_DIM};">Stories:</span>
          <span>${storyCount}</span>
          <span style="color: ${MATRIX_DIM};">Agentes registrados:</span>
          <span>${agentCount}</span>
          <span style="color: ${MATRIX_DIM};">Agente ativo:</span>
          <span>${activeAgent}</span>
          <span style="color: ${MATRIX_DIM};">Última atividade:</span>
          <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${lastActivity}</span>
        </div>
      </div>
    `;
  }

  private renderTerminalPreview(data: DashboardData): string {
    // Build terminal-style output from agent states
    const lines: string[] = [];
    lines.push(`$ lmas status --project ${this.esc(data.project?.name ?? 'unknown')}`);
    lines.push(`[LMAS] ${data.agents.health.total} agentes monitorados`);
    lines.push(`[LMAS] Health: ${data.agents.health.working}W ${data.agents.health.waiting}P ${data.agents.health.blocked}B ${data.agents.health.idle}I`);

    if (data.activeAgent) {
      lines.push(`[LMAS] Agente ativo: @${this.esc(data.activeAgent)}`);
    }

    const workingAgents = data.agents.states.filter(s => s.visualState === 'working');
    for (const agent of workingAgents) {
      const task = agent.currentTask ?? 'unknown task';
      lines.push(`  → @${this.esc(agent.agentId)} trabalhando em: ${this.esc(task)}`);
    }

    lines.push(`$ _`);

    const termContent = lines.map(l =>
      `<div style="padding: 1px 0;">${l}</div>`,
    ).join('');

    return `
      <div style="margin-bottom: 16px;">
        <div style="margin-bottom: 4px;">── TERMINAL (read-only v1.0) ──</div>
        <div style="background: #000; border: 1px solid ${MATRIX_DIM}; border-radius: 4px; padding: 8px; font-size: 11px; max-height: 150px; overflow-y: auto;">
          ${termContent}
        </div>
        <div style="color: ${MATRIX_DIM}; font-size: 10px; margin-top: 2px;">
          Terminal interativo disponível no v2.0
        </div>
      </div>
    `;
  }

  private renderBackButton(): string {
    return `
      <div style="text-align: center; padding: 16px 0; border-top: 1px solid ${MATRIX_DIM};">
        <button id="cmd-back-btn" style="
          background: transparent;
          border: 1px solid ${MATRIX_GREEN};
          color: ${MATRIX_GREEN};
          font-family: 'Courier New', monospace;
          font-size: 14px;
          padding: 8px 24px;
          cursor: pointer;
          letter-spacing: 1px;
        ">
          [ Voltar ao escritório ]
        </button>
      </div>
    `;
  }

  private renderError(message: string): string {
    return `
      <div style="padding: 32px; text-align: center;">
        <div style="color: ${MATRIX_RED}; font-size: 16px; margin-bottom: 8px;">ERRO</div>
        <div style="color: ${MATRIX_DIM};">${this.esc(message)}</div>
        <div style="margin-top: 16px;">
          <button id="cmd-back-btn" style="
            background: transparent;
            border: 1px solid ${MATRIX_RED};
            color: ${MATRIX_RED};
            font-family: 'Courier New', monospace;
            padding: 6px 16px;
            cursor: pointer;
          ">[ Voltar ]</button>
        </div>
      </div>
    `;
  }

  private formatTimeAgo(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'agora';
    if (minutes < 60) return `${minutes}min`;
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  }

  private esc(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
