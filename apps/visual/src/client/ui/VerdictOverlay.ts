import { VERDICT_COLORS } from '@/client/data/matrix-phrases';
import type { SmithVerdictLevel } from '@/client/data/matrix-phrases';

const DISPLAY_DURATION_MS = 4000;

/**
 * Full-screen verdict overlay — shows Smith's verdict dramatically.
 * Large text with color coding by severity.
 */
export class VerdictOverlay {
  private container: HTMLDivElement;
  private dismissTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'verdict-overlay';
    this.applyStyles();
    this.container.style.display = 'none';
    document.body.appendChild(this.container);
    this.injectStyles();
  }

  private applyStyles(): void {
    const s = this.container.style;
    s.position = 'fixed';
    s.top = '0';
    s.left = '0';
    s.width = '100%';
    s.height = '100%';
    s.display = 'none';
    s.alignItems = 'center';
    s.justifyContent = 'center';
    s.zIndex = '1100';
    s.backgroundColor = 'rgba(13, 2, 8, 0.7)';
    s.fontFamily = '"Courier New", monospace';
    s.pointerEvents = 'none';
  }

  private injectStyles(): void {
    if (document.getElementById('verdict-overlay-styles')) return;

    const style = document.createElement('style');
    style.id = 'verdict-overlay-styles';
    style.textContent = `
      #verdict-overlay .verdict-text {
        font-size: 48px;
        font-weight: bold;
        text-shadow: 0 0 20px currentColor, 0 0 40px currentColor;
        animation: verdict-pulse 0.5s ease-in-out;
        letter-spacing: 8px;
        text-transform: uppercase;
      }
      #verdict-overlay .verdict-findings {
        font-size: 16px;
        margin-top: 12px;
        color: #008F11;
      }
      @keyframes verdict-pulse {
        0% { transform: scale(0.5); opacity: 0; }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  show(verdict: SmithVerdictLevel, findings?: number): void {
    const color = VERDICT_COLORS[verdict];

    this.container.innerHTML = `
      <div style="text-align: center;">
        <div class="verdict-text" style="color: ${color};">${verdict}</div>
        ${findings !== undefined ? `<div class="verdict-findings">${findings} findings</div>` : ''}
      </div>
    `;

    this.container.style.display = 'flex';

    if (this.dismissTimer) clearTimeout(this.dismissTimer);
    this.dismissTimer = setTimeout(() => this.hide(), DISPLAY_DURATION_MS);
  }

  hide(): void {
    this.container.style.display = 'none';
    if (this.dismissTimer) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }
  }

  isVisible(): boolean {
    return this.container.style.display !== 'none';
  }

  destroy(): void {
    if (this.dismissTimer) clearTimeout(this.dismissTimer);
    this.container.remove();
    document.getElementById('verdict-overlay-styles')?.remove();
  }
}
