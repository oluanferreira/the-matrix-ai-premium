---
type: system
name: SYNAPSE
status: active
version: "1.1"
created: 2026-03-28
updated: 2026-03-28
tags:
  - system/synapse
  - framework/core
  - context-injection
aliases:
  - Motor de Regras
  - Context Engine
---

# SYNAPSE — Motor de Regras Contextual

Motor de injecao de contexto que enriquece cada prompt do usuario com regras relevantes baseadas em agente ativo, setor, keywords e estado da sessao.

## Arquitetura

```
UserPromptSubmit hook
  → synapse-engine.cjs (entry point)
    → hook-runtime.js (resolve dependencies)
      → SynapseEngine.process(prompt, session)
        → L0 Constitution (6 rules, NON-NEGOTIABLE)
        → L1 Global (8 rules, always loaded)
        → L2 Agent (5 rules, por @agent ativo)
        → L6 Keyword (7 rules, por setor via recall)
        → Output: <synapse-rules> XML injetado no prompt
```

## Layers

| Layer | Nome | Trigger | Exemplo |
|-------|------|---------|---------|
| L0 | Constitution | Sempre ativo | Agent Authority, Story-Driven, No Invention |
| L1 | Global | Sempre ativo | Pipeline awareness, artifact rules |
| L2 | Agent | `@agent` ou `/LMAS:agents:` no prompt | agent-dev: SDC, commits, push bloqueado |
| L3 | Workflow | Session workflow ativo | (futuro) |
| L4 | Task | Task em execucao | (futuro) |
| L5 | Squad | Squad ativo | (futuro) |
| L6 | Keyword | Recall keywords no prompt | sector-brand: brand-dna, naming, bridges |
| L7 | Star-command | `*command` no prompt | (futuro) |

## Domains (.synapse/)

| Arquivo | Layer | Rules | Descricao |
|---------|-------|-------|-----------|
| constitution | L0 | 6 | Artigos constitucionais |
| global | L1 | 8 | Regras universais (pipeline, artifacts) |
| context-pipeline | L1 | - | Pipeline awareness (futuro) |
| agent-dev | L2 | 5 | Regras do @dev (SDC, commits, push) |
| agent-qa | L2 | 4 | Regras do @qa (quality gates) |
| agent-architect | L2 | 5 | Regras do @architect |
| agent-kamala | L2 | 5 | Regras do @kamala (brand DNA) |
| agent-mifune | L2 | 5 | Regras do @mifune (business) |
| agent-copywriter | L2 | 5 | Regras do @copywriter |
| agent-traffic | L2 | 5 | Regras do @traffic-manager |
| sector-brand | L6 | 7 | Setor brand (recall: marca, naming...) |
| sector-design | L6 | 6 | Setor design (recall: wireframe, ui...) |
| sector-dev | L6 | 7 | Setor dev (recall: implementar, story...) |
| sector-marketing | L6 | 7 | Setor marketing (recall: copy, seo...) |
| sector-business | L6 | 7 | Setor business (recall: oferta, pricing...) |

## Manifest (.synapse/manifest)

Formato KEY=VALUE. Define estado, triggers e recall keywords de cada domain.

## Metricas

Persistidas em `.synapse/metrics/hook-metrics.json` a cada execucao.
Pipeline total: ~1.4ms (L0+L1+L2+L6).

## Sessoes

Gerenciadas por `session-manager.js`. Cleanup automatico de sessoes stale (>7 dias).

## Links

- [[Morpheus]] — Orquestrador principal
- [[Sistema]] — Visao geral do framework
- Engine: `.lmas-core/core/synapse/engine.js`
- Hook: `.claude/hooks/synapse-engine.cjs`
- Manifest: `.synapse/manifest`
