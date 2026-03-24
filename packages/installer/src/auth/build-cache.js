/**
 * The Matrix AI — Integrity Guard
 * Sistema de watermark e integridade de conteúdo para proteção anti-pirataria.
 *
 * Funções principais:
 * - Watermark invisível via caracteres zero-width (codifica tokenId + installId)
 * - Hash SHA256 de arquivos críticos para detecção de adulteração
 * - Telemetria anti-plágio com detecção de padrões suspeitos
 *
 * @module src/auth/integrity-guard
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ─── Caracteres zero-width usados para codificação ─────────────────────────
// Cada caractere representa 2 bits, permitindo codificar dados binários
// de forma invisível dentro de texto Markdown.
const ZW_CHARS = [
  '\u200B', // ZERO WIDTH SPACE        → bits 00
  '\u200C', // ZERO WIDTH NON-JOINER   → bits 01
  '\u200D', // ZERO WIDTH JOINER       → bits 10
  '\uFEFF', // ZERO WIDTH NO-BREAK SP  → bits 11
];

// Delimitadores para início e fim do bloco de watermark
const WM_START = '\u200B\u200D\u200B\u200D'; // padrão único de início
const WM_SEP = '\u200C\u200C';               // separador entre tokenId e installId
const WM_END = '\u200D\u200B\u200D\u200B';   // padrão único de fim

// Arquivos críticos para hash de integridade (relativos ao installDir)
const CRITICAL_FILES = [
  '.lmas-core/core-config.yaml',
  '.lmas-core/constitution.md',
];

// Diretório dos agentes (relativo ao installDir)
const AGENTS_DIR = '.lmas-core/development/agents';

// ─── Funções internas de codificação ────────────────────────────────────────

/**
 * Codifica uma string em caracteres zero-width.
 * Cada caractere da string original é convertido para seu código ASCII,
 * e cada byte é representado por 4 caracteres zero-width (2 bits cada).
 *
 * @param {string} text - Texto a codificar
 * @returns {string} Sequência de caracteres zero-width
 */
function encodeToZeroWidth(text) {
  let encoded = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    // Codifica byte em 4 pares de 2 bits (suporta até 255)
    encoded += ZW_CHARS[(charCode >> 6) & 0x03];
    encoded += ZW_CHARS[(charCode >> 4) & 0x03];
    encoded += ZW_CHARS[(charCode >> 2) & 0x03];
    encoded += ZW_CHARS[charCode & 0x03];
  }
  return encoded;
}

/**
 * Decodifica caracteres zero-width de volta para string legível.
 *
 * @param {string} zwText - Sequência de caracteres zero-width
 * @returns {string} Texto original decodificado
 */
function decodeFromZeroWidth(zwText) {
  let decoded = '';
  // Cada caractere original ocupa 4 caracteres zero-width
  for (let i = 0; i + 3 < zwText.length; i += 4) {
    const b3 = ZW_CHARS.indexOf(zwText[i]);
    const b2 = ZW_CHARS.indexOf(zwText[i + 1]);
    const b1 = ZW_CHARS.indexOf(zwText[i + 2]);
    const b0 = ZW_CHARS.indexOf(zwText[i + 3]);

    // Se qualquer caractere não for reconhecido, interrompe
    if (b3 < 0 || b2 < 0 || b1 < 0 || b0 < 0) return decoded;

    const charCode = (b3 << 6) | (b2 << 4) | (b1 << 2) | b0;
    decoded += String.fromCharCode(charCode);
  }
  return decoded;
}

/**
 * Lista todos os arquivos .md no diretório de agentes.
 * Retorna apenas arquivos (não diretórios).
 *
 * @param {string} installDir - Diretório raiz da instalação
 * @returns {string[]} Caminhos absolutos dos arquivos de agentes
 */
function listAgentFiles(installDir) {
  const agentsPath = path.join(installDir, AGENTS_DIR);
  try {
    if (!fs.existsSync(agentsPath)) return [];
    const entries = fs.readdirSync(agentsPath);
    return entries
      .filter((entry) => entry.endsWith('.md'))
      .map((entry) => path.join(agentsPath, entry))
      .filter((fullPath) => {
        try {
          return fs.statSync(fullPath).isFile();
        } catch {
          return false;
        }
      });
  } catch {
    return [];
  }
}

/**
 * Normaliza line endings para LF antes de calcular hashes.
 * Garante consistência entre Windows (CRLF) e Unix (LF).
 *
 * @param {string} content - Conteúdo do arquivo
 * @returns {string} Conteúdo normalizado
 */
function normalizeLineEndings(content) {
  return content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/**
 * Calcula hash SHA256 de um arquivo com normalização de line endings.
 *
 * @param {string} filePath - Caminho absoluto do arquivo
 * @returns {string|null} Hash hex ou null se arquivo não existir
 */
function hashSingleFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf8');
    const normalized = normalizeLineEndings(content);
    return crypto.createHash('sha256').update(normalized, 'utf8').digest('hex');
  } catch {
    return null;
  }
}

// ─── Funções exportadas ─────────────────────────────────────────────────────

/**
 * Gera um watermark invisível contendo tokenId e installId.
 * O watermark usa caracteres zero-width que não aparecem visualmente
 * em editores de texto ou renderizadores Markdown.
 *
 * @param {string} tokenId - ID do token premium (ex: "MTX-ABCD-1234-EFGH-5678")
 * @param {string} installId - ID único da instalação (ex: UUID)
 * @returns {string} String que parece vazia mas contém dados codificados
 */
function generateWatermark(tokenId, installId) {
  if (!tokenId || !installId) {
    throw new Error('tokenId e installId são obrigatórios para gerar watermark');
  }

  const encodedToken = encodeToZeroWidth(tokenId);
  const encodedInstall = encodeToZeroWidth(installId);

  // Formato: START + tokenId_codificado + SEP + installId_codificado + END
  return WM_START + encodedToken + WM_SEP + encodedInstall + WM_END;
}

/**
 * Extrai tokenId e installId de um texto que contém watermark.
 * Procura pelos delimitadores de início/fim e decodifica o conteúdo.
 *
 * @param {string} text - Texto potencialmente watermarked
 * @returns {{ tokenId: string, installId: string } | null} Dados extraídos ou null
 */
function extractWatermark(text) {
  if (!text || typeof text !== 'string') return null;

  try {
    // Localiza o bloco de watermark pelos delimitadores
    const startIdx = text.indexOf(WM_START);
    if (startIdx < 0) return null;

    const endIdx = text.indexOf(WM_END, startIdx + WM_START.length);
    if (endIdx < 0) return null;

    // Extrai o payload entre START e END
    const payload = text.slice(startIdx + WM_START.length, endIdx);

    // Divide pelo separador para obter tokenId e installId
    const sepIdx = payload.indexOf(WM_SEP);
    if (sepIdx < 0) return null;

    const encodedToken = payload.slice(0, sepIdx);
    const encodedInstall = payload.slice(sepIdx + WM_SEP.length);

    const tokenId = decodeFromZeroWidth(encodedToken);
    const installId = decodeFromZeroWidth(encodedInstall);

    // Valida que a decodificação produziu algo legível
    if (!tokenId || !installId) return null;

    return { tokenId, installId };
  } catch {
    return null;
  }
}

/**
 * Aplica watermarks em todos os arquivos de agentes (.md) no diretório.
 * Insere o watermark no final de cada arquivo como caracteres invisíveis.
 * Se o arquivo já tiver um watermark, ele é substituído.
 *
 * @param {string} installDir - Diretório raiz da instalação
 * @param {string} tokenId - ID do token premium
 * @param {string} installId - ID da instalação
 * @returns {number} Quantidade de arquivos watermarked
 */
function applyWatermarks(installDir, tokenId, installId) {
  if (!installDir || !tokenId || !installId) {
    throw new Error('installDir, tokenId e installId são obrigatórios');
  }

  const watermark = generateWatermark(tokenId, installId);
  const agentFiles = listAgentFiles(installDir);
  let count = 0;

  for (const filePath of agentFiles) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');

      // Remove watermark existente (se houver) para evitar duplicação
      const existingStart = content.indexOf(WM_START);
      if (existingStart >= 0) {
        const existingEnd = content.indexOf(WM_END, existingStart);
        if (existingEnd >= 0) {
          content = content.slice(0, existingStart) +
            content.slice(existingEnd + WM_END.length);
        }
      }

      // Remove trailing whitespace/newlines para inserção limpa
      content = content.replace(/\s+$/, '');

      // Adiciona newline final + watermark
      const watermarked = content + '\n' + watermark + '\n';
      fs.writeFileSync(filePath, watermarked, 'utf8');
      count++;
    } catch {
      // Silenciosamente pula arquivos que não podem ser lidos/escritos
      // (permissões, locks, etc.)
    }
  }

  return count;
}

/**
 * Gera hash SHA256 combinado de todos os arquivos críticos do framework.
 * Inclui core-config.yaml, constitution.md e todos os arquivos de agentes.
 * Usado para detectar adulteração do conteúdo.
 *
 * @param {string} installDir - Diretório raiz da instalação
 * @returns {{ hash: string, fileCount: number, timestamp: string }}
 */
function generateContentHash(installDir) {
  if (!installDir) {
    throw new Error('installDir é obrigatório');
  }

  const hasher = crypto.createHash('sha256');
  let fileCount = 0;

  // Hash dos arquivos críticos individuais (core-config, constitution)
  for (const relPath of CRITICAL_FILES) {
    const absPath = path.join(installDir, relPath);
    try {
      if (fs.existsSync(absPath)) {
        const content = fs.readFileSync(absPath, 'utf8');
        const normalized = normalizeLineEndings(content);
        // Inclui o caminho relativo no hash para detectar renomeações
        hasher.update(relPath + ':' + normalized);
        fileCount++;
      }
    } catch {
      // Arquivo inacessível — continua com os demais
    }
  }

  // Hash de todos os arquivos de agentes (ordenados para consistência)
  const agentFiles = listAgentFiles(installDir).sort();
  for (const absPath of agentFiles) {
    try {
      const content = fs.readFileSync(absPath, 'utf8');
      const normalized = normalizeLineEndings(content);
      const relPath = path.relative(installDir, absPath).replace(/\\/g, '/');
      hasher.update(relPath + ':' + normalized);
      fileCount++;
    } catch {
      // Arquivo inacessível — continua com os demais
    }
  }

  return {
    hash: hasher.digest('hex'),
    fileCount,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Verifica a integridade dos arquivos comparando o hash atual com o esperado.
 * Identifica quais arquivos específicos foram modificados.
 *
 * @param {string} installDir - Diretório raiz da instalação
 * @param {string} expectedHash - Hash esperado (gerado previamente)
 * @returns {{ valid: boolean, currentHash: string, expectedHash: string, modifiedFiles: string[] }}
 */
function verifyIntegrity(installDir, expectedHash) {
  if (!installDir || !expectedHash) {
    throw new Error('installDir e expectedHash são obrigatórios');
  }

  const current = generateContentHash(installDir);
  const valid = current.hash === expectedHash;
  const modifiedFiles = [];

  // Se o hash geral não bate, identifica quais arquivos mudaram
  if (!valid) {
    // Verifica arquivos críticos individuais
    for (const relPath of CRITICAL_FILES) {
      const absPath = path.join(installDir, relPath);
      const fileHash = hashSingleFile(absPath);
      if (fileHash === null) {
        // Arquivo removido ou inacessível
        modifiedFiles.push(relPath + ' (removido ou inacessível)');
      }
    }

    // Verifica cada arquivo de agente individualmente
    // Nota: não temos hashes individuais armazenados, então listamos todos
    // os que existem para ajudar na investigação
    const agentFiles = listAgentFiles(installDir);
    for (const absPath of agentFiles) {
      try {
        const content = fs.readFileSync(absPath, 'utf8');
        const relPath = path.relative(installDir, absPath).replace(/\\/g, '/');

        // Heurística: se o arquivo não tem watermark, provavelmente foi modificado
        const hasWatermark = content.indexOf(WM_START) >= 0;
        if (!hasWatermark) {
          modifiedFiles.push(relPath);
        }
      } catch {
        const relPath = path.relative(installDir, absPath).replace(/\\/g, '/');
        modifiedFiles.push(relPath + ' (erro de leitura)');
      }
    }
  }

  return {
    valid,
    currentHash: current.hash,
    expectedHash,
    modifiedFiles,
  };
}

/**
 * Constrói payload de telemetria para verificação anti-plágio.
 * Analisa o estado da instalação e detecta padrões suspeitos
 * que podem indicar cópia não autorizada ou adulteração.
 *
 * @param {string} installDir - Diretório raiz da instalação
 * @param {string} tokenId - ID do token premium esperado
 * @returns {Object} Payload de telemetria completo
 */
function buildTelemetryPayload(installDir, tokenId) {
  if (!installDir || !tokenId) {
    throw new Error('installDir e tokenId são obrigatórios');
  }

  const contentHash = generateContentHash(installDir);
  const agentFiles = listAgentFiles(installDir);
  const agentCount = agentFiles.length;

  // Verifica presença e integridade dos watermarks
  let hasWatermarks = false;
  let watermarkIntact = true;
  let watermarkChecked = 0;

  for (const filePath of agentFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const extracted = extractWatermark(content);

      if (extracted) {
        hasWatermarks = true;
        watermarkChecked++;
        // Watermark existe mas tokenId não corresponde — adulterado
        if (extracted.tokenId !== tokenId) {
          watermarkIntact = false;
        }
      }
    } catch {
      // Arquivo inacessível — não conta como falha de watermark
    }
  }

  // Se nenhum arquivo tem watermark, marca como não intacto
  if (watermarkChecked === 0) {
    watermarkIntact = false;
  }

  // ─── Detecção de padrões suspeitos ──────────────────────────────────────
  const suspiciousPatterns = [];

  // 1. Arquivos de agentes com atribuição de autor diferente
  for (const filePath of agentFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fileName = path.basename(filePath);

      // Procura por padrões de atribuição que não sejam do The Matrix AI
      const authorPatterns = [
        /(?:author|created[\s-]*by|made[\s-]*by|built[\s-]*by)\s*[:=]\s*(.+)/i,
        /(?:©|copyright)\s+\d{4}\s+(.+)/i,
      ];

      for (const pattern of authorPatterns) {
        const match = content.match(pattern);
        if (match) {
          const author = match[1].trim().toLowerCase();
          // Se a atribuição não menciona "matrix" ou "lmas", é suspeito
          if (!author.includes('matrix') && !author.includes('lmas')) {
            suspiciousPatterns.push(
              `Atribuição diferente em ${fileName}: "${match[1].trim()}"`
            );
          }
        }
      }
    } catch {
      // Arquivo inacessível
    }
  }

  // 2. Constitution modificada (verifica se referência ao projeto original foi alterada)
  try {
    const constitutionPath = path.join(installDir, '.lmas-core/constitution.md');
    if (fs.existsSync(constitutionPath)) {
      const constitution = fs.readFileSync(constitutionPath, 'utf8').toLowerCase();
      // Se constitution existe mas não menciona "matrix" ou "lmas", foi adulterada
      if (!constitution.includes('matrix') && !constitution.includes('lmas')) {
        suspiciousPatterns.push('Constitution modificada: referências ao projeto original removidas');
      }
    } else {
      suspiciousPatterns.push('Constitution removida: arquivo não encontrado');
    }
  } catch {
    // Erro de leitura
  }

  // 3. Core config com nome de projeto diferente referenciando "matrix" ou "lmas"
  try {
    const configPath = path.join(installDir, '.lmas-core/core-config.yaml');
    if (fs.existsSync(configPath)) {
      const config = fs.readFileSync(configPath, 'utf8');

      // Procura por project_name ou name que não referencie matrix/lmas
      const nameMatch = config.match(/(?:project_name|name)\s*:\s*['"]?([^'"\n]+)/i);
      if (nameMatch) {
        const projectName = nameMatch[1].trim().toLowerCase();
        // Se o nome do projeto parece uma cópia (contém matrix/lmas em contexto errado)
        if (
          (projectName.includes('matrix') || projectName.includes('lmas')) &&
          !projectName.includes('the matrix') &&
          projectName !== 'lmas'
        ) {
          suspiciousPatterns.push(
            `Core config com nome suspeito: "${nameMatch[1].trim()}"`
          );
        }
      }
    }
  } catch {
    // Erro de leitura
  }

  // 4. Arquivos que parecem cópias (mesma estrutura, nomes diferentes)
  try {
    const agentSizes = new Map();
    for (const filePath of agentFiles) {
      try {
        const stats = fs.statSync(filePath);
        const size = stats.size;
        const name = path.basename(filePath);

        // Agrupa por tamanho exato — arquivos diferentes com mesmo tamanho são suspeitos
        if (agentSizes.has(size)) {
          const existing = agentSizes.get(size);

          // Lê ambos e compara estrutura (linhas de heading)
          const content1 = fs.readFileSync(filePath, 'utf8');
          const content2 = fs.readFileSync(existing.path, 'utf8');

          const headings1 = content1.match(/^#+\s.+$/gm) || [];
          const headings2 = content2.match(/^#+\s.+$/gm) || [];

          // Se têm os mesmos headings mas nomes diferentes, é suspeito
          if (
            headings1.length > 2 &&
            headings1.length === headings2.length &&
            headings1.join('|') === headings2.join('|') &&
            name !== existing.name
          ) {
            suspiciousPatterns.push(
              `Possível cópia: ${name} e ${existing.name} (mesma estrutura, ${headings1.length} headings idênticos)`
            );
          }
        } else {
          agentSizes.set(size, { name, path: filePath });
        }
      } catch {
        // Arquivo inacessível
      }
    }
  } catch {
    // Erro geral na detecção de cópias
  }

  return {
    contentHash,
    agentCount,
    hasWatermarks,
    watermarkIntact,
    suspiciousPatterns,
  };
}

module.exports = {
  generateWatermark,
  extractWatermark,
  applyWatermarks,
  generateContentHash,
  verifyIntegrity,
  buildTelemetryPayload,
};
