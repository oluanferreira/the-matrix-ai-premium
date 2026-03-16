const fs = require('fs');
const path = require('path');

const VISUAL_DIR = path.join(__dirname, '../../apps/visual');

describe('Story 5.2: Login Scene — Escolha sua Pílula', () => {
  let loginSource;

  beforeAll(() => {
    loginSource = fs.readFileSync(
      path.join(VISUAL_DIR, 'src/client/scenes/LoginScene.ts'),
      'utf8',
    );
  });

  describe('Arquivo e estrutura', () => {
    test('arquivo LoginScene.ts existe', () => {
      expect(fs.existsSync(
        path.join(VISUAL_DIR, 'src/client/scenes/LoginScene.ts'),
      )).toBe(true);
    });

    test('exporta classe LoginScene', () => {
      expect(loginSource).toContain('export class LoginScene');
    });

    test('extends Phaser.Scene', () => {
      expect(loginSource).toContain('extends Phaser.Scene');
    });

    test('scene key é LoginScene', () => {
      expect(loginSource).toContain("key: 'LoginScene'");
    });
  });

  describe('Code Rain (AC: 1, 5)', () => {
    test('define caracteres katakana/numéricos', () => {
      expect(loginSource).toContain('CODE_RAIN_CHARS');
      expect(loginSource).toContain('アイウエオ');
      expect(loginSource).toContain('0123456789');
    });

    test('interface CodeRainColumn com propriedades', () => {
      expect(loginSource).toContain('interface CodeRainColumn');
      expect(loginSource).toContain('speed');
      expect(loginSource).toContain('nextSpawnY');
    });

    test('inicializa colunas de code rain', () => {
      expect(loginSource).toContain('initCodeRain');
      expect(loginSource).toContain('colSpacing');
      expect(loginSource).toContain('numColumns');
    });

    test('atualiza code rain no update()', () => {
      expect(loginSource).toContain('updateCodeRain');
      expect(loginSource).toContain('update()');
    });

    test('remove caracteres fora da tela', () => {
      expect(loginSource).toContain('col.chars.filter');
    });

    test('fundo preto', () => {
      expect(loginSource).toContain("'#000000'");
    });
  });

  describe('Typewriter em PT-BR (AC: 2)', () => {
    test('texto em português: Acorde...', () => {
      expect(loginSource).toContain("'Acorde...'");
    });

    test('texto em português: A Matrix possui voce...', () => {
      expect(loginSource).toContain("'A Matrix possui voce...'");
    });

    test('texto em português: Siga o coelho branco.', () => {
      expect(loginSource).toContain("'Siga o coelho branco.'");
    });

    test('delay entre caracteres (80ms)', () => {
      expect(loginSource).toContain('TYPEWRITER_CHAR_DELAY_MS');
      expect(loginSource).toContain('80');
    });

    test('pausa entre linhas (1500ms)', () => {
      expect(loginSource).toContain('TYPEWRITER_LINE_PAUSE_MS');
      expect(loginSource).toContain('1500');
    });

    test('implementa startTypewriter com timer', () => {
      expect(loginSource).toContain('startTypewriter');
      expect(loginSource).toContain('typewriterInterval');
    });

    test('texto verde Matrix', () => {
      expect(loginSource).toContain("color: '#00FF41'");
    });

    test('fonte monospace', () => {
      expect(loginSource).toContain("fontFamily: 'monospace'");
    });
  });

  // Story 5.4: Pills moved to ProjectSelectScene
  describe('Pílulas movidas para ProjectSelectScene (Story 5.4)', () => {
    let projectSelectSource;

    beforeAll(() => {
      projectSelectSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/scenes/ProjectSelectScene.ts'),
        'utf8',
      );
    });

    test('LoginScene não tem mais pílulas', () => {
      expect(loginSource).not.toContain('redPill');
      expect(loginSource).not.toContain('bluePill');
      expect(loginSource).not.toContain('showPills');
    });

    test('pílulas existem em ProjectSelectScene (DOM)', () => {
      expect(projectSelectSource).toContain('red-pill');
      expect(projectSelectSource).toContain('blue-pill');
      expect(projectSelectSource).toContain('#FF');
    });

    test('rótulos em PT-BR: Entrar e Voltar', () => {
      expect(projectSelectSource).toContain('Entrar');
      expect(projectSelectSource).toContain('Voltar');
    });

    test('pílulas são DOM elements com gradient', () => {
      expect(projectSelectSource).toContain('linear-gradient');
      expect(projectSelectSource).toContain('border-radius');
      expect(projectSelectSource).toContain('box-shadow');
    });

    test('hover scale effect (DOM)', () => {
      expect(projectSelectSource).toContain("addEventListener('mouseenter'");
      expect(projectSelectSource).toContain('scale(1.2)');
      expect(projectSelectSource).toContain('scale(1)');
    });

    test('pílulas clicáveis (DOM click handlers)', () => {
      expect(projectSelectSource).toContain("addEventListener('click'");
      expect(projectSelectSource).toContain('enterConstruct');
      expect(projectSelectSource).toContain('backToList');
    });
  });

  describe('Transição para ProjectSelectScene (Story 5.4)', () => {
    test('transiciona para ProjectSelectScene após typewriter', () => {
      expect(loginSource).toContain('transitionToProjectSelect');
      expect(loginSource).toContain("'ProjectSelectScene'");
    });

    test('fadeOut antes da transição', () => {
      expect(loginSource).toContain('fadeOut');
    });

    test('LoginScene não vai mais direto para ConstructScene', () => {
      expect(loginSource).not.toContain("'ConstructScene'");
    });
  });

  describe('Transição Glitch em ProjectSelectScene (AC: 4)', () => {
    let projectSelectSource;

    beforeAll(() => {
      projectSelectSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/scenes/ProjectSelectScene.ts'),
        'utf8',
      );
    });

    test('efeito shake na câmera', () => {
      expect(projectSelectSource).toContain('shake(500');
    });

    test('efeito flash verde', () => {
      expect(projectSelectSource).toContain('flash(500');
    });

    test('fadeOut após shake', () => {
      expect(projectSelectSource).toContain('fadeOut(500');
    });

    test('transição para ConstructScene', () => {
      expect(projectSelectSource).toContain("this.scene.start('ConstructScene')");
    });

    test('enterConstruct é o handler da pílula vermelha', () => {
      expect(projectSelectSource).toContain('enterConstruct');
      expect(projectSelectSource).toContain("addEventListener('click'");
    });
  });
});
