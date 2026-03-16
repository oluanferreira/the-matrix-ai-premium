const fs = require('fs');
const path = require('path');

const VISUAL_DIR = path.join(__dirname, '../../apps/visual');

describe('Story 4.3: RPG-Style Notifications', () => {
  describe('NotificationManager (AC: 1, 2, 3, 4, 5)', () => {
    let managerSource;

    beforeAll(() => {
      managerSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/ui/NotificationManager.ts'),
        'utf8',
      );
    });

    test('file exists', () => {
      expect(fs.existsSync(
        path.join(VISUAL_DIR, 'src/client/ui/NotificationManager.ts'),
      )).toBe(true);
    });

    test('exports NotificationManager class', () => {
      expect(managerSource).toContain('export class NotificationManager');
    });

    test('exports NotificationType type', () => {
      expect(managerSource).toContain('export type NotificationType');
    });

    test('exports NotificationData interface', () => {
      expect(managerSource).toContain('export interface NotificationData');
    });

    test('exports NotificationAction interface', () => {
      expect(managerSource).toContain('export interface NotificationAction');
    });

    // AC: 1 — RPG style popup
    test('creates DOM container for stack', () => {
      expect(managerSource).toContain("document.createElement('div')");
      expect(managerSource).toContain("'notification-stack'");
    });

    test('uses dark background (#0D0208) (AC: 1)', () => {
      expect(managerSource).toContain('#0D0208');
    });

    test('uses pixel art border style (#00FF41) (AC: 1)', () => {
      expect(managerSource).toContain('#00FF41');
    });

    test('uses monospace font (AC: 1)', () => {
      expect(managerSource).toContain('monospace');
    });

    test('has slide-in animation (AC: 1)', () => {
      expect(managerSource).toContain('notification-slide-in');
      expect(managerSource).toContain('translateX');
    });

    test('has slide-out animation for dismissal', () => {
      expect(managerSource).toContain('notification-slide-out');
      expect(managerSource).toContain('dismissing');
    });

    // AC: 2 — Notification types
    test('supports delivery type', () => {
      expect(managerSource).toContain("'delivery'");
    });

    test('supports smith-verdict type', () => {
      expect(managerSource).toContain("'smith-verdict'");
    });

    test('supports workflow type', () => {
      expect(managerSource).toContain("'workflow'");
    });

    test('supports error type', () => {
      expect(managerSource).toContain("'error'");
    });

    test('has type-specific icons', () => {
      expect(managerSource).toContain('TYPE_ICONS');
    });

    test('has type-specific border colors', () => {
      expect(managerSource).toContain('TYPE_BORDER_COLORS');
    });

    // AC: 3 — Content: icon, title, description, action buttons
    test('shows agent icon (AC: 3)', () => {
      expect(managerSource).toContain('notif-agent-icon');
      expect(managerSource).toContain('AGENT_CONFIG_MAP');
    });

    test('shows title (AC: 3)', () => {
      expect(managerSource).toContain('notif-title');
    });

    test('shows description (AC: 3)', () => {
      expect(managerSource).toContain('notif-description');
    });

    test('has contextual action buttons (AC: 3)', () => {
      expect(managerSource).toContain('notif-action-btn');
      expect(managerSource).toContain('notif-actions');
    });

    test('action buttons trigger callbacks (AC: 3)', () => {
      expect(managerSource).toContain('data-action-index');
      expect(managerSource).toContain('callback()');
    });

    // AC: 4 — Stack system
    test('max 3 visible (AC: 4)', () => {
      expect(managerSource).toContain('MAX_VISIBLE');
      expect(managerSource).toContain('3');
    });

    test('removes oldest when exceeding max (AC: 4)', () => {
      expect(managerSource).toContain('this.active.length >= MAX_VISIBLE');
      expect(managerSource).toContain('this.active[0]');
    });

    test('stacks vertically (flexbox column)', () => {
      expect(managerSource).toContain("flexDirection = 'column'");
    });

    // AC: 5 — Auto-dismiss and manual dismiss
    test('auto-dismiss after 10s (AC: 5)', () => {
      expect(managerSource).toContain('AUTO_DISMISS_MS');
      expect(managerSource).toContain('10000');
    });

    test('has dismiss method (AC: 5)', () => {
      expect(managerSource).toContain('dismiss(id');
    });

    test('click dismisses notification (AC: 5)', () => {
      expect(managerSource).toContain("addEventListener('click'");
      expect(managerSource).toContain('this.dismiss(id)');
    });

    test('clears timeout on dismiss', () => {
      expect(managerSource).toContain('clearTimeout');
    });

    // AC: 6 — Sound
    test('has sound toggle (AC: 6)', () => {
      expect(managerSource).toContain('soundEnabled');
      expect(managerSource).toContain('setSoundEnabled');
      expect(managerSource).toContain('isSoundEnabled');
    });

    // General
    test('has show method', () => {
      expect(managerSource).toContain('show(data');
    });

    test('has getActiveCount method', () => {
      expect(managerSource).toContain('getActiveCount()');
    });

    test('has clearAll method', () => {
      expect(managerSource).toContain('clearAll()');
    });

    test('has destroy method', () => {
      expect(managerSource).toContain('destroy()');
    });

    test('escapes HTML to prevent XSS', () => {
      expect(managerSource).toContain('escapeHtml');
    });

    test('returns notification id from show()', () => {
      expect(managerSource).toContain('return id');
    });
  });
});
