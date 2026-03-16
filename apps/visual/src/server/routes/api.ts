import { Router } from 'express';
import { AGENT_IDS } from '../../shared/agent-ids';
import type { ProjectContext } from '../project-context';
import type { ProjectDiscovery } from '../services/ProjectDiscovery';

export function createAPIRouter(
  projectContext: ProjectContext,
  projectDiscovery: ProjectDiscovery,
): Router {
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
      activeProject: projectContext.activeProjectPath,
    });
  });

  /**
   * GET /api/projects — Discover LMAS projects (AC: 3)
   */
  router.get('/projects', (_req, res) => {
    try {
      const projects = projectDiscovery.discoverProjects();
      res.json({ projects, count: projects.length });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Matrix Visual] Failed to discover projects: ${message}`);
      res.status(500).json({ error: `Failed to discover projects: ${message}` });
    }
  });

  /**
   * POST /api/project/select — Select active project (AC: 8)
   */
  router.post('/project/select', (req, res) => {
    try {
      const { projectPath } = req.body as { projectPath?: string };

      if (!projectPath || typeof projectPath !== 'string') {
        res.status(400).json({ error: 'projectPath is required and must be a string' });
        return;
      }

      // Validate project path (security: prevents traversal, checks LMAS markers)
      if (!projectDiscovery.validateProjectPath(projectPath)) {
        res.status(400).json({ error: 'Invalid project path: not a valid LMAS project directory' });
        return;
      }

      // Get project info before selecting
      const project = projectDiscovery.getProjectInfo(projectPath);
      if (!project) {
        res.status(400).json({ error: 'Failed to read project information' });
        return;
      }

      // Switch project context (reinitializes StateManager, FileWatcher, GitPoller)
      projectContext.selectProject(projectPath);

      res.json({ success: true, project });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Matrix Visual] Failed to select project: ${message}`);
      res.status(500).json({ error: `Failed to select project: ${message}` });
    }
  });

  /**
   * GET /api/dashboard — Aggregated data for Morpheus Room command center (Story 4.4)
   */
  router.get('/dashboard', (_req, res) => {
    try {
      const stateManager = projectContext.stateManager;
      const states = stateManager ? stateManager.getStates() : [];

      const working = states.filter(s => s.visualState === 'working').length;
      const idle = states.filter(s => s.visualState === 'idle').length;
      const blocked = states.filter(s => s.visualState === 'blocked').length;
      const waiting = states.filter(s => s.visualState === 'waiting').length;

      // Get active project info
      const activeProject = projectContext.activeProjectPath
        ? projectDiscovery.getProjectInfo(projectContext.activeProjectPath)
        : null;

      res.json({
        agents: {
          states,
          health: { working, idle, blocked, waiting, total: states.length },
        },
        project: activeProject,
        activeAgent: stateManager?.getActiveAgent() ?? null,
        timestamp: Date.now(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Matrix Visual] Failed to get dashboard data: ${message}`);
      res.status(500).json({ error: `Failed to get dashboard data: ${message}` });
    }
  });

  /**
   * GET /api/project/active — Get currently active project
   */
  router.get('/project/active', (_req, res) => {
    if (!projectContext.activeProjectPath) {
      res.json({ active: false, project: null });
      return;
    }

    const project = projectDiscovery.getProjectInfo(projectContext.activeProjectPath);
    res.json({ active: true, project });
  });

  return router;
}
