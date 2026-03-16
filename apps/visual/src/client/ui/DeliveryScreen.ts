import { AGENT_CONFIG_MAP } from '@/client/data/agent-config';

const MATRIX_BG = '#0D0208';
const MATRIX_GREEN = '#00FF41';
const MATRIX_DIM = '#005500';

interface DeliveryData {
  agentId: string;
  displayName: string;
  matrixName: string;
  role: string;
  currentTask: string | null;
  lastDelivery: string | null;
  lastSpeech: string | null;
}

/**
 * Delivery Screen — full interaction view for agent deliveries (Story 4.5).
 * DOM overlay (80% of screen) with: delivery details, chat, action buttons.
 * Opened by: clicking agent, clicking "..." bubble, or agent seek-player.
 */
export class DeliveryScreen {
  private container: HTMLDivElement;
  private contentEl: HTMLDivElement;
  private isOpen = false;
  private currentAgentId: string | null = null;
  private escHandler: ((e: KeyboardEvent) => void) | null = null;
  private onAction: ((agentId: string, action: string, message?: string) => void) | null = null;

  constructor(onAction?: (agentId: string, action: string, message?: string) => void) {
    this.onAction = onAction ?? null;

    this.container = document.createElement('div');
    this.container.id = 'delivery-screen';
    this.applyContainerStyles();

    this.contentEl = document.createElement('div');
    this.contentEl.id = 'delivery-content';
    this.container.appendChild(this.contentEl);

    document.body.appendChild(this.container);
  }

  private applyContainerStyles(): void {
    const s = this.container.style;
    s.position = 'fixed';
    s.top = '5vh';
    s.left = '10vw';
    s.width = '80vw';
    s.height = '90vh';
    s.backgroundColor = MATRIX_BG;
    s.border = `2px solid ${MATRIX_GREEN}`;
    s.borderRadius = '8px';
    s.color = MATRIX_GREEN;
    s.fontFamily = '"Courier New", monospace';
    s.fontSize = '13px';
    s.overflowY = 'auto';
    s.zIndex = '3000';
    s.opacity = '0';
    s.pointerEvents = 'none';
    s.transition = 'opacity 0.2s ease';
    s.boxShadow = `0 0 30px rgba(0, 255, 65, 0.3)`;
  }

  open(agentId: string, delivery?: { task?: string; content?: string; speech?: string }): void {
    if (this.isOpen) this.close();
    this.isOpen = true;
    this.currentAgentId = agentId;

    this.container.style.opacity = '1';
    this.container.style.pointerEvents = 'auto';

    // Bind ESC
    this.escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') this.close();
    };
    document.addEventListener('keydown', this.escHandler);

    // Build delivery data
    const config = AGENT_CONFIG_MAP[agentId];
    const data: DeliveryData = {
      agentId,
      displayName: config?.displayName ?? agentId,
      matrixName: config?.matrixName ?? '',
      role: config?.role ?? 'Agent',
      currentTask: delivery?.task ?? null,
      lastDelivery: delivery?.content ?? null,
      lastSpeech: delivery?.speech ?? null,
    };

    this.render(data);
  }

  close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.currentAgentId = null;

    this.container.style.opacity = '0';
    this.container.style.pointerEvents = 'none';

    if (this.escHandler) {
      document.removeEventListener('keydown', this.escHandler);
      this.escHandler = null;
    }
  }

  getIsOpen(): boolean {
    return this.isOpen;
  }

  getCurrentAgentId(): string | null {
    return this.currentAgentId;
  }

  destroy(): void {
    this.close();
    this.container.remove();
  }

  private render(data: DeliveryData): void {
    this.contentEl.innerHTML = `
      <div style="padding: 16px;">
        ${this.renderHeader(data)}
        ${this.renderDeliveryContent(data)}
        ${this.renderChat(data)}
        ${this.renderActions(data)}
      </div>
    `;

    this.bindActions(data.agentId);
  }

  private renderHeader(data: DeliveryData): string {
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid ${MATRIX_GREEN}; padding-bottom: 12px; margin-bottom: 16px;">
        <div>
          <div style="font-size: 18px;">@${this.esc(data.agentId)} — ${this.esc(data.displayName)}</div>
          <div style="color: ${MATRIX_DIM}; font-size: 11px;">${this.esc(data.matrixName)} | ${this.esc(data.role)}</div>
        </div>
        <button id="delivery-close-btn" style="
          background: transparent;
          border: 1px solid ${MATRIX_DIM};
          color: ${MATRIX_GREEN};
          font-family: 'Courier New', monospace;
          font-size: 16px;
          width: 32px;
          height: 32px;
          cursor: pointer;
        ">[X]</button>
      </div>
    `;
  }

  private renderDeliveryContent(data: DeliveryData): string {
    const task = data.currentTask
      ? `<div style="color: ${MATRIX_DIM}; margin-bottom: 8px;">Task: ${this.esc(data.currentTask)}</div>`
      : '';

    const content = data.lastDelivery
      ? `<div style="white-space: pre-wrap; line-height: 1.6; max-height: 40vh; overflow-y: auto; padding: 12px; background: #000; border: 1px solid ${MATRIX_DIM}; border-radius: 4px;">${this.esc(data.lastDelivery)}</div>`
      : `<div style="color: ${MATRIX_DIM}; padding: 24px; text-align: center;">Nenhuma entrega disponível no momento.</div>`;

    return `
      <div style="margin-bottom: 16px;">
        <div style="margin-bottom: 8px;">── ENTREGA ──</div>
        ${task}
        ${content}
      </div>
    `;
  }

  private renderChat(data: DeliveryData): string {
    const speech = data.lastSpeech
      ? `<div style="padding: 8px; background: #111; border-left: 2px solid ${MATRIX_GREEN}; margin-bottom: 8px;">
          <span style="color: ${MATRIX_DIM};">@${this.esc(data.agentId)}:</span> ${this.esc(data.lastSpeech)}
        </div>`
      : '';

    return `
      <div style="margin-bottom: 16px;">
        <div style="margin-bottom: 8px;">── CHAT ──</div>
        ${speech}
        <div style="display: flex; gap: 8px;">
          <input id="delivery-chat-input" type="text" placeholder="Digitar feedback..." style="
            flex: 1;
            background: #000;
            border: 1px solid ${MATRIX_DIM};
            color: ${MATRIX_GREEN};
            font-family: 'Courier New', monospace;
            font-size: 12px;
            padding: 8px;
            border-radius: 4px;
            outline: none;
          " />
          <button id="delivery-send-btn" style="
            background: transparent;
            border: 1px solid ${MATRIX_GREEN};
            color: ${MATRIX_GREEN};
            font-family: 'Courier New', monospace;
            padding: 8px 12px;
            cursor: pointer;
          ">[Enviar]</button>
        </div>
      </div>
    `;
  }

  private renderActions(data: DeliveryData): string {
    const hasDelivery = !!data.lastDelivery;
    const disabledStyle = hasDelivery ? '' : 'opacity: 0.3; pointer-events: none;';

    return `
      <div style="display: flex; gap: 12px; justify-content: center; padding: 16px 0; border-top: 1px solid ${MATRIX_DIM};">
        <button id="delivery-approve-btn" style="
          background: transparent;
          border: 1px solid ${MATRIX_GREEN};
          color: ${MATRIX_GREEN};
          font-family: 'Courier New', monospace;
          font-size: 14px;
          padding: 10px 24px;
          cursor: pointer;
          letter-spacing: 1px;
          ${disabledStyle}
        ">[ Aprovar ]</button>
        <button id="delivery-reject-btn" style="
          background: transparent;
          border: 1px solid ${MATRIX_DIM};
          color: ${MATRIX_DIM};
          font-family: 'Courier New', monospace;
          font-size: 14px;
          padding: 10px 24px;
          cursor: pointer;
          letter-spacing: 1px;
          ${disabledStyle}
        ">[ Recusar ]</button>
      </div>
    `;
  }

  private bindActions(agentId: string): void {
    // Close button
    const closeBtn = this.contentEl.querySelector('#delivery-close-btn');
    closeBtn?.addEventListener('click', () => this.close());

    // Approve
    const approveBtn = this.contentEl.querySelector('#delivery-approve-btn');
    approveBtn?.addEventListener('click', () => {
      this.onAction?.(agentId, 'approve');
      this.close();
    });

    // Reject
    const rejectBtn = this.contentEl.querySelector('#delivery-reject-btn');
    rejectBtn?.addEventListener('click', () => {
      this.onAction?.(agentId, 'reject');
      this.close();
    });

    // Send chat message
    const sendBtn = this.contentEl.querySelector('#delivery-send-btn');
    const chatInput = this.contentEl.querySelector('#delivery-chat-input') as HTMLInputElement | null;

    const sendMessage = () => {
      const message = chatInput?.value?.trim();
      if (message) {
        this.onAction?.(agentId, 'message', message);
        if (chatInput) chatInput.value = '';
      }
    };

    sendBtn?.addEventListener('click', sendMessage);
    chatInput?.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.stopPropagation();
        sendMessage();
      }
    });
  }

  private esc(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
