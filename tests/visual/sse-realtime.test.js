const fs = require('fs');
const path = require('path');

const VISUAL_DIR = path.join(__dirname, '../../apps/visual');

describe('Story 3.3: SSE Real-Time Broadcasting', () => {
  describe('AgentStateManager client (AC: 3)', () => {
    let stateManagerSource;

    beforeAll(() => {
      stateManagerSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/systems/AgentStateManager.ts'),
        'utf8',
      );
    });

    test('file exists', () => {
      expect(fs.existsSync(
        path.join(VISUAL_DIR, 'src/client/systems/AgentStateManager.ts'),
      )).toBe(true);
    });

    test('exports AgentStateManager class', () => {
      expect(stateManagerSource).toContain('export class AgentStateManager');
    });

    test('uses SSEClient', () => {
      expect(stateManagerSource).toContain("from '@/client/systems/SSEClient'");
    });

    test('uses AgentFactory', () => {
      expect(stateManagerSource).toContain('AgentFactory');
    });

    test('binds to agent-status events', () => {
      expect(stateManagerSource).toContain("'agent-status'");
      expect(stateManagerSource).toContain('handleAgentStatus');
    });

    test('binds to agent-task events', () => {
      expect(stateManagerSource).toContain("'agent-task'");
      expect(stateManagerSource).toContain('handleAgentTask');
    });

    test('binds to agent-delivery events', () => {
      expect(stateManagerSource).toContain("'agent-delivery'");
      expect(stateManagerSource).toContain('handleAgentDelivery');
    });

    test('binds to smith-verdict events', () => {
      expect(stateManagerSource).toContain("'smith-verdict'");
      expect(stateManagerSource).toContain('handleSmithVerdict');
    });

    test('binds to workflow-update events', () => {
      expect(stateManagerSource).toContain("'workflow-update'");
      expect(stateManagerSource).toContain('handleWorkflowUpdate');
    });

    test('updates agent status on status event', () => {
      expect(stateManagerSource).toContain('agent.setStatus');
    });

    test('updates agent task on task event', () => {
      expect(stateManagerSource).toContain('agent.setTask');
    });

    test('shows delivery speech bubble', () => {
      expect(stateManagerSource).toContain('agent.say');
      expect(stateManagerSource).toContain('Delivered');
    });

    test('handles smith verdict for target agent', () => {
      expect(stateManagerSource).toContain('targetAgentId');
      expect(stateManagerSource).toContain("getAgent('smith')");
    });

    test('has destroy method', () => {
      expect(stateManagerSource).toContain('destroy()');
    });

    test('exports event interfaces', () => {
      expect(stateManagerSource).toContain('export interface AgentStatusEvent');
      expect(stateManagerSource).toContain('export interface AgentDeliveryEvent');
      expect(stateManagerSource).toContain('export interface SmithVerdictEvent');
      expect(stateManagerSource).toContain('export interface WorkflowUpdateEvent');
    });
  });

  describe('SSE event types (AC: 2)', () => {
    let sseClientSource;

    beforeAll(() => {
      sseClientSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/systems/SSEClient.ts'),
        'utf8',
      );
    });

    test('handles agent-status events', () => {
      expect(sseClientSource).toContain("'agent-status'");
    });

    test('handles agent-delivery events', () => {
      expect(sseClientSource).toContain("'agent-delivery'");
    });

    test('handles smith-verdict events', () => {
      expect(sseClientSource).toContain("'smith-verdict'");
    });

    test('handles workflow-update events', () => {
      expect(sseClientSource).toContain("'workflow-update'");
    });

    test('handles heartbeat events (AC: 6)', () => {
      expect(sseClientSource).toContain("'heartbeat'");
    });
  });

  describe('SSE reconnection (AC: 5)', () => {
    let sseClientSource;

    beforeAll(() => {
      sseClientSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/systems/SSEClient.ts'),
        'utf8',
      );
    });

    test('auto-reconnects on error', () => {
      expect(sseClientSource).toContain('onerror');
      expect(sseClientSource).toContain('this.connect()');
    });

    test('uses exponential backoff', () => {
      expect(sseClientSource).toContain('reconnectDelay * 2');
    });

    test('caps reconnect delay at 30s', () => {
      expect(sseClientSource).toContain('maxReconnectDelay');
      expect(sseClientSource).toContain('30000');
    });

    test('resets delay on successful connect', () => {
      expect(sseClientSource).toContain('reconnectDelay = 1000');
    });
  });

  describe('server-side integration (AC: 1)', () => {
    let serverSource;
    let projectContextSource;

    beforeAll(() => {
      serverSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/server/index.ts'),
        'utf8',
      );
      // Story 5.4: broadcast logic moved to project-context.ts (dynamic project switching)
      projectContextSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/server/project-context.ts'),
        'utf8',
      );
    });

    test('imports StateManager', () => {
      expect(projectContextSource).toContain('StateManager');
    });

    test('imports GitPoller', () => {
      expect(projectContextSource).toContain('GitPoller');
    });

    test('StateManager emits to broadcaster', () => {
      expect(projectContextSource).toContain("stateManager.on('stateUpdate'");
      expect(projectContextSource).toContain('broadcaster.broadcast');
    });

    test('GitPoller emits to broadcaster', () => {
      expect(projectContextSource).toContain("gitPoller.on('newCommit'");
      expect(projectContextSource).toContain("event: 'agent-delivery'");
    });

    test('starts StateManager and GitPoller', () => {
      expect(projectContextSource).toContain('stateManager.start()');
      expect(projectContextSource).toContain('gitPoller.start()');
    });

    test('shuts down StateManager and GitPoller on exit', () => {
      expect(serverSource).toContain('stateManager.stop()');
      expect(serverSource).toContain('gitPoller.stop()');
    });

    test('broadcasts agent-status events from state changes', () => {
      expect(projectContextSource).toContain("event: 'agent-status'");
      expect(projectContextSource).toContain('state.agentId');
      expect(projectContextSource).toContain('state.visualState');
    });

    test('broadcasts agent-delivery events from git commits', () => {
      expect(projectContextSource).toContain('commit.hash');
      expect(projectContextSource).toContain('commit.message');
      expect(projectContextSource).toContain('commit.agentId');
    });
  });

  describe('heartbeat (AC: 6)', () => {
    let broadcasterSource;

    beforeAll(() => {
      broadcasterSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/server/services/SSEBroadcaster.ts'),
        'utf8',
      );
    });

    test('heartbeat at 30s interval', () => {
      expect(broadcasterSource).toContain('HEARTBEAT_INTERVAL_MS');
      expect(broadcasterSource).toContain('30_000');
    });

    test('startHeartbeat method', () => {
      expect(broadcasterSource).toContain('startHeartbeat()');
    });

    test('sends heartbeat with timestamp', () => {
      expect(broadcasterSource).toContain("event: 'heartbeat'");
      expect(broadcasterSource).toContain('timestamp');
    });
  });
});
