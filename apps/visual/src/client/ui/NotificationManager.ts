import { AGENT_CONFIG_MAP } from '@/client/data/agent-config';

const MAX_VISIBLE = 3;
const AUTO_DISMISS_MS = 10000;

export type NotificationType = 'delivery' | 'smith-verdict' | 'workflow' | 'error';

export interface NotificationAction {
  label: string;
  callback: () => void;
}

export interface NotificationData {
  type: NotificationType;
  agentId: string;
  title: string;
  description: string;
  actions?: NotificationAction[];
}

interface ActiveNotification {
  id: number;
  data: NotificationData;
  element: HTMLDivElement;
  timer: ReturnType<typeof setTimeout>;
}

const TYPE_ICONS: Record<NotificationType, string> = {
  'delivery': '📦',
  'smith-verdict': '🔍',
  'workflow': '⚡',
  'error': '⚠️',
};

const TYPE_BORDER_COLORS: Record<NotificationType, string> = {
  'delivery': '#00FF41',
  'smith-verdict': '#FF0000',
  'workflow': '#0ABDC6',
  'error': '#FFD700',
};

/**
 * RPG-style notification manager.
 * Shows stacked popups (max 3), auto-dismiss after 10s.
 * Supports contextual action buttons.
 */
export class NotificationManager {
  private container: HTMLDivElement;
  private active: ActiveNotification[] = [];
  private nextId = 0;
  private soundEnabled = true;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'notification-stack';
    this.applyContainerStyles();
    document.body.appendChild(this.container);
    this.injectStyles();
  }

  private applyContainerStyles(): void {
    const s = this.container.style;
    s.position = 'fixed';
    s.top = '48px';
    s.right = '16px';
    s.width = '300px';
    s.zIndex = '950';
    s.display = 'flex';
    s.flexDirection = 'column';
    s.gap = '8px';
    s.pointerEvents = 'none';
  }

  private injectStyles(): void {
    if (document.getElementById('notification-styles')) return;

    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      .rpg-notification {
        background: #0D0208;
        border: 2px solid #00FF41;
        color: #00FF41;
        font-family: "Courier New", monospace;
        font-size: 12px;
        padding: 10px 12px;
        pointer-events: all;
        cursor: pointer;
        animation: notification-slide-in 0.3s ease-out;
        box-shadow: 0 4px 12px rgba(0, 255, 65, 0.15);
        position: relative;
      }
      .rpg-notification.dismissing {
        animation: notification-slide-out 0.3s ease-in forwards;
      }
      @keyframes notification-slide-in {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes notification-slide-out {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
      .rpg-notification .notif-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
      }
      .rpg-notification .notif-icon {
        font-size: 16px;
        flex-shrink: 0;
      }
      .rpg-notification .notif-agent-icon {
        width: 16px;
        height: 16px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        border: 1px solid #00FF41;
        flex-shrink: 0;
      }
      .rpg-notification .notif-title {
        font-weight: bold;
        font-size: 12px;
        flex: 1;
      }
      .rpg-notification .notif-description {
        color: #008F11;
        font-size: 11px;
        margin-top: 4px;
        line-height: 1.3;
      }
      .rpg-notification .notif-actions {
        display: flex;
        gap: 8px;
        margin-top: 8px;
      }
      .rpg-notification .notif-action-btn {
        background: rgba(0, 255, 65, 0.1);
        border: 1px solid #00FF41;
        color: #00FF41;
        font-family: monospace;
        font-size: 11px;
        padding: 3px 10px;
        cursor: pointer;
        transition: background 0.2s;
      }
      .rpg-notification .notif-action-btn:hover {
        background: rgba(0, 255, 65, 0.3);
      }
    `;
    document.head.appendChild(style);
  }

  show(data: NotificationData): number {
    const id = this.nextId++;

    // Remove oldest if at max
    if (this.active.length >= MAX_VISIBLE) {
      const oldest = this.active[0];
      this.dismiss(oldest.id);
    }

    const element = this.createNotificationElement(id, data);
    this.container.appendChild(element);

    const timer = setTimeout(() => {
      this.dismiss(id);
    }, AUTO_DISMISS_MS);

    this.active.push({ id, data, element, timer });

    return id;
  }

  dismiss(id: number): void {
    const index = this.active.findIndex(n => n.id === id);
    if (index === -1) return;

    const notification = this.active[index];
    clearTimeout(notification.timer);
    notification.element.classList.add('dismissing');

    setTimeout(() => {
      notification.element.remove();
      this.active = this.active.filter(n => n.id !== id);
    }, 300);
  }

  private createNotificationElement(id: number, data: NotificationData): HTMLDivElement {
    const el = document.createElement('div');
    el.className = 'rpg-notification';
    el.style.borderColor = TYPE_BORDER_COLORS[data.type];

    const config = AGENT_CONFIG_MAP[data.agentId];
    const agentInitial = config?.displayName?.charAt(0) ?? '?';
    const typeIcon = TYPE_ICONS[data.type];

    let actionsHtml = '';
    if (data.actions && data.actions.length > 0) {
      const buttons = data.actions
        .map((a, i) => `<button class="notif-action-btn" data-action-index="${i}">${this.escapeHtml(a.label)}</button>`)
        .join('');
      actionsHtml = `<div class="notif-actions">${buttons}</div>`;
    }

    el.innerHTML = `
      <div class="notif-header">
        <span class="notif-icon">${typeIcon}</span>
        <span class="notif-agent-icon">${agentInitial}</span>
        <span class="notif-title">${this.escapeHtml(data.title)}</span>
      </div>
      <div class="notif-description">${this.escapeHtml(data.description)}</div>
      ${actionsHtml}
    `;

    // Click to dismiss (if no action buttons clicked)
    el.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.classList.contains('notif-action-btn')) {
        this.dismiss(id);
      }
    });

    // Action button handlers
    if (data.actions) {
      const buttons = el.querySelectorAll('.notif-action-btn');
      buttons.forEach((btn, i) => {
        btn.addEventListener('click', () => {
          data.actions?.[i]?.callback();
          this.dismiss(id);
        });
      });
    }

    return el;
  }

  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  getActiveCount(): number {
    return this.active.length;
  }

  clearAll(): void {
    for (const notification of [...this.active]) {
      this.dismiss(notification.id);
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  destroy(): void {
    this.clearAll();
    this.container.remove();
    document.getElementById('notification-styles')?.remove();
  }
}
