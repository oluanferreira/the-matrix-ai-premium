import Phaser from 'phaser';

const MATRIX_GREEN_HEX = 0x00FF41;
const CRT_ALPHA = 0.08;
const PARTICLE_ALPHA = 0.15;
const BULLET_TIME_DURATION_MS = 2500;
const GLITCH_DURATION_MS = 500;

/**
 * Matrix Visual Effects system — manages all ambient effects.
 * Story 5.3: CRT scanlines, particles, glitch, bullet time, portal glow, digital clock.
 */
export class MatrixEffects {
  private scene: Phaser.Scene;

  // CRT Scanlines (AC: 5)
  private crtOverlay: Phaser.GameObjects.Graphics | null = null;
  private crtEnabled = false;

  // Particles (AC: 2)
  private particleEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

  // Bullet time state (AC: 4)
  private isBulletTime = false;

  // Portal glow graphics (AC: 6)
  private portalGraphics: Phaser.GameObjects.Graphics | null = null;

  // Digital clock (AC: 7)
  private clockText: Phaser.GameObjects.Text | null = null;

  // Audio (AC: 8, 9)
  private ambientEnabled = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Initialize all effect systems.
   */
  init(mapWidth: number, mapHeight: number): void {
    this.initCRTScanlines();
    this.initParticles(mapWidth, mapHeight);
    this.initDigitalClock();
  }

  // ─── CRT Scanlines (AC: 5) ──────────────────────────────────────

  private initCRTScanlines(): void {
    const { width, height } = this.scene.cameras.main;
    this.crtOverlay = this.scene.add.graphics();
    this.crtOverlay.setScrollFactor(0);
    this.crtOverlay.setDepth(100);
    this.crtOverlay.setAlpha(0); // Hidden by default

    // Draw horizontal scanlines
    this.crtOverlay.fillStyle(0x000000, CRT_ALPHA);
    for (let y = 0; y < height; y += 2) {
      this.crtOverlay.fillRect(0, y, width, 1);
    }
  }

  toggleCRT(): void {
    this.crtEnabled = !this.crtEnabled;
    this.crtOverlay?.setAlpha(this.crtEnabled ? 1 : 0);
  }

  isCRTEnabled(): boolean {
    return this.crtEnabled;
  }

  // ─── Particles (AC: 2) ──────────────────────────────────────────

  private initParticles(mapWidth: number, mapHeight: number): void {
    // Create a small green particle texture
    const gfx = this.scene.add.graphics();
    gfx.fillStyle(MATRIX_GREEN_HEX, 1);
    gfx.fillRect(0, 0, 2, 2);
    gfx.generateTexture('matrix-particle', 2, 2);
    gfx.destroy();

    this.particleEmitter = this.scene.add.particles(0, 0, 'matrix-particle', {
      x: { min: 0, max: mapWidth },
      y: { min: 0, max: mapHeight },
      lifespan: 4000,
      speed: { min: 2, max: 8 },
      alpha: { start: PARTICLE_ALPHA, end: 0 },
      scale: { start: 1, end: 0.5 },
      frequency: 200,
      quantity: 1,
      blendMode: Phaser.BlendModes.ADD,
    });
    this.particleEmitter.setDepth(3);
  }

  // ─── Glitch Effect (AC: 3) ──────────────────────────────────────

  triggerGlitch(): void {
    const camera = this.scene.cameras.main;

    // Quick shake + flash
    camera.shake(GLITCH_DURATION_MS, 0.01);
    camera.flash(GLITCH_DURATION_MS / 2, 0, 255, 65, true);

    // Chromatic-like offset (shift camera briefly)
    const originalX = camera.scrollX;
    this.scene.time.delayedCall(100, () => {
      camera.scrollX = originalX + 2;
    });
    this.scene.time.delayedCall(200, () => {
      camera.scrollX = originalX - 1;
    });
    this.scene.time.delayedCall(GLITCH_DURATION_MS, () => {
      camera.scrollX = originalX;
    });
  }

  // ─── Bullet Time (AC: 4) ────────────────────────────────────────

  triggerBulletTime(): void {
    if (this.isBulletTime) return;
    this.isBulletTime = true;

    // Slow motion: reduce game time scale
    this.scene.time.timeScale = 0.3;
    this.scene.cameras.main.shake(300, 0.005);

    // Visual overlay — dark vignette
    const { width, height } = this.scene.cameras.main;
    const vignette = this.scene.add.graphics();
    vignette.setScrollFactor(0);
    vignette.setDepth(99);
    vignette.fillStyle(0x000000, 0.3);
    vignette.fillRect(0, 0, width, height);
    vignette.setAlpha(0);

    this.scene.tweens.add({
      targets: vignette,
      alpha: 1,
      duration: 300,
      yoyo: true,
      hold: BULLET_TIME_DURATION_MS - 600,
      onComplete: () => {
        vignette.destroy();
        this.scene.time.timeScale = 1;
        this.isBulletTime = false;
      },
    });
  }

  getIsBulletTime(): boolean {
    return this.isBulletTime;
  }

  // ─── Portal Glow (AC: 6) ────────────────────────────────────────

  createPortalGlow(x: number, y: number, width: number, height: number): void {
    if (!this.portalGraphics) {
      this.portalGraphics = this.scene.add.graphics();
      this.portalGraphics.setDepth(2);
    }

    this.portalGraphics.fillStyle(MATRIX_GREEN_HEX, 0.15);
    this.portalGraphics.fillRect(x, y, width, height);
    this.portalGraphics.lineStyle(1, MATRIX_GREEN_HEX, 0.4);
    this.portalGraphics.strokeRect(x, y, width, height);

    // Pulsating glow
    this.scene.tweens.add({
      targets: { alpha: 0.15 },
      alpha: 0.35,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      onUpdate: (_tween, target) => {
        this.portalGraphics?.clear();
        this.portalGraphics?.fillStyle(MATRIX_GREEN_HEX, target.alpha as number);
        this.portalGraphics?.fillRect(x, y, width, height);
        this.portalGraphics?.lineStyle(1, MATRIX_GREEN_HEX, (target.alpha as number) * 2);
        this.portalGraphics?.strokeRect(x, y, width, height);
      },
    });
  }

  // ─── Digital Clock (AC: 7) ──────────────────────────────────────

  private initDigitalClock(): void {
    this.clockText = this.scene.add.text(4, 2, '', {
      fontSize: '6px',
      color: '#00FF41',
      fontFamily: 'monospace',
    });
    this.clockText.setScrollFactor(0);
    this.clockText.setDepth(50);
    this.clockText.setAlpha(0.7);
  }

  updateClock(): void {
    if (!this.clockText) return;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    this.clockText.setText(`${hh}:${mm}`);
  }

  // ─── Ambient Sound Toggle (AC: 8, 9) ────────────────────────────

  toggleAmbientSound(): void {
    this.ambientEnabled = !this.ambientEnabled;
    // Audio loading/playback deferred — requires actual .ogg assets
    // In v1.0, this is a toggle flag only. Audio implementation in v2.0.
    console.log(`[MatrixEffects] Ambient sound: ${this.ambientEnabled ? 'ON' : 'OFF'}`);
  }

  isAmbientSoundEnabled(): boolean {
    return this.ambientEnabled;
  }

  // ─── Lifecycle ──────────────────────────────────────────────────

  update(): void {
    this.updateClock();
  }

  destroy(): void {
    this.crtOverlay?.destroy();
    this.particleEmitter?.destroy();
    this.portalGraphics?.destroy();
    this.clockText?.destroy();
  }
}
