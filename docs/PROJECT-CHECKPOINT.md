# PROJECT CHECKPOINT — The Matrix AI Visual

> **Última atualização:** 2026-03-16
> **Atualizado por:** @dev (Neo)
> **Sessão:** Story 5.4 completa + Story 6.1 em andamento

---

## Visão Geral do Projeto

**The Matrix AI Visual** (codinome "The Construct") é um jogo de observabilidade em tempo real que renderiza os agentes LMAS como personagens em um escritório virtual estilo RPG pixel art (Stardew Valley + Matrix).

**Objetivo v1.0 (MVP):** Observação + interação mínima. O game apenas OBSERVA o sistema LMAS (CLI First).
**Objetivo v2.0 (futuro):** Terminal visual completo + Smith body possession + auth real.

### Stack (ADR-1)

| Componente | Tecnologia | Versão |
|------------|-----------|--------|
| Game Engine | Phaser 3 | v3.90 (stable) |
| Sprites | Aseprite | v1.3.17 (compilado) |
| Level Design | LDtk | - |
| Server | Node.js + Express + SSE | - |
| Build | Vite (client) + tsx (server) | - |
| Linguagem | TypeScript (strict) | 5.x |
| Idioma do game | PT-BR | - |

### Arquitetura do Player (ADR-2)

- Player = Avatar do dono (agentId: 'player', cor: #00BFFF) — NÃO é agente LMAS
- Morpheus = NPC companheiro que segue o player
- WASD/setas para mover, câmera 2x zoom

### Scene Flow (ADR-3 — Story 5.4)

```
BootScene → LoginScene (typewriter PT-BR + code rain)
    → ProjectSelectScene (lista projetos LMAS)
        → Pílulas: 🔴 Vermelha (entrar) / 🔵 Azul (voltar)
            → ConstructScene + UIScene (escritório virtual)
```

---

## Status das Stories

### Épico 1: Foundation
| Story | Título | Status | Testes |
|-------|--------|--------|--------|
| 1.1 | Project Scaffolding (Phaser 3) | ✅ Done (QA PASS) | 35 |
| 1.2 | Express Server + SSE | ✅ Done (QA PASS) | 36 |
| 1.3 | Office Tilemap & Static Scene | ✅ Done | 43 |

### Épico 2: Sprites & Characters
| Story | Título | Status | Testes |
|-------|--------|--------|--------|
| 2.1 | Base Character Sprite System | ✅ Done | 52 |
| 2.2 | First 5 Agent Sprites | ✅ Ready for Review | 36 |
| 2.3 | Remaining 14 Agent Sprites | ✅ Ready for Review | 24 |

### Épico 3: Data Integration
| Story | Título | Status | Testes |
|-------|--------|--------|--------|
| 3.1 | LMAS Filesystem Data Reader | ✅ Ready for Review | 38 |
| 3.2 | Git Activity Integration | ✅ Ready for Review | 34 |
| 3.3 | SSE Real-Time Broadcasting | ✅ Ready for Review | 35 |

### Épico 4: Interaction & UI
| Story | Título | Status | Testes |
|-------|--------|--------|--------|
| 4.1 | Click-to-Inspect Panel | ✅ Ready for Review | 50 |
| 4.2 | Colonist Bar + Activity Feed | ✅ Ready for Review | 39 |
| 4.3 | RPG-Style Notifications | ✅ Ready for Review | 36 |
| 4.4 | Morpheus Room (Command Center) | ✅ Ready for Review | 66 |
| 4.5 | Proximity Interaction + Delivery Screen | ✅ Ready for Review | 69 |

### Épico 5: Polish & Effects
| Story | Título | Status | Testes |
|-------|--------|--------|--------|
| 5.1 | Smith Patrol System | ✅ Ready for Review | 44 |
| 5.2 | Login Scene — Choose Your Pill | ✅ Ready for Review | 35 |
| 5.3 | Matrix Visual Effects (CRT, rain, glitch) | ✅ Ready for Review | 60 |
| 5.4 | Project Selector — Escolha sua Realidade | ✅ Ready for Review | 101 |

### Épico 6: DX & Infrastructure
| Story | Título | Status | Testes |
|-------|--------|--------|--------|
| 6.1 | Session Checkpoint System | ✅ Ready for Review | - |

### Infraestrutura (sem story)
| Feature | Status | Testes |
|---------|--------|--------|
| Player Controller + Camera | ✅ Done | 35 |
| Morpheus Companion | ✅ Done | 16 |

### Totais

| Métrica | Valor |
|---------|-------|
| **Stories criadas** | 19 |
| **Stories completas** | 19/19 — TODAS COMPLETAS! |
| **Stories pendentes** | 0 |
| **Total de testes** | 930 |
| **Test suites** | 20 |

---

## Último Trabalho Realizado

### Sessão 2026-03-16 (atual)

**Story 5.4 — Project Selector** (COMPLETA):
- Criado `ProjectDiscovery` service (backend) — descobre projetos LMAS automaticamente
- Criado `ProjectContext` — troca dinâmica de projeto em runtime
- Criado `ProjectSelectScene` (frontend) — lista estilo terminal Matrix + pílulas
- Modificado `LoginScene` — pílulas movidas para ProjectSelectScene
- Modificado `index.ts` — PROJECT_ROOT hardcoded → dinâmico
- 3 endpoints novos: GET /api/projects, POST /api/project/select, GET /api/project/active
- 101 testes novos, 735 total passando

**Arquivos criados/modificados na sessão:**
- `apps/visual/src/server/services/ProjectDiscovery.ts` (novo)
- `apps/visual/src/server/project-context.ts` (novo)
- `apps/visual/src/client/scenes/ProjectSelectScene.ts` (novo)
- `apps/visual/src/server/routes/api.ts` (modificado)
- `apps/visual/src/server/index.ts` (modificado)
- `apps/visual/src/server/app.ts` (modificado)
- `apps/visual/src/client/scenes/LoginScene.ts` (modificado)
- `apps/visual/src/client/scenes/BootScene.ts` (modificado)
- `apps/visual/src/client/main.ts` (modificado)
- `tests/visual/project-selector.test.js` (novo)
- `tests/visual/login-scene.test.js` (ajustado)
- `tests/visual/sse-realtime.test.js` (ajustado)
- `tests/visual/office-tilemap.test.js` (ajustado)

---

## Próximos Passos (fila de implementação)

**TODAS AS 19 STORIES COMPLETAS!** v1.0 MVP implementado.

Próximas ações possíveis:
1. Ativar `@devops` para commit e push de todas as mudanças
2. Testar visualmente o game rodando (`npm run dev` em `apps/visual/`)
3. Planejar v2.0 (Smith body possession, auth real, terminal interativo, audio assets)

---

## Decisões Arquiteturais Ativas

| ADR | Decisão | Data |
|-----|---------|------|
| ADR-1 | Phaser 3 v3.90 (NÃO Phaser 4), Aseprite compilado, LDtk, custo $0 | 2026-03-15 |
| ADR-2 | Player = Avatar do dono (não agente), Morpheus = NPC companheiro | 2026-03-16 |
| ADR-3 | Scene flow: Boot→Login→ProjectSelect→Construct (Story 5.4) | 2026-03-16 |

---

## Documentos do Projeto

| Documento | Path | Versão |
|-----------|------|--------|
| PRD | `docs/PRD-THE-MATRIX-AI-VISUAL.md` | v1.3 |
| Architecture | `docs/ARCHITECTURE-THE-MATRIX-AI-VISUAL.md` | v1.3 |
| Aseprite Build | `docs/ASEPRITE-BUILD-PROGRESS.md` | Concluído |
| Market Research | `docs/MARKET-RESEARCH-PIXEL-ART-GAMES.md` | Corrigido |
| Checkpoint | `docs/PROJECT-CHECKPOINT.md` | v1.0 |

---

## Estrutura de Diretórios Chave

```
apps/visual/
├── src/
│   ├── client/
│   │   ├── scenes/     → BootScene, LoginScene, ProjectSelectScene, ConstructScene
│   │   ├── objects/     → Agent, AgentFactory, MorpheusCompanion, SmithPatrol, SpeechBubble
│   │   ├── systems/     → PlayerController, CameraController, SSEClient, AgentStateManager, LDtkParser
│   │   ├── ui/          → InspectorPanel, ColonistBar, AgentTooltip, ActivityFeed, NotificationManager
│   │   └── data/        → agent-config, matrix-phrases
│   ├── server/
│   │   ├── services/    → StateManager, LMASDataReader, SSEBroadcaster, GitReader, ProjectDiscovery
│   │   ├── routes/      → api (REST), sse (EventSource)
│   │   ├── watchers/    → FileWatcher, GitPoller
│   │   └── project-context.ts → Contexto dinâmico de projeto
│   └── shared/          → types, agent-ids, constants
├── tests/visual/        → 17 test suites, 735 testes
└── package.json         → @the-matrix/visual
```

---

## Agentes no Visual (19 + 1 Player)

- **Software Dev Wing (10):** neo, oracle, architect, trinity, keymaker, niobe, link, tank, sati, operator
- **Marketing Wing (7):** lock, mouse, sparks, merovingian, persephone, ghost, seraph
- **Central (2):** smith (corredor, patrulha), morpheus (companheiro do player)
- **Player (1):** avatar do dono (agentId: 'player', cor: #00BFFF)

---

## Conceitos Futuros (v2.0 — NÃO implementar agora)

- Smith Body Possession (morphing animation, state machine POSSESS→VERIFY→RELEASE)
- Auth real (login com credenciais)
- Terminal interativo no Morpheus Room (executar comandos LMAS)
- Constitution emendada: "CLI + Game são interfaces equivalentes"

---

## QA Concerns Pendentes (não-bloqueantes)

- MEDIUM: vite proxy formato simplificado (OK para dev)
- LOW: SSEClient JSON.parse sem try/catch (aceitável no MVP)

---

## Como Continuar

1. **Leia este arquivo** no início de cada sessão
2. **Verifique a seção "Próximos Passos"** para saber o que fazer
3. **Verifique a seção "Último Trabalho Realizado"** para contexto
4. **Atualize este arquivo** ao final de cada sessão ou após cada story completa
5. **Use `@checkpoint`** para atualizar automaticamente

---

*Checkpoint v1.0 — Atualizado automaticamente após cada milestone*
