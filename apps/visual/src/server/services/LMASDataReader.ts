import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export interface HandoffData {
  fromAgent: string;
  toAgent: string;
  storyId: string | null;
  storyPath: string | null;
  storyStatus: string | null;
  currentTask: string | null;
  decisions: string[];
  filesModified: string[];
  blockers: string[];
  nextAction: string | null;
  timestamp: number;
}

export interface StoryData {
  id: string;
  filePath: string;
  status: string;
  totalTasks: number;
  completedTasks: number;
  executor: string | null;
}

export interface AgentAction {
  timestamp: number;
  agentId: string;
  action: string;
}

export type AgentVisualState = 'working' | 'waiting' | 'blocked' | 'idle';

export interface AgentState {
  agentId: string;
  visualState: AgentVisualState;
  currentTask: string | null;
  currentStory: string | null;
  lastAction: string | null;
  lastActionTime: number | null;
}

const STATUS_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Reads LMAS filesystem data: handoffs, stories, logs.
 * Returns normalized AgentState[] for the Visual.
 */
export class LMASDataReader {
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  // ── Handoff Parsing ──

  readHandoffs(): HandoffData[] {
    const handoffDir = path.join(this.projectRoot, '.lmas', 'handoffs');
    if (!fs.existsSync(handoffDir)) return [];

    const files = fs.readdirSync(handoffDir)
      .filter(f => f.endsWith('.yaml') || f.endsWith('.yml'))
      .sort()
      .reverse(); // Most recent first

    const handoffs: HandoffData[] = [];
    for (const file of files) {
      const content = fs.readFileSync(path.join(handoffDir, file), 'utf8');
      const parsed = this.parseHandoff(content, file);
      if (parsed) handoffs.push(parsed);
    }
    return handoffs;
  }

  parseHandoff(content: string, filename: string): HandoffData | null {
    try {
      const data = yaml.load(content) as Record<string, unknown>;
      const handoff = (data?.handoff ?? data) as Record<string, unknown>;
      const storyContext = (handoff?.story_context ?? {}) as Record<string, unknown>;

      // Extract timestamp from filename (handoff-{from}-to-{to}-{timestamp}.yaml)
      const tsMatch = filename.match(/(\d+)\.ya?ml$/);
      const timestamp = tsMatch ? parseInt(tsMatch[1], 10) : Date.now();

      return {
        fromAgent: String(handoff.from_agent ?? ''),
        toAgent: String(handoff.to_agent ?? ''),
        storyId: storyContext.story_id ? String(storyContext.story_id) : null,
        storyPath: storyContext.story_path ? String(storyContext.story_path) : null,
        storyStatus: storyContext.story_status ? String(storyContext.story_status) : null,
        currentTask: storyContext.current_task ? String(storyContext.current_task) : null,
        decisions: Array.isArray(handoff.decisions) ? handoff.decisions.map(String) : [],
        filesModified: Array.isArray(handoff.files_modified) ? handoff.files_modified.map(String) : [],
        blockers: Array.isArray(handoff.blockers) ? handoff.blockers.map(String) : [],
        nextAction: handoff.next_action ? String(handoff.next_action) : null,
        timestamp,
      };
    } catch {
      return null;
    }
  }

  // ── Story Parsing ──

  readStories(): StoryData[] {
    const storiesDir = path.join(this.projectRoot, 'docs', 'stories', 'active');
    if (!fs.existsSync(storiesDir)) return [];

    const files = fs.readdirSync(storiesDir).filter(f => f.endsWith('.md'));
    const stories: StoryData[] = [];

    for (const file of files) {
      const content = fs.readFileSync(path.join(storiesDir, file), 'utf8');
      const parsed = this.parseStory(content, file);
      if (parsed) stories.push(parsed);
    }
    return stories;
  }

  parseStory(content: string, filename: string): StoryData | null {
    // Extract story ID from filename (e.g., 2.1.base-character-sprite-system.md → 2.1)
    const idMatch = filename.match(/^(\d+\.\d+)/);
    const id = idMatch ? idMatch[1] : filename.replace('.md', '');

    // Extract status
    const statusMatch = content.match(/\*\*(.+?)\*\*/);
    const status = statusMatch ? statusMatch[1] : 'Unknown';

    // Count checkboxes
    const totalTasks = (content.match(/- \[[ x]\]/g) ?? []).length;
    const completedTasks = (content.match(/- \[x\]/g) ?? []).length;

    // Extract executor
    const executorMatch = content.match(/executor:\s*"?(@\w+)"?/);
    const executor = executorMatch ? executorMatch[1] : null;

    return {
      id,
      filePath: filename,
      status,
      totalTasks,
      completedTasks,
      executor,
    };
  }

  // ── Log Parsing ──

  readLogs(maxLines: number = 100): AgentAction[] {
    const logPath = path.join(this.projectRoot, '.lmas', 'logs', 'agent.log');
    if (!fs.existsSync(logPath)) return [];

    const content = fs.readFileSync(logPath, 'utf8');
    const lines = content.trim().split('\n').slice(-maxLines);
    const actions: AgentAction[] = [];

    for (const line of lines) {
      const parsed = this.parseLogLine(line);
      if (parsed) actions.push(parsed);
    }
    return actions;
  }

  parseLogLine(line: string): AgentAction | null {
    // Format: [timestamp] @agentId action description
    const match = line.match(/\[(\d{4}-\d{2}-\d{2}T[\d:.]+Z?)\]\s*@(\w[\w-]*)\s+(.+)/);
    if (!match) return null;

    return {
      timestamp: new Date(match[1]).getTime(),
      agentId: match[2],
      action: match[3].trim(),
    };
  }

  // ── State Aggregation ──

  getAgentStates(): AgentState[] {
    const handoffs = this.readHandoffs();
    const stories = this.readStories();
    const logs = this.readLogs();
    const now = Date.now();

    const stateMap = new Map<string, AgentState>();

    // Initialize from handoffs
    for (const handoff of handoffs) {
      if (handoff.toAgent && !stateMap.has(handoff.toAgent)) {
        const hasBlockers = handoff.blockers.length > 0;
        const isRecent = (now - handoff.timestamp) < STATUS_TIMEOUT_MS;

        let visualState: AgentVisualState = 'idle';
        if (hasBlockers) visualState = 'blocked';
        else if (isRecent && handoff.currentTask) visualState = 'working';
        else if (isRecent) visualState = 'waiting';

        stateMap.set(handoff.toAgent, {
          agentId: handoff.toAgent,
          visualState,
          currentTask: handoff.currentTask,
          currentStory: handoff.storyId,
          lastAction: handoff.nextAction,
          lastActionTime: handoff.timestamp,
        });
      }
    }

    // Enrich from logs
    for (const action of logs) {
      const state = stateMap.get(action.agentId);
      if (state && (state.lastActionTime === null || action.timestamp > state.lastActionTime)) {
        state.lastAction = action.action;
        state.lastActionTime = action.timestamp;
      }
    }

    return Array.from(stateMap.values());
  }

  // ── Active Agent Detection ──

  detectActiveAgent(): string | null {
    const handoffs = this.readHandoffs();
    if (handoffs.length === 0) return null;
    return handoffs[0].toAgent || null;
  }
}
