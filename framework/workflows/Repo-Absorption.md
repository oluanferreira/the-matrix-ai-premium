---
type: workflow
id: repo-absorption
title: "Repository Absorption Pipeline"
tags:
  - workflow
  - framework
  - absorption
  - governance
created: 2026-03-29
---

# Repository Absorption Pipeline

> Workflow formal para analisar repositorios externos e absorver patterns beneficos ao LMAS.

## Classificacao (Morpheus)

| Tipo | Sinal | Fluxo |
|------|-------|-------|
| **A — Claude Code Framework** | `.claude/`, CLAUDE.md, hooks, rules, skills | [[#Flow A]] |
| **B — AI Agent Framework** | Agent defs, orchestration, multi-agent | [[#Flow B]] |
| **C — Tool / MCP Server** | MCP server, CLI, SDK, npm package | [[#Flow C]] |
| **D — Reference / Knowledge** | Metodologias, specs, playbooks, prompts | [[#Flow D]] |

## Flow A — Claude Code Framework

1. **SCAN** → `/claude-code-mastery:agents:claude-mastery-chief` — mapear hooks, rules, skills, MCP
2. **GAP** → Orion compara vs LMAS (TEMOS / MELHOR / PIOR / NAO TEMOS)
3. **DECIDE** → `/LMAS:agents:lmas-master` — governance (ABSORB / ADAPT / SKIP)
4. **IMPLEMENT** → `/LMAS:agents:dev` — criar SYNAPSE rules, hooks, templates
5. **VERIFY** → `/LMAS:agents:smith` — adversarial review

## Flow B — AI Agent Framework

1. **SCAN** → `/LMAS:agents:analyst` — arquitetura, comunicacao, routing, memory
2. **MAP** → `/claude-code-mastery:agents:claude-mastery-chief` — traduzir para CC equivalents
3. **DECIDE** → `/LMAS:agents:lmas-master` — governance (patterns, NAO codigo)
4. **IMPLEMENT** → `/LMAS:agents:dev` — adaptar patterns ao LMAS
5. **VERIFY** → `/LMAS:agents:smith` — verificar vs constitution

## Flow C — Tool / MCP Server

1. **SCAN** → `/claude-code-mastery:agents:claude-mastery-chief` — tipo integracao, deps, security
2. **EVALUATE** → `/LMAS:agents:analyst` — ROI, alternativas, security
3. **DECIDE** → `/LMAS:agents:lmas-master` — INTEGRATE / REFERENCE / SKIP
4. **IMPLEMENT** → `/LMAS:agents:dev` — tool-registry, MCP config
5. **VERIFY** → Orion testa integracao

## Flow D — Reference / Knowledge

1. **SCAN** → `/LMAS:agents:analyst` — extrair metodologias, patterns (defuddle para URLs)
2. **EVALUATE** → `/LMAS:agents:lmas-master` — relevancia vs LMAS
3. **DECIDE** → Morpheus — ABSORB / ADAPT / SKIP
4. **IMPLEMENT** → `/LMAS:agents:dev` — vault notes (REST API), rules, templates
5. **VERIFY** → `/LMAS:agents:smith` — completeness, HOME.md, memory

## Regras

- **CONSTITUTION_RULE_6:** Todos handoffs via Skill tool
- **Governance gate:** DECIDE e SEMPRE Morpheus — nunca delegado
- **Vault writes:** SEMPRE via Obsidian REST API
- **Memory:** Resultado em `reference_{repo}_analysis.md`
- **Otimizacao:** Se pattern sugere melhoria em workflow existente → `*propose-modification`

## Decisoes

| Decisao | Criterio | Acao |
|---------|----------|------|
| **ABSORB** | Preenche GAP no LMAS | Criar referencia + atualizar rules |
| **ADAPT** | Versao externa tem melhorias | Atualizar componente existente |
| **SKIP** | LMAS ja tem igual ou melhor | Documentar decisao na memory |
| **OPTIMIZE** | Pattern sugere forma melhor de fazer algo | `*propose-modification` no workflow existente |

## Historico

| Repo | Tipo | Resultado |
|------|------|-----------|
| [[reference_superpowers_aiox_analysis\|Superpowers]] | A | 4 SYNAPSE rules absorvidas |
| [[reference_superpowers_aiox_analysis\|AIOX Core]] | A | SKIP (LMAS superior) |
| [[reference_kepano_obsidian_skills\|Kepano Obsidian Skills]] | D | 4 refs vault + 2 rules atualizadas |

| [[#dev-browser\|dev-browser]] | C (Tool) | SKIP � claude-in-chrome + playwright cobrem 8/9 capacidades |

| [[dev-browser-analysis\|dev-browser]] | C (Tool) | ABSORB ref + OPTIMIZE pendente � script batching -69% custo vs claude-in-chrome |


## Two-Phase Review (OBRIGATORIO)

| Passo | Agente | Skill | Escopo | NAO faz |
|-------|--------|-------|--------|---------|
| **1. Tecnico** | Orion | /claude-code-mastery:agents:claude-mastery-chief | Arquitetura, modelo execucao, benchmarks, seguranca | Pesquisa comunitaria |
| **2. Avaliativo** | Atlas | /LMAS:agents:analyst | Feedback usuarios, estabilidade, riscos, ROI | Analise tecnica interna |

**Sequencial:** Phase 1 COMPLETA antes de Phase 2 iniciar. CONSTITUTION_RULE_6 enforced.

| [[anthropic-pdf-skill\|Anthropic PDF]] | D (Reference) | ABSORB � skill oficial, 5 gaps preenchidos (tabelas, merge, OCR, criacao, decrypt) |

| [[anthropic-pptx-skill\|Anthropic PPTX]] | D (Reference) | ABSORB � criacao de apresentacoes, 10 paletas, design system, QA visual |

| extract-design-system | C (Tool) | SKIP � 1 star, 2 WARNs, dev-browser cobre. Sati confirmou. |

| ui-ux-pro-max-skill | C (Tool) | ADAPT (dados only) � stars infladas, scam premium. Extrair 161 reasoning rules + 161 paletas + 57 fonts como referencia. NAO instalar CLI. Pendente: sessao dedicada para extracao. |