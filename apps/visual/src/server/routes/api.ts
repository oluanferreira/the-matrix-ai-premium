import { Router } from 'express';
import { AGENT_IDS } from '../../shared/agent-ids';

export function createAPIRouter(): Router {
  const router = Router();

  router.get('/agents', (_req, res) => {
    const agents = Object.entries(AGENT_IDS).map(([key, id]) => ({
      key,
      id,
      status: 'idle',
    }));
    res.json({ agents, count: agents.length });
  });

  router.get('/status', (_req, res) => {
    res.json({
      status: 'running',
      uptime: process.uptime(),
      timestamp: Date.now(),
    });
  });

  return router;
}
