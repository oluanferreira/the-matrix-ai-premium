---
type: reference
source: kepano/obsidian-skills
title: "Obsidian Flavored Markdown — Spec Canônica (Kepano)"
tags:
  - reference
  - obsidian
  - markdown
  - canonical
absorbed: 2026-03-29
---

# Obsidian Flavored Markdown — Referência Canônica

> Fonte: [kepano/obsidian-skills](https://skills.sh/kepano/obsidian-skills/obsidian-markdown) — Steph Ango (CEO Obsidian)

## Wikilinks (Links Internos)

- `[[Note Name]]` — link básico
- `[[Note Name|Display Text]]` — com alias
- `[[Note Name#Heading]]` — link para seção
- `[[Note Name#^block-id]]` — link para bloco específico
- `[[#Heading]]` — link interno no mesmo arquivo

> **Regra:** Use `[[wikilinks]]` para notas internas (auto-rename tracking). Use `[text](url)` SOMENTE para URLs externas.

### Block IDs
Append `^block-id` ao final de um parágrafo. Para listas/quotes, coloque em linha separada após o bloco.

## Embeds

Prefixar wikilinks com `!` para embed inline:
- `![[Note Name]]` — nota completa
- `![[Note Name#Heading]]` — apenas seção
- `![[image.png]]` — imagem
- `![[image.png|300]]` — imagem com largura
- `![[document.pdf#page=3]]` — página específica de PDF

## Callouts

Sintaxe: `> [!type]` com título opcional e estado de colapso:

**Tipos disponíveis:**
`note`, `warning`, `tip`, `danger`, `info`, `example`, `quote`, `bug`, `success`, `failure`, `question`, `abstract`, `todo`

**Colapso:**
- `> [!type]-` — fechado por padrão
- `> [!type]+` — aberto por padrão

## Properties (Frontmatter)

Bloco YAML no início do arquivo:
```yaml
---
title: Note Title
date: 2024-01-15
tags:
  - tag1
  - tag2
aliases:
  - Alternative Name
cssclasses:
  - custom-class
---
```

## Tags

- `#tag` — tag inline
- `#nested/tag` — hierárquica
- Válido: letras, números (não como primeiro char), underscores, hifens, barras

## Comments

- Inline: `This visible %%hidden%% text`
- Bloco: `%% conteúdo oculto no reading view %%`

## Formatting Especial

- `==highlighted text==` — destaque amarelo
- `$equation$` — LaTeX inline
- `$$block equation$$` — LaTeX display
- Mermaid em blocos ` ```mermaid `

## Footnotes

- Referência: `Text[^1]` com definição `[^1]: content`
- Inline: `Text^[inline content]`

## Workflow para Agentes

1. Adicionar frontmatter com metadata
2. Escrever conteúdo em Markdown padrão
3. Linkar notas com `[[wikilinks]]` para conexões no vault
4. Embeddar conteúdo com `![[]]` onde necessário
5. Usar callouts para ênfase
6. Verificar rendering no Obsidian
