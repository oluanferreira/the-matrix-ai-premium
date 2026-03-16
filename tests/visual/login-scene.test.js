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

    test('texto em português: A Matrix possui você...', () => {
      expect(loginSource).toContain("'A Matrix possui você...'");
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
      expect(loginSource).toContain('typewriterTimer');
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

    test('pílulas existem em ProjectSelectScene', () => {
      expect(projectSelectSource).toContain('redPill');
      expect(projectSelectSource).toContain('bluePill');
      expect(projectSelectSource).toContain('0xFF0000');
      expect(projectSelectSource).toContain('0x0000FF');
    });

    test('rótulos em PT-BR: Entrar e Voltar', () => {
      expect(projectSelectSource).toContain("'Entrar'");
      expect(projectSelectSource).toContain("'Voltar'");
    });

    test('createPill cria container com cápsula em ProjectSelectScene', () => {
      expect(projectSelectSource).toContain('createPill');
      expect(projectSelectSource).toContain('fillRoundedRect');
      expect(projectSelectSource).toContain('strokeRoundedRect');
    });

    test('efeito de brilho na pílula', () => {
      expect(projectSelectSource).toContain('fillEllipse');
    });

    test('hover scale effect', () => {
      expect(projectSelectSource).toContain('pointerover');
      expect(projectSelectSource).toContain('setScale(1.2)');
      expect(projectSelectSource).toContain('pointerout');
      expect(projectSelectSource).toContain('setScale(1)');
    });

    test('pílulas interativas com hit area', () => {
      expect(projectSelectSource).toContain('setInteractive');
      expect(projectSelectSource).toContain('Phaser.Geom.Rectangle');
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
      expect(projectSelectSource).toContain("'pointerdown'");
    });
  });
});
