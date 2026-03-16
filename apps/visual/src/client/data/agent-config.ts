import { AGENT_IDS } from '@/shared/agent-ids';

export interface AgentDisplayConfig {
  agentId: string;
  displayName: string;
  matrixName: string;
  spriteKey: string;
  wing: 'software-dev' | 'marketing' | 'central';
  role: string;
  alwaysSeated?: boolean;
  alpha?: number;
}

/**
 * Core 5 agents — first to receive custom sprites (Story 2.2).
 */
export const CORE_AGENTS: AgentDisplayConfig[] = [
  {
    agentId: AGENT_IDS.NEO,
    displayName: 'Neo',
    matrixName: 'The One',
    spriteKey: 'neo',
    wing: 'software-dev',
    role: 'Full Stack Developer',
  },
  {
    agentId: AGENT_IDS.ORACLE,
    displayName: 'Oracle',
    matrixName: 'The Oracle',
    spriteKey: 'oracle',
    wing: 'software-dev',
    role: 'Test Architect & Quality Advisor',
  },
  {
    agentId: AGENT_IDS.TRINITY,
    displayName: 'Trinity',
    matrixName: 'Trinity',
    spriteKey: 'trinity',
    wing: 'software-dev',
    role: 'Product Manager',
  },
  {
    agentId: AGENT_IDS.SMITH,
    displayName: 'Smith',
    matrixName: 'Agent Smith',
    spriteKey: 'smith',
    wing: 'central',
    role: 'Adversarial Verifier',
  },
  {
    agentId: AGENT_IDS.MORPHEUS,
    displayName: 'Morpheus',
    matrixName: 'Morpheus',
    spriteKey: 'morpheus',
    wing: 'central',
    role: 'Master Orchestrator',
  },
];

/**
 * Remaining 14 agents — full team (Story 2.3).
 */
export const REMAINING_AGENTS: AgentDisplayConfig[] = [
  // Software Dev Wing (7)
  {
    agentId: AGENT_IDS.ARCHITECT,
    displayName: 'Architect',
    matrixName: 'The Architect',
    spriteKey: 'architect',
    wing: 'software-dev',
    role: 'System Architect',
  },
  {
    agentId: AGENT_IDS.KEYMAKER,
    displayName: 'Keymaker',
    matrixName: 'The Keymaker',
    spriteKey: 'keymaker',
    wing: 'software-dev',
    role: 'Product Owner',
  },
  {
    agentId: AGENT_IDS.NIOBE,
    displayName: 'Niobe',
    matrixName: 'Niobe',
    spriteKey: 'niobe',
    wing: 'software-dev',
    role: 'Scrum Master',
  },
  {
    agentId: AGENT_IDS.LINK,
    displayName: 'Link',
    matrixName: 'Link',
    spriteKey: 'link',
    wing: 'software-dev',
    role: 'Business Analyst',
  },
  {
    agentId: AGENT_IDS.TANK,
    displayName: 'Tank',
    matrixName: 'Tank',
    spriteKey: 'tank',
    wing: 'software-dev',
    role: 'Data Engineer',
  },
  {
    agentId: AGENT_IDS.SATI,
    displayName: 'Sati',
    matrixName: 'Sati',
    spriteKey: 'sati',
    wing: 'software-dev',
    role: 'UX Design Expert',
  },
  {
    agentId: AGENT_IDS.OPERATOR,
    displayName: 'Operator',
    matrixName: 'The Operator',
    spriteKey: 'operator',
    wing: 'software-dev',
    role: 'DevOps Engineer',
    alwaysSeated: true,
  },
  // Marketing Wing (7)
  {
    agentId: AGENT_IDS.LOCK,
    displayName: 'Lock',
    matrixName: 'Commander Lock',
    spriteKey: 'lock',
    wing: 'marketing',
    role: 'Marketing Chief',
  },
  {
    agentId: AGENT_IDS.MOUSE,
    displayName: 'Mouse',
    matrixName: 'Mouse',
    spriteKey: 'mouse',
    wing: 'marketing',
    role: 'Copywriter',
  },
  {
    agentId: AGENT_IDS.SPARKS,
    displayName: 'Sparks',
    matrixName: 'Sparks',
    spriteKey: 'sparks',
    wing: 'marketing',
    role: 'Social Media Manager',
  },
  {
    agentId: AGENT_IDS.MEROVINGIAN,
    displayName: 'Merovingian',
    matrixName: 'The Merovingian',
    spriteKey: 'merovingian',
    wing: 'marketing',
    role: 'Traffic Manager',
  },
  {
    agentId: AGENT_IDS.PERSEPHONE,
    displayName: 'Persephone',
    matrixName: 'Persephone',
    spriteKey: 'persephone',
    wing: 'marketing',
    role: 'Content Strategist',
  },
  {
    agentId: AGENT_IDS.GHOST,
    displayName: 'Ghost',
    matrixName: 'Ghost',
    spriteKey: 'ghost',
    wing: 'marketing',
    role: 'Content Researcher',
    alpha: 0.6,
  },
  {
    agentId: AGENT_IDS.SERAPH,
    displayName: 'Seraph',
    matrixName: 'Seraph',
    spriteKey: 'seraph',
    wing: 'marketing',
    role: 'Content Reviewer',
  },
];

/** All 19 agents combined */
export const ALL_AGENTS: AgentDisplayConfig[] = [...CORE_AGENTS, ...REMAINING_AGENTS];

/** Quick lookup: agentId → display config */
export const AGENT_CONFIG_MAP: Record<string, AgentDisplayConfig> = {};
for (const agent of ALL_AGENTS) {
  AGENT_CONFIG_MAP[agent.agentId] = agent;
}

/** Backwards compat alias */
export const CORE_AGENT_MAP = AGENT_CONFIG_MAP;

/** Set of core agent IDs for quick membership check */
export const CORE_AGENT_IDS = new Set(CORE_AGENTS.map(a => a.agentId));
