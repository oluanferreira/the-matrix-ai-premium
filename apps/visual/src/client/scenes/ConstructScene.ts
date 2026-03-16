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
      // Click → abrir painel inspector
      agent.on('pointerdown', () => {
        this.inspectorPanel?.open(agent);
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

  update(): void {
    this.playerController?.update();
    this.morpheusCompanion?.update();
    this.cameraController?.update();
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
}
