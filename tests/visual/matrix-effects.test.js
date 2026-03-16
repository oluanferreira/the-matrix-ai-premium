const fs = require('fs');
const path = require('path');

const VISUAL_DIR = path.join(__dirname, '../../apps/visual');
const CLIENT_DIR = path.join(VISUAL_DIR, 'src/client');

describe('Story 5.3: Matrix Visual Effects', () => {
  let codeRainSource;
  let matrixEffectsSource;
  let constructSource;

  beforeAll(() => {
    codeRainSource = fs.readFileSync(
      path.join(CLIENT_DIR, 'objects/CodeRain.ts'), 'utf8',
    );
    matrixEffectsSource = fs.readFileSync(
      path.join(CLIENT_DIR, 'systems/MatrixEffects.ts'), 'utf8',
    );
    constructSource = fs.readFileSync(
      path.join(CLIENT_DIR, 'scenes/ConstructScene.ts'), 'utf8',
    );
  });

  // ─── Code Rain (AC: 1) ─────────────────────────────────────────────

  describe('Code Rain nas janelas (AC: 1)', () => {
    test('arquivo CodeRain.ts existe', () => {
      expect(fs.existsSync(path.join(CLIENT_DIR, 'objects/CodeRain.ts'))).toBe(true);
    });

    test('exporta classe CodeRain', () => {
      expect(codeRainSource).toContain('export class CodeRain');
    });

    test('caracteres katakana', () => {
      expect(codeRainSource).toContain('アイウエオ');
    });

    test('caracteres numéricos', () => {
      expect(codeRainSource).toContain('0123456789');
    });

    test('recebe windowAreas no constructor', () => {
      expect(codeRainSource).toContain('windowAreas');
    });

    test('colunas com velocidades variadas', () => {
      expect(codeRainSource).toContain('speed');
      expect(codeRainSource).toContain('Math.random()');
    });

    test('reseta coluna quando passa do fundo da janela', () => {
      expect(codeRainSource).toContain('area.y + area.height');
    });

    test('head character mais brilhante que tail', () => {
      expect(codeRainSource).toContain('brightness');
    });

    test('toggle enabled/disabled', () => {
      expect(codeRainSource).toContain('setEnabled');
      expect(codeRainSource).toContain('isEnabled');
    });

    test('método update()', () => {
      expect(codeRainSource).toContain('update(): void');
    });

    test('método destroy()', () => {
      expect(codeRainSource).toContain('destroy(): void');
    });
  });

  // ─── Particles (AC: 2) ─────────────────────────────────────────────

  describe('Partículas verdes (AC: 2)', () => {
    test('arquivo MatrixEffects.ts existe', () => {
      expect(fs.existsSync(path.join(CLIENT_DIR, 'systems/MatrixEffects.ts'))).toBe(true);
    });

    test('exporta classe MatrixEffects', () => {
      expect(matrixEffectsSource).toContain('export class MatrixEffects');
    });

    test('cria particle emitter', () => {
      expect(matrixEffectsSource).toContain('ParticleEmitter');
      expect(matrixEffectsSource).toContain('initParticles');
    });

    test('gera textura de partícula verde', () => {
      expect(matrixEffectsSource).toContain('matrix-particle');
      expect(matrixEffectsSource).toContain('generateTexture');
    });

    test('alpha baixo para sutileza', () => {
      expect(matrixEffectsSource).toContain('PARTICLE_ALPHA');
      expect(matrixEffectsSource).toContain('0.15');
    });

    test('blend mode ADD para brilho', () => {
      expect(matrixEffectsSource).toContain('BlendModes.ADD');
    });
  });

  // ─── Glitch Effect (AC: 3) ─────────────────────────────────────────

  describe('Glitch Effect (AC: 3)', () => {
    test('método triggerGlitch()', () => {
      expect(matrixEffectsSource).toContain('triggerGlitch(): void');
    });

    test('camera shake', () => {
      expect(matrixEffectsSource).toContain('camera.shake');
    });

    test('camera flash verde', () => {
      expect(matrixEffectsSource).toContain('camera.flash');
      expect(matrixEffectsSource).toContain('0, 255, 65');
    });

    test('duração do glitch (500ms)', () => {
      expect(matrixEffectsSource).toContain('GLITCH_DURATION_MS');
      expect(matrixEffectsSource).toContain('500');
    });

    test('chromatic offset (scroll shift)', () => {
      expect(matrixEffectsSource).toContain('camera.scrollX');
    });
  });

  // ─── Bullet Time (AC: 4) ───────────────────────────────────────────

  describe('Bullet Time / Slow Motion (AC: 4)', () => {
    test('método triggerBulletTime()', () => {
      expect(matrixEffectsSource).toContain('triggerBulletTime(): void');
    });

    test('reduz timeScale para slow motion', () => {
      expect(matrixEffectsSource).toContain('time.timeScale = 0.3');
    });

    test('restaura timeScale após duração', () => {
      expect(matrixEffectsSource).toContain('time.timeScale = 1');
    });

    test('duração de 2.5 segundos', () => {
      expect(matrixEffectsSource).toContain('BULLET_TIME_DURATION_MS');
      expect(matrixEffectsSource).toContain('2500');
    });

    test('vignette overlay escuro', () => {
      expect(matrixEffectsSource).toContain('vignette');
      expect(matrixEffectsSource).toContain('0x000000');
    });

    test('previne dupla ativação', () => {
      expect(matrixEffectsSource).toContain('if (this.isBulletTime) return');
    });

    test('getter getIsBulletTime()', () => {
      expect(matrixEffectsSource).toContain('getIsBulletTime()');
    });
  });

  // ─── CRT Scanlines (AC: 5) ─────────────────────────────────────────

  describe('CRT Scanlines (AC: 5)', () => {
    test('inicializa CRT overlay', () => {
      expect(matrixEffectsSource).toContain('initCRTScanlines');
      expect(matrixEffectsSource).toContain('crtOverlay');
    });

    test('scanlines horizontais a cada 2px', () => {
      expect(matrixEffectsSource).toContain('y += 2');
    });

    test('toggle on/off', () => {
      expect(matrixEffectsSource).toContain('toggleCRT(): void');
      expect(matrixEffectsSource).toContain('crtEnabled');
    });

    test('getter isCRTEnabled()', () => {
      expect(matrixEffectsSource).toContain('isCRTEnabled()');
    });

    test('scrollFactor 0 (fixed on camera)', () => {
      expect(matrixEffectsSource).toContain('setScrollFactor(0)');
    });

    test('depth alto para ficar acima do jogo', () => {
      expect(matrixEffectsSource).toContain('setDepth(100)');
    });

    test('tecla C ativa/desativa CRT na ConstructScene', () => {
      expect(constructSource).toContain('keydown-C');
      expect(constructSource).toContain('toggleCRT');
    });
  });

  // ─── Portal Glow (AC: 6) ───────────────────────────────────────────

  describe('Portal Glow nas portas (AC: 6)', () => {
    test('método createPortalGlow()', () => {
      expect(matrixEffectsSource).toContain('createPortalGlow');
    });

    test('cor verde Matrix', () => {
      expect(matrixEffectsSource).toContain('MATRIX_GREEN_HEX');
    });

    test('glow pulsante (tween yoyo repeat -1)', () => {
      expect(matrixEffectsSource).toContain('yoyo: true');
      expect(matrixEffectsSource).toContain('repeat: -1');
    });

    test('ConstructScene cria portal glow', () => {
      expect(constructSource).toContain('createPortalGlow');
    });
  });

  // ─── Digital Clock (AC: 7) ─────────────────────────────────────────

  describe('Relógio Digital (AC: 7)', () => {
    test('inicializa digital clock', () => {
      expect(matrixEffectsSource).toContain('initDigitalClock');
      expect(matrixEffectsSource).toContain('clockText');
    });

    test('formato HH:MM', () => {
      expect(matrixEffectsSource).toContain('getHours');
      expect(matrixEffectsSource).toContain('getMinutes');
      expect(matrixEffectsSource).toContain("padStart(2, '0')");
    });

    test('atualiza com hora real', () => {
      expect(matrixEffectsSource).toContain('new Date()');
      expect(matrixEffectsSource).toContain('updateClock');
    });

    test('fixed on camera (scrollFactor 0)', () => {
      expect(matrixEffectsSource).toContain('setScrollFactor(0)');
    });

    test('fonte verde monospace', () => {
      expect(matrixEffectsSource).toContain("color: '#00FF41'");
      expect(matrixEffectsSource).toContain('monospace');
    });
  });

  // ─── Sound Toggle (AC: 8, 9) ───────────────────────────────────────

  describe('Som ambiente (AC: 8, 9)', () => {
    test('toggle ambient sound', () => {
      expect(matrixEffectsSource).toContain('toggleAmbientSound(): void');
      expect(matrixEffectsSource).toContain('ambientEnabled');
    });

    test('getter isAmbientSoundEnabled()', () => {
      expect(matrixEffectsSource).toContain('isAmbientSoundEnabled()');
    });

    test('tecla N ativa/desativa som na ConstructScene', () => {
      expect(constructSource).toContain('keydown-N');
      expect(constructSource).toContain('toggleAmbientSound');
    });
  });

  // ─── ConstructScene Integration ────────────────────────────────────

  describe('ConstructScene Integration', () => {
    test('importa MatrixEffects', () => {
      expect(constructSource).toContain("import { MatrixEffects }");
    });

    test('importa CodeRain', () => {
      expect(constructSource).toContain("import { CodeRain }");
    });

    test('cria instância de MatrixEffects', () => {
      expect(constructSource).toContain('new MatrixEffects(');
    });

    test('cria instância de CodeRain', () => {
      expect(constructSource).toContain('new CodeRain(');
    });

    test('matrixEffects.init() chamado', () => {
      expect(constructSource).toContain('matrixEffects.init(');
    });

    test('matrixEffects.update() no loop', () => {
      expect(constructSource).toContain('this.matrixEffects?.update()');
    });

    test('codeRain.update() no loop', () => {
      expect(constructSource).toContain('this.codeRain?.update()');
    });

    test('getters getMatrixEffects() e getCodeRain()', () => {
      expect(constructSource).toContain('getMatrixEffects()');
      expect(constructSource).toContain('getCodeRain()');
    });

    test('define windowAreas para code rain', () => {
      expect(constructSource).toContain('windowAreas');
    });
  });

  // ─── Lifecycle ─────────────────────────────────────────────────────

  describe('Lifecycle', () => {
    test('MatrixEffects tem destroy()', () => {
      expect(matrixEffectsSource).toContain('destroy(): void');
    });

    test('CodeRain tem destroy()', () => {
      expect(codeRainSource).toContain('destroy(): void');
    });

    test('MatrixEffects tem update()', () => {
      expect(matrixEffectsSource).toContain('update(): void');
    });
  });
});
