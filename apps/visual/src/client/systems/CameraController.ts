import Phaser from 'phaser';

export interface CameraControllerConfig {
  mapWidth: number;
  mapHeight: number;
  dragSpeed?: number;
  zoomMin?: number;
  zoomMax?: number;
  zoomStep?: number;
  keyScrollSpeed?: number;
  followTarget?: Phaser.GameObjects.GameObject;
  followLerp?: number;
  initialZoom?: number;
}

/**
 * Camera controller for the Construct scene.
 * Supports: drag scroll, keyboard scroll (arrow keys), zoom, and auto-fit.
 */
export class CameraController {
  private scene: Phaser.Scene;
  private camera: Phaser.Cameras.Scene2D.Camera;
  private config: Required<CameraControllerConfig>;
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  private followTarget: Phaser.GameObjects.GameObject | null = null;

  constructor(scene: Phaser.Scene, config: CameraControllerConfig) {
    this.scene = scene;
    this.camera = scene.cameras.main;
    this.config = {
      mapWidth: config.mapWidth,
      mapHeight: config.mapHeight,
      dragSpeed: config.dragSpeed ?? 1,
      zoomMin: config.zoomMin ?? 0.5,
      zoomMax: config.zoomMax ?? 2,
      zoomStep: config.zoomStep ?? 0.1,
      keyScrollSpeed: config.keyScrollSpeed ?? 4,
      followTarget: config.followTarget ?? null,
      followLerp: config.followLerp ?? 0.1,
      initialZoom: config.initialZoom ?? 0,
    };

    this.setupBounds();
    this.setupZoom();

    if (config.followTarget) {
      this.startFollow(config.followTarget, config.followLerp);
      if (config.initialZoom) {
        this.camera.zoom = Phaser.Math.Clamp(config.initialZoom, this.config.zoomMin, this.config.zoomMax);
      }
    } else {
      this.setupDrag();
      this.setupKeyboard();
      this.fitToMap();
    }
  }

  private setupBounds(): void {
    this.camera.setBounds(0, 0, this.config.mapWidth, this.config.mapHeight);
  }

  private setupDrag(): void {
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.middleButtonDown() || pointer.rightButtonDown()) {
        this.isDragging = true;
        this.dragStartX = pointer.x;
        this.dragStartY = pointer.y;
      }
    });

    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        const dx = (this.dragStartX - pointer.x) * this.config.dragSpeed / this.camera.zoom;
        const dy = (this.dragStartY - pointer.y) * this.config.dragSpeed / this.camera.zoom;
        this.camera.scrollX += dx;
        this.camera.scrollY += dy;
        this.dragStartX = pointer.x;
        this.dragStartY = pointer.y;
      }
    });

    this.scene.input.on('pointerup', () => {
      this.isDragging = false;
    });
  }

  private setupZoom(): void {
    this.scene.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: unknown[], _deltaX: number, deltaY: number) => {
      const newZoom = this.camera.zoom - (deltaY > 0 ? this.config.zoomStep : -this.config.zoomStep);
      this.camera.zoom = Phaser.Math.Clamp(newZoom, this.config.zoomMin, this.config.zoomMax);
    });
  }

  private setupKeyboard(): void {
    if (this.scene.input.keyboard) {
      this.cursors = this.scene.input.keyboard.createCursorKeys();
    }
  }

  /**
   * Zoom to fit the entire map in the viewport.
   */
  fitToMap(): void {
    const scaleX = this.camera.width / this.config.mapWidth;
    const scaleY = this.camera.height / this.config.mapHeight;
    const fitZoom = Math.min(scaleX, scaleY);
    this.camera.zoom = Phaser.Math.Clamp(fitZoom, this.config.zoomMin, this.config.zoomMax);
    this.camera.centerOn(this.config.mapWidth / 2, this.config.mapHeight / 2);
  }

  /**
   * Call in scene update() for keyboard scrolling.
   */
  update(): void {
    if (!this.cursors) return;

    const speed = this.config.keyScrollSpeed / this.camera.zoom;

    if (this.cursors.left.isDown) this.camera.scrollX -= speed;
    if (this.cursors.right.isDown) this.camera.scrollX += speed;
    if (this.cursors.up.isDown) this.camera.scrollY -= speed;
    if (this.cursors.down.isDown) this.camera.scrollY += speed;
  }

  /**
   * Camera follows a game object (e.g., player character).
   */
  startFollow(target: Phaser.GameObjects.GameObject, lerp?: number): void {
    this.followTarget = target;
    this.camera.startFollow(target, true, lerp ?? this.config.followLerp, lerp ?? this.config.followLerp);
  }

  /**
   * Stop following and return to free camera.
   */
  stopFollow(): void {
    this.followTarget = null;
    this.camera.stopFollow();
  }

  /**
   * Center camera on a specific world position.
   */
  centerOn(x: number, y: number): void {
    this.camera.centerOn(x, y);
  }

  destroy(): void {
    this.scene.input.off('pointerdown');
    this.scene.input.off('pointermove');
    this.scene.input.off('pointerup');
    this.scene.input.off('wheel');
  }
}
