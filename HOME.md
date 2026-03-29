---
type: moc
title: "Minha Matrix - Home"
tags:
  - moc
  - home
---

# Minha Matrix - Home

> The Matrix AI Framework — Visual Knowledge Layer

## Navegacao Rapida

### Projetos
- [[dashboards/Projects-Overview|Overview de Todos os Projetos]]
- [[projects/lmas/PROJECT-MOC|LMAS — Framework]] | [[projects/lmas/PROJECT-CHECKPOINT|Checkpoint]]
- [[projects/clawin/PROJECT-MOC|ClaWin1Click — SaaS]] | [[projects/clawin/PROJECT-CHECKPOINT|Checkpoint]]
- [[projects/i5x/PROJECT-MOC|i5x — Agentes WhatsApp]] | [[projects/i5x/PROJECT-CHECKPOINT|Checkpoint]]

### Documentacao Global
- [[docs/core-architecture|Arquitetura Core]]
- [[docs/CHANGELOG|Changelog]]
- [[docs/OBSIDIAN-INTEGRATION-PLAN|Plano de Integracao Obsidian]]

### Atlas (clicavel no Graph View)
- **Dominios:** [[framework/Software-Dev|Software Dev]] | [[framework/Marketing|Marketing]] | [[framework/Business-Brand|Business + Brand]] | [[framework/Sistema|Sistema]]
- **Agentes:** [[framework/agents/Morpheus|Morpheus]] · [[framework/agents/Neo|Neo]] · [[framework/agents/Oracle|Oracle]] · [[framework/agents/Aria|Aria]] · [[framework/agents/Trinity|Trinity]] · [[framework/agents/Smith-Agent|Smith]] e mais 20
- **Squads:** [[framework/squads/Copy-Squad|Copy]] · [[framework/squads/Hormozi-Squad|Hormozi]] · [[framework/squads/Brand-Squad|Brand]] · [[framework/squads/Traffic-Masters|Traffic]] e mais 8
- **Workflows:** [[framework/workflows/SDC|SDC]] · [[framework/workflows/Content-Pipeline|Content]] · [[framework/workflows/Campaign-Pipeline|Campaign]] · [[framework/workflows/Brand-Flow|Brand]] e mais 4

### Documentacao
- [[docs/pt/core-architecture|Arquitetura Core (PT)]]
- [[docs/pt/guides/user-guide|Guia do Usuario]]
- [[docs/pt/guides/workflows-guide|Guia de Workflows]]
- [[docs/pt/guides/agent-selection-guide|Guia de Selecao de Agentes]]
- [[docs/pt/architecture/ARCHITECTURE-INDEX|Index de Arquitetura]]

### Dashboards
- [[dashboards/Project-Overview|Visao Geral do Projeto]]
- [[dashboards/ADR-Index|Index de ADRs]]
- [[dashboards/Architecture-Map|Mapa de Arquitetura]]

### Canvas (Workflows Visuais)
- [[canvas/SDC-Workflow|Story Development Cycle]]
- [[canvas/Agent-Map|Mapa de Agentes]]

### ADRs (Decisoes Arquiteturais)
- [[docs/pt/architecture/adr/ADR-COLLAB-1-current-state-audit|ADR-COLLAB-1: Branch Protection]]
- [[docs/pt/architecture/adr/ADR-COLLAB-2-proposed-configuration|ADR-COLLAB-2: Contribuicao Externa]]
- [[docs/pt/architecture/adr/adr-hcs-health-check-system|ADR-HCS: Health Check System]]
- [[docs/pt/architecture/adr/adr-isolated-vm-decision|ADR-VM: Isolated VM (Substituido)]]

## Estrutura do Vault

| Pasta | Conteudo | Quem escreve |
|-------|---------|-------------|
| `inbox/` | Capturas rapidas, notas nao categorizadas | Humano + Agentes |
| `daily-notes/` | Reflexoes diarias, contexto de sessao | Humano (sagrado) |
| `projects/` | Pastas por projeto (checkpoint, stories, PRD, ADR) | Agentes LMAS |
| `docs/` | Documentacao global do framework | Agentes LMAS |
| `dashboards/` | Queries Dataview, Bases views | Agentes (Fase 2) |
| `canvas/` | Workflows visuais em JSON Canvas | Agentes (Fase 2) |
| `attachments/` | Imagens, PDFs, assets | Qualquer |
| `squads/` | Definicoes de squads | @lmas-master |

## Agentes LMAS (22 agentes)

### Software Dev
| Agente | Persona | Escopo |
|--------|---------|--------|
| @dev | Neo | Implementacao de codigo |
| @qa | Oracle | Testes e qualidade |
| @architect | Aria | Arquitetura e design tecnico |
| @pm | Trinity | Product Management |
| @po | Keymaker | Product Owner, stories/epics |
| @sm | Niobe | Scrum Master |
| @analyst | Link | Pesquisa e analise |
| @data-engineer | Tank | Database design |
| @ux-design-expert | Sati | UX/UI design |
| @devops | Operator | CI/CD, git push (EXCLUSIVO) |

### Marketing
| Agente | Persona | Escopo |
|--------|---------|--------|
| @marketing-chief | Lock | Aprovacao de conteudo, brand governance |
| @copywriter | Mouse | Copywriting para todos os canais |
| @social-media-manager | Sparks | Publicacao (EXCLUSIVO), calendario social |
| @content-strategist | Persephone | Estrategia de conteudo, editorial |
| @content-researcher | Ghost | Pesquisa de mercado, concorrentes |
| @content-reviewer | Seraph | Quality gate de conteudo |
| @seo | Cypher | SEO audits, keywords, E-E-A-T, GEO |

### Business + Brand
| Agente | Persona | Escopo |
|--------|---------|--------|
| @mifune | Mifune | Ofertas, pricing, estrategia de negocio |
| @hamann | Hamann | Conselho estrategico, advisory board |
| @traffic-manager | Merovingian | Trafego pago, budget, ROAS (EXCLUSIVO) |
| @kamala | Kamala | Posicionamento, naming, identidade de marca |
| @bugs | Bugs | Narrativa, storytelling, manifestos |

### Sistema (Cross-Domain)
| Agente | Persona | Escopo |
|--------|---------|--------|
| @lmas-master | Morpheus | Domain Router, Orchestrator, Framework |
| @smith | Smith | Verificador adversarial (red-team) |
| @checkpoint | Checkpoint | Rastreamento de estado do projeto |
| @squad-creator | Craft | Criacao e gestao de squads |

## Squads (12 squads especializados)

| Squad | Agentes | Foco |
|-------|---------|------|
| **advisory-board** | 11 conselheiros | Ray Dalio, Munger, Naval, Thiel, Sinek, e mais |
| **brand-squad** | 15 agentes | Brand equity, posicionamento, identidade, arquitetura |
| **claude-code-mastery** | Meta-squad | Hooks, skills, subagents, MCP, context engineering |
| **c-level-squad** | 6 executivos | CEO, COO, CMO, CTO, CIO, CAIO virtual |
| **copy-squad** | 23 copywriters | Direct response, email, funis, VSLs, cartas de vendas |
| **cybersecurity** | 15 agentes | Pentest, red team, blue team, AppSec, incident response |
| **data-squad** | 7 estrategistas | Analytics, CLV, growth, community, customer success |
| **design-squad** | Complementar | Visual generation, DesignOps, Design System Leadership |
| **hormozi-squad** | 16 agentes | Offers, leads, pricing, sales, hooks, launch, scaling |
| **movement** | 7 agentes | Fenomenologia, identidade, manifestos, ciclos de crescimento |
| **storytelling** | 12 mestres | Mitologia, screenwriting, business storytelling, pitching |
| **traffic-masters** | 16 especialistas | Facebook, YouTube, Google Ads, media buying, scaling |

## Workflows (18 workflows)

### Desenvolvimento (Primary)
| Workflow | Fluxo | Quando usar |
|----------|-------|-------------|
| **Story Development Cycle (SDC)** | @sm → @po → @dev → @qa → @devops | Nova story de um epic |
| **QA Loop** | @qa → @dev → @qa (max 5x) | QA encontrou issues, ciclo fix/review |
| **Spec Pipeline** | @pm → @architect → @analyst → @pm → @qa → @architect | Feature complexa precisa de spec |
| **Brownfield Discovery** | @architect → @data-engineer → @ux → @qa → @pm | Entrar em projeto existente |

### Greenfield / Brownfield
| Workflow | Tipo |
|----------|------|
| **greenfield-fullstack** | Projeto novo fullstack |
| **greenfield-service** | Projeto novo backend/API |
| **greenfield-ui** | Projeto novo frontend |
| **brownfield-fullstack** | Projeto existente fullstack |
| **brownfield-service** | Projeto existente backend |
| **brownfield-ui** | Projeto existente frontend |

### Marketing
| Workflow | Fluxo | Quando usar |
|----------|-------|-------------|
| **Content Pipeline** | @content-strategist → @content-researcher → @copywriter → @seo → @content-reviewer → @marketing-chief | Producao de conteudo |
| **Campaign Pipeline** | @content-strategist → @seo → @copywriter → @content-reviewer → @marketing-chief → @traffic-manager | Campanha paga |
| **Landing Page Pipeline** | Estrategia → copy → design → dev | Landing page completa |

### Design
| Workflow | Quando usar |
|----------|-------------|
| **design-system-build-quality** | Construir design system |
| **design-system-review** | Revisar design system existente |

### Outros
| Workflow | Quando usar |
|----------|-------------|
| **auto-worktree** | Desenvolvimento isolado em worktree Git |
| **epic-orchestration** | Orquestrar epic completo |
| **development-cycle** | Ciclo de desenvolvimento generico |

## Comandos Principais

### Morpheus (@lmas-master)
| Comando | O que faz |
|---------|-----------|
| `*help` | Mostrar todos os comandos |
| `*create` | Criar componente LMAS (agent, task, workflow) |
| `*modify` | Modificar componente existente |
| `*task {nome}` | Executar task especifica |
| `*workflow {nome}` | Iniciar workflow |
| `*exec` | Modo de execucao (auto/interativo/safety) |
| `*domains` | Listar dominios |
| `*route {desc}` | Rotear por intencao |
| `*brainstorm {tema}` | Brainstorming multi-agente |
| `*absorb {source}` | Absorver referencia externa |
| `*refs` | Consultar Reference Store |
| `*ids check` | Checar registry antes de criar |
| `*ids stats` | Estatisticas do registry |

### Dev Workflow
| Comando | Agente | O que faz |
|---------|--------|-----------|
| `*draft` | @sm | Criar story |
| `*validate-story-draft` | @po | Validar story (10 pontos) |
| `*develop` | @dev | Implementar story |
| `*review` | @qa | Quality gate |
| `*push` | @devops | Git push (EXCLUSIVO) |

### Marketing
| Comando | Agente | O que faz |
|---------|--------|-----------|
| `*brief` | @content-strategist | Criar content brief |
| `*write-copy` | @copywriter | Escrever copy |
| `*review-content` | @content-reviewer | Review de conteudo |
| `*approve-content` | @marketing-chief | Aprovar conteudo |
| `*publish` | @social-media-manager | Publicar (EXCLUSIVO) |
| `*seo-audit` | @seo | Auditoria SEO |
| `*campaign-plan` | @traffic-manager | Plano de campanha |

### Business + Brand
| Comando | Agente | O que faz |
|---------|--------|-----------|
| `*create-positioning` | @kamala | Posicionamento de marca |
| `*build-identity` | @kamala | Sistema de identidade |
| `*create-offer` | @mifune | Criar oferta |
| `*set-pricing` | @mifune | Estrategia de pricing |
| `*build-narrative` | @bugs | Narrativa de marca |
| `*convene-board` | @hamann | Sessao do advisory board |
| `*budget-allocation` | @traffic-manager | Alocacao de budget |

### Verificacao
| Comando | Agente | O que faz |
|---------|--------|-----------|
| `*verify` | @smith | Review adversarial de qualquer entrega |
| `*interrogate` | @smith | Deep dive em aspecto especifico |
| `*stress-test` | @smith | Testar limites e edge cases |

## Regras do Vault

1. **CLI First** — Obsidian e SOMENTE para visualizacao. Execucao acontece no terminal.
2. **Daily notes sao sagradas** — Agentes podem LER mas NAO ESCREVER em daily-notes/.
3. **Inbox first** — Notas rapidas caem na inbox. Categorizacao acontece depois.
4. **Links em markdown padrao** — Usar `[texto](caminho)` como primario. Wikilinks `[[nota]]` como complemento.


## Referencias Canonicas

| Referencia | Fonte | Uso |
|-----------|-------|-----|
| [[obsidian-markdown-spec]] | Kepano (CEO Obsidian) | Markdown syntax para todos os agentes |
| [[obsidian-bases-spec]] | Kepano | Database views (.base files) |
| [[json-canvas-spec]] | Kepano | Canvas file format (.canvas) |
| [[defuddle-reference]] | Kepano | Web content extraction (token-efficient) |