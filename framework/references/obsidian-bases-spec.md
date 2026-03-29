---
type: reference
source: kepano/obsidian-skills
title: "Obsidian Bases — Spec Completa (Kepano)"
tags:
  - reference
  - obsidian
  - bases
  - database
  - canonical
absorbed: 2026-03-29
---

# Obsidian Bases — Referência Completa

> Fonte: [kepano/obsidian-skills](https://skills.sh/kepano/obsidian-skills/obsidian-bases) — Steph Ango (CEO Obsidian)

## Overview

Bases são database views nativas do Obsidian usando arquivos `.base` com YAML. 4 tipos de view: table, cards, list, map.

## Estrutura do Arquivo .base

```yaml
filters:        # Filtros globais
  and/or/not: []

formulas:       # Propriedades computadas
  formula_name: 'expression'

properties:     # Configuração de display
  property_name:
    displayName: "Display Name"

summaries:      # Fórmulas de resumo
  summary_name: 'values.mean().round(3)'

views:          # Uma ou mais views
  - type: table|cards|list|map
    name: "View Name"
    limit: 10
    groupBy:
      property: property_name
      direction: ASC|DESC
    filters:
      and: []
    order:
      - file.name
    summaries:
      property_name: Average
```

## 3 Tipos de Properties

1. **Note properties** — do frontmatter: `author` ou `note.author`
2. **File properties** — metadata: `file.name`, `file.basename`, `file.path`, `file.folder`, `file.ext`, `file.size`, `file.ctime`, `file.mtime`, `file.tags`, `file.links`, `file.backlinks`, `file.embeds`, `file.properties`
3. **Formula properties** — computadas: `formula.my_formula`

**Keyword `this`:** Referencia o arquivo base no conteúdo principal, o arquivo que embeda quando embedded, ou arquivo ativo na sidebar.

## Filter Syntax

Operadores: `==`, `!=`, `>`, `<`, `>=`, `<=`, `&&`, `||`, `!`

```yaml
# Filtro simples
filters: 'status == "done"'

# AND (todas condições)
filters:
  and:
    - 'status == "done"'
    - file.hasTag("project")

# OR (qualquer condição)
filters:
  or:
    - 'priority == 1'
    - 'priority == 2'

# NOT (excluir)
filters:
  not:
    - file.inFolder("archive")

# Funções de filtro
file.hasTag("tag")
file.hasLink("Note")
file.inFolder("Path")
```

## Formula System

```yaml
formulas:
  total: "price * quantity"
  status_icon: 'if(done, "✅", "⏳")'
  formatted: 'if(price, price.toFixed(2) + " dollars")'
  created: 'file.ctime.format("YYYY-MM-DD")'
  days_old: '(now() - file.ctime).days'
  days_until: 'if(due_date, (date(due_date) - today()).days, "")'
```

### Funções Disponíveis

| Função | Assinatura | Propósito |
|--------|-----------|-----------|
| `date()` | `date(string): date` | Parse string para date (YYYY-MM-DD HH:mm:ss) |
| `now()` | `now(): date` | Data e hora atual |
| `today()` | `today(): date` | Data atual (00:00:00) |
| `if()` | `if(cond, true, false?)` | Lógica condicional |
| `duration()` | `duration(string): duration` | Parse duration string |
| `file()` | `file(path): file` | Obter objeto de arquivo |
| `link()` | `link(path, display?): Link` | Criar link |

### GOTCHA: Duration Type

Subtrair datas retorna Duration (NÃO número). Acesse `.days`, `.hours`, `.minutes`, `.seconds` ANTES de math:

- ✅ CORRETO: `(now() - file.ctime).days.round(0)`
- ❌ ERRADO: `(now() - file.ctime).round(0)`

### Aritmética de Data

Unidades: y/year/years, M/month/months, d/day/days, w/week/weeks, h/hour/hours, m/minute/minutes
- `now() + "1 day"` = amanhã
- `today() + "7d"` = daqui uma semana

## Summary Formulas Padrão

**Number:** Average, Min, Max, Sum, Range, Median, Stddev
**Date:** Earliest, Latest, Range
**Boolean:** Checked, Unchecked
**Any:** Empty, Filled, Unique

## YAML Quoting Rules (CRÍTICO)

- Strings com caracteres especiais (`:`, `{`, `}`, `[`, `]`, `,`, `&`, `*`, `#`, `?`, `|`, `-`, `<`, `>`, `=`, `!`, `%`, `@`) DEVEM ser quoted
- Fórmulas com aspas duplas DEVEM usar aspas simples: `'if(done, "Yes", "No")'`
- ❌ ERRADO: `displayName: Status: Active`
- ✅ CORRETO: `displayName: "Status: Active"`

## Embedding Bases

Em arquivos markdown:
- `![[MyBase.base]]` — embed base completa
- `![[MyBase.base#View Name]]` — embed view específica

## Troubleshooting

1. **Duration math:** Sempre acessar `.days` etc antes de `.round()`
2. **Null checks:** Guard com `if()`: `if(due_date, (date(due_date) - today()).days, "")`
3. **Undefined formulas:** Todo `formula.X` em order/properties DEVE existir em formulas
4. **Mismatched quotes:** Fórmulas com `"` precisam wrapper `'`

## Exemplo Completo: Task Tracker

```yaml
filters:
  and:
    - file.hasTag("task")
    - 'file.ext == "md"'

formulas:
  days_until_due: 'if(due, (date(due) - today()).days, "")'
  is_overdue: 'if(due, date(due) < today() && status != "done", false)'
  priority_label: 'if(priority == 1, "🔴 High", if(priority == 2, "🟡 Medium", "🟢 Low"))'

views:
  - type: table
    name: "Active Tasks"
    filters:
      and:
        - 'status != "done"'
    order:
      - file.name
      - status
      - formula.priority_label
      - due
      - formula.days_until_due
    groupBy:
      property: status
      direction: ASC
    summaries:
      formula.days_until_due: Average
```
