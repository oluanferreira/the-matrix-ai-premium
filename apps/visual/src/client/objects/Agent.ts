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

const SPRITE_WIDTH = 16;
const SPRITE_HEIGHT = 32;

export interface AgentConfig {
  agentId: string;
  x: number;
  y: number;
  spriteKey?: string;
  displayName?: string;
}

/**
 * Agent game object — extends Container with sprite, status indicator,
 * floating icon, and speech bubble.
 */
export class Agent extends Phaser.GameObjects.Container {
  readonly agentId: string;
  private sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Rectangle;
  private statusIndicator: StatusIndicator;
  private floatingIcon: Phaser.GameObjects.Text;
  private speechBubble: SpeechBubble;
  private currentAnimation: AnimationState = 'idle';
  private currentTask: string | null = null;

  constructor(scene: Phaser.Scene, config: AgentConfig) {
    super(scene, config.x, config.y);
    this.agentId = config.agentId;
    scene.add.existing(this);

    // Create sprite or placeholder rectangle
    if (config.spriteKey && scene.textures.exists(config.spriteKey)) {
      this.sprite = scene.add.sprite(0, 0, config.spriteKey);
    } else {
      // Placeholder colored rectangle
      const color = this.getAgentColor(config.agentId);
      this.sprite = scene.add.rectangle(0, 0, SPRITE_WIDTH, SPRITE_HEIGHT, color);
    }
    this.add(this.sprite);

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
  }

  // ── Animation State Machine ──

  getAnimationState(): AnimationState {
    return this.currentAnimation;
  }

  setAnimationState(state: AnimationState): boolean {
    if (this.currentAnimation === state) return true;

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
    this.speechBubble.show(text, durationMs);
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

  moveTo(x: number, y: number): void {
    this.setPosition(x, y);
  }

  // ── Color by agent role ──

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
    };
    return colors[agentId] ?? 0x00FF41;
  }

  destroy(fromScene?: boolean): void {
    this.statusIndicator.destroy(fromScene);
    this.speechBubble.destroy(fromScene);
    super.destroy(fromScene);
  }
}
