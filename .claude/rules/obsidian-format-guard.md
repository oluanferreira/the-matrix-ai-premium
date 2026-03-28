---
paths:
  - "docs/**"
  - "framework/**"
  - "inbox/**"
  - "dashboards/**"
  - "projects/**/stories/**"
  - "projects/**/prd/**"
  - "projects/**/architecture/**"
---
# Obsidian Format Guard — Agentes Obsidian-Aware

## Rule (MUST — All Agents)

Todos os artefatos Markdown criados por agentes DEVEM seguir o formato Obsidian para aparecerem corretamente no vault.

## Frontmatter Obrigatorio

Todo arquivo `.md` criado em `docs/`, `inbox/`, `dashboards/`, `framework/` DEVE ter frontmatter YAML:

```yaml
---
type: {tipo}        # OBRIGATORIO: story|adr|prd|guide|dashboard|agent|squad|workflow|moc|checkpoint
title: "{titulo}"   # OBRIGATORIO: titulo descritivo
project: {id}       # OBRIGATORIO em projects/: lmas|clawin|i5x (omitir em framework/)
tags:                # OBRIGATORIO: pelo menos 1 tag
  - project/{id}    # Tag de projeto (em artefatos dentro de projects/)
  - {tag1}
---
```

**Campo `project`:** Obrigatorio para artefatos dentro de `projects/`. Opcional para artefatos em `framework/`, `dashboards/`, `docs/` (globais). A tag `project/{id}` permite queries cross-project via Dataview.

### Frontmatter por Tipo

| Tipo | Campos obrigatorios | Campos opcionais |
|------|-------------------|-----------------|
| **story** | type, id, title, status, epic, tags | priority, agent, branch, created, completed |
| **adr** | type, id, title, status, date, tags | decision, supersedes, impacts, author |
| **prd** | type, title, version, status, tags | author, audience |
| **dashboard** | type, title, tags | - |
| **agent** | type, id, persona, domain, tags | icon |
| **squad** | type, id, tags | agents (count) |
| **workflow** | type, id, tags | - |

### Status validos para stories
`Draft` | `Ready` | `InProgress` | `InReview` | `Done`

### Status validos para ADRs
`proposed` | `accepted` | `deprecated` | `superseded`

## Links entre Notas

### Formato primario: Markdown links padrao
```markdown
Conforme decidido no [ADR-7](../architecture/adr/adr-auth.md)...
```

### Formato complementar: Wikilinks (para graph view)
```markdown
Conforme decidido no [[adr-auth|ADR-7]]...
```

**Regra:** Sempre usar texto legivel. O conteudo DEVE fazer sentido sem o Obsidian — lido no terminal, GitHub, ou qualquer editor.

## Daily Notes — Zona Sagrada

Agentes podem LER arquivos em `daily-notes/` mas NUNCA ESCREVER neles. Daily notes sao exclusivas do humano.

## Inbox

Notas rapidas criadas por agentes que nao tem destino claro devem ir para `inbox/`. O usuario ou Morpheus categoriza depois.

## Checkpoint

Ao atualizar `docs/PROJECT-CHECKPOINT.md`, incluir frontmatter:
```yaml
---
type: checkpoint
last_updated: {data}
active_story: "{id}"
active_agent: {agent}
---
```

## Canvas

Ao iniciar um workflow, verificar se existe canvas correspondente em `canvas/`. Se nao existir, o agente pode criar um `.canvas` (JSON Canvas) como referencia visual estatica.

## Obrigatoriedade

Esta rule e MUST para todos os agentes. Artefatos sem frontmatter sao considerados incompletos.
