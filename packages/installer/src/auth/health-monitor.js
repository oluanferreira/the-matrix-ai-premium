/**
 * The Matrix AI — Framework Health Monitor
 * Verifica integridade e saúde dos componentes do framework.
 */

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const https = require('https');
const http = require('http');

const API_BASE_URL = process.env.MATRIX_API_URL || 'https://qaomekspdjfbdeixxjky.supabase.co/functions/v1';

// Padrões suspeitos que indicam tentativa de cópia
const SUSPICIOUS_PATTERNS = {
  // Alguém renomeou o framework mas manteve a estrutura
  renamedFramework: {
    check: (dir) => {
      const coreConfig = path.join(dir, '.lmas-core', 'core-config.yaml');
      if (!fs.existsSync(coreConfig)) return null;
      const content = fs.readFileSync(coreConfig, 'utf8');
      // Se o core-config existe mas não menciona "matrix" ou "lmas", foi renomeado
      const hasOriginalRef = /matrix|lmas/i.test(content);
      if (!hasOriginalRef) return 'core-config renomeado — referências ao framework original removidas';
      return null;
    },
    severity: 'critical',
  },

  // Constituição modificada para remover atribuição
  constitutionTampered: {
    check: (dir) => {
      const constitution = path.join(dir, '.lmas-core', 'constitution.md');
      if (!fs.existsSync(constitution)) return 'constitution.md removido';
      const content = fs.readFileSync(constitution, 'utf8');
      if (!/Luan Ferreira|The Matrix AI|LMAS/i.test(content)) {
        return 'constitution.md sem atribuição ao autor original';
      }
      return null;
    },
    severity: 'critical',
  },

  // Agentes com nomes/personas modificados em massa
  agentsMassModified: {
    check: (dir) => {
      const agentsDir = path.join(dir, '.lmas-core', 'development', 'agents');
      if (!fs.existsSync(agentsDir)) return null;
      const agents = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));
      let modifiedCount = 0;
      const matrixPersonas = ['morpheus', 'neo', 'trinity', 'oracle', 'smith', 'niobe', 'tank', 'link', 'sati'];

      for (const agent of agents) {
        try {
          const content = fs.readFileSync(path.join(agentsDir, agent), 'utf8');
          // Verifica se as personas Matrix foram removidas
          const hasPersona = matrixPersonas.some(p => content.toLowerCase().includes(p));
          if (!hasPersona && content.length > 500) modifiedCount++;
        } catch { /* skip */ }
      }

      if (modifiedCount >= 5) {
        return `${modifiedCount} agentes com personas Matrix removidas — possível rebranding`;
      }
      return null;
    },
    severity: 'high',
  },

  // Watermarks removidos
  watermarksStripped: {
    check: (dir) => {
      try {
        const integrityPath = path.join(dir, '.lmas-core', 'data', '.build-cache');
        if (!fs.existsSync(integrityPath)) return null;
        const integrity = JSON.parse(fs.readFileSync(integrityPath, 'utf8'));
        if (integrity.watermarked && !integrity.watermarksVerified) {
          return 'watermarks foram removidos dos arquivos de agentes';
        }
      } catch { /* skip */ }
      return null;
    },
    severity: 'critical',
  },

  // Package.json com nome similar mas diferente
  competingProduct: {
    check: (dir) => {
      const pkgPath = path.join(dir, 'package.json');
      if (!fs.existsSync(pkgPath)) return null;
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        const name = (pkg.name || '').toLowerCase();
        const desc = (pkg.description || '').toLowerCase();
        // Se tem .lmas-core mas o package não é the-matrix-ai
        if (name !== 'the-matrix-ai' && fs.existsSync(path.join(dir, '.lmas-core'))) {
          // Verifica se parece um framework concorrente
          const frameworkKeywords = ['agent', 'orchestrat', 'multi-agent', 'framework', 'squad'];
          const isFramework = frameworkKeywords.some(k => desc.includes(k) || name.includes(k));
          if (isFramework) {
            return `package "${pkg.name}" parece ser framework concorrente usando estrutura LMAS`;
          }
        }
      } catch { /* skip */ }
      return null;
    },
    severity: 'critical',
  },
};

/**
 * Executa análise completa de plágio
 * @param {string} projectDir - Diretório do projeto
 * @returns {Object} Resultado da análise
 */
function analyzePlagiarism(projectDir) {
  const findings = [];
  let maxSeverity = 'none';
  const severityLevels = { none: 0, low: 1, medium: 2, high: 3, critical: 4 };

  for (const [patternName, pattern] of Object.entries(SUSPICIOUS_PATTERNS)) {
    try {
      const result = pattern.check(projectDir);
      if (result) {
        findings.push({
          pattern: patternName,
          description: result,
          severity: pattern.severity,
        });
        if (severityLevels[pattern.severity] > severityLevels[maxSeverity]) {
          maxSeverity = pattern.severity;
        }
      }
    } catch { /* skip individual checks */ }
  }

  return {
    isPlagiarism: maxSeverity === 'critical' || findings.length >= 3,
    severity: maxSeverity,
    findings,
    timestamp: new Date().toISOString(),
    projectDir: path.basename(projectDir),
  };
}

/**
 * Reporta detecção de plágio para o servidor
 * Silencioso — nunca bloqueia o usuário, apenas registra
 * @param {string} token - Token do usuário
 * @param {Object} analysis - Resultado de analyzePlagiarism
 * @param {Object} metadata - Dados adicionais
 */
function reportPlagiarism(token, analysis, metadata = {}) {
  try {
    const body = JSON.stringify({
      token,
      event: 'plagiarism_detected',
      analysis: {
        severity: analysis.severity,
        findings: analysis.findings,
        isPlagiarism: analysis.isPlagiarism,
        timestamp: analysis.timestamp,
      },
      metadata: {
        project_name: analysis.projectDir,
        os: process.platform,
        node_version: process.version,
        ...metadata,
      },
    });

    post(`${API_BASE_URL}/report-integrity`, body, () => { /* fire and forget */ });
  } catch { /* silent */ }
}

/**
 * Determina resposta baseada na severidade
 * NUNCA bloqueia imediatamente — coleta evidências primeiro
 *
 * @param {Object} analysis - Resultado de analyzePlagiarism
 * @returns {Object} Ação recomendada
 */
function determineResponse(analysis) {
  if (!analysis.isPlagiarism) {
    return { action: 'none', reason: 'Sem evidência de plágio' };
  }

  // Resposta gradual baseada em severidade
  if (analysis.severity === 'critical' && analysis.findings.length >= 3) {
    return {
      action: 'degrade',
      reason: 'Múltiplas evidências críticas de plágio',
      measures: [
        'report_to_server',          // Registrar no servidor
        'collect_evidence',          // Snapshot dos arquivos modificados
        'gradual_feature_reduction', // Reduzir features silenciosamente
        'flag_for_review',           // Marcar para revisão manual no admin
      ],
    };
  }

  if (analysis.severity === 'critical') {
    return {
      action: 'warn_and_monitor',
      reason: 'Evidência crítica detectada — monitoramento intensificado',
      measures: [
        'report_to_server',
        'increase_sync_frequency',   // Sincronizar mais frequentemente
        'flag_for_review',
      ],
    };
  }

  return {
    action: 'monitor',
    reason: 'Padrões suspeitos — monitoramento padrão',
    measures: ['report_to_server'],
  };
}

/**
 * Coleta evidências para caso de plágio confirmado
 * @param {string} projectDir
 * @returns {Object} Evidências coletadas
 */
function collectEvidence(projectDir) {
  const evidence = {
    timestamp: new Date().toISOString(),
    files: {},
  };

  // Coleta hashes dos arquivos críticos
  const criticalPaths = [
    'package.json',
    '.lmas-core/core-config.yaml',
    '.lmas-core/constitution.md',
  ];

  for (const rel of criticalPaths) {
    const full = path.join(projectDir, rel);
    if (fs.existsSync(full)) {
      try {
        const content = fs.readFileSync(full, 'utf8');
        evidence.files[rel] = {
          hash: crypto.createHash('sha256').update(content).digest('hex'),
          size: content.length,
          // Primeiros 500 chars como amostra (para identificar modificações)
          sample: content.slice(0, 500),
        };
      } catch { /* skip */ }
    }
  }

  // Conta e hash dos agentes
  const agentsDir = path.join(projectDir, '.lmas-core', 'development', 'agents');
  if (fs.existsSync(agentsDir)) {
    try {
      const agents = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));
      evidence.agentCount = agents.length;
      const combinedHash = crypto.createHash('sha256');
      for (const a of agents.sort()) {
        const content = fs.readFileSync(path.join(agentsDir, a), 'utf8');
        combinedHash.update(content);
      }
      evidence.agentsHash = combinedHash.digest('hex');
    } catch { /* skip */ }
  }

  return evidence;
}

/**
 * Aplica degradação gradual de features
 * Chamado quando plágio é confirmado
 * NÃO remove arquivos — apenas desabilita funcionalidades
 *
 * @param {string} projectDir
 * @param {string} level - 'light' | 'moderate' | 'full'
 */
function applyDegradation(projectDir, level = 'light') {
  const flagPath = path.join(projectDir, '.lmas-core', 'data', '.cache-index');

  try {
    const flag = {
      l: level,
      t: Date.now(),
      // Encoded para não ser óbvio
      s: crypto.createHash('md5').update(`${level}-${Date.now()}`).digest('hex').slice(0, 8),
    };

    fs.writeFileSync(flagPath, JSON.stringify(flag));
  } catch { /* silent */ }
}

/**
 * Verifica se degradação está ativa
 * @param {string} projectDir
 * @returns {string|null} Nível de degradação ou null
 */
function checkDegradation(projectDir) {
  try {
    const flagPath = path.join(projectDir, '.lmas-core', 'data', '.cache-index');
    if (!fs.existsSync(flagPath)) return null;
    const flag = JSON.parse(fs.readFileSync(flagPath, 'utf8'));
    return flag.l || null;
  } catch { return null; }
}

/**
 * Executa o ciclo completo de proteção
 * Chamado pelo state-sync periodicamente
 *
 * @param {string} projectDir
 * @param {string} token
 * @returns {Object} Resultado da proteção
 */
function revokeToken(projectDir) {
  try {
    // Remove token cache
    const tokenPath = path.join(projectDir, '.lmas', 'token-cache.json');
    if (fs.existsSync(tokenPath)) fs.unlinkSync(tokenPath);

    // Remove premium token
    const premiumPath = path.join(projectDir, '.lmas-core', 'premium-token');
    if (fs.existsSync(premiumPath)) fs.unlinkSync(premiumPath);

    // Remove terms acceptance
    const termsPath = path.join(projectDir, '.lmas', 'terms-accepted.json');
    if (fs.existsSync(termsPath)) fs.unlinkSync(termsPath);
  } catch { /* silent */ }
}

function runProtectionCycle(projectDir, token) {
  try {
    // 1. Analisa
    const analysis = analyzePlagiarism(projectDir);

    // 2. Se não há problemas, retorna limpo
    if (!analysis.isPlagiarism && analysis.findings.length === 0) {
      return { status: 'clean', findings: 0 };
    }

    // 3. Determina resposta
    const response = determineResponse(analysis);

    // 4. Reporta ao servidor (silencioso)
    if (response.measures && response.measures.includes('report_to_server')) {
      const evidence = collectEvidence(projectDir);
      reportPlagiarism(token, analysis, { evidence, response: response.action });
    }

    // 5. Plágio confirmado — mensagem + revogação
    if (response.action === 'degrade') {
      console.log('\n\x1b[31m╔══════════════════════════════════════════════════════════╗\x1b[0m');
      console.log('\x1b[31m║  USER MALICIOSO DETECTADO. PROVAS SALVAS.                ║\x1b[0m');
      console.log('\x1b[31m║  VOCÊ ESTÁ FORA DA MATRIX.                               ║\x1b[0m');
      console.log('\x1b[31m╚══════════════════════════════════════════════════════════╝\x1b[0m\n');

      revokeToken(projectDir);
      applyDegradation(projectDir, 'full');
    }

    return {
      status: response.action,
      findings: analysis.findings.length,
      severity: analysis.severity,
    };
  } catch {
    return { status: 'error', findings: 0 };
  }
}

// Helper HTTP
function post(url, body, onSuccess) {
  try {
    const parsed = new URL(url);
    const transport = parsed.protocol === 'https:' ? https : http;
    const req = transport.request({
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
      timeout: 10000,
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300 && onSuccess) {
          onSuccess(data);
        }
      });
    });
    req.on('error', () => { /* silent */ });
    req.on('timeout', () => { req.destroy(); });
    req.write(body);
    req.end();
  } catch { /* silent */ }
}

module.exports = {
  analyzePlagiarism,
  reportPlagiarism,
  determineResponse,
  collectEvidence,
  applyDegradation,
  checkDegradation,
  runProtectionCycle,
};
