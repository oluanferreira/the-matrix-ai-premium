const fs = require('fs');
const path = require('path');

const VISUAL_DIR = path.join(__dirname, '../../apps/visual');
const SERVER_DIR = path.join(VISUAL_DIR, 'src/server');
const CLIENT_DIR = path.join(VISUAL_DIR, 'src/client');

describe('Story 5.4: Project Selector — Escolha sua Realidade', () => {
  let projectDiscoverySource;
  let projectContextSource;
  let apiSource;
  let indexSource;
  let appSource;
  let projectSelectSceneSource;
  let loginSceneSource;
  let mainSource;
  let bootSceneSource;

  beforeAll(() => {
    projectDiscoverySource = fs.readFileSync(
      path.join(SERVER_DIR, 'services/ProjectDiscovery.ts'), 'utf8',
    );
    projectContextSource = fs.readFileSync(
      path.join(SERVER_DIR, 'project-context.ts'), 'utf8',
    );
    apiSource = fs.readFileSync(
      path.join(SERVER_DIR, 'routes/api.ts'), 'utf8',
    );
    indexSource = fs.readFileSync(
      path.join(SERVER_DIR, 'index.ts'), 'utf8',
    );
    appSource = fs.readFileSync(
      path.join(SERVER_DIR, 'app.ts'), 'utf8',
    );
    projectSelectSceneSource = fs.readFileSync(
      path.join(CLIENT_DIR, 'scenes/ProjectSelectScene.ts'), 'utf8',
    );
    loginSceneSource = fs.readFileSync(
      path.join(CLIENT_DIR, 'scenes/LoginScene.ts'), 'utf8',
    );
    mainSource = fs.readFileSync(
      path.join(CLIENT_DIR, 'main.ts'), 'utf8',
    );
    bootSceneSource = fs.readFileSync(
      path.join(CLIENT_DIR, 'scenes/BootScene.ts'), 'utf8',
    );
  });

  // ─── Backend: ProjectDiscovery Service (AC: 2) ─────────────────────

  describe('ProjectDiscovery Service (AC: 2)', () => {
    test('arquivo ProjectDiscovery.ts existe', () => {
      expect(fs.existsSync(
        path.join(SERVER_DIR, 'services/ProjectDiscovery.ts'),
      )).toBe(true);
    });

    test('exporta classe ProjectDiscovery', () => {
      expect(projectDiscoverySource).toContain('export class ProjectDiscovery');
    });

    test('exporta interface ProjectInfo', () => {
      expect(projectDiscoverySource).toContain('export interface ProjectInfo');
    });

    test('ProjectInfo tem campos obrigatórios', () => {
      expect(projectDiscoverySource).toContain('name: string');
      expect(projectDiscoverySource).toContain('path: string');
      expect(projectDiscoverySource).toContain('lastActivity: number');
      expect(projectDiscoverySource).toContain('storyCount: number');
      expect(projectDiscoverySource).toContain('agentCount: number');
    });

    test('detecta marcadores LMAS (.lmas-core, core-config.yaml)', () => {
      expect(projectDiscoverySource).toContain('.lmas-core');
      expect(projectDiscoverySource).toContain('core-config.yaml');
    });

    test('método discoverProjects() retorna ProjectInfo[]', () => {
      expect(projectDiscoverySource).toContain('discoverProjects(): ProjectInfo[]');
    });

    test('método validateProjectPath() para segurança', () => {
      expect(projectDiscoverySource).toContain('validateProjectPath');
    });

    test('previne path traversal', () => {
      expect(projectDiscoverySource).toContain('..');
    });

    test('lê LMAS_PROJECTS_PATH env var', () => {
      expect(projectDiscoverySource).toContain('LMAS_PROJECTS_PATH');
    });

    test('usa separador de plataforma (Windows ; / Linux :)', () => {
      expect(projectDiscoverySource).toContain("process.platform === 'win32'");
    });

    test('extrai nome do projeto de core-config.yaml', () => {
      expect(projectDiscoverySource).toContain('extractProjectName');
      expect(projectDiscoverySource).toContain('yaml.load');
    });

    test('conta stories do projeto', () => {
      expect(projectDiscoverySource).toContain('countStories');
      expect(projectDiscoverySource).toContain("'docs', 'stories', 'active'");
    });

    test('conta agentes do projeto', () => {
      expect(projectDiscoverySource).toContain('countAgents');
      expect(projectDiscoverySource).toContain("'development', 'agents'");
    });

    test('ordena projetos por lastActivity (mais recente primeiro)', () => {
      expect(projectDiscoverySource).toContain('b.lastActivity - a.lastActivity');
    });

    test('método getProjectInfo() para obter info de um projeto específico', () => {
      expect(projectDiscoverySource).toContain('getProjectInfo');
    });
  });

  // ─── Backend: ProjectContext (AC: 8, 9) ────────────────────────────

  describe('ProjectContext — Dynamic Project Switching (AC: 8, 9)', () => {
    test('arquivo project-context.ts existe', () => {
      expect(fs.existsSync(
        path.join(SERVER_DIR, 'project-context.ts'),
      )).toBe(true);
    });

    test('exporta interface ProjectContext', () => {
      expect(projectContextSource).toContain('export interface ProjectContext');
    });

    test('exporta createProjectContext()', () => {
      expect(projectContextSource).toContain('export function createProjectContext');
    });

    test('tem activeProjectPath para rastrear projeto ativo', () => {
      expect(projectContextSource).toContain('activeProjectPath');
    });

    test('método selectProject() reinicializa serviços', () => {
      expect(projectContextSource).toContain('selectProject');
      expect(projectContextSource).toContain('new StateManager(projectPath)');
      expect(projectContextSource).toContain('new GitPoller(projectPath)');
    });

    test('para serviços existentes antes de trocar', () => {
      expect(projectContextSource).toContain('stateManager.stop()');
      expect(projectContextSource).toContain('gitPoller.stop()');
    });

    test('inicia novos serviços após troca', () => {
      expect(projectContextSource).toContain('stateManager.start()');
      expect(projectContextSource).toContain('gitPoller.start()');
    });

    test('conecta broadcaster SSE ao novo projeto', () => {
      expect(projectContextSource).toContain('broadcaster.broadcast');
      expect(projectContextSource).toContain('agent-status');
      expect(projectContextSource).toContain('agent-delivery');
    });
  });

  // ─── Backend: API Endpoints (AC: 3, 8) ─────────────────────────────

  describe('API Endpoints (AC: 3, 8)', () => {
    test('GET /api/projects endpoint existe', () => {
      expect(apiSource).toContain("router.get('/projects'");
    });

    test('/api/projects chama discoverProjects()', () => {
      expect(apiSource).toContain('discoverProjects()');
    });

    test('POST /api/project/select endpoint existe', () => {
      expect(apiSource).toContain("router.post('/project/select'");
    });

    test('/api/project/select valida projectPath', () => {
      expect(apiSource).toContain('validateProjectPath');
    });

    test('/api/project/select rejeita se projectPath ausente', () => {
      expect(apiSource).toContain('projectPath is required');
    });

    test('/api/project/select chama selectProject()', () => {
      expect(apiSource).toContain('selectProject(projectPath)');
    });

    test('GET /api/project/active para verificar projeto ativo', () => {
      expect(apiSource).toContain("router.get('/project/active'");
    });

    test('/api/status inclui activeProject', () => {
      expect(apiSource).toContain('activeProject');
    });

    test('tratamento de erros com try/catch', () => {
      expect(apiSource).toContain('catch (error)');
      expect(apiSource).toContain('res.status(500)');
      expect(apiSource).toContain('res.status(400)');
    });

    test('recebe ProjectContext e ProjectDiscovery como dependências', () => {
      expect(apiSource).toContain('projectContext: ProjectContext');
      expect(apiSource).toContain('projectDiscovery: ProjectDiscovery');
    });
  });

  // ─── Backend: Server Index (AC: 9) ─────────────────────────────────

  describe('Server Index — Dynamic Project Root (AC: 9)', () => {
    test('não tem PROJECT_ROOT hardcoded como antes', () => {
      // Agora usa DEFAULT_WORKSPACE ao invés de PROJECT_ROOT fixo
      expect(indexSource).toContain('DEFAULT_WORKSPACE');
    });

    test('cria projectContext', () => {
      expect(indexSource).toContain('createProjectContext');
    });

    test('passa projectContext para createApp', () => {
      expect(indexSource).toContain('createApp(projectContext)');
    });

    test('conecta broadcaster ao projectContext', () => {
      expect(indexSource).toContain('projectContext.broadcaster = broadcaster');
    });

    test('graceful shutdown verifica se serviços existem', () => {
      expect(indexSource).toContain('if (projectContext.stateManager)');
      expect(indexSource).toContain('if (projectContext.gitPoller)');
    });

    test('log indica aguardando seleção de projeto', () => {
      expect(indexSource).toContain('Awaiting project selection');
    });
  });

  // ─── Backend: App Setup ────────────────────────────────────────────

  describe('App Setup', () => {
    test('app.ts importa ProjectDiscovery', () => {
      expect(appSource).toContain("import { ProjectDiscovery }");
    });

    test('app.ts cria instância de ProjectDiscovery', () => {
      expect(appSource).toContain('new ProjectDiscovery');
    });

    test('app.ts tem express.json() para parsing de body', () => {
      expect(appSource).toContain('express.json()');
    });

    test('CORS permite método POST', () => {
      expect(appSource).toContain('GET, POST, OPTIONS');
    });

    test('passa projectContext e projectDiscovery para createAPIRouter', () => {
      expect(appSource).toContain('createAPIRouter(projectContext, projectDiscovery)');
    });
  });

  // ─── Frontend: ProjectSelectScene (AC: 1, 4, 5, 6, 7) ─────────────

  describe('ProjectSelectScene (AC: 1, 4, 5, 6, 7)', () => {
    test('arquivo ProjectSelectScene.ts existe', () => {
      expect(fs.existsSync(
        path.join(CLIENT_DIR, 'scenes/ProjectSelectScene.ts'),
      )).toBe(true);
    });

    test('exporta classe ProjectSelectScene', () => {
      expect(projectSelectSceneSource).toContain('export class ProjectSelectScene');
    });

    test('extends Phaser.Scene', () => {
      expect(projectSelectSceneSource).toContain('extends Phaser.Scene');
    });

    test('scene key é ProjectSelectScene', () => {
      expect(projectSelectSceneSource).toContain("key: 'ProjectSelectScene'");
    });

    test('estilo terminal Matrix (fundo e texto verde)', () => {
      expect(projectSelectSceneSource).toContain('#00FF41');
      expect(projectSelectSceneSource).toContain('#0D0208');
      expect(projectSelectSceneSource).toContain('monospace');
    });

    test('busca projetos via fetch /api/projects', () => {
      expect(projectSelectSceneSource).toContain("fetch('/api/projects')");
    });

    test('interface ProjectInfo com campos necessários', () => {
      expect(projectSelectSceneSource).toContain('interface ProjectInfo');
      expect(projectSelectSceneSource).toContain('name: string');
      expect(projectSelectSceneSource).toContain('path: string');
    });

    test('mostra lista de projetos', () => {
      expect(projectSelectSceneSource).toContain('showProjectList');
    });

    test('suporta navegação por teclado (UP/DOWN/ENTER)', () => {
      expect(projectSelectSceneSource).toContain('ArrowUp');
      expect(projectSelectSceneSource).toContain('ArrowDown');
      expect(projectSelectSceneSource).toContain("'Enter'");
    });

    test('suporta clique do mouse nos itens', () => {
      expect(projectSelectSceneSource).toContain("addEventListener('click'");
      expect(projectSelectSceneSource).toContain("addEventListener('mouseenter'");
    });

    test('tem título "Selecione sua realidade"', () => {
      expect(projectSelectSceneSource).toContain('Selecione sua realidade');
    });

    test('destaca item selecionado com cor diferente', () => {
      expect(projectSelectSceneSource).toContain('selectedIndex');
      expect(projectSelectSceneSource).toContain('MATRIX_GREEN');
      expect(projectSelectSceneSource).toContain('MATRIX_DIM');
    });

    test('mostra cursor > no item selecionado', () => {
      expect(projectSelectSceneSource).toContain('&gt;');
    });
  });

  // ─── Frontend: Pills em ProjectSelectScene (AC: 5, 6, 7) ──────────

  describe('Pills em ProjectSelectScene (AC: 5, 6, 7)', () => {
    test('mostra pílulas após selecionar projeto', () => {
      expect(projectSelectSceneSource).toContain('showPills');
    });

    test('cria pílula vermelha', () => {
      expect(projectSelectSceneSource).toContain('red-pill');
      expect(projectSelectSceneSource).toContain('#FF');
    });

    test('cria pílula azul', () => {
      expect(projectSelectSceneSource).toContain('blue-pill');
      expect(projectSelectSceneSource).toContain('#00');
    });

    test('pílula vermelha entra no Construct (AC: 6)', () => {
      expect(projectSelectSceneSource).toContain('enterConstruct');
      expect(projectSelectSceneSource).toContain("'ConstructScene'");
    });

    test('pílula vermelha faz POST /api/project/select', () => {
      expect(projectSelectSceneSource).toContain("fetch('/api/project/select'");
      expect(projectSelectSceneSource).toContain("method: 'POST'");
      expect(projectSelectSceneSource).toContain('projectPath');
    });

    test('efeito glitch na transição (shake + flash)', () => {
      expect(projectSelectSceneSource).toContain('shake(500');
      expect(projectSelectSceneSource).toContain('flash(500');
    });

    test('pílula azul volta para lista (AC: 7)', () => {
      expect(projectSelectSceneSource).toContain('backToList');
    });

    test('ESC também volta para lista', () => {
      expect(projectSelectSceneSource).toContain("'Escape'");
      expect(projectSelectSceneSource).toContain('backToList');
    });

    test('hover effect nas pílulas (scale 1.2)', () => {
      expect(projectSelectSceneSource).toContain('scale(1.2)');
      expect(projectSelectSceneSource).toContain('scale(1)');
    });

    test('rótulos Entrar e Voltar em PT-BR', () => {
      expect(projectSelectSceneSource).toContain('Entrar');
      expect(projectSelectSceneSource).toContain('Voltar');
    });

    test('mostra nome do projeto selecionado acima das pílulas', () => {
      expect(projectSelectSceneSource).toContain('selectedProject.name');
    });
  });

  // ─── Frontend: Auto-Select (AC: 10) ────────────────────────────────

  describe('Project List Always Shown (AC: 10 updated)', () => {
    test('always shows project list (never auto-selects)', () => {
      // Updated: always shows list with "Começar novo projeto" button
      expect(projectSelectSceneSource).toContain('showProjectList');
      // Should NOT have auto-select logic
      expect(projectSelectSceneSource).not.toContain('this.projects.length === 1');
    });

    test('botão "Começar novo projeto" sempre visível', () => {
      expect(projectSelectSceneSource).toContain('new-project-btn');
      expect(projectSelectSceneSource).toContain('Comecar novo projeto');
    });
  });

  // ─── Frontend: Empty State (AC: 11) ────────────────────────────────

  describe('Empty State — Nenhum Projeto (AC: 11)', () => {
    test('detecta 0 projetos', () => {
      expect(projectSelectSceneSource).toContain('this.projects.length === 0');
    });

    test('mostra mensagem quando sem projetos', () => {
      expect(projectSelectSceneSource).toContain('Nenhum projeto LMAS detectado');
    });

    test('mensagem em PT-BR: nenhum projeto detectado', () => {
      expect(projectSelectSceneSource).toContain('Nenhum projeto LMAS detectado');
    });

    test('instrui o usuário a instalar LMAS', () => {
      expect(projectSelectSceneSource).toContain('npx lmas-core install');
    });

    test('mostra instruções de novo projeto', () => {
      expect(projectSelectSceneSource).toContain('npx lmas-core install');
    });
  });

  // ─── Frontend: LoginScene Modifications (AC: 1) ────────────────────

  describe('LoginScene Modifications (AC: 1)', () => {
    test('LoginScene não tem mais pílulas', () => {
      expect(loginSceneSource).not.toContain('redPill');
      expect(loginSceneSource).not.toContain('bluePill');
      expect(loginSceneSource).not.toContain('showPills');
    });

    test('LoginScene transiciona para ProjectSelectScene', () => {
      expect(loginSceneSource).toContain("'ProjectSelectScene'");
    });

    test('LoginScene ainda tem typewriter', () => {
      expect(loginSceneSource).toContain('startTypewriter');
      expect(loginSceneSource).toContain("'Acorde...'");
    });

    test('LoginScene ainda tem code rain', () => {
      expect(loginSceneSource).toContain('CODE_RAIN_CHARS');
      expect(loginSceneSource).toContain('updateCodeRain');
    });

    test('LoginScene não vai mais direto para ConstructScene', () => {
      expect(loginSceneSource).not.toContain("'ConstructScene'");
    });

    test('transição com fade out', () => {
      expect(loginSceneSource).toContain('transitionToProjectSelect');
      expect(loginSceneSource).toContain('fadeOut');
    });
  });

  // ─── Frontend: Scene Registration ──────────────────────────────────

  describe('Scene Registration', () => {
    test('main.ts importa ProjectSelectScene', () => {
      expect(mainSource).toContain("import { ProjectSelectScene }");
    });

    test('main.ts importa LoginScene', () => {
      expect(mainSource).toContain("import { LoginScene }");
    });

    test('main.ts registra todas as scenes na ordem correta', () => {
      // BootScene → LoginScene → ProjectSelectScene → ConstructScene
      const sceneArrayMatch = mainSource.match(/scene:\s*\[([^\]]+)\]/);
      expect(sceneArrayMatch).not.toBeNull();
      const sceneList = sceneArrayMatch[1];
      expect(sceneList).toContain('BootScene');
      expect(sceneList).toContain('LoginScene');
      expect(sceneList).toContain('ProjectSelectScene');
      expect(sceneList).toContain('ConstructScene');
    });

    test('BootScene transiciona para LoginScene (não ConstructScene)', () => {
      expect(bootSceneSource).toContain("'LoginScene'");
      expect(bootSceneSource).not.toContain("'ConstructScene'");
    });
  });

  // ─── Frontend: Code Rain em ProjectSelectScene ─────────────────────

  describe('Code Rain em ProjectSelectScene', () => {
    test('tem code rain background', () => {
      expect(projectSelectSceneSource).toContain('CODE_RAIN_CHARS');
      expect(projectSelectSceneSource).toContain('initCodeRain');
      expect(projectSelectSceneSource).toContain('updateCodeRain');
    });

    test('atualiza code rain no update()', () => {
      expect(projectSelectSceneSource).toContain('update()');
    });
  });

  // ─── Frontend: Error Handling ──────────────────────────────────────

  describe('Error Handling', () => {
    test('ProjectSelectScene trata erros de fetch', () => {
      expect(projectSelectSceneSource).toContain('catch (error)');
      expect(projectSelectSceneSource).toContain('showError');
    });

    test('mostra mensagem de erro ao usuário', () => {
      expect(projectSelectSceneSource).toContain('Erro ao buscar projetos');
    });

    test('trata falha na seleção de projeto', () => {
      expect(projectSelectSceneSource).toContain('Falha ao selecionar projeto');
    });

    test('previne duplo-click no enterConstruct', () => {
      expect(projectSelectSceneSource).toContain("this.sceneState === 'entering'");
    });
  });

  // ─── Scene Flow Completo ───────────────────────────────────────────

  describe('Scene Flow: Boot → Login → ProjectSelect → Construct', () => {
    test('flow completo está conectado', () => {
      // BootScene → LoginScene
      expect(bootSceneSource).toContain("scene.start('LoginScene')");

      // LoginScene → ProjectSelectScene
      expect(loginSceneSource).toContain("scene.start('ProjectSelectScene')");

      // ProjectSelectScene → ConstructScene
      expect(projectSelectSceneSource).toContain("scene.start('ConstructScene')");
    });
  });

  // ─── Segurança ─────────────────────────────────────────────────────

  describe('Segurança', () => {
    test('API valida projectPath antes de usar', () => {
      expect(apiSource).toContain('validateProjectPath');
    });

    test('ProjectDiscovery previne path traversal', () => {
      expect(projectDiscoverySource).toContain("'..'");
    });

    test('API rejeita projectPath inválido com 400', () => {
      expect(apiSource).toContain("res.status(400)");
    });

    test('API rejeita projectPath não-string', () => {
      expect(apiSource).toContain("typeof projectPath !== 'string'");
    });
  });

  // ─── UX: formatTimeAgo em PT-BR ───────────────────────────────────

  describe('UX: Formatação PT-BR', () => {
    test('formatTimeAgo existe', () => {
      expect(projectSelectSceneSource).toContain('formatTimeAgo');
    });

    test('exibe "agora" para timestamps recentes', () => {
      expect(projectSelectSceneSource).toContain("'agora'");
    });

    test('exibe minutos atrás', () => {
      expect(projectSelectSceneSource).toContain('min atras');
    });

    test('exibe horas atrás', () => {
      expect(projectSelectSceneSource).toContain('h atras');
    });

    test('exibe dias atrás', () => {
      expect(projectSelectSceneSource).toContain('d atras');
    });
  });
});
