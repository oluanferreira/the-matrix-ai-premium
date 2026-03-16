# The Matrix AI Visual — Product Requirements Document (PRD)

> *"Eu não vim te dizer como isso vai terminar. Vim te dizer como vai começar."*
> — Morpheus

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-15 | 1.0 | PRD inicial criado a partir do documento de ideia + pesquisa de mercado | @pm (Trinity) |
| 2026-03-15 | 1.1 | Correções pós-review Smith: Phaser 4→3 (F1), login cosmético sem auth (F2), 22→19 agentes (F3), pipeline de assets definida (F4), npm workspaces (F5), NFR11 segurança Express (F6), ajustes menores (F7-F14) | @pm (Trinity) |
| 2026-03-15 | 1.2 | Visão v2.0 formalizada: Game como Terminal Visual do LMAS — interação completa (criar agentes, workflows, squads via game). CON1/NFR7 atualizados para abordagem faseada. Seção v2.0 Roadmap adicionada | @pm (Trinity) |
| 2026-03-15 | 1.3 | Correções Smith review #2 (16 findings, COMPROMISED): Goals atualizados com visão interativa (F1/F12), Mapa de Cobertura CLI→Game adicionado (F1), Morpheus Room story criada (F2/F3), v2.0 expandido para todos os domínios (F2), inspector+notificações expandidos (F4/F5), 22→19 no §9.2 (F6), nota Phaser 3 no Market Research (F7), ações mínimas v1.0 definidas (F8), NFR11 sem helmet (F9), áudio/som na Story 5.3 (F10), session state em 3.1 (F11), UX Vision atualizada (F11), Epic 5 título padronizado (F13), AC1b renumerado (F14), pílula azul padronizada (F15/F16), citação §7.1 trocada (F16) | @pm (Trinity) |

---

## 1. Goals and Background Context

### 1.1 Goals

- Criar uma experiência visual 2D pixel art que mostra agentes AI do LMAS trabalhando em tempo real num escritório virtual temático Matrix
- Permitir que o usuário observe, inspecione e **interaja** com os agentes — a visão original sempre foi interativa, não apenas observação
- Evoluir o game para **terminal visual completo do LMAS** (v2.0) — onde o usuário faz tudo que faria no CLI (criar agentes, workflows, squads, executar comandos) mas com interface pixel art imersiva
- Diferenciar-se de projetos similares (AgentOffice, AI Town, Pixel Agents) através da estética Matrix icônica, dados reais de trabalho e interação completa com o framework
- Entregar o MVP com custo zero de ferramentas (stack 100% open-source)
- Estabelecer o conceito "auto-construção" — o produto é construído pelo próprio framework que ele visualiza

### 1.2 Background Context

O The Matrix AI é um framework de execução multi-agente (LMAS) onde agentes com personas do universo Matrix (Neo, Oracle, Trinity, Smith, etc.) executam tarefas reais de desenvolvimento de software e marketing. Atualmente, toda interação acontece via CLI — o que é correto pela Constitution (CLI First), mas não oferece observabilidade visual do que os agentes estão fazendo.

O **The Matrix AI Visual** (codinome: **The Construct**) resolve isso em duas fases:

- **v1.0 (MVP):** Camada de **observabilidade** — renderiza o estado dos agentes como um escritório virtual pixel art 2D. O usuário observa, inspeciona e acompanha o trabalho dos agentes em tempo real.
- **v2.0:** O game se torna um **terminal visual completo do LMAS** — além de observar, o usuário pode **criar agentes, workflows e squads** diretamente de dentro do game, da mesma forma que faria no CLI. O game se torna a interface principal do framework, equivalente ao terminal mas com visual pixel art imersivo.

O mercado de jogos pixel art gerou $400M+ em 2024, com projetos similares (AgentOffice, AI Town, Stanford Smallville) validando o conceito. Nenhum deles combina tema forte (Matrix), dados reais de trabalho, verificação adversarial (Smith) e **interação completa com o framework** (v2.0).

---

## 2. Requirements

### 2.1 Functional Requirements

- **FR1:** O sistema deve renderizar um escritório 2D pixel art top-down com duas alas (Software Dev Wing e Marketing Wing) e uma sala central (Morpheus Room)
- **FR2:** Cada agente LMAS deve ser representado por um personagem pixel art animado com sprite sheet (idle, working, walking, talking)
- **FR3:** Cada personagem deve exibir indicador de status visual (verde=trabalhando, amarelo=aguardando, vermelho=bloqueado, cinza=idle)
- **FR4:** Ao clicar em um agente, um painel lateral deve abrir mostrando: task atual, última fala, findings (se aplicável) e últimas ações
- **FR5:** O cenário deve incluir elementos visuais Matrix: code rain nas janelas, piso escuro com reflexo verde, monitores com métricas
- **FR6:** A tela de login deve ser **cosmética** (sem autenticação real no MVP): apresentar duas opções temáticas — pílula vermelha (entrar no Construct) e pílula azul (fechar/escurecer) — com efeito de transição glitch. Não há campos de email/senha no MVP; o login é apenas uma tela de entrada temática
- **FR7:** Smith deve ter comportamento especial: patrulhar o corredor entre as alas, parar atrás de agentes ao verificar entregas, e exibir veredictos animados (COMPROMISED/INFECTED/CONTAINED/CLEAN)
- **FR8:** A Morpheus Room deve exibir visão geral: status de todos os agentes, workflow ativo, métricas globais (entregas, tasks, findings)
- **FR9:** Notificações in-game devem aparecer no estilo RPG para eventos importantes (entregas concluídas, veredictos do Smith)
- **FR10:** O sistema deve consumir dados do filesystem LMAS (handoffs, logs, story files) e atividade git (commits, branches) para alimentar o estado dos agentes
- **FR11:** Cada agente deve exibir ícone flutuante sobre a cabeça identificando sua função (🎯, ✍️, 📱, etc.)
- **FR12:** Agentes devem exibir bolhas de fala in-character quando ativos (frases do personagem Matrix correspondente)
- **FR13:** O painel de inspeção do agente deve usar estilo terminal Matrix (fundo preto, texto verde monospace)
- **FR14:** O sistema deve suportar pelo menos 19 personagens simultâneos (10 Software Dev + 7 Marketing + 1 Smith + 1 Morpheus), com arquitetura extensível para adição de novos agentes no futuro
- **FR15:** O sistema deve oferecer ações interativas mínimas no v1.0: (a) botões de ação em notificações ([Sim/Não] para acionar Smith, [Ver findings/Ignorar] para vereditos), (b) botão [Ver detalhes] no inspector panel, (c) Morpheus Room como ponto de acesso ao terminal de status
- **FR16:** A Morpheus Room deve funcionar como central de comando: ao clicar na cadeira do Morpheus, abrir visão geral com status de todos os agentes, workflow ativo, métricas globais (entregas, tasks, findings), e preview do terminal do orquestrador (read-only no v1.0, interativo no v2.0)

### 2.2 Non-Functional Requirements

- **NFR1:** O rendering deve manter 30+ FPS com 19 agentes animados e efeitos visuais ativos em hardware modesto (integrated GPU)
- **NFR2:** O tempo de carregamento inicial da aplicação não deve exceder 5 segundos em conexão local
- **NFR3:** O custo total de ferramentas e dependências deve ser $0 (stack 100% open-source/grátis)
- **NFR4:** A aplicação deve funcionar em browsers modernos (Chrome 90+, Firefox 90+, Edge 90+)
- **NFR5:** A resolução base deve ser 320x180 com integer scaling (6x para 1080p, nearest-neighbor)
- **NFR6:** O sistema de dados deve suportar atualização de estado via SSE (Server-Sent Events) com latência < 2 segundos
- **NFR7:** **v1.0:** A aplicação respeita Constitution CLI First — Visual é observabilidade. **v2.0:** Visual torna-se interface interativa equivalente ao CLI (Constitution Art. I emendado)
- **NFR8:** Sprites devem usar estilo "Matrix Hi-Bit" (base 16-bit com efeitos modernos: iluminação dinâmica, partículas, CRT shader)
- **NFR9:** A paleta principal deve usar as cores Matrix oficiais (#0D0208 a #00FF41) com toques cyberpunk (#EA00D9 magenta, #0ABDC6 cyan)
- **NFR10:** O projeto deve ser deployável na VPS Hostinger (187.77.227.95, Ubuntu 24.04, 2 vCPUs, 8GB RAM)
- **NFR11:** O servidor Express deve implementar segurança básica: CORS (configurado para origin permitida), rate limiting no SSE endpoint (máx. 10 conexões simultâneas), e headers de segurança configurados manualmente (X-Content-Type-Options, X-Frame-Options) — sem dependência helmet (ADR-6). HTTPS via Nginx reverse proxy em produção

---

## 3. User Interface Design Goals

### 3.1 Overall UX Vision

Uma experiência imersiva no universo Matrix onde o usuário **observa e interage** com sua equipe de agentes AI como se estivesse jogando um game de gerenciamento. **v1.0:** observar, inspecionar e reagir a eventos (botões de ação em notificações, acionar Smith, acessar terminal Morpheus). **v2.0:** gerenciar completamente — criar agentes, workflows, squads, executar comandos. A interface deve evocar a sensação de "entrar na Matrix" — transições com glitch, terminal verde, code rain — mas sempre priorizando a clareza dos dados reais que os agentes estão produzindo.

### 3.2 Key Interaction Paradigms

- **Click-to-Inspect:** Clicar em qualquer agente abre painel lateral com detalhes (Padrão 1 da pesquisa)
- **Multi-Tab Inspector:** Painel com abas Info/Task/Log/Findings (Padrão 2)
- **Status Visual no Sprite:** Animações e ícones refletem estado em tempo real (Padrão 4)
- **Activity Feed:** Log global cronológico no canto inferior (Padrão 5)
- **Colonist Bar:** Retratos dos agentes ativos fixos no topo da tela (Padrão 3)
- **Notificação RPG:** Popups temáticos para eventos importantes

### 3.3 Core Screens and Views

1. **Login Screen** — "Choose your pill" (pílula vermelha/azul, code rain, glitch transition)
2. **The Construct** — Escritório principal com as duas alas + corredor + Morpheus Room
3. **Agent Inspector Panel** — Painel lateral terminal-style ao clicar num agente
4. **Morpheus Room View** — Sala de comando com visão geral e métricas globais
5. **Notification System** — Popups RPG-style para eventos

### 3.4 Accessibility

None (MVP). WCAG AA considerado para v2.

### 3.5 Branding

- **Universo:** The Matrix (filme, 1999)
- **Paleta primária:** Matrix Green (#0D0208 → #003B00 → #008F11 → #00FF41)
- **Paleta secundária:** Cyberpunk Neon (#EA00D9 magenta, #0ABDC6 cyan, #7C4DFF violet)
- **Tipografia:** Monospace para UI/terminal, pixel font para in-game
- **Efeitos:** Code rain, CRT scanlines, glitch, bullet time
- **Som:** Lo-fi cyberpunk ambient + teclas de teclado

### 3.6 Target Device and Platforms

Web Responsive (Desktop priority, laptop/monitor). Tablet como secondary target. Mobile não é target no MVP.

---

## 4. Technical Assumptions

### 4.1 Repository Structure

**Monorepo** — O The Matrix AI Visual será uma nova pasta no monorepo existente do The Matrix AI:

```
the-matrix-ai/
├── apps/
│   └── visual/              ← The Matrix AI Visual (novo)
│       ├── src/
│       │   ├── game/        ← Phaser scenes, sprites, game logic
│       │   ├── server/      ← Node.js + Express + SSE
│       │   └── shared/      ← Types, constants compartilhados
│       ├── assets/
│       │   ├── sprites/     ← Aseprite exports (PNG sprite sheets)
│       │   ├── tilesets/    ← LDtk exports
│       │   └── audio/      ← Sons e música
│       └── package.json
├── .lmas-core/
├── docs/
└── ...
```

### 4.2 Service Architecture

**Monolith** com separação client/server:

| Camada | Stack | Papel |
|--------|-------|-------|
| **Game Client** | Phaser 3 (TypeScript) | Rendering pixel art, animações, interação |
| **Server** | Node.js + Express | Serve static files, SSE endpoint, lê filesystem LMAS |
| **Data Source** | Filesystem LMAS + Git | Handoffs, logs, story files, commits |

Sem banco de dados no MVP. Dados lidos diretamente do filesystem e git.

### 4.3 Testing Requirements

**Unit + Integration:**

- Unit tests: Jest para lógica de negócio (data parsing, state management)
- Integration tests: Testes de SSE endpoint, data parsing de arquivos LMAS
- Visual tests: Não no MVP (complexidade de testar canvas rendering)
- E2E: Não no MVP

### 4.4 Additional Technical Assumptions

- **Game Engine:** Phaser 3 (TypeScript, v3.90 stable) — escolhido por estabilidade, ecossistema 2D completo, 1800+ exemplos documentados, comunidade enorme. Migração para Phaser 4 planejada na v2.0 quando estiver stable (ver ADR-1 na Arquitetura)
- **Sprite Creation:** Aseprite (compilado do fonte, $0) — padrão da indústria para pixel art, sprite sheets, animações frame-by-frame
- **Level Design:** LDtk — auto-tiling, criado pelo diretor de Dead Cells, exporta JSON consumível por Phaser
- **Real-time Data:** SSE (EventSource) para server→client (95% do fluxo: estados, métricas). WebSocket opcional para comandos do usuário
- **Resolução:** 320x180 base com 6x integer scaling para 1080p (nearest-neighbor obrigatório)
- **Perspectiva MVP:** Top-down (Stardew Valley style). Isométrico planejado para v2.0
- **Deploy:** VPS Hostinger (187.77.227.95), Node.js process com PM2
- **Phaser PixUI:** Biblioteca de UI pixel art para Phaser — avaliada para elementos de UI in-game

### 4.5 Constraints

- **CON1:** CLI First (faseado) — **v1.0:** O Visual é camada de observabilidade, não envia comandos (Constitution Art. I). **v2.0:** O Visual se torna terminal visual do LMAS — pode criar agentes, workflows e squads, replicando as capacidades do CLI. Constitution Art. I será emendado para reconhecer o Game como interface equivalente ao CLI
- **CON2:** Zero custo de ferramentas — Stack 100% open-source
- **CON3:** Sem banco de dados no MVP — Dados do filesystem/git
- **CON4:** Assets pixel art devem ser criados do zero (personagens Matrix, escritório) usando Aseprite + LDtk. **Responsável:** Luan (owner do projeto), com auxílio de IA generativa (Gemini/DALL-E) para concept art de referência e @ux-design-expert (Sati) para design specs
- **CON5:** MVP top-down. Migração para isométrico somente na v2.0
- **CON6:** Deploy na VPS existente (2 vCPUs, 8GB RAM) — deve ser leve

---

## 5. Epic List

### Epic 1: Foundation & Game Engine Setup
Estabelecer infraestrutura do projeto, configuração do Phaser 3, servidor Express com SSE, e renderizar o primeiro cenário estático do escritório com tiles.

### Epic 2: Agent Sprites & Character System
Criar personagens pixel art dos 19 agentes LMAS, implementar sprite sheets com animações, sistema de status visual, e pathfinding básico para movimentação.

### Epic 3: Data Integration & Real-Time State
Conectar o Visual ao filesystem LMAS, implementar SSE para atualização de estado dos agentes em tempo real, e sincronizar dados de git/handoffs/logs.

### Epic 4: Interaction & Inspector Panel
Implementar click-to-inspect nos agentes, painel lateral terminal-style, colonist bar, activity feed, e sistema de notificações RPG.

### Epic 5: Smith Patrol & Visual Effects
Implementar comportamento especial do Smith (patrulha, inspeção, veredictos animados), login screen temática, e efeitos visuais Matrix (code rain, glitch, bullet time).

---

## 6. Epic Details

### Epic 1: Foundation & Game Engine Setup

**Goal:** Estabelecer a base técnica do projeto com Phaser 3, servidor Express, SSE, e o cenário estático do escritório renderizado com tiles LDtk. Ao final deste epic, o usuário deve ver o escritório vazio rodando no browser com o servidor servindo dados via SSE.

#### Story 1.1: Project Scaffolding & Phaser 3 Setup

> Como desenvolvedor,
> quero ter o projeto configurado com Phaser 3 + TypeScript + build tooling,
> para que eu tenha a base funcional para desenvolver o game.

**Acceptance Criteria:**
1. Diretório `apps/visual/` criado no monorepo com `package.json`, `tsconfig.json`
2. **npm workspaces** configurado no `package.json` raiz: `"workspaces": ["apps/*"]` para integração monorepo
3. Phaser 3 (v3.90+) instalado e configurado com TypeScript
4. Build tool (Vite ou webpack) configurado para desenvolvimento com hot reload
5. Uma Phaser Scene vazia renderizando canvas 320x180 com scaling 6x para 1080p
6. Nearest-neighbor interpolation ativo (pixel art nítido)
7. `npm run dev` inicia o game no browser em `http://localhost:3000`
8. `npm run build` gera build de produção
9. ESLint + TypeScript strict mode configurados

#### Story 1.2: Express Server & SSE Endpoint

> Como desenvolvedor,
> quero ter um servidor Express que serve o game client e expõe um endpoint SSE,
> para que o frontend receba atualizações de estado em tempo real.

**Acceptance Criteria:**
1. Servidor Express criado em `apps/visual/src/server/`
2. Serve os arquivos estáticos do build do Phaser
3. Endpoint `GET /api/events/stream` retorna SSE (Content-Type: text/event-stream)
4. SSE envia heartbeat a cada 30 segundos para manter conexão
5. SSE envia evento mock de teste (`agent-status-update`) a cada 5 segundos
6. Cliente Phaser se conecta ao SSE e loga eventos no console
7. CORS configurado para permitir apenas origins autorizadas (localhost:3000 em dev, domínio em prod)
8. Headers de segurança configurados (X-Content-Type-Options, X-Frame-Options)
9. Testes de integração para o endpoint SSE

#### Story 1.3: Office Tilemap & Static Scene

> Como usuário,
> quero ver o escritório pixelado no browser com as duas alas e o corredor,
> para que eu tenha o cenário base onde os agentes vão trabalhar.

**Acceptance Criteria:**
1. Tileset do escritório criado em LDtk com tiles 16x16
2. Layout do mapa com: Software Dev Wing (esquerda), Marketing Wing (direita), corredor central, Morpheus Room (inferior)
3. Phaser importa e renderiza o mapa LDtk corretamente
4. Tiles incluem: pisos escuros, mesas, cadeiras, monitores, paredes, portas
5. Paleta Matrix aplicada (tons escuros com acentos verdes)
6. Mapa scrollável se maior que a viewport
7. Câmera posicionada para mostrar o escritório completo no zoom padrão

---

### Epic 2: Agent Sprites & Character System

**Goal:** Criar os personagens pixelados dos agentes LMAS com animações de estado, sistema de status visual, e posicionamento no mapa. Ao final, o usuário verá os 19 agentes sentados nas suas mesas com animações idle.

#### Story 2.1: Base Character Sprite System

> Como desenvolvedor,
> quero um sistema genérico de personagem com sprite sheet e animações,
> para que eu possa criar múltiplos agentes reutilizando a mesma base.

**Acceptance Criteria:**
1. Classe `Agent` (ou componente) criada com suporte a sprite sheet Aseprite
2. Animações suportadas: idle, working, walking (4 direções)
3. Sistema de status visual (glow colorido ao redor do sprite): verde, amarelo, vermelho, cinza
4. Ícone flutuante sobre a cabeça (emoji ou sprite pequeno)
5. Bolha de fala que aparece/desaparece com texto configurável
6. Personagem se posiciona em coordenada (x, y) do mapa
7. Testes unitários para state machine de animações

#### Story 2.2: First 5 Agent Sprites (Core Team)

> Como usuário,
> quero ver Neo, Oracle, Trinity, Smith e Morpheus no escritório como personagens pixelados distintos,
> para que eu reconheça cada agente visualmente.

**Acceptance Criteria:**
1. 5 sprite sheets criados em Aseprite: Neo (casaco preto, óculos), Oracle (vestido, avental), Trinity (couro preto), Smith (terno, óculos, earpiece), Morpheus (casaco, óculos)
2. Cada personagem tem pelo menos 3 animações: idle (sentado), working (digitando), walking (4 frames por direção)
3. Sprites são 16x32px (ou proporção similar) em estilo Hi-Bit (16-bit com detalhes)
4. Personagens posicionados nas mesas corretas conforme layout do mapa
5. Animação idle rodando continuamente
6. Todos os sprites exportados como PNG sprite sheets consumíveis pelo Phaser
7. **Pipeline de assets:** Concept art (IA generativa) → Sprite sheet (Aseprite manual) → Export (PNG+JSON) → Import (Phaser). Owner: Luan

#### Story 2.3: Remaining Agent Sprites (Full Team)

> Como usuário,
> quero ver todos os 19 agentes LMAS no escritório com visual único,
> para que a experiência esteja completa visualmente.

**Acceptance Criteria:**
1. Sprite sheets criados para os 14 agentes restantes:
   - **Software Dev Wing:** Architect, Keymaker, Niobe, Link, Tank, Sati, Operator
   - **Marketing Wing:** Lock, Mouse, Sparks, Merovingian, Persephone, Ghost, Seraph
2. Cada personagem tem visual único que remete ao personagem Matrix
3. Posicionados nas alas corretas (Software Dev Wing vs Marketing Wing)
4. Operator permanece sentado (nunca sai da cadeira, conforme documento de ideia)
5. Ghost tem efeito de transparência/translucidez
6. Todos usam o mesmo sistema de animação base da Story 2.1

**Lista completa dos 19 agentes LMAS:**

| # | AgentId | Persona | Wing | Nota Visual |
|---|---------|---------|------|-------------|
| 1 | neo | Neo | Software Dev | Casaco preto, óculos |
| 2 | oracle | Oracle | Software Dev | Vestido, avental |
| 3 | trinity | Trinity | Software Dev | Couro preto |
| 4 | smith | Smith | Central (corredor) | Terno, óculos, earpiece |
| 5 | morpheus | Morpheus | Central (sala própria) | Casaco, óculos |
| 6 | architect | Architect | Software Dev | Visual austero, clean |
| 7 | keymaker | Keymaker | Software Dev | Muitas chaves |
| 8 | niobe | Niobe | Software Dev | Piloto, prática |
| 9 | link | Link | Software Dev | Headset, operador |
| 10 | tank | Tank | Software Dev | Robusto, técnico |
| 11 | sati | Sati | Software Dev | Criança, cores vivas |
| 12 | operator | Operator | Software Dev | Sempre sentado |
| 13 | lock | Lock | Marketing | Comandante, uniforme |
| 14 | mouse | Mouse | Marketing | Jovem, criativo |
| 15 | sparks | Sparks | Marketing | Comunicador |
| 16 | merovingian | Merovingian | Marketing | Elegante, francês |
| 17 | persephone | Persephone | Marketing | Sofisticada |
| 18 | ghost | Ghost | Marketing | Translúcido |
| 19 | seraph | Seraph | Marketing | Guardião |

---

### Epic 3: Data Integration & Real-Time State

**Goal:** Conectar o Visual aos dados reais do LMAS (filesystem, git) e atualizar o estado dos agentes em tempo real via SSE. Ao final, os agentes refletem o estado real do trabalho — quem está ativo, que task está rodando, últimos commits.

#### Story 3.1: LMAS Filesystem Data Reader

> Como desenvolvedor,
> quero um módulo que lê dados do filesystem LMAS (handoffs, logs, stories),
> para que o Visual reflita o estado real dos agentes.

**Acceptance Criteria:**
1. Módulo `DataReader` que lê: `.lmas/handoffs/`, `.lmas/logs/`, `docs/stories/`
2. Parseia handoff YAML para extrair: from_agent, to_agent, story_context, decisions
3. Parseia story files para extrair: status, checkboxes completas, agente ativo
4. Parseia logs para extrair: últimas ações por agente com timestamp
5. Retorna dados normalizados num formato `AgentState` uniforme
6. File watcher (fs.watch ou chokidar) para detectar mudanças no filesystem
7. Testes unitários com fixtures de arquivos mock

#### Story 3.2: Git Activity Integration

> Como desenvolvedor,
> quero que o Visual leia atividade git (commits, branches),
> para que entregas (commits) dos agentes sejam refletidas no escritório.

**Acceptance Criteria:**
1. Módulo `GitReader` que executa `git log`, `git status`, `git branch` via child_process
2. Extrai: último commit (mensagem, autor, timestamp), branch atual, arquivos modificados
3. Mapeia commits para agentes via convenção de commit message (ex: `feat: ... [Story 2.1]` → @dev)
4. Atualiza estado do agente quando novo commit é detectado
5. Polling a cada 10 segundos (ou configurável)
6. Testes com repositório git mock

#### Story 3.3: SSE Real-Time Broadcasting

> Como usuário,
> quero que os agentes no escritório mudem de estado em tempo real quando algo acontece,
> para que eu veja o trabalho acontecendo ao vivo.

**Acceptance Criteria:**
1. DataReader e GitReader alimentam o SSE endpoint com eventos tipados
2. Eventos SSE: `agent-status`, `agent-task`, `agent-delivery`, `smith-verdict`, `workflow-update`
3. Cliente Phaser recebe eventos e atualiza sprites (animação, status, bolha de fala)
4. Latência de atualização < 2 segundos entre mudança no filesystem e reflexo visual
5. Reconexão automática do SSE client em caso de desconexão
6. Heartbeat a cada 30s para manter conexão viva

---

### Epic 4: Interaction & Inspector Panel

**Goal:** Implementar a interação do usuário com os agentes — click-to-inspect, painel de detalhes, colonist bar, activity feed e notificações. Ao final, o usuário pode clicar em qualquer agente e ver informações detalhadas.

#### Story 4.1: Click-to-Inspect & Agent Inspector Panel

> Como usuário,
> quero clicar num agente e ver um painel lateral com detalhes do que ele está fazendo,
> para que eu possa inspecionar entregas e tasks.

**Acceptance Criteria:**
1. Clicar em qualquer personagem abre painel lateral (overlay HTML ou Phaser UI)
2. Painel estilo terminal Matrix (fundo preto #0D0208, texto verde #00FF41, fonte monospace)
3. Conteúdo do painel: nome do agente, persona, status, task atual, última fala, findings (quantidade por severidade, se aplicável), últimas ações (timestamp)
4. Botão [Ver detalhes] para expandir findings ou task details
5. Clicar em área vazia ou pressionar ESC fecha o painel
6. Apenas um painel aberto por vez (clicar em outro agente troca)
7. Hover sobre agente mostra tooltip rápido (nome + status)
8. Animação de abertura/fechamento do painel (slide-in/out)

#### Story 4.2: Colonist Bar & Activity Feed

> Como usuário,
> quero ver retratos dos agentes no topo e um log de atividades no rodapé,
> para ter visão geral sem precisar clicar em cada um.

**Acceptance Criteria:**
1. Barra superior com mini-retratos (16x16 ou 24x24) de todos os agentes ativos
2. Indicador de status no retrato (borda colorida: verde/amarelo/vermelho/cinza)
3. Clicar no retrato centraliza a câmera no agente correspondente
4. Activity feed no rodapé com scroll: `[HH:MM] @agente — ação realizada`
5. Feed filtrável por agente (clicar no retrato filtra o feed)
6. Últimas 50 atividades mantidas no feed (FIFO)

#### Story 4.3: RPG-Style Notifications

> Como usuário,
> quero receber notificações temáticas quando eventos importantes acontecem,
> para que eu não perca entregas e veredictos do Smith.

**Acceptance Criteria:**
1. Notificações aparecem como popup no estilo RPG (borda pixel art, fundo escuro)
2. Tipos de notificação: entrega concluída, Smith verdict, workflow change, erro/blocker
3. Notificação mostra: ícone do agente, título do evento, descrição curta, e botões de ação contextuais (ex: [Sim/Não] para acionar Smith, [Ver findings/Ignorar] para vereditos)
4. Notificações empilham verticalmente (máximo 3 visíveis)
5. Auto-dismiss após 10 segundos (ou dismiss manual via clique)
6. Som sutil ao aparecer (opcional, configurável)

#### Story 4.4: Morpheus Room — Command Center

> Como usuário,
> quero uma sala especial de comando (Morpheus Room) com visão geral do sistema,
> para ter um centro de controle com métricas, workflows e preview do terminal do orquestrador.

**Acceptance Criteria:**
1. Sala acessível via porta especial no corredor central (com efeito glow verde)
2. Tela de comando DOM overlay mostrando: agentes ativos, story atual, workflow ativo
3. Preview do terminal do orquestrador (read-only no v1.0, interativo no v2.0)
4. Métricas do sistema: stories completas vs total, última atividade, health geral dos agentes
5. Botão [Voltar ao escritório] para retornar ao Construct

---

### Epic 5: Smith Patrol & Visual Effects

**Goal:** Implementar o comportamento especial do Smith (patrulha, veredictos), a tela de login temática, e os efeitos visuais Matrix. Ao final, a experiência completa estará pronta com toda a atmosfera Matrix.

#### Story 5.1: Smith Patrol System

> Como usuário,
> quero ver o Smith patrulhando o corredor e parando atrás de agentes para verificar entregas,
> para ter a experiência completa do verificador adversarial.

**Acceptance Criteria:**
1. Smith caminha automaticamente pelo corredor entre as duas alas (pathfinding simples)
2. Quando uma entrega é concluída, Smith caminha até o agente e para atrás dele
3. Bolha de fala aparece com frase in-character ("Hmm... interesting.", "I've been expecting this.")
4. Após verificação, animação de veredicto: Smith ajusta óculos → texto aparece (COMPROMISED/INFECTED/CONTAINED/CLEAN)
5. Cores do veredicto: CLEAN=verde, CONTAINED=amarelo, INFECTED=laranja, COMPROMISED=vermelho
6. Sprite do Smith muda para pose agressiva quando encontra problemas
7. Após veredicto, Smith retoma patrulha

#### Story 5.2: Login Screen — "Choose Your Pill"

> Como usuário,
> quero uma tela de login temática com pílulas vermelha/azul e code rain,
> para ter a experiência imersiva de "entrar na Matrix".

**Acceptance Criteria:**
1. Tela de entrada com fundo preto e code rain verde caindo (login cosmético, sem autenticação)
2. Texto temático: "Wake up..." → "The Matrix has you..." → "Follow the white rabbit" (animação typewriter)
3. Pílula vermelha (entrar no Construct) e pílula azul (fechar/escurecer) como botões pixelados
4. Ao clicar na pílula vermelha: efeito de transição glitch → fade para o escritório
5. Code rain: colunas de caracteres katakana/numéricos caindo com velocidades variadas
6. Responsivo para telas desktop (1280x720 mínimo)
7. **Nota:** Autenticação real (email/senha, sessões) planejada para v2.0

#### Story 5.3: Matrix Visual Effects

> Como usuário,
> quero ver code rain nas janelas, partículas verdes flutuando e efeitos CRT,
> para que a atmosfera Matrix esteja completa.

**Acceptance Criteria:**
1. Code rain renderizado nas janelas do escritório (colunas de caracteres verdes caindo)
2. Partículas verdes sutis flutuando no ar do escritório
3. Glitch effect sutil quando um agente encontra um bug/erro
4. Slow motion (bullet time) por 2-3 segundos quando Smith emite veredicto COMPROMISED
5. CRT scanlines como overlay opcional (toggle on/off)
6. Portas entre alas com efeito de portal verde sutil
7. Relógio digital no topo mostrando hora real

---

## 7. v2.0 Roadmap — Game como Terminal Visual do LMAS

> *"Livre sua mente."* — Morpheus

### 7.1 Visão

O v2.0 transforma o The Construct de camada de observação para **terminal visual completo do LMAS**. Tudo que o usuário faz hoje no CLI via `@agent` e `*commands`, poderá fazer de dentro do game — com a mesma potência, mas com experiência visual imersiva.

O game se torna a **interface principal** do framework. Cada usuário pode:
- Criar e customizar agentes (novos personas, novos ícones)
- Criar e executar workflows (SDC, Spec Pipeline, etc.)
- Criar squads com composição customizada
- Ativar agentes e emitir comandos via interface visual

### 7.2 Mapa de Cobertura CLI → Game (por domínio)

O game deve cobrir TODOS os domínios do framework. Abaixo, o mapeamento completo:

**Framework & Orchestration (Morpheus Room):**

| Capacidade CLI | Representação no Game |
|---------------|----------------------|
| `@agent` — Ativar agente | Clicar no personagem → inspector com contexto do agente |
| `*create agent/workflow/squad` | Morpheus Room → interface de criação visual |
| `*modify agent` | Inspector panel → botão editar configuração |
| `*workflow {name}` — Executar | Morpheus Room → visualizar/iniciar workflows |
| `*domains` / `*route` | Morpheus Room → mapa de domínios e roteamento |
| `*ids check/impact/stats` | Morpheus Room → métricas e registry visual |
| `*brainstorm` | Sala de reunião visual com agentes participantes |

**Software Development (SW Dev Wing):**

| Capacidade CLI | Representação no Game |
|---------------|----------------------|
| `*draft` / `*create-story` | @sm (Niobe) → painel de criação de story |
| `*validate-story-draft` | @po (Keymaker) → checklist visual |
| `*develop` / `*build` | @dev (Neo) → visualizar progresso de implementação |
| `*review` / `*gate` | @qa (Oracle) → painel de QA com veredito |
| `*push` / `*create-pr` | @devops (Operator) → painel de deploy |
| `*create-schema` / `*security-audit` | @data-engineer (Tank) → painel de DB |
| `*create-architecture` | @architect → painel de arquitetura |
| `*research` / `*wireframe` | @ux (Sati) / @analyst (Link) → painéis de pesquisa |

**Marketing (Marketing Wing):**

| Capacidade CLI | Representação no Game |
|---------------|----------------------|
| `*content-strategy` / `*brief` | @strategist (Persephone) → painel de estratégia |
| `*write-copy` / `*ad-copy` | @copywriter (Mouse) → painel de criação |
| `*publish` / `*schedule-post` | @social (Sparks) → calendário visual |
| `*budget-allocation` / `*roi-report` | @traffic (Merovingian) → dashboard de métricas |
| `*approve-campaign` / `*brand-review` | @chief (Lock) → painel de aprovação |
| Pesquisa de mercado / concorrentes | @researcher (Ghost) → painel de pesquisa |
| Review de conteúdo / brand | @reviewer (Seraph) → painel de revisão |

**Verificação (Corredor — Smith):**

| Capacidade CLI | Representação no Game |
|---------------|----------------------|
| `*verify` | Notificação → botão [Sim] aciona Smith → patrulha até agente |
| `*verdict` | Animação de veredito com overlay visual |
| `*stress-test` / `*find-missing` | Smith para atrás do agente, analisa, exibe findings |

### 7.3 Funcionalidades Planejadas (v2.0)

| Feature | Equivalente CLI | Descrição |
|---------|----------------|-----------|
| **Agent Creator** | `@morpheus *create agent` | Interface visual para criar novos agentes com persona, ícone, e capabilities |
| **Workflow Builder** | `@morpheus *create-workflow` | Drag-and-drop de passos de workflow com agentes |
| **Squad Manager** | `@morpheus *create squad` | Montar squads com agentes selecionados |
| **Command Terminal** | `@agent *command` | Terminal integrado in-game (Morpheus Room) para comandos diretos |
| **Agent Editor** | `@morpheus *modify agent` | Editar configuração de agentes existentes via inspector |
| **Story Manager** | `@sm *draft` + `@po *validate` | Criar e validar stories visualmente |
| **QA Dashboard** | `@qa *review` + `*gate` | Painel de quality gate com métricas e veredito |
| **DevOps Panel** | `@devops *push` + `*create-pr` | Painel de deploy com status de CI/CD |
| **Marketing Hub** | `@copywriter` + `@social` + `@traffic` | Hub de marketing: copy, calendário, budget, campanhas |
| **Data Studio** | `@data-engineer *create-schema` | Interface visual para schema design e migrations |
| **Autenticação** | N/A | Login real com email/senha, sessões de usuário |
| **Multi-tenant** | N/A | Cada usuário tem seu workspace isolado |

### 7.4 Implicações Técnicas

| Aspecto | v1.0 (MVP) | v2.0 |
|---------|-----------|------|
| **Dados** | Filesystem read-only | REST API CRUD + filesystem |
| **Auth** | Cosmético (pílulas) | Real (JWT + sessions) |
| **Constitution** | Art. I: CLI First | Art. I emendado: CLI + Game como interfaces equivalentes |
| **Banco de dados** | Nenhum | SQLite/PostgreSQL para user data |
| **WebSocket** | Opcional | Obrigatório (comandos bidirecionais) |
| **Deploy** | Single-user, local/VPS | Multi-user, VPS |

### 7.5 Pré-requisitos do v2.0

1. v1.0 completo e funcional (Epics 1-5)
2. Emenda na Constitution Art. I ("CLI + Game são interfaces equivalentes")
3. PRD v2.0 separado com requisitos detalhados
4. Novo epic: "Epic 6: Interactive Terminal" com stories específicas

### 7.6 Arquitetura Preparatória (v1.0 → v2.0)

A arquitetura v1.0 já deve preparar a extensibilidade:
- **Agent config externalizável**: registry de agentes em JSON/YAML (hardcoded no v1.0, dinâmico no v2.0)
- **SSE → WebSocket migration path**: estrutura de eventos compatível
- **Server modular**: Express routes separados por domínio (prontos para CRUD)
- **State Manager**: centralizado, pronto para receber writes além de reads

---

## 8. Checklist Results Report

*A ser preenchido após revisão por @qa.*

---

## 9. Next Steps

### 9.1 UX Expert Prompt

> @ux-design-expert (Sati): Leia o PRD em `docs/PRD-THE-MATRIX-AI-VISUAL.md` e a pesquisa de mercado em `docs/MARKET-RESEARCH-PIXEL-ART-GAMES.md`. Crie o UX spec para o The Matrix AI Visual, focando em: layout do escritório (tilemap), design dos 19 personagens pixel art, painel de inspeção terminal-style, colonist bar, e as telas de login/transição. Use as referências visuais de Katana ZERO, Stardew Valley, Game Dev Story e VirtuaVerse.

### 9.2 Architect Prompt

> @architect: Leia o PRD em `docs/PRD-THE-MATRIX-AI-VISUAL.md`. Crie a arquitetura técnica detalhada para o The Matrix AI Visual: estrutura de diretórios, módulos Phaser (scenes, game objects, plugins), servidor Express com SSE, data readers (filesystem + git), e pipeline de build. Stack definida: Phaser 3 (v3.90) + TypeScript + Node.js/Express + SSE. Considere performance para 19 sprites animados e efeitos visuais simultâneos.

---

*PRD v1.2 — Atualizado em 2026-03-15*
*Inputs: THE-MATRIX-AI-VISUAL.md (documento de ideia) + MARKET-RESEARCH-PIXEL-ART-GAMES.md (pesquisa de mercado)*
*v1.0: Observabilidade visual (Epics 1-5) → v2.0: Terminal interativo completo do LMAS*
*Próximo passo: Implementar Epic 1 (Foundation & Game Engine Setup)*
