const fs = require('fs');
const path = require('path');

const VISUAL_DIR = path.join(__dirname, '../../apps/visual');
const SERVER_DIR = path.join(VISUAL_DIR, 'src/server');
const CLIENT_DIR = path.join(VISUAL_DIR, 'src/client');

describe('Story 4.4: Morpheus Room — Command Center', () => {
  let commandScreenSource;
  let constructSceneSource;
  let apiSource;

  beforeAll(() => {
    commandScreenSource = fs.readFileSync(
      path.join(CLIENT_DIR, 'ui/CommandScreen.ts'), 'utf8',
    );
    constructSceneSource = fs.readFileSync(
      path.join(CLIENT_DIR, 'scenes/ConstructScene.ts'), 'utf8',
    );
    apiSource = fs.readFileSync(
      path.join(SERVER_DIR, 'routes/api.ts'), 'utf8',
    );
  });

  // ─── CommandScreen File & Structure ────────────────────────────────

  describe('CommandScreen — arquivo e estrutura', () => {
    test('arquivo CommandScreen.ts existe', () => {
      expect(fs.existsSync(
        path.join(CLIENT_DIR, 'ui/CommandScreen.ts'),
      )).toBe(true);
    });

    test('exporta classe CommandScreen', () => {
      expect(commandScreenSource).toContain('export class CommandScreen');
    });

    test('estilo terminal Matrix (fundo #0D0208, texto #00FF41)', () => {
      expect(commandScreenSource).toContain('#0D0208');
      expect(commandScreenSource).toContain('#00FF41');
      expect(commandScreenSource).toContain('monospace');
    });

    test('overlay fullscreen (100vw x 100vh)', () => {
      expect(commandScreenSource).toContain('100vw');
      expect(commandScreenSource).toContain('100vh');
    });

    test('z-index alto para ficar acima do jogo', () => {
      expect(commandScreenSource).toContain('zIndex');
      expect(commandScreenSource).toContain('2000');
    });

    test('transição com opacity', () => {
      expect(commandScreenSource).toContain('opacity');
      expect(commandScreenSource).toContain('transition');
    });
  });

  // ─── Door Access (AC: 1) ───────────────────────────────────────────

  describe('Porta especial no corredor (AC: 1)', () => {
    test('ConstructScene importa CommandScreen', () => {
      expect(constructSceneSource).toContain("import { CommandScreen }");
    });

    test('cria instância de CommandScreen', () => {
      expect(constructSceneSource).toContain('new CommandScreen()');
    });

    test('setup da porta com glow verde', () => {
      expect(constructSceneSource).toContain('setupMorpheusRoomDoor');
      expect(constructSceneSource).toContain('doorGlow');
    });

    test('glow verde animado (pulsating)', () => {
      expect(constructSceneSource).toContain('animateDoorGlow');
      expect(constructSceneSource).toContain('0x00FF41');
      expect(constructSceneSource).toContain('yoyo: true');
    });

    test('zona de interação na porta', () => {
      expect(constructSceneSource).toContain('doorZone');
      expect(constructSceneSource).toContain('setInteractive');
    });

    test('click na porta abre CommandScreen', () => {
      expect(constructSceneSource).toContain("commandScreen?.open()");
    });

    test('tecla M abre/fecha CommandScreen', () => {
      expect(constructSceneSource).toContain('keydown-M');
      expect(constructSceneSource).toContain('commandScreen?.toggle()');
    });

    test('hint [M] aparece quando player está perto', () => {
      expect(constructSceneSource).toContain('doorHint');
      expect(constructSceneSource).toContain('[M] Morpheus Room');
      expect(constructSceneSource).toContain('dist < 32');
    });
  });

  // ─── Command Screen Content — Agents (AC: 2) ──────────────────────

  describe('Tela de Comando — Agentes Ativos (AC: 2)', () => {
    test('busca dados via fetch /api/dashboard', () => {
      expect(commandScreenSource).toContain("fetch('/api/dashboard')");
    });

    test('renderiza lista de agentes', () => {
      expect(commandScreenSource).toContain('renderAgentList');
    });

    test('mostra agentId de cada agente', () => {
      expect(commandScreenSource).toContain('agent.agentId');
    });

    test('mostra status com ícone (working/waiting/blocked/idle)', () => {
      expect(commandScreenSource).toContain('STATUS_ICONS');
      expect(commandScreenSource).toContain('working');
      expect(commandScreenSource).toContain('waiting');
      expect(commandScreenSource).toContain('blocked');
      expect(commandScreenSource).toContain('idle');
    });

    test('mostra task atual do agente', () => {
      expect(commandScreenSource).toContain('currentTask');
    });

    test('mostra story atual do agente', () => {
      expect(commandScreenSource).toContain('currentStory');
    });

    test('ordena agentes por status (working primeiro)', () => {
      expect(commandScreenSource).toContain('order.indexOf');
    });

    test('cores diferentes por status', () => {
      expect(commandScreenSource).toContain('STATUS_COLORS');
      expect(commandScreenSource).toContain('MATRIX_GREEN');
      expect(commandScreenSource).toContain('MATRIX_YELLOW');
      expect(commandScreenSource).toContain('MATRIX_RED');
    });

    test('trata estado vazio (nenhum agente)', () => {
      expect(commandScreenSource).toContain('Nenhum dado de agente');
    });
  });

  // ─── Terminal Preview (AC: 3) ──────────────────────────────────────

  describe('Preview do Terminal (AC: 3)', () => {
    test('renderiza terminal preview', () => {
      expect(commandScreenSource).toContain('renderTerminalPreview');
    });

    test('estilo terminal (fundo preto, borda)', () => {
      expect(commandScreenSource).toContain("background: #000");
    });

    test('mostra comandos tipo lmas status', () => {
      expect(commandScreenSource).toContain('lmas status');
    });

    test('mostra agentes working no terminal', () => {
      expect(commandScreenSource).toContain('trabalhando em');
    });

    test('nota de read-only v1.0', () => {
      expect(commandScreenSource).toContain('read-only v1.0');
      expect(commandScreenSource).toContain('v2.0');
    });

    test('cursor piscante ($ _)', () => {
      expect(commandScreenSource).toContain('$ _');
    });
  });

  // ─── Metrics Panel (AC: 4) ─────────────────────────────────────────

  describe('Métricas do Sistema (AC: 4)', () => {
    test('renderiza painel de métricas', () => {
      expect(commandScreenSource).toContain('renderMetrics');
    });

    test('mostra contagem de stories', () => {
      expect(commandScreenSource).toContain('storyCount');
    });

    test('mostra contagem de agentes registrados', () => {
      expect(commandScreenSource).toContain('agentCount');
    });

    test('mostra agente ativo', () => {
      expect(commandScreenSource).toContain('activeAgent');
    });

    test('mostra última atividade com timestamp', () => {
      expect(commandScreenSource).toContain('lastActivity');
      expect(commandScreenSource).toContain('formatTimeAgo');
    });

    test('health bar visual (working/waiting/blocked/idle)', () => {
      expect(commandScreenSource).toContain('renderHealthBar');
      expect(commandScreenSource).toContain('pctWork');
      expect(commandScreenSource).toContain('pctBlock');
    });
  });

  // ─── Back Button (AC: 5) ───────────────────────────────────────────

  describe('Botão Voltar ao Escritório (AC: 5)', () => {
    test('renderiza botão de retorno', () => {
      expect(commandScreenSource).toContain('renderBackButton');
    });

    test('texto em PT-BR: Voltar ao escritório', () => {
      expect(commandScreenSource).toContain('Voltar ao escritório');
    });

    test('botão styled com borda Matrix green', () => {
      expect(commandScreenSource).toContain('cmd-back-btn');
    });

    test('click no botão fecha CommandScreen', () => {
      expect(commandScreenSource).toContain("backBtn.addEventListener('click'");
      expect(commandScreenSource).toContain('this.close()');
    });

    test('ESC também fecha CommandScreen', () => {
      expect(commandScreenSource).toContain('Escape');
      expect(commandScreenSource).toContain('this.close()');
    });

    test('método close() esconde o overlay', () => {
      expect(commandScreenSource).toContain("close(): void");
      expect(commandScreenSource).toContain("this.isOpen = false");
    });
  });

  // ─── API Dashboard Endpoint ────────────────────────────────────────

  describe('API — GET /api/dashboard', () => {
    test('endpoint /api/dashboard existe', () => {
      expect(apiSource).toContain("router.get('/dashboard'");
    });

    test('retorna health dos agentes (working/idle/blocked/waiting)', () => {
      expect(apiSource).toContain("visualState === 'working'");
      expect(apiSource).toContain("visualState === 'idle'");
      expect(apiSource).toContain("visualState === 'blocked'");
      expect(apiSource).toContain("visualState === 'waiting'");
    });

    test('retorna estados dos agentes', () => {
      expect(apiSource).toContain('getStates()');
    });

    test('retorna info do projeto ativo', () => {
      expect(apiSource).toContain('getProjectInfo');
    });

    test('retorna agente ativo', () => {
      expect(apiSource).toContain('getActiveAgent()');
    });

    test('tratamento de erros com try/catch', () => {
      expect(apiSource).toContain('Failed to get dashboard data');
    });
  });

  // ─── Auto-Refresh ──────────────────────────────────────────────────

  describe('Auto-Refresh', () => {
    test('auto-refresh a cada 5 segundos', () => {
      expect(commandScreenSource).toContain('setInterval');
      expect(commandScreenSource).toContain('5000');
    });

    test('limpa interval ao fechar', () => {
      expect(commandScreenSource).toContain('clearInterval');
    });

    test('refresh busca dados atualizados', () => {
      expect(commandScreenSource).toContain('async refresh');
      expect(commandScreenSource).toContain("fetch('/api/dashboard')");
    });
  });

  // ─── Lifecycle ─────────────────────────────────────────────────────

  describe('Lifecycle', () => {
    test('open() mostra overlay', () => {
      expect(commandScreenSource).toContain("async open()");
      expect(commandScreenSource).toContain("this.isOpen = true");
    });

    test('close() esconde overlay', () => {
      expect(commandScreenSource).toContain("close(): void");
      expect(commandScreenSource).toContain("this.isOpen = false");
    });

    test('toggle() alterna visibilidade', () => {
      expect(commandScreenSource).toContain('toggle(): void');
    });

    test('destroy() remove do DOM', () => {
      expect(commandScreenSource).toContain('destroy(): void');
      expect(commandScreenSource).toContain('this.container.remove()');
    });

    test('getIsOpen() retorna estado', () => {
      expect(commandScreenSource).toContain('getIsOpen()');
    });
  });

  // ─── Segurança ─────────────────────────────────────────────────────

  describe('Segurança', () => {
    test('escapa HTML para prevenir XSS', () => {
      expect(commandScreenSource).toContain('esc(');
      expect(commandScreenSource).toContain('textContent');
    });

    test('trata erros de fetch gracefully', () => {
      expect(commandScreenSource).toContain('catch (error)');
      expect(commandScreenSource).toContain('renderError');
    });

    test('error screen tem botão de voltar', () => {
      expect(commandScreenSource).toContain('ERRO');
      expect(commandScreenSource).toContain('cmd-back-btn');
    });
  });

  // ─── Header ────────────────────────────────────────────────────────

  describe('Header', () => {
    test('título MORPHEUS ROOM', () => {
      expect(commandScreenSource).toContain('MORPHEUS ROOM');
      expect(commandScreenSource).toContain('COMMAND CENTER');
    });

    test('mostra nome do projeto', () => {
      expect(commandScreenSource).toContain('projectName');
    });

    test('mostra horário', () => {
      expect(commandScreenSource).toContain('toLocaleTimeString');
      expect(commandScreenSource).toContain('pt-BR');
    });
  });

  // ─── ConstructScene Integration ────────────────────────────────────

  describe('ConstructScene Integration', () => {
    test('getter getCommandScreen()', () => {
      expect(constructSceneSource).toContain('getCommandScreen()');
    });

    test('propriedade commandScreen', () => {
      expect(constructSceneSource).toContain('private commandScreen: CommandScreen | null');
    });

    test('propriedade doorZone', () => {
      expect(constructSceneSource).toContain('private doorZone');
    });

    test('propriedade doorGlow', () => {
      expect(constructSceneSource).toContain('private doorGlow');
    });

    test('propriedade doorHint', () => {
      expect(constructSceneSource).toContain('private doorHint');
    });
  });
});
