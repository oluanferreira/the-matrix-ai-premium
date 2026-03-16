import path from 'path';
import { createApp } from './app';
import { StateManager } from './services/StateManager';
import { GitPoller } from './watchers/GitPoller';
import type { AgentState } from './services/LMASDataReader';
import type { GitCommit } from './services/GitReader';

const PORT = process.env.PORT ?? 3001;
const PROJECT_ROOT = path.resolve(__dirname, '../../../..');

const { app, broadcaster } = createApp();

broadcaster.startHeartbeat();

// Real data integration (replaces mock events when LMAS data is available)
const stateManager = new StateManager(PROJECT_ROOT);
const gitPoller = new GitPoller(PROJECT_ROOT);

stateManager.on('stateUpdate', (states: AgentState[]) => {
  for (const state of states) {
    broadcaster.broadcast({
      event: 'agent-status',
      data: {
        agentId: state.agentId,
        status: state.visualState,
        task: state.currentTask,
        timestamp: Date.now(),
      },
    });
  }
});

gitPoller.on('newCommit', (commit: GitCommit) => {
  broadcaster.broadcast({
    event: 'agent-delivery',
    data: {
      agentId: commit.agentId ?? 'dev',
      commitHash: commit.hash,
      message: commit.message,
      storyId: commit.storyId,
      timestamp: commit.timestamp,
    },
  });
});

stateManager.start();
gitPoller.start();

// Fallback: keep mock events for demo mode
broadcaster.startMockEvents();

const server = app.listen(PORT, () => {
  console.log(`[Matrix Visual] Server running on http://localhost:${PORT}`);
  console.log(`[Matrix Visual] SSE endpoint: http://localhost:${PORT}/api/events/stream`);
});

process.on('SIGTERM', () => {
  console.log('[Matrix Visual] Shutting down...');
  stateManager.stop();
  gitPoller.stop();
  broadcaster.shutdown();
  server.close();
});

process.on('SIGINT', () => {
  console.log('[Matrix Visual] Shutting down...');
  stateManager.stop();
  gitPoller.stop();
  broadcaster.shutdown();
  server.close();
});
