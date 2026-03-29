---
type: reference
source: kepano/obsidian-skills
title: "JSON Canvas — Spec Completa (Kepano)"
tags:
  - reference
  - obsidian
  - canvas
  - diagram
  - canonical
absorbed: 2026-03-29
---

# JSON Canvas — Especificação Completa

> Fonte: [kepano/obsidian-skills](https://skills.sh/kepano/obsidian-skills/json-canvas) — Steph Ango (CEO Obsidian)

## Estrutura do Arquivo

Arquivo `.canvas` contém dois arrays top-level:
```json
{
  "nodes": [],
  "edges": []
}
```

## Node Types

### Atributos Comuns (todos os nodes)

| Campo | Tipo | Required | Descrição |
|-------|------|----------|-----------|
| `id` | string | SIM | Hex 16 chars, único |
| `type` | string | SIM | text, file, link, group |
| `x` | number | SIM | Posição X |
| `y` | number | SIM | Posição Y |
| `width` | number | SIM | Largura (px) |
| `height` | number | SIM | Altura (px) |
| `color` | string | NÃO | Preset "1"-"6" ou hex |

### Text Node
- `text` (required) — conteúdo Markdown
- Usar `\n` para quebras de linha (NÃO `\n` literal)
- Dimensões sugeridas: 200-600px largura, 80-500px altura

### File Node
- `file` (required) — path do arquivo
- `subpath` (opcional) — link para heading/block (começa com `#`)

### Link Node
- `url` (required) — URL externo

### Group Node
- `label` (opcional) — título do grupo
- `background` (opcional) — path de imagem de fundo
- `backgroundStyle` — `cover`, `ratio`, ou `repeat`
- Funciona como container visual para outros nodes

## Edge Attributes

| Campo | Tipo | Required | Descrição |
|-------|------|----------|-----------|
| `id` | string | SIM | Único |
| `fromNode` | string | SIM | ID do node de origem |
| `toNode` | string | SIM | ID do node de destino |
| `fromSide` | string | NÃO | top, right, bottom, left |
| `toSide` | string | NÃO | top, right, bottom, left |
| `fromEnd` | string | NÃO | none ou arrow |
| `toEnd` | string | NÃO | none ou arrow (default: arrow) |
| `color` | string | NÃO | Preset ou hex |
| `label` | string | NÃO | Texto descritivo |

## Sistema de Cores

| Preset | Cor |
|--------|-----|
| "1" | Vermelho |
| "2" | Laranja |
| "3" | Amarelo |
| "4" | Verde |
| "5" | Cyan |
| "6" | Roxo |

Também aceita hex: `"#FF0000"`

## Regras de Validação

1. Todos os IDs devem ser únicos (nodes + edges)
2. `fromNode`/`toNode` devem referenciar IDs existentes
3. Campos required por tipo devem estar presentes
4. Ordem no array = z-index (primeiro = camada inferior)

## Layout Guidelines

- Espaçar nodes 50-100px
- Padding interno em groups: 20-50px
- Coordenadas podem ser negativas (canvas infinito)
- Alinhar em múltiplos de grid para layouts limpos
