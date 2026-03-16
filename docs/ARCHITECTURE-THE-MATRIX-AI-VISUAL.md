# The Matrix AI Visual — Arquitetura Técnica

> *"Eu sei Kung Fu."* — Neo
> *"Mostre-me."* — Morpheus

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-15 | 1.0 | Arquitetura técnica inicial | @architect |
| 2026-03-15 | 1.1 | Correções pós-review Smith: alinhar referências Phaser 4→3, 22→19 agentes, ADR-6 segurança Express | @architect |
| 2026-03-15 | 1.2 | Nota de extensibilidade v2.0: arquitetura preparatória para terminal interativo (config externalizável, server modular, WebSocket migration path) | @architect |
| 2026-03-15 | 1.3 | Sync com PRD v1.3: 16 findings Smith corrigidos — FR15/FR16 (interatividade mínima v1.0 + Morpheus Room), Story 4.4, mapa CLI→Game v2.0 | @architect |

---

## 1. Visão Geral

### 1.1 Tipo de Aplicação

Aplicação web monolítica com duas camadas: **game client** (Phaser 3 v3.90, browser) e **server** (Node.js/Express, SSE). Sem banco de dados — dados lidos do filesystem LMAS e git.

### 1.2 Diagrama de Alto Nível

```
┌─────────────────────────────────────────────────────┐
│                    BROWSER                           │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │           Phaser 3 Game Client               │    │
│  │                                               │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  │    │
│  │  │  Login    │  │ Construct│  │ Inspector │  │    │
│  │  │  Scene    │  │  Scene   │  │  Panel    │  │    │
│  │  └──────────┘  └──────────┘  └──────────┘  │    │
│  │                                               │    │
│  │  ┌──────────────────────────────────────┐    │    │
│  │  │         SSE Client (EventSource)      │    │    │
│  │  └──────────────┬───────────────────────┘    │    │
│  └─────────────────┼───────────────────────────┘    │
│                     │                                │
└─────────────────────┼────────────────────────────────┘
                      │ SSE (text/event-stream)
┌─────────────────────┼────────────────────────────────┐
│                     │        SERVER                   │
│  ┌─────────────────┴───────────────────────────┐    │
│  │           Express + SSE Broadcaster          │    │
│  └──────┬──────────────┬──────────────┬────────┘    │
│         │              │              │              │
│  ┌──────┴─────┐ ┌──────┴─────┐ ┌─────┴──────┐     │
│  │  LMAS Data │ │  Git Data  │ │  State     │     │
│  │  Reader    │ │  Reader    │ │  Manager   │     │
│  └──────┬─────┘ └──────┬─────┘ └────────────┘     │
│         │              │                            │
│  ┌──────┴──────────────┴──────────────────────┐    │
│  │              Filesystem / Git               │    │
│  │  .lmas/handoffs/ .lmas/logs/ docs/stories/  │    │
│  └─────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
```

### 1.3 Decisão Técnica: Phaser 3 vs Phaser 4

| Aspecto | Phaser 3 (v3.90) | Phaser 4 (RC.5) |
|---------|-------------------|------------------|
| Estabilidade | Stable, production-ready | Release Candidate |
| TypeScript | Definitions file externo | Nativo |
| Documentação | 1800+ exemplos | Menos exemplos, em crescimento |
| Comunidade | Enorme | Menor |
| WebGPU | Não | Sim |
| Import Aseprite | Plugin | Nativo |

**Decisão: Phaser 3.90 (stable)**

Justificativa: Phaser 4 está em RC mas a documentação e exemplos são limitados. Para o MVP, a estabilidade do Phaser 3 é mais importante. A migração para Phaser 4 pode ser feita na v2.0 quando o engine estiver stable. O Phaser 3 suporta 100% dos requisitos do MVP (sprites, tilemaps, input, camera, scenes).

**Risco mitigado:** Se Phaser 4 for estável antes do início do Epic 1, reavaliar.

---

## 2. Estrutura do Projeto

```
apps/visual/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
│
├── src/
│   ├── client/                    # Game Client (Phaser)
│   │   ├── main.ts                # Entry point, Phaser config, game init
│   │   ├── config.ts              # Game constants (resolution, colors, etc.)
│   │   │
│   │   ├── scenes/                # Phaser Scenes
│   │   │   ├── BootScene.ts       # Preload assets, show loading bar
│   │   │   ├── LoginScene.ts      # "Choose your pill" login screen
│   │   │   ├── ConstructScene.ts  # Main office scene (The Construct)
│   │   │   └── UIScene.ts         # HUD overlay (colonist bar, activity feed, notifications)
│   │   │
│   │   ├── objects/               # Game Objects (sprites, entities)
│   │   │   ├── Agent.ts           # Base agent class (sprite, animations, status)
│   │   │   ├── AgentFactory.ts    # Creates agents from config (19 agents)
│   │   │   ├── SmithPatrol.ts     # Smith special behavior (patrol, inspect, verdict)
│   │   │   ├── CodeRain.ts        # Code rain effect (katakana columns)
│   │   │   ├── SpeechBubble.ts    # Speech bubble above agents
│   │   │   └── StatusIndicator.ts # Glow/border status indicator
│   │   │
│   │   ├── ui/                    # UI Components (HTML overlay or Phaser UI)
│   │   │   ├── InspectorPanel.ts  # Agent inspector side panel
│   │   │   ├── ColonistBar.ts     # Top bar with agent portraits
│   │   │   ├── ActivityFeed.ts    # Bottom activity log
│   │   │   ├── Notification.ts    # RPG-style notification popup
│   │   │   └── VerdictOverlay.ts  # Smith verdict animation overlay
│   │   │
│   │   ├── systems/               # Game Systems (logic, state)
│   │   │   ├── SSEClient.ts       # EventSource wrapper, reconnection, parsing
│   │   │   ├── AgentStateManager.ts # Manages state of all agents
│   │   │   └── CameraController.ts  # Camera pan, zoom, follow
│   │   │
│   │   └── data/                  # Static data
│   │       ├── agent-config.ts    # 19 agent definitions (name, persona, position, sprite key)
│   │       ├── matrix-phrases.ts  # In-character phrases per agent
│   │       └── palette.ts         # Matrix color palette constants
│   │
│   ├── server/                    # Backend (Node.js/Express)
│   │   ├── index.ts               # Server entry point
│   │   ├── app.ts                 # Express app setup, routes
│   │   │
│   │   ├── routes/
│   │   │   ├── sse.ts             # GET /api/events/stream — SSE endpoint
│   │   │   └── api.ts             # GET /api/agents, GET /api/status — REST
│   │   │
│   │   ├── services/
│   │   │   ├── LMASDataReader.ts  # Reads .lmas/handoffs/, logs, stories
│   │   │   ├── GitReader.ts       # Reads git log, status, branches
│   │   │   ├── StateManager.ts    # Aggregates data → AgentState[]
│   │   │   └── SSEBroadcaster.ts  # Manages SSE connections, broadcasts events
│   │   │
│   │   └── watchers/
│   │       ├── FileWatcher.ts     # fs.watch on .lmas/ and docs/stories/
│   │       └── GitPoller.ts       # Polls git status every 10s
│   │
│   └── shared/                    # Shared between client & server
│       ├── types.ts               # AgentState, SSEEvent, AgentStatus, etc.
│       ├── constants.ts           # Shared constants (event names, status values)
│       └── agent-ids.ts           # Agent ID enum/map
│
├── assets/                        # Game assets (NOT in src/)
│   ├── sprites/                   # Aseprite exports (PNG sprite sheets + JSON)
│   │   ├── neo.png
│   │   ├── neo.json               # Aseprite JSON export (frames, tags)
│   │   ├── oracle.png
│   │   ├── oracle.json
│   │   └── ...
│   ├── tilesets/                   # LDtk exports
│   │   ├── office.ldtk            # LDtk project file
│   │   ├── office.json            # Exported tilemap JSON
│   │   └── tileset.png            # Tileset image
│   ├── ui/                        # UI elements
│   │   ├── panel-border.png       # Terminal panel border (9-slice)
│   │   ├── pill-red.png           # Red pill button
│   │   ├── pill-blue.png          # Blue pill button
│   │   └── notification-bg.png    # RPG notification background
│   ├── fonts/                     # Pixel fonts
│   │   └── matrix-font.png        # Bitmap font (monospace, green)
│   └── audio/                     # Sound effects + music
│       ├── ambient-lofi.mp3       # Background music
│       ├── keypress.wav           # Typing sound
│       └── notification.wav       # Notification sound
│
└── tests/
    ├── server/
    │   ├── lmas-data-reader.test.ts
    │   ├── git-reader.test.ts
    │   ├── state-manager.test.ts
    │   └── sse-broadcaster.test.ts
    ├── client/
    │   ├── agent.test.ts
    │   ├── agent-state-manager.test.ts
    │   └── sse-client.test.ts
    └── fixtures/
        ├── mock-handoff.yaml
        ├── mock-story.md
        └── mock-git-log.txt
```

---

## 3. Stack Tecnológico Detalhado

### 3.1 Dependências de Produção

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| `phaser` | ^3.90.0 | Game engine 2D (Canvas/WebGL) |
| `express` | ^4.21 | HTTP server, static files, SSE |
| `chokidar` | ^4.0 | File watcher (mais confiável que fs.watch no Windows) |
| `js-yaml` | ^4.1 | Parsear handoff YAML files |

### 3.2 Dependências de Desenvolvimento

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| `typescript` | ^5.7 | Linguagem |
| `vite` | ^6.0 | Build tool + dev server (client) |
| `tsx` | ^4.19 | Executar TypeScript server sem build step |
| `jest` | ^29 | Testes |
| `ts-jest` | ^29 | Jest com TypeScript |
| `@types/express` | ^4 | Types do Express |
| `eslint` | ^9 | Linting |
| `concurrently` | ^9 | Rodar client + server juntos |

### 3.3 Ferramentas Externas (não npm)

| Ferramenta | Versão | Propósito |
|------------|--------|-----------|
| Aseprite | v1.3.17 (compilado) | Criar sprite sheets dos personagens |
| LDtk | v1.5+ | Level design, tilemap do escritório |

### 3.4 Total de dependências de produção: 4

Mínimo absoluto. Chokidar é necessário porque `fs.watch` é inconsistente no Windows. js-yaml é necessário para parsear handoffs YAML.

---

## 4. Phaser — Arquitetura de Scenes

### 4.1 Scene Flow

```
BootScene → LoginScene → ConstructScene + UIScene (parallel)
```

| Scene | Tipo | Responsabilidade |
|-------|------|-----------------|
| **BootScene** | Transitória | Carrega todos os assets (sprites, tilesets, fontes, audio). Exibe loading bar. |
| **LoginScene** | Transitória | Tela "Choose your pill". Code rain. Transição glitch para ConstructScene. |
| **ConstructScene** | Persistente | Renderiza o escritório, agentes, Smith patrol, efeitos visuais. É a scene principal do game. |
| **UIScene** | Overlay | Roda em paralelo com ConstructScene. Renderiza HUD: colonist bar, activity feed, notifications, inspector panel. Fica acima da ConstructScene. |

### 4.2 Por que UIScene separada?

A UI não deve scrollar com o mapa. Separar em scene overlay garante que colonist bar, notifications e inspector panel ficam fixos na viewport enquanto o mapa do escritório pode ser scrollado/zoomado.

```typescript
// Em ConstructScene.create():
this.scene.launch('UIScene');
```

### 4.3 ConstructScene — Game Objects

```
ConstructScene
├── Tilemap (office.json from LDtk)
│   ├── Floor Layer (tiles)
│   ├── Furniture Layer (mesas, cadeiras, monitores)
│   └── Walls Layer (paredes, portas)
├── Agent[] (19 instances)
│   ├── Sprite (animated)
│   ├── StatusIndicator (glow)
│   ├── FloatingIcon (emoji/sprite)
│   └── SpeechBubble (conditional)
├── SmithPatrol (special Agent subclass)
├── CodeRain[] (window overlays)
├── ParticleEmitter (green particles)
└── Camera (bounded to tilemap)
```

---

## 5. Server — Arquitetura

### 5.1 Fluxo de Dados

```
Filesystem/.lmas/          Git Repository
      │                         │
      ▼                         ▼
  FileWatcher              GitPoller (10s)
      │                         │
      ▼                         ▼
 LMASDataReader             GitReader
      │                         │
      └──────────┬──────────────┘
                 ▼
           StateManager
           (AgentState[])
                 │
                 ▼
          SSEBroadcaster
                 │
                 ▼
     GET /api/events/stream
           (SSE)
                 │
                 ▼
         Browser (Phaser)
```

### 5.2 SSE Events

| Event Type | Payload | Trigger |
|------------|---------|---------|
| `agent-status` | `{ agentId, status, task?, message? }` | Handoff file criado/modificado |
| `agent-delivery` | `{ agentId, deliveryType, description, timestamp }` | Novo commit detectado |
| `smith-verdict` | `{ targetAgent, verdict, findings[] }` | Smith handoff detected |
| `workflow-update` | `{ workflowName, phase, activeAgents[] }` | Story status change |
| `heartbeat` | `{ timestamp }` | Every 30s |

### 5.3 SSE Event Format

```
event: agent-status
data: {"agentId":"neo","status":"working","task":"implement payment API","message":"Digitando código..."}

event: heartbeat
data: {"timestamp":1710518400000}
```

### 5.4 REST Endpoints (complementares)

| Method | Path | Response | Uso |
|--------|------|----------|-----|
| GET | `/api/agents` | `AgentState[]` | Estado inicial de todos os agentes ao conectar |
| GET | `/api/agents/:id` | `AgentState` | Estado de um agente específico |
| GET | `/api/status` | `{ workflow, activeStory, branch }` | Status geral do projeto |

---

## 6. Data Readers — Mapeamento LMAS → Visual

### 6.1 LMASDataReader

| Fonte | Dados Extraídos | Mapeamento |
|-------|-----------------|------------|
| `.lmas/handoffs/*.yaml` | from_agent, to_agent, story_context, decisions | Detecta agente ativo, task atual, delegações |
| `.lmas/logs/agent.log` | timestamp, agente, ação | Activity feed, últimas ações |
| `docs/stories/active/*.md` | status, checkboxes, agente implementando | Story ativa, progresso |

### 6.2 GitReader

| Comando | Dados Extraídos | Mapeamento |
|---------|-----------------|------------|
| `git log --oneline -20` | hash, message, timestamp | Últimas entregas, agent-delivery events |
| `git status --porcelain` | files modified/staged | Agente @dev status (working se há mudanças) |
| `git branch --show-current` | branch name | Contexto de branch no painel |

### 6.3 Mapeamento Agente → Status

| Condição | Status Visual |
|----------|--------------|
| Handoff recente (< 5min) com task ativa | 🟢 Working |
| Story existe mas sem handoff recente | 🟡 Waiting |
| Handoff com blocker | 🔴 Blocked |
| Sem dados recentes | ⚪ Idle |

---

## 7. Types (shared/types.ts)

```typescript
type AgentId =
  | 'neo' | 'oracle' | 'architect' | 'trinity' | 'keymaker'
  | 'niobe' | 'link' | 'tank' | 'sati' | 'operator'
  | 'lock' | 'mouse' | 'sparks' | 'merovingian'
  | 'persephone' | 'ghost' | 'seraph' | 'smith' | 'morpheus';

type AgentStatus = 'working' | 'waiting' | 'blocked' | 'idle';

type SmithVerdict = 'CLEAN' | 'CONTAINED' | 'INFECTED' | 'COMPROMISED';

interface AgentState {
  id: AgentId;
  name: string;
  persona: string;
  role: string;
  wing: 'software-dev' | 'marketing' | 'central';
  status: AgentStatus;
  task: string | null;
  lastMessage: string | null;
  lastActions: AgentAction[];
  position: { x: number; y: number };
}

interface AgentAction {
  timestamp: number;
  description: string;
}

interface SSEEvent {
  type: 'agent-status' | 'agent-delivery' | 'smith-verdict' | 'workflow-update' | 'heartbeat';
  data: Record<string, unknown>;
}

interface SmithVerdictEvent {
  targetAgent: AgentId;
  verdict: SmithVerdict;
  findings: Finding[];
}

interface Finding {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
}
```

---

## 8. Build & Dev Pipeline

### 8.1 package.json scripts

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\"",
    "dev:client": "vite",
    "dev:server": "tsx watch src/server/index.ts",
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "tsc -p tsconfig.server.json",
    "start": "node dist/server/index.js",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit"
  }
}
```

### 8.2 Vite Config

```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: '/',
  build: {
    outDir: 'dist/client',
    assetsDir: 'assets',
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
```

### 8.3 Dev Flow

```
[Terminal 1] vite dev (client, port 3000) → proxy /api → port 3001
[Terminal 2] tsx watch (server, port 3001) → SSE + REST
```

Em produção: Vite builda static files → Express serve tudo de `dist/client/` na porta 3001.

---

## 9. Tilemap — Convenções LDtk

### 9.1 Layers

| Layer | Tipo | Conteúdo |
|-------|------|----------|
| `Floor` | Tiles | Piso escuro, carpete |
| `Furniture` | Tiles | Mesas, cadeiras, monitores, plantas |
| `Walls` | Tiles | Paredes, portas, janelas |
| `Collisions` | IntGrid | Áreas não-walkable (para pathfinding do Smith) |
| `AgentSpawns` | Entities | Pontos de spawn dos agentes (x, y, agentId) |

### 9.2 Tile Size

- **Tile:** 16x16 pixels
- **Agent sprite:** 16x32 pixels (1 tile wide, 2 tiles tall)
- **Map size estimado:** ~40x30 tiles (640x480 pixels na resolução base)

### 9.3 Export

LDtk exporta JSON. O Phaser importa via `this.load.tilemapTiledJSON()` (ou parser customizado se formato diferir). O `phaser-ldtk-importer` pode ser usado, ou parser manual (JSON é simples).

---

## 10. Sprite Pipeline — Aseprite → Phaser

### 10.1 Workflow

```
Aseprite (.aseprite)
    │
    ├── Export Sprite Sheet (PNG + JSON)
    │   ├── Format: Array (horizontal strip)
    │   ├── Tags: idle, working, walking-up, walking-down, walking-left, walking-right
    │   └── Output: assets/sprites/{agent}.png + {agent}.json
    │
    └── Phaser loads:
        this.load.aseprite('{agent}', 'sprites/{agent}.png', 'sprites/{agent}.json');
        // OR
        this.load.atlas('{agent}', 'sprites/{agent}.png', 'sprites/{agent}.json');
```

### 10.2 Animação Tags (convenção)

| Tag | Frames | Uso |
|-----|--------|-----|
| `idle` | 4-6 | Sentado na mesa, movimento sutil |
| `working` | 4-8 | Digitando, interagindo com tela |
| `walk-down` | 4 | Andando para baixo |
| `walk-up` | 4 | Andando para cima |
| `walk-left` | 4 | Andando para esquerda |
| `walk-right` | 4 | Andando para direita |
| `special` | 4-8 | Animação única do personagem |

### 10.3 Sprite Specs

| Propriedade | Valor |
|-------------|-------|
| Tamanho por frame | 16x32 px |
| Estilo | Hi-Bit (16-bit com detalhes) |
| Paleta | Matrix + Cyberpunk (conforme pesquisa) |
| FPS de animação | 6-8 fps (padrão pixel art) |
| Formato de export | Aseprite JSON Array |

---

## 11. Smith Pathfinding

### 11.1 Algoritmo

Pathfinding simples baseado em waypoints (não precisa de A* completo):

```
Smith Waypoints:
  1. Corredor central (y fixo, x varia)
  2. Entrada ala Software Dev
  3. Entrada ala Marketing
  4. Frente de cada mesa de agente (pontos de inspeção)

Patrol Loop:
  corredor → sw-dev entrada → mesas sw-dev (random) → corredor → marketing entrada → mesas marketing (random) → corredor
```

### 11.2 Comportamento Programático

```
State Machine:
  PATROL → andando entre waypoints
  INSPECT → parado atrás de um agente (triggered por delivery event)
  VERDICT → exibindo veredicto (animação 3-5s)
  RETURN → voltando ao patrol path
```

---

## 12. Performance Considerations

### 12.1 Sprite Optimization

- **Texture Atlas:** Combinar todos os sprites num único atlas (Phaser suporta multi-atlas)
- **Object Pooling:** Reutilizar speech bubbles e notifications
- **Culling:** Phaser faz camera culling automático para sprites fora da viewport
- **Animation Caching:** Criar animações uma vez no BootScene, reutilizar

### 12.2 SSE Optimization

- **Delta Updates:** Só enviar mudanças de estado, não estado completo
- **Debounce:** FileWatcher debounce de 500ms para evitar flood de eventos
- **Heartbeat:** 30s interval para manter conexão sem overhead

### 12.3 Target Performance

| Métrica | Target |
|---------|--------|
| FPS | 30+ (19 sprites + efeitos) |
| Memory | < 100MB |
| Initial Load | < 5s |
| SSE Latency | < 2s |

---

## 13. Deploy

### 13.1 VPS (Hostinger)

```
Servidor: 187.77.227.95
OS: Ubuntu 24.04
Resources: 2 vCPUs, 8GB RAM, 100GB disco

Stack de Deploy:
├── PM2 (process manager)
│   └── visual-server (Node.js, port 3001)
├── Nginx (reverse proxy)
│   └── visual.domain.com → localhost:3001
└── Static files servidos pelo Express
```

### 13.2 Build & Deploy Script

```bash
# Na VPS:
cd /root/the-matrix-ai/apps/visual
npm ci --production
npm run build
pm2 restart visual-server || pm2 start dist/server/index.js --name visual-server
```

---

## 14. Decisões Arquiteturais (ADRs)

### ADR-1: Phaser 3 ao invés de Phaser 4
- **Status:** Aceito
- **Contexto:** Phaser 4 está em RC.5, documentação limitada
- **Decisão:** Usar Phaser 3.90 (stable) para o MVP
- **Consequência:** Migração para Phaser 4 planejada na v2.0

### ADR-2: UI como HTML overlay vs Phaser UI
- **Status:** Aceito
- **Contexto:** Inspector panel precisa de texto rich (monospace, scrollable)
- **Decisão:** UIScene usa Phaser para colonist bar e notifications. Inspector panel usa DOM overlay (div posicionado sobre o canvas)
- **Consequência:** Melhor texto/scroll no inspector, mas precisa coordenar Phaser + DOM

### ADR-3: SSE ao invés de WebSocket
- **Status:** Aceito
- **Contexto:** 95% do fluxo é server→client (estados, métricas)
- **Decisão:** SSE para real-time, REST para initial state
- **Consequência:** Mais simples, sem dependência extra (Socket.io). WebSocket adicionado na v2 se necessário

### ADR-4: Sem banco de dados no MVP
- **Status:** Aceito
- **Contexto:** Dados já existem no filesystem LMAS e git
- **Decisão:** Ler diretamente do filesystem + git CLI
- **Consequência:** Sem overhead de DB, mas sem histórico persistente além do git log

### ADR-5: chokidar para file watching
- **Status:** Aceito
- **Contexto:** `fs.watch` é inconsistente no Windows (eventos duplicados, paths)
- **Decisão:** Usar chokidar (única dependência extra justificada)
- **Consequência:** File watching confiável cross-platform

### ADR-6: Segurança Express (CORS + Headers)
- **Status:** Aceito
- **Contexto:** Server Express exposto na rede, SSE endpoint público
- **Decisão:** CORS configurado para origin permitida (localhost:3000 em dev, domínio em prod). Headers de segurança (X-Content-Type-Options: nosniff, X-Frame-Options: DENY) configurados manualmente (sem dependência helmet para manter zero deps extras). Rate limit no SSE: máx 10 conexões simultâneas. HTTPS via Nginx reverse proxy em prod.
- **Consequência:** Segurança básica sem dependências adicionais

### ADR-7: Tilemap parser manual vs phaser-ldtk-importer
- **Status:** Pendente (avaliar na Story 1.3)
- **Contexto:** phaser-ldtk-importer existe mas documentação limitada
- **Decisão:** Avaliar plugin. Se insuficiente, parser manual (JSON do LDtk é simples)
- **Consequência:** Flexibilidade garantida

---

## 15. Riscos Técnicos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Phaser 3 descontinuado | Baixa | Alto | Migrar para Phaser 4 quando stable |
| Performance com 19 sprites + efeitos | Baixa | Médio | Texture atlas, culling, profiling early |
| LDtk → Phaser parsing issues | Média | Baixo | Parser manual como fallback |
| fs.watch inconsistente | Alta (Windows) | Médio | chokidar como dependência |
| Aseprite sprite quality (amateur art) | Alta | Médio | Templates de sprite, tutoriais, IA para concept art |

---

## 16. Extensibilidade v2.0 — Terminal Visual do LMAS

### 16.1 Visão

Na v2.0, o game deixa de ser apenas observação e se torna o **terminal visual completo do LMAS** — equivalente ao CLI mas com interface pixel art imersiva. Usuários poderão criar agentes, workflows e squads de dentro do game.

### 16.2 Arquitetura Preparatória (v1.0)

A arquitetura v1.0 deve facilitar a transição:

| Componente | v1.0 (Atual) | v2.0 (Futuro) |
|-----------|-------------|---------------|
| **Agent config** | Hardcoded em `agent-config.ts` | Externalizável (JSON/YAML), CRUD API |
| **Server routes** | GET-only (read) | CRUD completo (POST/PUT/DELETE) |
| **Comunicação** | SSE (server→client) | SSE + WebSocket (bidirecional) |
| **State Manager** | Read-only | Read + Write |
| **Auth** | Cosmético | JWT + sessions |
| **DB** | Nenhum | SQLite/PostgreSQL |

### 16.3 Preparação no v1.0

Para facilitar a migração v1.0 → v2.0:

1. **Agent config em objeto separado** (não inline): permite futura externalização
2. **Express routes modulares**: `/api/agents/`, `/api/workflows/` — mesmo sem CRUD, a estrutura de routes já existe
3. **SSEEvent type extensível**: tipo union permite adicionar novos eventos
4. **State Manager centralizado**: ponto único de reads facilita adicionar writes depois

### 16.4 Constitution Art. I — Emenda Necessária

Na v2.0, Constitution Art. I ("CLI First") será emendado:
- **De:** "UI observa, nunca controla"
- **Para:** "CLI e Game são interfaces equivalentes — ambas podem criar, modificar e executar"

---

*Arquitetura Técnica v1.2 — Atualizada em 2026-03-15*
*Baseada no PRD-THE-MATRIX-AI-VISUAL.md v1.2*
*v1.0: Observabilidade (Epics 1-5) → v2.0: Terminal interativo completo*
*Próximo passo: Implementar Epic 1 (Foundation & Game Engine Setup)*
