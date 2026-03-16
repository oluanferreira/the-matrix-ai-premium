import path from 'path';
import { fileURLToPath } from 'url';
import { createApp } from './app';
import { createProjectContext } from './project-context';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT ?? 3001;
const DEFAULT_WORKSPACE = path.resolve(__dirname, '../../../..');

console.log(`[Matrix Visual] Workspace: ${DEFAULT_WORKSPACE}`);
console.log(`[Matrix Visual] CWD: ${process.cwd()}`);

const projectContext = createProjectContext(DEFAULT_WORKSPACE);
const { app, broadcaster } = createApp(projectContext);

// Wire broadcaster to project context for SSE events
projectContext.broadcaster = broadcaster;

broadcaster.startHeartbeat();

// Fallback: keep mock events for demo mode (until a project is selected)
broadcaster.startMockEvents();

const server = app.listen(PORT, () => {
  console.log(`[Matrix Visual] Server running on http://localhost:${PORT}`);
  console.log(`[Matrix Visual] SSE endpoint: http://localhost:${PORT}/api/events/stream`);
  console.log(`[Matrix Visual] Awaiting project selection from client...`);
});

process.on('SIGTERM', () => {
  console.log('[Matrix Visual] Shutting down...');
  if (projectContext.stateManager) projectContext.stateManager.stop();
  if (projectContext.gitPoller) projectContext.gitPoller.stop();
  broadcaster.shutdown();
  server.close();
});

process.on('SIGINT', () => {
  console.log('[Matrix Visual] Shutting down...');
  if (projectContext.stateManager) projectContext.stateManager.stop();
  if (projectContext.gitPoller) projectContext.gitPoller.stop();
  broadcaster.shutdown();
  server.close();
});
