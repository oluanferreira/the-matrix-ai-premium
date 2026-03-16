const fs = require('fs');
const path = require('path');

const VISUAL_DIR = path.join(__dirname, '../../apps/visual');
const CLIENT_DIR = path.join(VISUAL_DIR, 'src/client');

describe('Story 4.5: Proximity Interaction & Delivery Screen', () => {
  let proximitySource;
  let bubbleSource;
  let deliverySource;
  let constructSource;

  beforeAll(() => {
    proximitySource = fs.readFileSync(
      path.join(CLIENT_DIR, 'systems/ProximityDetector.ts'), 'utf8',
    );
    bubbleSource = fs.readFileSync(
      path.join(CLIENT_DIR, 'ui/InteractionBubble.ts'), 'utf8',
    );
    deliverySource = fs.readFileSync(
      path.join(CLIENT_DIR, 'ui/DeliveryScreen.ts'), 'utf8',
    );
    constructSource = fs.readFileSync(
      path.join(CLIENT_DIR, 'scenes/ConstructScene.ts'), 'utf8',
    );
  });

  // ─── ProximityDetector (AC: 1) ─────────────────────────────────────

  describe('ProximityDetector (AC: 1)', () => {
    test('arquivo ProximityDetector.ts existe', () => {
      expect(fs.existsSync(
        path.join(CLIENT_DIR, 'systems/ProximityDetector.ts'),
      )).toBe(true);
    });

    test('exporta classe ProximityDetector', () => {
      expect(proximitySource).toContain('export class ProximityDetector');
    });

    test('exporta interface ProximityEvent', () => {
      expect(proximitySource).toContain('export interface ProximityEvent');
    });

    test('threshold de proximidade 48px', () => {
      expect(proximitySource).toContain('PROXIMITY_THRESHOLD');
      expect(proximitySource).toContain('48');
    });

    test('recebe player e agents no constructor', () => {
      expect(proximitySource).toContain('player: Agent');
      expect(proximitySource).toContain('agents: Map<string, Agent>');
    });

    test('callbacks onEnter e onLeave', () => {
      expect(proximitySource).toContain('onEnter');
      expect(proximitySource).toContain('onLeave');
    });

    test('método update() verifica distância a cada frame', () => {
      expect(proximitySource).toContain('update(): void');
      expect(proximitySource).toContain('distanceTo');
    });

    test('calcula distância euclidiana', () => {
      expect(proximitySource).toContain('Math.sqrt');
    });

    test('rastreia agentes próximos', () => {
      expect(proximitySource).toContain('nearbyAgents');
    });

    test('método isNearby()', () => {
      expect(proximitySource).toContain('isNearby(agentId: string)');
    });

    test('método getNearbyAgents()', () => {
      expect(proximitySource).toContain('getNearbyAgents()');
    });

    test('ignora player no loop', () => {
      expect(proximitySource).toContain("agentId === 'player'");
    });
  });

  // ─── InteractionBubble (AC: 1, 2) ──────────────────────────────────

  describe('InteractionBubble — balão "..." (AC: 1, 2)', () => {
    test('arquivo InteractionBubble.ts existe', () => {
      expect(fs.existsSync(
        path.join(CLIENT_DIR, 'ui/InteractionBubble.ts'),
      )).toBe(true);
    });

    test('exporta classe InteractionBubble', () => {
      expect(bubbleSource).toContain('export class InteractionBubble');
    });

    test('mostra "..." como texto', () => {
      expect(bubbleSource).toContain("'...'");
    });

    test('estilo Matrix (fundo escuro, borda verde)', () => {
      expect(bubbleSource).toContain('0x0D0208');
      expect(bubbleSource).toContain('0x00FF41');
    });

    test('animação flutuante (tween yoyo)', () => {
      expect(bubbleSource).toContain('yoyo: true');
      expect(bubbleSource).toContain('Sine.easeInOut');
    });

    test('clicável — dispara onClick', () => {
      expect(bubbleSource).toContain('setInteractive');
      expect(bubbleSource).toContain('pointerdown');
      expect(bubbleSource).toContain('this.onClick(agentId)');
    });

    test('hover scale effect', () => {
      expect(bubbleSource).toContain('pointerover');
      expect(bubbleSource).toContain('setScale(1.2)');
    });

    test('método show(agentId, x, y)', () => {
      expect(bubbleSource).toContain('show(agentId: string');
    });

    test('método hide(agentId)', () => {
      expect(bubbleSource).toContain('hide(agentId: string)');
    });

    test('método hideAll()', () => {
      expect(bubbleSource).toContain('hideAll()');
    });

    test('método isVisible()', () => {
      expect(bubbleSource).toContain('isVisible(agentId: string)');
    });

    test('método updatePosition()', () => {
      expect(bubbleSource).toContain('updatePosition');
    });

    test('método destroy()', () => {
      expect(bubbleSource).toContain('destroy()');
    });

    test('usa containers Phaser para cada bubble', () => {
      expect(bubbleSource).toContain('Phaser.GameObjects.Container');
      expect(bubbleSource).toContain('bubbles: Map');
    });
  });

  // ─── DeliveryScreen (AC: 4, 5, 8, 9) ──────────────────────────────

  describe('DeliveryScreen (AC: 4, 5, 8, 9)', () => {
    test('arquivo DeliveryScreen.ts existe', () => {
      expect(fs.existsSync(
        path.join(CLIENT_DIR, 'ui/DeliveryScreen.ts'),
      )).toBe(true);
    });

    test('exporta classe DeliveryScreen', () => {
      expect(deliverySource).toContain('export class DeliveryScreen');
    });

    test('overlay grande (80vw x 90vh) (AC: 8)', () => {
      expect(deliverySource).toContain('80vw');
      expect(deliverySource).toContain('90vh');
    });

    test('estilo terminal Matrix', () => {
      expect(deliverySource).toContain('#0D0208');
      expect(deliverySource).toContain('#00FF41');
      expect(deliverySource).toContain('monospace');
    });

    test('z-index alto (3000)', () => {
      expect(deliverySource).toContain('3000');
    });

    test('glow shadow verde', () => {
      expect(deliverySource).toContain('boxShadow');
      expect(deliverySource).toContain('rgba(0, 255, 65');
    });
  });

  // ─── DeliveryScreen: Agent Name (AC: 4) ────────────────────────────

  describe('DeliveryScreen — Agent Info (AC: 4)', () => {
    test('mostra agentId', () => {
      expect(deliverySource).toContain('data.agentId');
    });

    test('mostra displayName', () => {
      expect(deliverySource).toContain('data.displayName');
    });

    test('mostra matrixName e role', () => {
      expect(deliverySource).toContain('data.matrixName');
      expect(deliverySource).toContain('data.role');
    });

    test('usa AGENT_CONFIG_MAP para dados do agente', () => {
      expect(deliverySource).toContain('AGENT_CONFIG_MAP');
    });
  });

  // ─── DeliveryScreen: Delivery Content (AC: 4, 8) ──────────────────

  describe('DeliveryScreen — Entrega (AC: 4, 8)', () => {
    test('seção ENTREGA', () => {
      expect(deliverySource).toContain('ENTREGA');
    });

    test('conteúdo scrollável', () => {
      expect(deliverySource).toContain('overflow-y: auto');
      expect(deliverySource).toContain('max-height: 40vh');
    });

    test('texto preserva whitespace (pre-wrap)', () => {
      expect(deliverySource).toContain('white-space: pre-wrap');
    });

    test('mostra task atual', () => {
      expect(deliverySource).toContain('currentTask');
    });

    test('mensagem quando sem entrega', () => {
      expect(deliverySource).toContain('Nenhuma entrega disponível');
    });
  });

  // ─── DeliveryScreen: Chat (AC: 4, 5) ──────────────────────────────

  describe('DeliveryScreen — Chat (AC: 4, 5)', () => {
    test('seção CHAT', () => {
      expect(deliverySource).toContain('CHAT');
    });

    test('input de texto para feedback', () => {
      expect(deliverySource).toContain('delivery-chat-input');
      expect(deliverySource).toContain('Digitar feedback');
    });

    test('botão Enviar', () => {
      expect(deliverySource).toContain('delivery-send-btn');
      expect(deliverySource).toContain('[Enviar]');
    });

    test('Enter envia mensagem', () => {
      expect(deliverySource).toContain("e.key === 'Enter'");
      expect(deliverySource).toContain('sendMessage');
    });

    test('mostra última fala do agente', () => {
      expect(deliverySource).toContain('lastSpeech');
    });
  });

  // ─── DeliveryScreen: Action Buttons (AC: 5) ────────────────────────

  describe('DeliveryScreen — Botões de Ação (AC: 5)', () => {
    test('botão Aprovar', () => {
      expect(deliverySource).toContain('delivery-approve-btn');
      expect(deliverySource).toContain('Aprovar');
    });

    test('botão Recusar', () => {
      expect(deliverySource).toContain('delivery-reject-btn');
      expect(deliverySource).toContain('Recusar');
    });

    test('approve dispara onAction com "approve"', () => {
      expect(deliverySource).toContain("'approve'");
    });

    test('reject dispara onAction com "reject"', () => {
      expect(deliverySource).toContain("'reject'");
    });

    test('message dispara onAction com "message"', () => {
      expect(deliverySource).toContain("'message'");
    });

    test('callback onAction recebe agentId + action', () => {
      expect(deliverySource).toContain('onAction');
    });

    test('botões desabilitados quando sem entrega', () => {
      expect(deliverySource).toContain('disabledStyle');
      expect(deliverySource).toContain('pointer-events: none');
    });
  });

  // ─── DeliveryScreen: Close (AC: 9) ─────────────────────────────────

  describe('DeliveryScreen — Fechar (AC: 9)', () => {
    test('botão [X] para fechar', () => {
      expect(deliverySource).toContain('delivery-close-btn');
      expect(deliverySource).toContain('[X]');
    });

    test('ESC fecha a tela', () => {
      expect(deliverySource).toContain('Escape');
      expect(deliverySource).toContain('this.close()');
    });

    test('close() esconde overlay', () => {
      expect(deliverySource).toContain("close(): void");
      expect(deliverySource).toContain("this.isOpen = false");
    });

    test('getIsOpen() retorna estado', () => {
      expect(deliverySource).toContain('getIsOpen()');
    });

    test('getCurrentAgentId() retorna agente atual', () => {
      expect(deliverySource).toContain('getCurrentAgentId()');
    });
  });

  // ─── ConstructScene Integration (AC: 3) ────────────────────────────

  describe('ConstructScene Integration (AC: 3)', () => {
    test('importa DeliveryScreen', () => {
      expect(constructSource).toContain("import { DeliveryScreen }");
    });

    test('importa InteractionBubble', () => {
      expect(constructSource).toContain("import { InteractionBubble }");
    });

    test('importa ProximityDetector', () => {
      expect(constructSource).toContain("import { ProximityDetector }");
    });

    test('cria instância de DeliveryScreen', () => {
      expect(constructSource).toContain('new DeliveryScreen()');
    });

    test('cria instância de InteractionBubble', () => {
      expect(constructSource).toContain('new InteractionBubble(');
    });

    test('setup ProximityDetector', () => {
      expect(constructSource).toContain('setupProximityDetector');
      expect(constructSource).toContain('new ProximityDetector(');
    });

    test('click no agente abre DeliveryScreen (AC: 3)', () => {
      expect(constructSource).toContain('openDeliveryForAgent');
    });

    test('proximityDetector.update() no loop', () => {
      expect(constructSource).toContain('this.proximityDetector?.update()');
    });

    test('getters para novos componentes', () => {
      expect(constructSource).toContain('getDeliveryScreen()');
      expect(constructSource).toContain('getProximityDetector()');
      expect(constructSource).toContain('getInteractionBubble()');
    });
  });

  // ─── Segurança ─────────────────────────────────────────────────────

  describe('Segurança', () => {
    test('DeliveryScreen escapa HTML (XSS)', () => {
      expect(deliverySource).toContain('esc(');
      expect(deliverySource).toContain('textContent');
    });

    test('chat input stopPropagation no Enter', () => {
      expect(deliverySource).toContain('e.stopPropagation()');
    });
  });
});
