const fs = require('fs');
const path = require('path');

const VISUAL_DIR = path.join(__dirname, '../../apps/visual');

describe('Story 4.1: Click-to-Inspect & Agent Inspector Panel', () => {
  describe('Agent interactivity (AC: 1, 6)', () => {
    let agentSource;

    beforeAll(() => {
      agentSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/objects/Agent.ts'),
        'utf8',
      );
    });

    test('Agent file exists', () => {
      expect(fs.existsSync(
        path.join(VISUAL_DIR, 'src/client/objects/Agent.ts'),
      )).toBe(true);
    });

    test('sets container interactive', () => {
      expect(agentSource).toContain('setInteractive');
      expect(agentSource).toContain('useHandCursor');
    });

    test('sets container size for hit area', () => {
      expect(agentSource).toContain('this.setSize(');
    });

    test('tracks last speech text', () => {
      expect(agentSource).toContain('lastSpeechText');
      expect(agentSource).toContain('getLastSpeech');
    });

    test('stores speech text in say()', () => {
      expect(agentSource).toContain('this.lastSpeechText = text');
    });
  });

  describe('InspectorPanel (AC: 2, 3, 8)', () => {
    let panelSource;

    beforeAll(() => {
      panelSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/ui/InspectorPanel.ts'),
        'utf8',
      );
    });

    test('file exists', () => {
      expect(fs.existsSync(
        path.join(VISUAL_DIR, 'src/client/ui/InspectorPanel.ts'),
      )).toBe(true);
    });

    test('exports InspectorPanel class', () => {
      expect(panelSource).toContain('export class InspectorPanel');
    });

    test('creates DOM container element', () => {
      expect(panelSource).toContain("document.createElement('div')");
      expect(panelSource).toContain("'inspector-panel'");
    });

    test('appends to document body', () => {
      expect(panelSource).toContain('document.body.appendChild');
    });

    test('uses Matrix terminal background (#0D0208)', () => {
      expect(panelSource).toContain('#0D0208');
    });

    test('uses Matrix green text (#00FF41)', () => {
      expect(panelSource).toContain('#00FF41');
    });

    test('uses monospace font', () => {
      expect(panelSource).toContain('monospace');
    });

    test('has slide-in animation via CSS transform', () => {
      expect(panelSource).toContain('translateX(100%)');
      expect(panelSource).toContain('translateX(0)');
      expect(panelSource).toContain('transition');
    });

    test('shows agent name', () => {
      expect(panelSource).toContain('displayName');
      expect(panelSource).toContain('inspector-name');
    });

    test('shows agent persona/matrix name', () => {
      expect(panelSource).toContain('matrixName');
      expect(panelSource).toContain('inspector-matrix-name');
    });

    test('shows agent status', () => {
      expect(panelSource).toContain('getStatus()');
      expect(panelSource).toContain('STATUS_LABELS');
      expect(panelSource).toContain('STATUS_COLORS');
    });

    test('shows current task', () => {
      expect(panelSource).toContain('getTask()');
      expect(panelSource).toContain('Current Task');
    });

    test('shows last speech', () => {
      expect(panelSource).toContain('getLastSpeech()');
      expect(panelSource).toContain('Last Speech');
    });

    test('shows agent role', () => {
      expect(panelSource).toContain('inspector-role');
      expect(panelSource).toContain('config?.role');
    });

    test('has [Ver detalhes] button (AC: 4)', () => {
      expect(panelSource).toContain('Ver detalhes');
      expect(panelSource).toContain('inspector-details-btn');
    });

    test('has open method', () => {
      expect(panelSource).toContain('open(agent');
    });

    test('has close method', () => {
      expect(panelSource).toContain('close()');
    });

    test('has destroy method', () => {
      expect(panelSource).toContain('destroy()');
    });

    test('only one panel at a time (AC: 6) — checks current agent', () => {
      expect(panelSource).toContain('currentAgentId');
      expect(panelSource).toContain('this.currentAgentId === agentId');
    });

    test('uses AGENT_CONFIG_MAP for agent details', () => {
      expect(panelSource).toContain("from '@/client/data/agent-config'");
      expect(panelSource).toContain('AGENT_CONFIG_MAP');
    });

    test('escapes HTML to prevent XSS', () => {
      expect(panelSource).toContain('escapeHtml');
    });
  });

  describe('close behavior (AC: 5)', () => {
    let panelSource;

    beforeAll(() => {
      panelSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/ui/InspectorPanel.ts'),
        'utf8',
      );
    });

    test('ESC key closes panel', () => {
      expect(panelSource).toContain("'Escape'");
      expect(panelSource).toContain('keydown');
    });

    test('close button in panel', () => {
      expect(panelSource).toContain('inspector-close');
    });

    test('unbinds handlers on close', () => {
      expect(panelSource).toContain('unbindCloseHandlers');
      expect(panelSource).toContain('removeEventListener');
    });
  });

  describe('AgentTooltip (AC: 7)', () => {
    let tooltipSource;

    beforeAll(() => {
      tooltipSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/ui/AgentTooltip.ts'),
        'utf8',
      );
    });

    test('file exists', () => {
      expect(fs.existsSync(
        path.join(VISUAL_DIR, 'src/client/ui/AgentTooltip.ts'),
      )).toBe(true);
    });

    test('exports AgentTooltip class', () => {
      expect(tooltipSource).toContain('export class AgentTooltip');
    });

    test('creates DOM element', () => {
      expect(tooltipSource).toContain("document.createElement('div')");
      expect(tooltipSource).toContain("'agent-tooltip'");
    });

    test('shows agent name and status', () => {
      expect(tooltipSource).toContain('displayName');
      expect(tooltipSource).toContain('STATUS_LABELS');
    });

    test('positions at pointer location', () => {
      expect(tooltipSource).toContain('screenX');
      expect(tooltipSource).toContain('screenY');
    });

    test('has show method with agentId and status', () => {
      expect(tooltipSource).toContain('show(agentId');
    });

    test('has hide method', () => {
      expect(tooltipSource).toContain('hide()');
    });

    test('has destroy method', () => {
      expect(tooltipSource).toContain('destroy()');
    });

    test('uses Matrix terminal style', () => {
      expect(tooltipSource).toContain('#0D0208');
      expect(tooltipSource).toContain('#00FF41');
      expect(tooltipSource).toContain('monospace');
    });

    test('tooltip has pointerEvents none (no click interception)', () => {
      expect(tooltipSource).toContain("pointerEvents = 'none'");
    });
  });

  describe('ConstructScene integration (AC: 1, 5, 6, 7)', () => {
    let sceneSource;

    beforeAll(() => {
      sceneSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/scenes/ConstructScene.ts'),
        'utf8',
      );
    });

    test('imports InspectorPanel', () => {
      expect(sceneSource).toContain("from '@/client/ui/InspectorPanel'");
    });

    test('imports AgentTooltip', () => {
      expect(sceneSource).toContain("from '@/client/ui/AgentTooltip'");
    });

    test('creates InspectorPanel instance', () => {
      expect(sceneSource).toContain('new InspectorPanel()');
    });

    test('creates AgentTooltip instance', () => {
      expect(sceneSource).toContain('new AgentTooltip()');
    });

    test('sets up agent interaction handlers', () => {
      expect(sceneSource).toContain('setupAgentInteraction');
    });

    test('binds pointerdown on agents to open interaction (Story 4.5: DeliveryScreen)', () => {
      expect(sceneSource).toContain("agent.on('pointerdown'");
      // Story 4.5: click now opens DeliveryScreen instead of InspectorPanel
      expect(sceneSource).toContain('openDeliveryForAgent');
    });

    test('binds pointerover on agents to show tooltip', () => {
      expect(sceneSource).toContain("agent.on('pointerover'");
      expect(sceneSource).toContain('agentTooltip?.show');
    });

    test('binds pointerout on agents to hide tooltip', () => {
      expect(sceneSource).toContain("agent.on('pointerout'");
      expect(sceneSource).toContain('agentTooltip?.hide()');
    });

    test('hides tooltip when inspector opens', () => {
      // In the pointerdown handler, tooltip should hide
      expect(sceneSource).toContain('agentTooltip?.hide()');
    });

    test('click on empty area closes inspector (AC: 5)', () => {
      expect(sceneSource).toContain('gameObjects.length === 0');
      expect(sceneSource).toContain('inspectorPanel?.close()');
    });

    test('iterates all agents for event binding', () => {
      expect(sceneSource).toContain('agentFactory.getAllAgents()');
    });
  });
});
