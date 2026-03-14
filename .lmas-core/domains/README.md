# LMAS Domains — Multi-Domain Governance

## O que é um Domain?

Um **domain** é um setor operacional com suas próprias regras, agentes, quality gates e workflows. Cada domain **estende** a Constitution base com artigos específicos.

## Estrutura

```
domains/
├── _base/                    # Definições universais compartilhadas
│   └── gate-severity.yaml    # BLOCK/WARN/INFO severity levels
├── software-dev/             # Domain: Software Development
│   └── constitution.yaml     # SD-I, SD-II, SD-III + authority + gates
├── marketing/                # Domain: Marketing Digital
│   └── constitution.yaml     # MK-I, MK-II, MK-III, MK-IV + authority + gates
└── README.md                 # Este arquivo
```

## Como Criar um Novo Domain

### 1. Criar diretório

```bash
mkdir .lmas-core/domains/{domain-id}
```

Use **kebab-case** para o ID (ex: `data-ops`, `finance`, `customer-success`).

### 2. Criar `constitution.yaml`

Use o schema em `.lmas-core/schemas/domain-constitution.schema.json` como referência.

Seções obrigatórias:

```yaml
domain:
  id: {domain-id}
  name: "Display Name"
  version: "1.0.0"
  extends: base

articles:
  - id: {PREFIX}-I          # Prefixo único (2-3 letras maiúsculas)
    name: "Article Name"
    severity: MUST
    rules: [...]
    gate: { action: BLOCK }

authority_matrix:
  {operation}:
    exclusive_to: "@agent"

quality_gates:
  layer1_*: { checks: {...} }

deliverable_format:
  type: {story|brief|requisition|...}
  required_sections: [...]
  tracking:
    status_flow: [...]
```

### 3. Registrar no domain-registry

Adicione uma entrada em `.lmas-core/data/domain-registry.yaml`:

```yaml
{domain-id}:
  name: "Display Name"
  aliases: [...]
  path: ".lmas-core/domains/{domain-id}"
  default: false
  team_bundles: []
  core_agents: []
```

### 4. Criar team bundle

Crie um team bundle em `.lmas-core/development/agent-teams/team-{name}.yaml` com `domain: {domain-id}`.

### 5. (Opcional) Criar agentes

Defina os agentes do domain em `.lmas-core/development/agents/` ou em `squads/{squad-name}/agents/`.

## Convenções

| Convenção | Exemplo |
|-----------|---------|
| Domain ID | `kebab-case`: `software-dev`, `data-ops` |
| Article ID prefix | 2-3 letras maiúsculas: `SD-`, `MK-`, `FN-`, `DO-` |
| Article numbering | Romanos: I, II, III, IV |
| Severity | `NON-NEGOTIABLE`, `MUST`, `SHOULD` |
| Gate action | `BLOCK`, `WARN`, `INFO` |

## Resolução de Domain

Prioridade (do mais específico ao mais genérico):

1. Campo `domain` no squad `config.yaml`
2. Campo `domain` no team bundle ativo
3. Campo `domain.active` no `project-config.yaml`
4. **Fallback:** `software-dev` (default)

## Referências

- Constitution base: `.lmas-core/constitution.md`
- Domain registry: `.lmas-core/data/domain-registry.yaml`
- Schema: `.lmas-core/schemas/domain-constitution.schema.json`
- Gate severity: `.lmas-core/domains/_base/gate-severity.yaml`
