# Pesquisa de Mercado: Pixel Art Games para The Matrix AI Visual

> Pesquisa conduzida em 2026-03-14 por Morpheus (LMAS Master)
> 4 frentes de pesquisa paralelas: top games, estética cyberpunk/Matrix, virtual office games, tech stack

---

## Sumário Executivo

### Conclusão Principal

O The Matrix AI Visual deve se inspirar no estilo **Hi-Bit** (pixel art moderno sem restrições retro), combinando sprites 16-bit detalhados com **efeitos visuais modernos** (iluminação dinâmica, partículas, CRT shaders). A perspectiva deve ser **top-down** no MVP, evoluindo para **isométrico** na v2.

### Referências Visuais Primárias

| Jogo | O que Pegar | Por que |
|------|-------------|---------|
| **Katana ZERO** | Bullet time, paleta neon-noir, glitch effects | Mais próximo da estética Matrix em pixel art |
| **Stardew Valley** | NPCs com schedules autônomos, interação por clique | 50M vendas, prova que o modelo funciona |
| **Game Dev Story** | Sprites sentados nas mesas produzindo pontos | Exatamente o conceito de "observar equipe trabalhando" |
| **AgentOffice** | Escritório pixel art com agentes AI autônomos | Projeto existente quase idêntico ao conceito |
| **Pixel Agents** | Agentes AI como sprites com animações de estado | VS Code extension que já faz algo similar |
| **RimWorld** | Character inspection, task queue, prioridades | Melhor referência de UI para inspecionar personagens |
| **VirtuaVerse** | Chuva, neon, estética hacker, terminal verde | A atmosfera cyberpunk perfeita em pixel art |

### Stack Tecnológico Recomendado

| Camada | Tecnologia | Custo |
|--------|-----------|-------|
| Game Engine | **Phaser 4** (TypeScript) | Grátis |
| Sprites | **Aseprite** (compilado do fonte) | Grátis |
| Tilesets | **LDtk** (auto-tiling) | Grátis |
| Level Design | **LDtk** | Grátis |
| Real-time | **SSE** + WebSocket (Socket.io) | Grátis |
| Backend | Node.js + Express | Grátis |
| **Total** | | **$0** |

---

## 1. Top Pixel Art Games de Sucesso

### Top 15 por Vendas

| # | Jogo | Ano | Vendas | Metacritic | Estilo |
|---|------|-----|--------|------------|--------|
| 1 | Terraria | 2011 | ~64M | 83 | Side-view 2D, iluminação dinâmica |
| 2 | **Stardew Valley** | 2016 | ~50M | 89-91 | 16-bit SNES, top-down |
| 3 | Hollow Knight | 2017 | ~15M | 87-90 | Hand-drawn + pixel hybrid |
| 4 | Dead Cells | 2018 | ~10M | 89 | Hi-bit, animações frame-by-frame |
| 5 | Undertale | 2015 | 5-10M | 92 | 8-bit minimalista proposital |
| 6 | Vampire Survivors | 2022 | 5-10M | 86 | Sprites retro simples |
| 7 | Balatro | 2024 | ~5M | 90 | Pixel art + CRT shader |
| 8 | Dave the Diver | 2023 | ~5M | 90 | 16-bit detalhado |
| 9 | Enter the Gungeon | 2016 | 3M+ | 87 | Top-down detalhado |
| 10 | Shovel Knight | 2014 | 2.5M+ | 90 | NES-authentic 8-bit |
| 11 | Celeste | 2018 | ~1.7M | 91-94 | 16-bit com partículas modernas |
| 12 | Noita | 2020 | 2-5M | 80 | Pixel-by-pixel physics |
| 13 | Blasphemous | 2019 | ~4M | 78-82 | Gothic 32-bit detalhado |
| 14 | **Katana ZERO** | 2019 | 2-5M | 83 | VHS/neon, slow-motion |
| 15 | Hyper Light Drifter | 2016 | 1-2M | 84 | Hi-bit, paleta vibrante |

### Categorias de Estilo Visual

| Estilo | Resolução | Exemplos | Para Matrix AI |
|--------|-----------|----------|---------------|
| **8-bit/NES** | ~256x240, 25-54 cores | Shovel Knight, Undertale | Muito simples |
| **16-bit/SNES** | ~320x240, 256+ cores | Stardew Valley, Celeste | Bom para NPCs |
| **Hi-Bit** | 480x270+, cores ilimitadas | Dead Cells, Katana ZERO | **RECOMENDADO** |
| **HD-2D** | Sprites pixel + ambiente 3D | Octopath Traveler | Muito complexo |
| **Top-Down** | Variada | Stardew, Vampire Survivors | **PERSPECTIVA MVP** |
| **Isométrico** | Projeção ~30° | Habbo Hotel, SimCity | **PERSPECTIVA V2** |

### Lições dos Jogos Mais Vendidos

| Lição | Evidência |
|-------|-----------|
| **Gameplay > Fidelidade visual** | Vampire Survivors (sprites simples) = 5-10M vendas vs Eastward (sprites lindos) = ~500K |
| **Animação fluida = multiplicador de valor** | Dead Cells e Celeste "parecem premium" pela animação |
| **Paleta coerente > paleta grande** | Undertale com poucos pixels vendeu 5-10M |
| **Efeitos modernos sobre base retro** | Maiores sucessos pós-2018 combinam sprites + iluminação/partículas |
| **Identidade visual única** | Cada top-10 é reconhecível por um screenshot |

### Dados de Mercado

- Jogos indie pixel art: **$400M+ em receita em 2024**
- Lançamentos "Pixel Graphics" no Steam: **1.412 (2020) → 3.458 (2024)** = +145%
- Mercado saturado = diferenciação visual é crítica

---

## 2. Estética Cyberpunk/Matrix em Pixel Art

### Jogos de Referência Principal

**Katana ZERO** (Tier S)
- Bullet time via droga "Chronos" = referência direta ao Matrix
- Paleta neon saturada (magenta, cyan, amarelo) sobre fundos escuros
- Trail effects, slow-motion particles, afterimages

**VA-11 Hall-A** (Tier S)
- Bar cyberpunk com personagens pixel art detalhados
- Tons quentes de neon (rosa, roxo, azul)
- Diálogo como mecânica central — referência para interação com agentes

**The Last Night** (Tier S)
- Sprites pixel art 2D com iluminação 3D volumétrica
- Benchmark visual do gênero cyberpunk pixel art
- Profundidade de campo real sobre sprites

**VirtuaVerse** (Tier S)
- Protagonista hacker, chuva constante, neon glow
- Esquema de cores azul-roxo, caracteres japoneses
- A atmosfera Matrix mais autêntica em pixel art

**SIGNALIS** (Tier A)
- Modo CRT incluído de fábrica
- Tons frios (azuis, cinzas) com acentos vermelhos

### Paleta de Cores Matrix (Valores Exatos)

| Nome | Hex | Uso |
|------|-----|-----|
| Vampire Black | `#0D0208` | Fundo profundo |
| Dark Green | `#003B00` | Caracteres distantes |
| Islam Green | `#008F11` | Caracteres médios, glow secundário |
| **Erin (Matrix Green)** | `#00FF41` | Caracteres brilhantes, cursores |

**Paleta expandida do Code Rain:**

| Cor | Hex | Contexto |
|-----|-----|----------|
| Preto puro | `#020204` | Background absoluto |
| Verde escuro | `#204829` | Caracteres quase invisíveis |
| Verde médio | `#22B455` | Caracteres normais |
| Verde claro | `#80CE87` | Caracteres recentes/brilhantes |

### Paletas Cyberpunk Complementares

**Neon Cyberpunk Clássica:**
`#711C91` (roxo) · `#EA00D9` (magenta) · `#0ABDC6` (cyan) · `#133E7C` (azul) · `#091833` (preto)

**Cores "Não-Naturais":**
`#39FF14` (acid green) · `#FF00FF` (hot pink) · `#00F3FF` (cyan) · `#7C4DFF` (electric violet) · `#050505` (near-black)

**Princípio:** Base quase preta + 1-2 tons neon = o neon "brilha" contra a escuridão.

### Elementos Visuais Matrix em Games

| Elemento | Técnica | Referência |
|----------|---------|------------|
| **Code rain** | Colunas de katakana com bloom verde, sawtooth wave | Hacknet, VirtuaVerse |
| **Verde-sobre-preto** | Paleta `#0D0208` a `#00FF41` | Terminais hacker |
| **Neon sobre escuridão** | Base cinza/marrom + neon cyan/magenta/verde | Katana ZERO, HUNTDOWN |
| **Bullet time** | Slow-motion com trail effects | Katana ZERO |
| **CRT/Scanlines** | Shader: subpixel mask + scanlines + bloom | SIGNALIS |
| **Chuva urbana** | Overlay animado + reflexos no chão | VirtuaVerse, The Last Night |
| **Terminal interface** | Fonte monospace verde, cursor piscando | Hacknet, Uplink |
| **Glitch effects** | Sine waves + ruído + flickering | Katana ZERO, SIGNALIS |
| **Aberração cromática** | Separação RGB nos cantos | SIGNALIS |

### Componentes de Shader CRT

1. **Subpixel Masking** — simula fósforos RGB
2. **Scanlines** — variação horizontal de intensidade
3. **Glow/Bloom** — bloom sutil direcional
4. **Pixel Grid** — reamostragem por resolução
5. **Color Bleeding** — fósforos borram cores adjacentes
6. **Curvature** — barrel distortion das bordas
7. **Vignette** — escurecimento nas bordas

Referência: **CRT-Royale** shader

---

## 3. Virtual Office & Team Simulation Games

### Projetos Diretamente Relevantes

**Pixel Agents** (VS Code Extension, 2026)
- Agentes AI (Claude Code) como sprites pixel art animados
- Digitam quando escrevem código, leem quando buscam arquivos, esperam quando precisam de atenção
- **Token health bars**: rate limits como stats de jogo
- Sub-agent visualization: sub-agentes aparecem como personagens separados
- [GitHub](https://github.com/pablodelucca/pixel-agents)

**AgentOffice** (Monorepo TypeScript)
- Escritório virtual pixel art com agentes AI (Ollama)
- Andam, pensam, conversam, executam código, buscam na web, atribuem tarefas
- **Phaser.js** + **React** para UI overlays
- **Colyseus Room** para loop de pensamento
- **SQLite + embeddings** para memória persistente
- Personalidade via Big Five (OCEAN)
- [GitHub](https://github.com/harishkotra/agent-office)

**AI Town** (a16z + Convex)
- Starter kit MIT-licensed para mundo de agentes AI
- Stack: Convex + Pinecone + OpenAI + Clerk
- Mundo pixel art com agentes que formam relacionamentos
- [GitHub](https://github.com/a16z-infra/ai-town)

**Stanford Generative Agents / Smallville** (2023)
- 25 agentes com sprites 2D numa cidade simulada
- Memória + reflexão + planejamento = comportamento emergente
- Agentes espalham convites para festa autonomamente
- [Paper](https://arxiv.org/abs/2304.03442)

**Squad Pod**
- Fork do Pixel Agents adaptado para framework Squad
- [GitHub](https://github.com/swigerb/squad-pod)

### Jogos de Gestão de Estúdio/Empresa Tech

| Jogo | Destaque | Relevância |
|------|----------|------------|
| **Game Dev Story** (Kairosoft) | Sprites sentados nas mesas produzindo pontos, 4 stats por empregado | Conceito visual core |
| **Software Inc.** | Escritório multi-andares, equipes com personalidades compatíveis | Mecânica de equipe |
| **Game Dev Tycoon** | Garagem → escritório, treinar equipe | Progressão visual |
| **Startup Panic** | Personalidades únicas, eventos aleatórios | Dinâmica de equipe |
| **DevTycoon** | Construir escritórios, gerenciar funcionários, pixel art | Referência visual direta |

### Referências de Autonomia de NPCs

| Jogo | Sistema de Autonomia | Relevância |
|------|---------------------|------------|
| **RimWorld** | Work Details, prioridades, labors atribuídos | Sistema de tarefas |
| **Prison Architect** | Prisoner Profile com 5 abas | Inspector pattern |
| **Two Point Hospital** | Staff Inspector: Info/Mood/Stats/Log | Multi-tab inspector |
| **Stardew Valley** | NPCs com schedules autônomos | Rotinas de agentes |
| **Dwarf Fortress** | Labor system granular | Especialização |

### Padrões de UI para Inspecionar Personagens

**Padrão 1: Click-to-Inspect** (mais comum)
- Clique simples → painel inferior/lateral
- Clique duplo → perfil completo com abas
- Hover → tooltip rápido

**Padrão 2: Multi-Tab Inspector**
- Aba 1: Info (nome, profissão, task atual)
- Aba 2: Mood/Necessidades (felicidade, energia)
- Aba 3: Skills/Stats (habilidades, experiência)
- Aba 4: Log/Histórico (atividades recentes)

**Padrão 3: Barra de Personagens** (Colonist Bar)
- Retratos fixos no topo da tela
- Indicadores de status no retrato
- Clique centra câmera

**Padrão 4: Status Visual no Sprite**
- Thought bubbles sobre o personagem
- Animação reflete estado (digitando, lendo, andando)
- Barras de progresso flutuantes
- Ícones de status sobre a cabeça

**Padrão 5: Activity Feed/Log**
- Stream cronológico: `[timestamp] Agente fez X`
- Filtrável por agente ou tipo

**Padrão 6: Task Queue / Work Priority**
- Lista de tarefas pendentes por personagem
- Sistema de prioridade numérico

**Padrão 7: Token/Resource Bars como Game Stats**
- Métricas técnicas como stats de jogo (HP, mana)
- Rate limits como barras de energia
- Context window como barra de capacidade

### Virtual Offices para Equipes Reais

| Produto | Destaque |
|---------|----------|
| **Gather.town** | Escritório 2D pixel art, proximidade ativa vídeo/mic |
| **SoWork** | 2.5D isométrico, AI bot "Sophia" para notas de reunião |

---

## 4. Tech Stack — Análise Completa

### Game Engines Comparadas

| Engine | Tamanho | Performance (10K sprites) | Pixel Art Nativo | Melhor Para |
|--------|---------|--------------------------|------------------|-------------|
| **Phaser 3/4** | ~500KB | ~45-55fps | Sim (modo pixel) | **RECOMENDADO** |
| **PixiJS** | ~200KB | 60fps (mais rápido) | Manual | Max performance |
| **Excalibur.js** | ~300KB | ~30-40fps | Sim (`pixelArt: true`) | TypeScript-first |
| **Kaplay** | ~150KB | ~25-35fps | Sim | Prototipagem rápida |
| **Three.js** | ~600KB | ~55-60fps | Não (3D) | 2.5D/Isométrico |
| **Godot HTML5** | ~15-20MB | Excelente | Sim (nativo) | Games complexos |
| **Unity WebGL** | ~5-30MB | Boa | Via config | NAO RECOMENDADO |

### Por que Phaser 4?

1. Ecossistema mais completo para jogos 2D no browser
2. Importa diretamente arquivos Aseprite
3. Physics embutido (Arcade, Matter.js)
4. Scene management = separar "salas" do escritório
5. 1800+ exemplos na documentação
6. **Phaser 4 RC** (2025): WebGPU, TypeScript nativo, "Smooth Pixel Art"
7. Plugin WebSocket/Socket.io bem documentado
8. [Phaser PixUI](https://phaser.io/news/2026/02/phaser-pixel-art-ui-library) — UI específica para pixel art

### Ferramentas de Sprite

| Ferramenta | Preço | Melhor Para |
|------------|-------|-------------|
| **Aseprite** | Grátis (compilado) | Personagens, animações (padrão da indústria — compilado do [fonte](https://github.com/aseprite/aseprite), mesmo software, zero custo) |
| **LDtk** | Grátis | Level design, auto-tiling, tilesets (criado pelo diretor de Dead Cells — substitui Pyxel Edit com vantagem do auto-tiling) |
| **Piskel** | Grátis | Experimentação rápida (browser) |

### Nota sobre Custo Zero

O Aseprite é software open-source (licença proprietária para binários, mas código-fonte disponível para compilação pessoal). Compilando do [GitHub](https://github.com/aseprite/aseprite), você obtém **exatamente o mesmo software** — zero diferença funcional.

O LDtk substitui o Pyxel Edit para tilesets, com a vantagem do auto-tiling (recurso que o Pyxel Edit não tem).

**Resultado: stack 100% gratuito sem comprometer qualidade.**

### Perspectiva: Top-Down vs Isométrico

| Aspecto | Top-Down | Isométrico |
|---------|----------|------------|
| Complexidade | Baixa | Média-Alta |
| Coordenadas | Direto (x,y) | Requer transformação |
| Click detection | Trivial | Complexo |
| Arte necessária | Menos sprites | 2-4x mais sprites |
| Visual | Funcional | Mais imersivo |
| Exemplos | Stardew Valley | Habbo Hotel |

**Recomendação:** Top-down no MVP → Isométrico na v2. A lógica do dashboard é a mesma.

### Dados em Tempo Real

| Tecnologia | Direção | Melhor Para |
|-----------|---------|-------------|
| **SSE (EventSource)** | Server → Client | Dashboard, estados, métricas (95% do fluxo) |
| **WebSocket** | Bidirecional | Comandos do usuário para agentes |

```
Backend (Node.js)
├── SSE /api/events/stream → estados dos agentes, métricas, alertas
└── WebSocket ws:// → comandos do usuário [opcional]
```

### Performance — O Que Importa

Para ~20-50 personagens animados + ~200-500 tiles:
- **Canvas 2D é mais que suficiente**
- WebGL via Phaser (automático) dá margem extra
- Otimizações: texture atlases, object pooling, culling, delta updates

### Resolução Recomendada

| Resolução | Scaling 1080p | Nota |
|-----------|---------------|------|
| **320x180** | 6x perfeito | Mais comum, funciona em 720p/1080p/4K |
| 480x270 | 4x perfeito | Mais espaço visual |
| 384x216 | 5x perfeito | Compromisso |

**Regra:** Integer scaling com nearest-neighbor = essencial para pixel art nítido.

---

## 5. Análise Competitiva — Projetos Similares

### Comparação Direta

| Projeto | Conceito | Status | Diferencial do Matrix AI Visual |
|---------|----------|--------|-------------------------------|
| **Pixel Agents** | Sprites de agentes AI no VS Code | Ativo (2026) | Apenas observação, sem interação rica |
| **AgentOffice** | Escritório pixel art + Ollama | Experimental | Sem tema, sem estética Matrix |
| **AI Town** | Mundo pixel art de agentes AI | Starter kit | Genérico, sem contexto de trabalho |
| **Stanford Smallville** | Cidade de agentes AI | Pesquisa | Não é produto, é paper acadêmico |
| **Squad Pod** | Fork de Pixel Agents para Squad | Ativo | Limitado ao VS Code |
| **Gather.town** | Escritório virtual real | Produto ($) | Para humanos, não para agentes AI |

### Diferencial do The Matrix AI Visual

1. **Tema forte e reconhecível** — Matrix é icônico, nenhum concorrente usa
2. **Dados reais de trabalho** — Não é simulação, são agentes trabalhando de verdade
3. **Smith como mecânica única** — Patrulheiro adversarial é game mechanic original
4. **Standalone web app** — Não é extensão de IDE, é experiência independente
5. **Cross-domain** — Software dev + Marketing em um só escritório
6. **Auto-construção** — O produto constrói a si mesmo (meta-level)

---

## 6. Recomendações para o PRD

### Estilo Visual Recomendado: "Matrix Hi-Bit"

Combinar:
- **Base 16-bit** (sprites ~16x32px) estilo Game Dev Story/Stardew Valley
- **Efeitos Hi-Bit** (iluminação dinâmica, partículas, CRT shader) estilo Katana ZERO
- **Paleta Matrix** (#0D0208 a #00FF41) como cor dominante
- **Toques neon cyberpunk** (magenta #EA00D9, cyan #0ABDC6) para acentos
- **Code rain** nas janelas como efeito ambiente constante

### UI Recomendada

1. **Click-to-Inspect** (Padrão 1) para clique nos agentes
2. **Multi-Tab Inspector** (Padrão 2) no painel lateral estilo terminal
3. **Status Visual no Sprite** (Padrão 4) com ícones e animações de estado
4. **Activity Feed** (Padrão 5) como log global no canto inferior
5. **Colonist Bar** (Padrão 3) com retratos dos agentes ativos no topo

### Fases de Desenvolvimento

| Fase | Escopo | Perspectiva |
|------|--------|-------------|
| **MVP** | Escritório estático, ~10 agentes, click-to-inspect, dados de filesystem | Top-down |
| **v1.1** | Smith patrulhando, animações de estado, activity feed | Top-down |
| **v1.5** | SSE real-time, Morpheus Room, notificações in-game | Top-down |
| **v2.0** | Migração para isométrico, efeitos visuais avançados | Isométrico |

### Stack Final

```
Phaser 4 (TypeScript) + Aseprite (compilado) + LDtk + Node.js/Express + SSE
Custo: $0 (100% open-source)
```

---

## Fontes

### Top Pixel Art Games
- [Stardew Valley Sales - VGChartz](https://www.vgchartz.com/article/467162/stardew-valley-sales-top-50-million-units/)
- [Terraria Sales - Game Developer](https://www.gamedeveloper.com/business/re-logic-s-terraria-has-sold-58-7-million-copies-in-13-years)
- [Dead Cells 10M Sales - ResetEra](https://www.resetera.com/threads/dead-cells-has-sold-over-10-million-copies.726381/)
- [Balatro 5M Sales - Game Developer](https://www.gamedeveloper.com/business/balatro-sells-5-million-copies-after-end-of-year-spike)
- [Pixel Art Market 2024 - Logic Simplified](https://logicsimplified.com/newgames/the-resurgence-of-pixel-art-more-than-just-nostalgia/)

### Estética Cyberpunk/Matrix
- [Matrix Code Green - SchemeColor](https://www.schemecolor.com/matrix-code-green.php)
- [Matrix Green Symbolism - Pixflow](https://pixflow.net/blog/the-green-color-scheme-of-the-matrix/)
- [Cyberpunk Pixel Art - Slynyrd](https://www.slynyrd.com/blog/2023/1/30/pixelblog-42-cyberpunk-pixel-art)
- [Lospec Cyberpunk Palettes](https://lospec.com/palette-list/tag/cyberpunk)
- [CRT Effect on Pixel Art - datagubbe.se](https://datagubbe.se/crt/)
- [Best Pixel Art Cyberpunk Games - GameRant](https://gamerant.com/best-pixel-art-cyberpunk-games/)

### Virtual Office & Simulation
- [AgentOffice - DEV Community](https://dev.to/harishkotra/how-i-built-agentoffice-self-growing-ai-teams-in-a-pixel-art-virtual-office-4o0p)
- [Pixel Agents - VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=pablodelucca.pixel-agents)
- [Stanford Generative Agents Paper](https://arxiv.org/abs/2304.03442)
- [AI Town - a16z GitHub](https://github.com/a16z-infra/ai-town)
- [Gather.town](https://www.gather.town/)

### Tech Stack
- [JS Game Engines 2025 - LogRocket](https://blog.logrocket.com/best-javascript-html5-game-engines-2025/)
- [JS Game Rendering Benchmark - GitHub](https://github.com/Shirajuki/js-game-rendering-benchmark)
- [Phaser v4 RC](https://phaser.io/news/2025/05/phaser-v4-release-candidate-4)
- [LDtk Level Editor](https://ldtk.io/)
- [Aseprite Guide 2025](https://generalistprogrammer.com/tutorials/aseprite-complete-professional-pixel-art-guide)
- [SSE vs WebSocket - DEV Community](https://dev.to/polliog/server-sent-events-beat-websockets-for-95-of-real-time-apps-heres-why-a4l)

---

*Pesquisa de Mercado v1.0 — Criada em 2026-03-14*
*Próximo passo: @pm (Trinity) cria PRD formal baseado neste documento + THE-MATRIX-AI-VISUAL.md*
