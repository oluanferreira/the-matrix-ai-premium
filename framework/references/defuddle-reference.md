---
type: reference
source: kepano/obsidian-skills
title: "Defuddle — Web Content Extraction (Kepano)"
tags:
  - reference
  - tool
  - web
  - extraction
  - token-efficiency
absorbed: 2026-03-29
---

# Defuddle — Extração Limpa de Conteúdo Web

> Fonte: [kepano/obsidian-skills](https://skills.sh/kepano/obsidian-skills/defuddle) — Steph Ango (CEO Obsidian)
> GitHub: 17.9K stars

## O que é

CLI tool que extrai conteúdo limpo e legível de páginas web, removendo clutter (ads, nav, boilerplate). Reduz uso de tokens significativamente comparado ao WebFetch raw.

## Uso

```bash
# Básico — converte para markdown
defuddle parse <url> --md

# Salvar em arquivo
defuddle parse <url> --md -o content.md

# Extrair metadata
defuddle parse <url> -p title
defuddle parse <url> -p description
defuddle parse <url> -p domain
```

## Formatos de Output

| Flag | Output |
|------|--------|
| `--md` | Markdown (padrão recomendado) |
| `--json` | JSON com HTML e markdown |
| (nenhum) | HTML raw |
| `-p <name>` | Propriedade específica de metadata |

## Quando Usar

| Cenário | Ferramenta |
|---------|-----------|
| Análise de conteúdo web com AI processing | WebFetch |
| Extração limpa de artigos/docs (token-eficiente) | Defuddle |
| Pré-processar URL antes de absorção (*absorb) | Defuddle |
| Scraping estruturado | Apify |

## Integração com LMAS

Defuddle é ideal como pré-processador no pipeline `*absorb`:
1. `defuddle parse <url> --md` → conteúdo limpo
2. Agente analisa conteúdo limpo (menos tokens)
3. Decisão de absorção com melhor qualidade de input
