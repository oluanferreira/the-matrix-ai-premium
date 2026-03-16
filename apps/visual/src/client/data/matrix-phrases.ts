/**
 * In-character phrases for Agent Smith during patrol and inspection.
 */

export const SMITH_PATROL_PHRASES: string[] = [
  'Hmm... interessante.',
  'Eu estava esperando isso.',
  'Vamos ver o que temos aqui.',
  'O inevitável, Sr. Anderson.',
  'Propósito... é o que nos guia.',
  'Eu preciso sair daqui.',
  'Você ouve isso, Sr. Anderson? Esse é o som da inevitabilidade.',
  'Eu odeio esse lugar. Esse zoológico.',
];

export const SMITH_INSPECT_PHRASES: string[] = [
  'Deixe-me verificar...',
  'Hora da inspeção.',
  'Vamos ver se está de acordo...',
  'Eu tenho olhos em toda parte.',
  'Nenhum código escapa de mim.',
];

export const SMITH_VERDICT_PHRASES: Record<string, string[]> = {
  CLEAN: [
    'Aceitável. Desta vez.',
    'Limpo. Continue assim.',
    'Sem anomalias detectadas.',
  ],
  CONTAINED: [
    'Alguns problemas menores. Contidos.',
    'Quase aceitável. Quase.',
    'Você passou. Por pouco.',
  ],
  INFECTED: [
    'Infectado. Isso precisa ser corrigido.',
    'Inaceitável. Corrija imediatamente.',
    'Eu sabia que haveria problemas.',
  ],
  COMPROMISED: [
    'Comprometido. Completamente inaceitável.',
    'Isso é uma afronta ao sistema.',
    'Reescreva. Do zero.',
  ],
};

export type SmithVerdictLevel = 'CLEAN' | 'CONTAINED' | 'INFECTED' | 'COMPROMISED';

export const VERDICT_COLORS: Record<SmithVerdictLevel, string> = {
  CLEAN: '#00FF41',
  CONTAINED: '#FFD700',
  INFECTED: '#FFA500',
  COMPROMISED: '#FF0000',
};
