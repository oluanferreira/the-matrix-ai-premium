# The Matrix AI Visual — Documento de Ideia

> *"Infelizmente, ninguém pode dizer a você o que a Matrix é. Você tem que ver por si mesmo."*
> — Morpheus

---

## A Ideia

**The Matrix AI Visual** é uma experiência gamer 2D com cenário e personagens pixelados, ambientada no universo Matrix, onde você observa e interage em tempo real com sua equipe de agentes de IA trabalhando.

Imagine entrar em um escritório pixelado no estilo retro/cyberpunk. O chão é escuro, a chuva de código verde cai nas janelas. Cada agente é um personagem pixel art sentado na sua mesa. Neo está codando. Oracle está revisando. Smith está patrulhando entre as mesas com as mãos para trás, olhando por cima do ombro dos outros.

Você clica num agente. Um painel abre mostrando o que ele está fazendo neste exato momento. Suas entregas. Seus findings. Sua fila de trabalho. É como um jogo de gerenciamento, mas o trabalho é real.

---

## Experiência do Usuário

### 1. Tela de Login — "Choose your pill"

A tela de login é temática. Fundo preto com code rain verde caindo. Dois campos: email e senha. Mas em vez de um botão "Entrar", há duas pílulas pixeladas:

- 🔴 **Pílula Vermelha** — Entrar (ver a verdade, entrar na Matrix)
- 🔵 **Pílula Azul** — Cancelar (voltar para a ignorância)

Ao clicar na pílula vermelha, a tela faz um efeito de "acordar na Matrix" — transição com glitch visual — e você entra no escritório.

### 2. O Escritório — "The Construct"

O escritório é um cenário 2D pixel art visto de cima (top-down) ou isométrico, inspirado em jogos como **Stardew Valley**, **Habbo Hotel** ou **Squad Pod**.

O ambiente é um andar de escritório dividido em duas alas:

```
┌──────────────────────────────────────────────────────┐
│                    THE CONSTRUCT                       │
│                                                        │
│  ╔══════════════════╗     ╔══════════════════╗        │
│  ║  SOFTWARE DEV    ║     ║    MARKETING     ║        │
│  ║  WING            ║     ║    WING          ║        │
│  ║                  ║     ║                  ║        │
│  ║  [Neo] [Oracle]  ║     ║  [Lock] [Mouse]  ║        │
│  ║  [Arch] [Tank]   ║     ║  [Sparks] [Mero] ║        │
│  ║  [Sati] [Link]   ║     ║  [Perse] [Ghost] ║        │
│  ║  [Niobe][Keymkr] ║     ║  [Seraph]        ║        │
│  ║  [Trinity][Oper]  ║     ║                  ║        │
│  ╚══════════════════╝     ╚══════════════════╝        │
│                                                        │
│          🕶️ [Smith] — patrulhando o corredor           │
│                                                        │
│  ╔══════════════════╗                                  │
│  ║  MORPHEUS ROOM   ║  ← Sala do orquestrador          │
│  ║  (Comando Central)║                                  │
│  ╚══════════════════╝                                  │
└──────────────────────────────────────────────────────┘
```

**Elementos visuais do cenário:**
- Piso escuro com reflexo verde sutil
- Janelas com code rain caindo
- Monitores nos cantos mostrando métricas
- Plantas pixeladas (toque de vida no ambiente cyberpunk)
- Portas entre as alas com efeito de portal verde
- Relógio digital no topo mostrando hora real

### 3. Os Personagens — Pixel Art Animados

Cada agente é um **personagem pixelado** com:
- Sprite sheet com animações (idle, working, walking, talking)
- Roupa/visual que remete ao personagem Matrix
- Ícone flutuante sobre a cabeça (🎯, ✍️, 📱, etc.)
- Bolha de fala com frases in-character quando ativo
- Indicador de status (cor do brilho ao redor):
  - 🟢 Verde = trabalhando ativamente
  - 🟡 Amarelo = aguardando input/aprovação
  - 🔴 Vermelho = bloqueado/erro
  - ⚪ Cinza = idle/disponível

**Personagens e seus visuais:**

| Agente | Visual Pixel Art | Animação Especial |
|--------|-----------------|-------------------|
| **Neo** (dev) | Casaco longo preto, óculos | Digita código, faz "dodge" quando bug é encontrado |
| **Oracle** (qa) | Vestido, avental, cookies | Lê relatórios, oferece cookie quando aprova |
| **Architect** | Terno branco, barba | Desenha diagramas no ar |
| **Trinity** (pm) | Couro preto, cabelo curto | Gerencia quadro Kanban na mesa |
| **Keymaker** (po) | Casaco longo, muitas chaves | Abre/fecha "portas" (stories) |
| **Niobe** (sm) | Roupa de piloto | Pilota entre os agentes coordenando |
| **Link** (analyst) | Headset, monitores múltiplos | Analisa dados em telas holográficas |
| **Tank** (data-eng) | Musculoso, sem fio | Carrega "programas" (dados) nas costas |
| **Sati** (ux) | Menina jovem, vestido colorido | Pinta interfaces no ar como mágica |
| **Operator** (devops) | Na cadeira com headset | Operando terminal verde, nunca sai da cadeira |
| **Lock** (mkt-chief) | Uniforme militar | Anda verificando cada mesa do marketing |
| **Mouse** (copywriter) | Jovem curioso, casual | Digita freneticamente, para e admira o que escreveu |
| **Sparks** (social) | Técnico com ferramentas | Acende "sinais" (posts) que flutuam para cima |
| **Merovingian** (traffic) | Terno elegante, vinho na mão | Analisa gráficos com ar superior |
| **Persephone** (strategist) | Vestido branco elegante | Revela "verdades" em documentos |
| **Ghost** (researcher) | Quase invisível, translúcido | Aparece e desaparece investigando |
| **Seraph** (reviewer) | Pose de guardião, luvas | Testa cada entrega com golpe marcial |
| **Smith** (verifier) | Terno, óculos, earpiece | Patrulha o corredor, para atrás de agentes e observa com desprezo |

### 4. Interação — Clique no Agente

Ao clicar em qualquer personagem, um **painel lateral** abre no estilo terminal Matrix (fundo preto, texto verde):

```
┌─────────────────────────────────┐
│ 🕶️ SMITH — Delivery Verifier    │
│ Status: 🟢 Verificando entrega  │
│ ─────────────────────────────── │
│                                  │
│ 📋 Task Atual:                   │
│ verify-delivery (from @dev)      │
│                                  │
│ 💬 Última fala:                  │
│ "Mr. Anderson... sua entrega     │
│  chegou. Vamos ver o que         │
│  realmente está aqui dentro."    │
│                                  │
│ 📊 Findings: 12                  │
│ ├── CRITICAL: 2                  │
│ ├── HIGH: 4                      │
│ ├── MEDIUM: 5                    │
│ └── LOW: 1                       │
│                                  │
│ 🕐 Últimas ações:               │
│ • 14:32 — Iniciou *verify       │
│ • 14:28 — Recebeu entrega @dev  │
│ • 14:15 — CONTAINED (copy)      │
│                                  │
│ [Ver detalhes] [Falar com agente]│
└─────────────────────────────────┘
```

### 5. Smith — O Patrulheiro

Smith tem comportamento especial no mapa:
- **Não fica parado** — anda pelo corredor entre as alas
- **Para atrás de agentes** — quando uma entrega é concluída, Smith caminha até o agente e fica atrás dele observando
- **Bolha de fala aparece**: *"Hmm... interesting."* ou *"I've been expecting this."*
- **Quando encontra problemas**: Sprite muda para pose agressiva, bolha vermelha com finding
- **Animação de veredicto**: Smith ajusta os óculos → texto aparece: "COMPROMISED" / "INFECTED" / "CONTAINED" / "CLEAN"

### 6. Morpheus Room — Comando Central

A sala do Morpheus é especial:
- **Visão geral** de todos os agentes e seus status
- **Workflow ativo** — mostra o pipeline atual (content pipeline, campaign pipeline, story development cycle)
- **Métricas globais** — entregas hoje, tasks completas, findings do Smith
- **Cadeira do Morpheus** ao centro — quando clicada, abre o terminal do orquestrador

### 7. Efeitos Visuais Matrix

- **Code rain** nas janelas (clássico verde caindo)
- **Glitch effects** quando um agente encontra um bug
- **Slow motion** (bullet time) quando Smith emite um veredito COMPROMISED
- **Partículas verdes** flutuando no ar
- **Som ambiente**: trilha lo-fi cyberpunk + teclas de teclado
- **Transições de tela** com efeito de "decodificação" da Matrix

### 8. Notificações In-Game

Eventos importantes aparecem como notificações no estilo RPG:

```
┌─────────────────────────────────┐
│ 📨 Nova Entrega                  │
│ Neo completou: feat: payment API │
│                                  │
│ 🕶️ Deseja que o Smith verifique? │
│ [Sim]  [Não]                     │
└─────────────────────────────────┘
```

```
┌─────────────────────────────────┐
│ ⚠️ Smith Verdict: INFECTED       │
│ 4 HIGH findings na entrega do    │
│ Mouse (ad-copy para Meta Ads)    │
│                                  │
│ [Ver findings] [Ignorar]         │
└─────────────────────────────────┘
```

---

## Dados em Tempo Real

### O que alimenta o visual

O visual se conecta ao backend que monitora a atividade dos agentes:

- **Agent status** — Qual agente está ativo, idle, trabalhando, bloqueado
- **Task atual** — Que task cada agente está executando
- **Entregas** — Artefatos produzidos (commits, copies, plans)
- **Smith findings** — Resultados de verificações adversariais
- **Workflow position** — Onde estamos no pipeline (content/campaign/story)
- **Mensagens entre agentes** — Handoffs, delegações, escalações

### Fonte dos dados

No primeiro momento, os dados vêm de:
1. **Arquivos do filesystem** — `.lmas/handoffs/`, `.lmas/logs/`, story files
2. **Git activity** — commits, branches, diffs
3. **Session state** — Qual agente está ativo no Claude Code

Futuramente:
4. **WebSocket em tempo real** — Claude Code envia eventos para o dashboard
5. **API REST** — Para consultar histórico e métricas

---

## Quem Constrói Isso

**O próprio The Matrix AI.**

Este projeto passa pelo pipeline completo do framework:

```
@pm (Trinity)        → Cria o PRD formal a partir deste documento de ideia
@architect (Arch)    → Define arquitetura (Next.js? Phaser.js? Canvas 2D?)
@ux (Sati)           → Desenha as telas, sprites, UX flow
@dev (Neo)           → Implementa o código
@qa (Oracle)         → Testa qualidade
@smith (Smith)       → Verifica cada entrega com olhar adversarial
@devops (Operator)   → Deploy na VPS (187.77.227.95)
```

Cada agente faz sua parte. O resultado é que **The Matrix AI constrói a si mesmo visualmente** — meta-level.

---

## Inspirações

| Referência | O que pegar |
|------------|-------------|
| [OpenSquad](https://github.com/renatoasse/opensquad) | Conceito de Virtual Office, real-time agent monitoring |
| [Squad Pod](https://github.com/swigerb/squad-pod) | Pixel art office, sprites animados, pathfinding, speech bubbles |
| Habbo Hotel | Estilo isométrico 2D, quartos customizáveis |
| Stardew Valley | Pixel art charm, interação com NPCs |
| The Matrix (filme) | Estética, personagens, frases, code rain, bullet time |
| Enter the Matrix (jogo) | Gameplay Matrix, missões, hacking |

---

## Nome

**The Matrix AI Visual** — ou simplesmente **The Construct** (o ambiente de treinamento/simulação da Matrix).

---

## Resumo em Uma Frase

> Um escritório virtual 2D pixel art no universo Matrix onde você vê seus agentes de IA trabalhando em tempo real, clica neles para inspecionar entregas, e o Smith patrulha verificando a qualidade de tudo.

---

*Documento de Ideia v1.0 — Criado em 2026-03-14*
*Este documento será transformado em PRD formal por @pm (Trinity) usando o pipeline do The Matrix AI.*
