import { createApp } from './app';

const PORT = process.env.PORT ?? 3001;

const { app, broadcaster } = createApp();

broadcaster.startHeartbeat();
broadcaster.startMockEvents();

const server = app.listen(PORT, () => {
  console.log(`[Matrix Visual] Server running on http://localhost:${PORT}`);
  console.log(`[Matrix Visual] SSE endpoint: http://localhost:${PORT}/api/events/stream`);
});

process.on('SIGTERM', () => {
  console.log('[Matrix Visual] Shutting down...');
  broadcaster.shutdown();
  server.close();
});

process.on('SIGINT', () => {
  console.log('[Matrix Visual] Shutting down...');
  broadcaster.shutdown();
  server.close();
});
