import Phaser from 'phaser';
import { StatusIndicator } from '@/client/objects/StatusIndicator';
import { SpeechBubble } from '@/client/objects/SpeechBubble';
import type { AgentVisualStatus } from '@/client/objects/StatusIndicator';

export type AnimationState = 'idle' | 'working' | 'walk-down' | 'walk-up' | 'walk-left' | 'walk-right';

const ANIMATION_TRANSITIONS: Record<AnimationState, AnimationState[]> = {
  'idle': ['working', 'walk-down', 'walk-up', 'walk-left', 'walk-right'],
  'working': ['idle', 'walk-down', 'walk-up', 'walk-left', 'walk-right'],
  'walk-down': ['idle', 'working', 'walk-up', 'walk-left', 'walk-right'],
  'walk-up': ['idle', 'working', 'walk-down', 'walk-left', 'walk-right'],
  'walk-left': ['idle', 'working', 'walk-down', 'walk-up', 'walk-right'],
  'walk-right': ['idle', 'working', 'walk-down', 'walk-up', 'walk-left'],
};

const SPRITE_WIDTH = 64;
const SPRITE_HEIGHT = 96;

export interface AgentConfig {
  agentId: string;
  x: number;
  y: number;
  spriteKey?: string;
  displayName?: string;
  alwaysSeated?: boolean;
  alpha?: number;
}

/**
 * Agent game object — extends Container with sprite, status indicator,
 * floating icon, and speech bubble.
 */
export class Agent extends Phaser.GameObjects.Container {
  readonly agentId: string;
  readonly alwaysSeated: boolean;
  private sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Rectangle | Phaser.GameObjects.Container;
  private statusIndicator: StatusIndicator;
  private floatingIcon: Phaser.GameObjects.Text;
  private speechBubble: SpeechBubble;
  private currentAnimation: AnimationState = 'idle';
  private currentTask: string | null = null;
  private lastSpeechText: string | null = null;

  constructor(scene: Phaser.Scene, config: AgentConfig) {
    super(scene, config.x, config.y);
    this.agentId = config.agentId;
    this.alwaysSeated = config.alwaysSeated ?? false;
    scene.add.existing(this);

    // Create sprite or procedural character
    if (config.spriteKey && scene.textures.exists(config.spriteKey)) {
      this.sprite = scene.add.sprite(0, 0, config.spriteKey);
    } else {
      // Procedural mini-character: head + body + distinct silhouette
      const color = this.getAgentColor(config.agentId);
      this.sprite = this.createProceduralSprite(scene, color, config.agentId);
    }
    this.add(this.sprite);

    // Apply custom alpha (e.g., Ghost transparency)
    if (config.alpha !== undefined) {
      this.setAlpha(config.alpha);
    }

    // Status indicator (glow around sprite)
    this.statusIndicator = new StatusIndicator(scene, SPRITE_WIDTH, SPRITE_HEIGHT);
    this.add(this.statusIndicator);

    // Floating icon above head
    this.floatingIcon = scene.add.text(0, -SPRITE_HEIGHT / 2 - 10, '', {
      fontSize: '8px',
      color: '#00FF41',
      fontFamily: 'monospace',
    }).setOrigin(0.5);
    this.add(this.floatingIcon);

    // Speech bubble
    this.speechBubble = new SpeechBubble(scene, -SPRITE_HEIGHT / 2 - 12);
    this.add(this.speechBubble);

    this.setDepth(3);

    // Make container interactive for click/hover
    this.setSize(SPRITE_WIDTH, SPRITE_HEIGHT);
    this.setInteractive({ useHandCursor: true });
  }

  // ── Animation State Machine ──

  getAnimationState(): AnimationState {
    return this.currentAnimation;
  }

  setAnimationState(state: AnimationState): boolean {
    if (this.currentAnimation === state) return true;

    // Block walking for always-seated agents (e.g., Operator)
    if (this.alwaysSeated && state.startsWith('walk-')) return false;

    const validTransitions = ANIMATION_TRANSITIONS[this.currentAnimation];
    if (!validTransitions.includes(state)) return false;

    this.currentAnimation = state;
    this.playAnimation(state);
    return true;
  }

  private playAnimation(state: AnimationState): void {
    if (this.sprite instanceof Phaser.GameObjects.Sprite) {
      const animKey = `${this.agentId}-${state}`;
      if (this.sprite.anims.exists(animKey)) {
        this.sprite.play(animKey);
      }
    }
  }

  // ── Status ──

  setStatus(status: AgentVisualStatus): void {
    this.statusIndicator.setStatus(status);
  }

  getStatus(): AgentVisualStatus {
    return this.statusIndicator.getStatus();
  }

  // ── Floating Icon ──

  setIcon(icon: string): void {
    this.floatingIcon.setText(icon);
  }

  clearIcon(): void {
    this.floatingIcon.setText('');
  }

  // ── Speech Bubble ──

  say(text: string, durationMs?: number): void {
    this.lastSpeechText = text;
    this.speechBubble.show(text, durationMs);
  }

  getLastSpeech(): string | null {
    return this.lastSpeechText;
  }

  silence(): void {
    this.speechBubble.hide();
  }

  isSpeaking(): boolean {
    return this.speechBubble.isShowing();
  }

  // ── Task ──

  setTask(task: string | null): void {
    this.currentTask = task;
    if (task) {
      this.setIcon('💻');
      this.setAnimationState('working');
    } else {
      this.clearIcon();
      this.setAnimationState('idle');
    }
  }

  getTask(): string | null {
    return this.currentTask;
  }

  // ── Position ──

  moveTo(x: number, y: number): boolean {
    if (this.alwaysSeated) return false;
    this.setPosition(x, y);
    return true;
  }

  // ── Color by agent role ──

  /**
   * Creates a procedural mini-character (32x48) with head, body, legs, and identity.
   * Placeholder until real Aseprite sprites are created.
   */
  private createProceduralSprite(
    scene: Phaser.Scene,
    color: number,
    agentId: string,
  ): Phaser.GameObjects.Container {
    const container = scene.add.container(0, 0);
    const gfx = scene.add.graphics();

    // Outline (dark border)
    gfx.fillStyle(0x0F0F1A, 1);
    gfx.fillCircle(0, -28, 18);          // Head outline
    gfx.fillRoundedRect(-20, -12, 40, 52, 6); // Body outline
    gfx.fillRect(-16, 36, 12, 16);       // Left leg outline
    gfx.fillRect(4, 36, 12, 16);         // Right leg outline

    // Body fill
    const bodyGfx = scene.add.graphics();
    bodyGfx.fillStyle(color, 1);
    bodyGfx.fillRoundedRect(-16, -8, 32, 44, 4);
    bodyGfx.fillStyle(0x1A1A2E, 1);      // Legs (dark pants)
    bodyGfx.fillRect(-12, 36, 8, 12);
    bodyGfx.fillRect(4, 36, 8, 12);

    // Head fill (skin tone)
    const headGfx = scene.add.graphics();
    const skinColor = this.getSkinColor(agentId);
    headGfx.fillStyle(skinColor, 1);
    headGfx.fillCircle(0, -28, 14);

    // Hair
    const hairGfx = scene.add.graphics();
    const hairColor = this.getHairColor(agentId);
    hairGfx.fillStyle(hairColor, 1);
    hairGfx.fillRect(-14, -44, 28, 12);  // top hair
    hairGfx.fillRect(-14, -44, 6, 20);   // left side
    hairGfx.fillRect(8, -44, 6, 20);     // right side

    // Eyes
    const eyeGfx = scene.add.graphics();
    const hasGlasses = ['dev', 'smith', 'pm', 'lmas-master'].includes(agentId);
    if (hasGlasses) {
      eyeGfx.fillStyle(0x222222, 1);
      eyeGfx.fillRect(-12, -32, 10, 6);
      eyeGfx.fillRect(2, -32, 10, 6);
      eyeGfx.fillStyle(0x88CCFF, 0.5);
      eyeGfx.fillRect(-10, -32, 4, 2);
      eyeGfx.fillRect(4, -32, 4, 2);
    } else {
      eyeGfx.fillStyle(0x000000, 1);
      eyeGfx.fillRect(-8, -32, 4, 4);
      eyeGfx.fillRect(4, -32, 4, 4);
      eyeGfx.fillStyle(0xFFFFFF, 1);
      eyeGfx.fillRect(-8, -32, 2, 2);
      eyeGfx.fillRect(4, -32, 2, 2);
    }

    container.add(gfx);
    container.add(bodyGfx);
    container.add(headGfx);
    container.add(hairGfx);
    container.add(eyeGfx);

    // Name label below feet
    const displayName = this.getShortName(agentId);
    const label = scene.add.text(0, 56, displayName, {
      fontSize: '10px',
      color: '#00FF41',
      fontFamily: 'monospace',
    }).setOrigin(0.5);
    container.add(label);

    return container as unknown as Phaser.GameObjects.Container;
  }

  private getSkinColor(agentId: string): number {
    const dark: string[] = ['qa', 'sm', 'analyst', 'data-engineer', 'marketing-chief', 'lmas-master'];
    return dark.includes(agentId) ? 0x8B6914 : 0xDEB887;
  }

  private getHairColor(agentId: string): number {
    const colors: Record<string, number> = {
      'dev': 0x1A1A1A,        // Neo: black slicked
      'qa': 0x8B7355,         // Oracle: gray-brown curly
      'architect': 0xDDDDDD,  // Architect: white
      'pm': 0x1A1A1A,         // Trinity: black short
      'po': 0xAAAAAA,         // Keymaker: gray wispy
      'sm': 0x1A1A1A,         // Niobe: black cropped
      'analyst': 0x1A1A1A,    // Link: black
      'data-engineer': 0x1A1A1A, // Tank: bald (minimal)
      'ux-design-expert': 0x1A1A1A, // Sati: dark
      'devops': 0x4A3A2A,     // Operator: brown
      'smith': 0x4A3A2A,      // Smith: brown slicked
      'lmas-master': 0x1A1A1A, // Morpheus: bald
      'marketing-chief': 0x1A1A1A, // Lock: cropped
      'copywriter': 0x6B4E2A, // Mouse: messy brown
      'social-media-manager': 0x1A1A1A, // Sparks: spiky
      'traffic-manager': 0x2A2A2A, // Merovingian: dark slicked
      'content-strategist': 0x1A1A1A, // Persephone: straight dark
      'content-researcher': 0x1A1A1A, // Ghost: hooded
      'content-reviewer': 0x1A1A1A,  // Seraph: dark
      'player': 0x4A3A2A,     // Player: brown
    };
    return colors[agentId] ?? 0x1A1A1A;
  }

  private getShortName(agentId: string): string {
    const names: Record<string, string> = {
      'dev': 'Neo', 'qa': 'Oracle', 'architect': 'Arch',
      'pm': 'Trinity', 'po': 'Key', 'sm': 'Niobe',
      'analyst': 'Link', 'data-engineer': 'Tank',
      'ux-design-expert': 'Sati', 'devops': 'Op',
      'smith': 'Smith', 'lmas-master': 'Morph',
      'marketing-chief': 'Lock', 'copywriter': 'Mouse',
      'social-media-manager': 'Sparks', 'traffic-manager': 'Merv',
      'content-strategist': 'Pers', 'content-researcher': 'Ghost',
      'content-reviewer': 'Seraph', 'player': 'You',
    };
    return names[agentId] ?? agentId;
  }

  private getAgentColor(agentId: string): number {
    const colors: Record<string, number> = {
      dev: 0x00FF41,
      qa: 0x0ABDC6,
      architect: 0x008F11,
      pm: 0xEA00D9,
      po: 0xFFD700,
      sm: 0xFF6B6B,
      analyst: 0x4ECDC4,
      'data-engineer': 0x45B7D1,
      'ux-design-expert': 0xF7DC6F,
      devops: 0xE74C3C,
      'marketing-chief': 0xFF8C00,
      copywriter: 0xDDA0DD,
      'social-media-manager': 0x87CEEB,
      'traffic-manager': 0xFFA500,
      'content-strategist': 0x9370DB,
      'content-researcher': 0x20B2AA,
      'content-reviewer': 0xCD853F,
      smith: 0xFF0000,
      'lmas-master': 0xFFFFFF,
      player: 0x00BFFF,
    };
    return colors[agentId] ?? 0x00FF41;
  }

  destroy(fromScene?: boolean): void {
    this.statusIndicator.destroy(fromScene);
    this.speechBubble.destroy(fromScene);
    super.destroy(fromScene);
  }
}
