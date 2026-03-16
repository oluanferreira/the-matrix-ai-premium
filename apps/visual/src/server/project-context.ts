import { StateManager } from './services/StateManager';
import { GitPoller } from './watchers/GitPoller';
import { SSEBroadcaster } from './services/SSEBroadcaster';
import type { AgentState } from './services/LMASDataReader';
import type { GitCommit } from './services/GitReader';

export interface ProjectContext {
  defaultWorkspace: string;
  activeProjectPath: string | null;
  stateManager: StateManager | null;
  gitPoller: GitPoller | null;
  broadcaster: SSEBroadcaster | null;
  selectProject: (projectPath: string) => void;
}

/**
 * Creates a mutable project context that can switch between LMAS projects at runtime.
 * The StateManager, FileWatcher, and GitPoller are re-initialized when switching projects.
 */
export function createProjectContext(defaultWorkspace: string): ProjectContext {
  const context: ProjectContext = {
    defaultWorkspace,
    activeProjectPath: null,
    stateManager: null,
    gitPoller: null,
    broadcaster: null,
    selectProject: () => {},
  };

  context.selectProject = (projectPath: string) => {
    // Stop existing services
    if (context.stateManager) {
      context.stateManager.stop();
    }
    if (context.gitPoller) {
      context.gitPoller.stop();
    }

    // Create new services scoped to selected project
    context.activeProjectPath = projectPath;
    context.stateManager = new StateManager(projectPath);
    context.gitPoller = new GitPoller(projectPath);

    // Wire up broadcasting if broadcaster is set
    if (context.broadcaster) {
      const broadcaster = context.broadcaster;

      context.stateManager.on('stateUpdate', (states: AgentState[]) => {
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

      context.gitPoller.on('newCommit', (commit: GitCommit) => {
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
    }

    // Start services
    context.stateManager.start();
    context.gitPoller.start();

    console.log(`[Matrix Visual] Project selected: ${projectPath}`);
  };

  return context;
}
