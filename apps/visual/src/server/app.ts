import express from 'express';
import path from 'path';
import { SSEBroadcaster } from './services/SSEBroadcaster';
import { createSSERouter } from './routes/sse';
import { createAPIRouter } from './routes/api';
import { ProjectDiscovery } from './services/ProjectDiscovery';
import type { ProjectContext } from './project-context';

export function createApp(projectContext: ProjectContext) {
  const app = express();
  const broadcaster = new SSEBroadcaster();
  const projectDiscovery = new ProjectDiscovery(projectContext.defaultWorkspace);

  // JSON body parsing
  app.use(express.json());

  // Security headers (AC: 8 — manual, zero deps, ADR-6)
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // CORS (AC: 7 — only localhost:3000 in dev)
  app.use((req, res, next) => {
    const allowedOrigins = ['http://localhost:3000'];
    const origin = req.headers.origin;

    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    next();
  });

  // API routes
  app.use('/api', createAPIRouter(projectContext, projectDiscovery));
  app.use('/api', createSSERouter(broadcaster));

  // Serve static files (production)
  const clientDir = path.join(__dirname, '../../dist/client');
  app.use(express.static(clientDir));

  // SPA fallback
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDir, 'index.html'));
  });

  return { app, broadcaster };
}
