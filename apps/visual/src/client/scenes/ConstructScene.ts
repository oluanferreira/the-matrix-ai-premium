import Phaser from 'phaser';
import { LDtkParser } from '@/client/systems/LDtkParser';
import { CameraController } from '@/client/systems/CameraController';
import { PlayerController } from '@/client/systems/PlayerController';
import { AgentFactory } from '@/client/objects/AgentFactory';
import { Agent } from '@/client/objects/Agent';
import { MorpheusCompanion } from '@/client/objects/MorpheusCompanion';
import { InspectorPanel } from '@/client/ui/InspectorPanel';
import { AgentTooltip } from '@/client/ui/AgentTooltip';
import { ColonistBar } from '@/client/ui/ColonistBar';
import { ActivityFeed } from '@/client/ui/ActivityFeed';
import { CommandScreen } from '@/client/ui/CommandScreen';
import { DeliveryScreen } from '@/client/ui/DeliveryScreen';
import { InteractionBubble } from '@/client/ui/InteractionBubble';
import { ProximityDetector } from '@/client/systems/ProximityDetector';
import { MatrixEffects } from '@/client/systems/MatrixEffects';
import { CodeRain } from '@/client/objects/CodeRain';
import { AGENT_CONFIG_MAP } from '@/client/data/agent-config';
import { AGENT_IDS } from '@/shared/agent-ids';
import type { LDtkProject, AgentSpawn } from '@/client/systems/LDtkParser';

/**
 * Cena principal — renderiza o tilemap do escritório a partir dos dados LDtk.
 * O player é o avatar do dono (não um agente LMAS).
 * Morpheus é um NPC companheiro que acompanha o player.
 */
export class ConstructScene extends Phaser.Scene {
  private cameraController: CameraController | null = null;
  private playerController: PlayerController | null = null;
  private morpheusCompanion: MorpheusCompanion | null = null;
  private playerAvatar: Agent | null = null;
  private agentFactory: AgentFactory | null = null;
  private inspectorPanel: InspectorPanel | null = null;
  private agentTooltip: AgentTooltip | null = null;
  private colonistBar: ColonistBar | null = null;
  private activityFeed: ActivityFeed | null = null;
  private commandScreen: CommandScreen | null = null;
  private deliveryScreen: DeliveryScreen | null = null;
  private interactionBubble: InteractionBubble | null = null;
  private proximityDetector: ProximityDetector | null = null;
  private matrixEffects: MatrixEffects | null = null;
  private codeRain: CodeRain | null = null;
  private doorZone: Phaser.GameObjects.Zone | null = null;
  private doorGlow: Phaser.GameObjects.Graphics | null = null;
  private doorHint: Phaser.GameObjects.Text | null = null;
  private agentSpawns: AgentSpawn[] = [];
  private collisionGrid: boolean[][] = [];

  constructor() {
    super({ key: 'ConstructScene' });
  }

  preload(): void {
    this.load.image('tileset', '/assets/tilesets/placeholder-tileset.png');
    this.load.json('office-map', '/assets/tilesets/office.ldtk.json');
  }

  create(): void {
    const mapData = this.cache.json.get('office-map') as LDtkProject;
    const level = mapData.levels[0];

    if (!level) {
      console.error('[ConstructScene] Nenhum nível encontrado nos dados do mapa');
      return;
    }

    const parser = new LDtkParser(this, 'tileset');

    // Renderizar layers em ordem (fundo para frente)
    const floorLayer = parser.findLayer(level, 'Floor');
    const furnitureLayer = parser.findLayer(level, 'Furniture');
    const wallsLayer = parser.findLayer(level, 'Walls');
    const collisionsLayer = parser.findLayer(level, 'Collisions');
    const spawnsLayer = parser.findLayer(level, 'AgentSpawns');

    if (floorLayer) parser.renderTileLayer(floorLayer, 0);
    if (furnitureLayer) parser.renderTileLayer(furnitureLayer, 1);
    if (wallsLayer) parser.renderTileLayer(wallsLayer, 2);

    // Parsear dados de colisão para pathfinding
    if (collisionsLayer) {
      this.collisionGrid = parser.parseCollisions(collisionsLayer);
    }

    // Parsear pontos de spawn dos agentes
    if (spawnsLayer) {
      this.agentSpawns = parser.parseAgentSpawns(spawnsLayer);
      console.log(`[ConstructScene] ${this.agentSpawns.length} spawns de agentes carregados`);
    }

    // Criar agentes nos pontos de spawn
    this.agentFactory = new AgentFactory(this);
    if (this.agentSpawns.length > 0) {
      this.agentFactory.createFromSpawns(this.agentSpawns);
    } else {
      this.agentFactory.createAllAgents();
    }
    console.log(`[ConstructScene] ${this.agentFactory.getAgentCount()} agentes criados`);

    // Aplicar config de exibição para todos os agentes
    for (const [agentId, config] of Object.entries(AGENT_CONFIG_MAP)) {
      const agent = this.agentFactory.getAgent(agentId);
      if (agent) {
        agent.setIcon(config.displayName.charAt(0));
      }
    }

    // Setup UI overlays
    this.inspectorPanel = new InspectorPanel();
    this.agentTooltip = new AgentTooltip();
    this.activityFeed = new ActivityFeed();
    this.colonistBar = new ColonistBar({
      onAgentClick: (agentId) => {
        const agent = this.agentFactory?.getAgent(agentId);
        if (agent) {
          this.cameraController?.centerOn(agent.x, agent.y);
        }
      },
      onAgentFilter: (agentId) => {
        this.activityFeed?.setFilter(agentId);
      },
    });
    this.setupAgentInteraction();

    // Criar avatar do player (o dono — NÃO é um agente LMAS)
    const spawnX = level.pxWid / 2;
    const spawnY = level.pxHei / 2;
    this.playerAvatar = new Agent(this, {
      agentId: 'player',
      x: spawnX,
      y: spawnY,
    });
    this.playerAvatar.setIcon('👤');
    this.playerAvatar.setDepth(5);

    // Setup controle do player (WASD/setas)
    this.playerController = new PlayerController(this, this.playerAvatar, {
      collisionGrid: this.collisionGrid,
      mapWidth: level.pxWid,
      mapHeight: level.pxHei,
    });

    // Morpheus = NPC companheiro que segue o player
    const morpheus = this.agentFactory.getAgent(AGENT_IDS.MORPHEUS);
    if (morpheus) {
      this.morpheusCompanion = new MorpheusCompanion(morpheus, this.playerAvatar);
    }

    // Câmera segue o avatar do player
    this.cameraController = new CameraController(this, {
      mapWidth: level.pxWid,
      mapHeight: level.pxHei,
      followTarget: this.playerAvatar,
      followLerp: 0.1,
      initialZoom: 2,
    });

    // Matrix Visual Effects (Story 5.3)
    this.matrixEffects = new MatrixEffects(this);
    this.matrixEffects.init(level.pxWid, level.pxHei);

    // Code rain in window areas (Story 5.3 AC: 1)
    const windowAreas = [
      { x: 16, y: 8, width: 32, height: 24 },
      { x: level.pxWid - 48, y: 8, width: 32, height: 24 },
      { x: level.pxWid / 2 - 16, y: 8, width: 32, height: 24 },
    ];
    this.codeRain = new CodeRain(this, windowAreas);

    // Portal glow on doors (Story 5.3 AC: 6)
    this.matrixEffects.createPortalGlow(level.pxWid / 2 - 6, 16, 12, 16);

    // Toggle CRT with C key, ambient with N key
    this.input.keyboard?.on('keydown-C', () => {
      this.matrixEffects?.toggleCRT();
    });
    this.input.keyboard?.on('keydown-N', () => {
      this.matrixEffects?.toggleAmbientSound();
    });

    // Morpheus Room — Command Center (Story 4.4)
    this.commandScreen = new CommandScreen();
    this.setupMorpheusRoomDoor(level.pxWid);

    // Delivery Screen + Proximity Interaction (Story 4.5)
    this.deliveryScreen = new DeliveryScreen();
    this.interactionBubble = new InteractionBubble(this, (agentId) => {
      this.openDeliveryForAgent(agentId);
    });
    this.setupProximityDetector();

    // Tecla M abre/fecha Morpheus Room
    this.input.keyboard?.on('keydown-M', () => {
      this.commandScreen?.toggle();
    });

    // Click em área vazia fecha inspector
    this.input.on('pointerdown', (_pointer: Phaser.Input.Pointer, gameObjects: Phaser.GameObjects.GameObject[]) => {
      if (gameObjects.length === 0) {
        this.inspectorPanel?.close();
      }
    });

    console.log(`[ConstructScene] Mapa carregado: ${level.pxWid}x${level.pxHei}px`);
  }

  private setupAgentInteraction(): void {
    if (!this.agentFactory) return;

    for (const [, agent] of this.agentFactory.getAllAgents()) {
      // Click → abrir DeliveryScreen (Story 4.5 AC: 3)
      agent.on('pointerdown', () => {
        this.openDeliveryForAgent(agent.agentId);
        this.agentTooltip?.hide();
      });

      // Hover → mostrar tooltip
      agent.on('pointerover', (pointer: Phaser.Input.Pointer) => {
        this.agentTooltip?.show(
          agent.agentId,
          agent.getStatus(),
          pointer.event.clientX,
          pointer.event.clientY,
        );
      });

      agent.on('pointermove', (pointer: Phaser.Input.Pointer) => {
        this.agentTooltip?.show(
          agent.agentId,
          agent.getStatus(),
          pointer.event.clientX,
          pointer.event.clientY,
        );
      });

      agent.on('pointerout', () => {
        this.agentTooltip?.hide();
      });
    }
  }

  /**
   * Setup proximity detector for player↔agent interaction (Story 4.5 AC: 1).
   */
  private setupProximityDetector(): void {
    if (!this.playerAvatar || !this.agentFactory) return;

    this.proximityDetector = new ProximityDetector(
      this.playerAvatar,
      this.agentFactory.getAllAgents(),
      // onEnter: show "..." bubble
      (event) => {
        this.interactionBubble?.show(event.agentId, event.agent.x, event.agent.y);
      },
      // onLeave: hide "..." bubble
      (agentId) => {
        this.interactionBubble?.hide(agentId);
      },
    );
  }

  /**
   * Open DeliveryScreen for a specific agent (Story 4.5 AC: 3, 4).
   */
  private openDeliveryForAgent(agentId: string): void {
    const agent = this.agentFactory?.getAgent(agentId);
    if (!agent) return;

    this.deliveryScreen?.open(agentId, {
      task: agent.getCurrentTask?.() ?? undefined,
      speech: agent.getLastSpeech?.() ?? undefined,
    });
  }

  /**
   * Creates the Morpheus Room door in the central corridor with green glow (AC: 1).
   * Door is placed at center-top of the map.
   */
  private setupMorpheusRoomDoor(mapWidth: number): void {
    const doorX = mapWidth / 2;
    const doorY = 24; // Top of the corridor

    // Green glow effect on the door
    this.doorGlow = this.add.graphics();
    this.doorGlow.setDepth(3);
    this.animateDoorGlow(doorX, doorY);

    // Interaction zone around the door
    this.doorZone = this.add.zone(doorX, doorY, 24, 24);
    this.doorZone.setInteractive();
    this.doorZone.on('pointerdown', () => {
      this.commandScreen?.open();
    });

    // Hint text (shows when player is near)
    this.doorHint = this.add.text(doorX, doorY + 14, '[M] Morpheus Room', {
      fontSize: '5px',
      color: '#00FF41',
      fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(10).setAlpha(0);
  }

  private animateDoorGlow(x: number, y: number): void {
    if (!this.doorGlow) return;

    // Pulsating green glow
    this.tweens.add({
      targets: { alpha: 0.3 },
      alpha: 0.8,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      onUpdate: (_tween, target) => {
        this.doorGlow?.clear();
        this.doorGlow?.fillStyle(0x00FF41, target.alpha as number);
        this.doorGlow?.fillRect(x - 6, y - 8, 12, 16);
      },
    });
  }

  update(): void {
    this.playerController?.update();
    this.morpheusCompanion?.update();
    this.cameraController?.update();
    this.proximityDetector?.update();
    this.matrixEffects?.update();
    this.codeRain?.update();

    // Show door hint when player is near (Story 4.4 AC: 1)
    if (this.playerAvatar && this.doorHint) {
      const doorX = this.doorHint.x;
      const doorY = this.doorHint.y - 14;
      const dist = Phaser.Math.Distance.Between(
        this.playerAvatar.x, this.playerAvatar.y, doorX, doorY,
      );
      this.doorHint.setAlpha(dist < 32 ? 1 : 0);
    }
  }

  getAgentSpawns(): AgentSpawn[] {
    return this.agentSpawns;
  }

  getCollisionGrid(): boolean[][] {
    return this.collisionGrid;
  }

  getAgentFactory(): AgentFactory | null {
    return this.agentFactory;
  }

  getAgent(agentId: string): Agent | undefined {
    return this.agentFactory?.getAgent(agentId);
  }

  getPlayerAvatar(): Agent | null {
    return this.playerAvatar;
  }

  getMorpheusCompanion(): MorpheusCompanion | null {
    return this.morpheusCompanion;
  }

  getCommandScreen(): CommandScreen | null {
    return this.commandScreen;
  }

  getDeliveryScreen(): DeliveryScreen | null {
    return this.deliveryScreen;
  }

  getProximityDetector(): ProximityDetector | null {
    return this.proximityDetector;
  }

  getInteractionBubble(): InteractionBubble | null {
    return this.interactionBubble;
  }

  getMatrixEffects(): MatrixEffects | null {
    return this.matrixEffects;
  }

  getCodeRain(): CodeRain | null {
    return this.codeRain;
  }
}
