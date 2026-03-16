export const AGENT_IDS = {
  // Software Dev Wing
  NEO: 'dev',
  ORACLE: 'qa',
  ARCHITECT: 'architect',
  TRINITY: 'pm',
  KEYMAKER: 'po',
  NIOBE: 'sm',
  LINK: 'analyst',
  TANK: 'data-engineer',
  SATI: 'ux-design-expert',
  OPERATOR: 'devops',
  // Marketing Wing
  LOCK: 'marketing-chief',
  MOUSE: 'copywriter',
  SPARKS: 'social-media-manager',
  MEROVINGIAN: 'traffic-manager',
  PERSEPHONE: 'content-strategist',
  GHOST: 'content-researcher',
  SERAPH: 'content-reviewer',
  // Central
  SMITH: 'smith',
  MORPHEUS: 'lmas-master',
} as const;

export type AgentId = typeof AGENT_IDS[keyof typeof AGENT_IDS];
