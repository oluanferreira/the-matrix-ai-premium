import { Router } from 'express';
import type { SSEBroadcaster } from '../services/SSEBroadcaster';

export function createSSERouter(broadcaster: SSEBroadcaster): Router {
  const router = Router();

  router.get('/events/stream', (req, res) => {
    const clientId = broadcaster.addClient(res);

    if (clientId === null) {
      res.status(503).json({ error: 'Too many SSE connections' });
      return;
    }

    req.on('close', () => {
      broadcaster.removeClient(clientId);
    });
  });

  return router;
}
