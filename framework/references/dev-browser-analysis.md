---
type: reference
source: sawyerhood/dev-browser
title: "dev-browser — Browser Automation via Script Batching"
tags:
  - reference
  - tool
  - browser
  - automation
  - optimization-candidate
absorbed: 2026-03-29
status: under-evaluation
---

# dev-browser — Análise Completa

> Fonte: [sawyerhood/dev-browser](https://github.com/SawyerHood/dev-browser) — 5K stars, MIT

## Diferencial Arquitetural

dev-browser usa modelo de **script batching** em vez de chamadas individuais:
- 1 script JS = N ações = 1 turn (vs 1 ação = 1 turn no MCP)
- QuickJS WASM sandbox (seguro, pre-approvable)
- Estado persistente entre scripts (páginas nomeadas)
- ARIA snapshots textuais (menos tokens que screenshots)

## Benchmarks

| Método | Turns | Custo | Tempo | Sucesso |
|--------|-------|-------|-------|---------|
| dev-browser | 29 | $0.88 | 3m53s | 100% |
| Playwright MCP | 51 | $1.45 | 4m31s | 100% |
| Claude Chrome Ext | 80 | $2.81 | 12m54s | 100% |

## Arquitetura

- CLI Rust + Daemon Node.js
- QuickJS WASM sandbox (scripts isolados)
- Fork do Playwright client dentro do sandbox
- Comunicação via Unix socket/Named pipe
- Named pages persistem entre execuções

## Status no LMAS

**Decisão:** ABSORB como referência + OPTIMIZE pendente
- Referência técnica salva para consulta
- Teste prático lado a lado com claude-in-chrome pendente
- Se teste confirmar ganhos → propor como alternativa/complemento
- Se teste revelar instabilidade → manter claude-in-chrome

## Riscos Identificados (pesquisa comunitária)

- Bugs de estabilidade (hangs em páginas pesadas, TimeoutError crashes)
- Apenas Chromium (sem cross-browser)
- Projeto novo (dez/2025, 6 versões publicadas)
- Fork do Playwright client pode ficar desatualizado
