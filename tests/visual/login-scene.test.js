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

  describe('Pílulas (AC: 3)', () => {
    test('cria pílula vermelha', () => {
      expect(loginSource).toContain('redPill');
      expect(loginSource).toContain('0xFF0000');
    });

    test('cria pílula azul', () => {
      expect(loginSource).toContain('bluePill');
      expect(loginSource).toContain('0x0000FF');
    });

    test('rótulos em PT-BR: Entrar e Sair', () => {
      expect(loginSource).toContain("'Entrar'");
      expect(loginSource).toContain("'Sair'");
    });

    test('createPill cria container com cápsula', () => {
      expect(loginSource).toContain('createPill');
      expect(loginSource).toContain('fillRoundedRect');
      expect(loginSource).toContain('strokeRoundedRect');
    });

    test('efeito de brilho na pílula', () => {
      expect(loginSource).toContain('fillEllipse');
    });

    test('hover scale effect', () => {
      expect(loginSource).toContain('pointerover');
      expect(loginSource).toContain('setScale(1.2)');
      expect(loginSource).toContain('pointerout');
      expect(loginSource).toContain('setScale(1)');
    });

    test('pílulas interativas com hit area', () => {
      expect(loginSource).toContain('setInteractive');
      expect(loginSource).toContain('Phaser.Geom.Rectangle');
    });

    test('showPills chamado após typewriter', () => {
      expect(loginSource).toContain('showPills');
      expect(loginSource).toContain('pillsVisible');
    });
  });

  describe('Transição Glitch (AC: 4)', () => {
    test('efeito shake na câmera', () => {
      expect(loginSource).toContain('shake(500');
    });

    test('efeito flash verde', () => {
      expect(loginSource).toContain('flash(500, 0, 255, 65)');
    });

    test('fadeOut após shake', () => {
      expect(loginSource).toContain('fadeOut(500');
    });

    test('transição para ConstructScene', () => {
      expect(loginSource).toContain("this.scene.start('ConstructScene')");
    });

    test('enterConstruct é o handler da pílula vermelha', () => {
      expect(loginSource).toContain('enterConstruct');
      expect(loginSource).toContain("'pointerdown'");
    });
  });

  describe('Pílula azul (fechar/escurecer)', () => {
    test('closeDarken com fadeOut', () => {
      expect(loginSource).toContain('closeDarken');
      expect(loginSource).toContain('fadeOut(1000');
    });
  });
});
