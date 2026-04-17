# Task: init-artifacts

> Bootstrap artifact system for the active project.

## Metadata

```yaml
id: init-artifacts
agent: lmas-master
elicit: true
type: setup
```

## Purpose

Create the artifact infrastructure (pipeline-status.yaml, artifacts/, bridges/) for a project that doesn't have it yet. Called manually via `*init-artifacts` or suggested automatically by Pipeline-Suggest when a cross-sector handoff is detected without artifact infra.

## Pre-Conditions

- Active project resolved (multi-project mode)
- `projects/{id}/` directory exists
- `projects/{id}/pipeline-status.yaml` does NOT exist (if it does, abort with "Artifact system already configured")

## Steps

### Step 1: Verify project

```
Read projects/{id}/.project.yaml or CLAUDE.md to confirm project identity.
If pipeline-status.yaml already exists:
  → "Artifact system ja configurado para {project}. Use pipeline-status.yaml para ver estado."
  → ABORT
```

### Step 2: Elicit sectors (elicit: true)

Present sector options based on what the project already has:

```
Quais setores este projeto vai usar?

1) Brand + Design + Dev (app completo com marca)
2) Dev only (software sem brand/marketing)
3) Brand + Marketing (lancamento/conteudo)
4) Brand + Design + Dev + Marketing (full stack + marketing)
5) Todos os 6 setores (brand, design, dev, marketing, business, video)
6) Customizar (escolher individualmente)

Detectado: {listar diretorios existentes — brand/, stories/, prd/}
```

If option 6, list all 6 sectors and let user pick with numbers.

### Step 3: Create structure

For each selected sector:

```bash
mkdir -p projects/{id}/artifacts/{sector}
```

Always create:
```bash
mkdir -p projects/{id}/bridges
```

### Step 4: Generate pipeline-status.yaml

```yaml
schema_version: "1.0"
project: {id}

sectors:
  {for each selected sector}:
    status: not-started
    current: null
    done: []
    blocked_by: []  # Auto-fill from sector-stages.yaml default_bridges

bridges: []

session_log:
  - session_id: "init-artifacts"
    date: "{today}"
    agent: "morpheus"
    sector: "framework"
    stage_started: "init"
    stage_completed: "init"
    artifacts_produced:
      - "pipeline-status.yaml"
    next_action: "Primeiro setor a trabalhar"

health:
  total_artifacts: 0
  complete_artifacts: 0
  blocked_bridges: 0
  avg_completeness: 0
  last_handoff_success: null
  handoff_failures: 0
```

### Step 5: Auto-populate blocked_by

Read `sector-stages.yaml` default_bridges to set initial blocked_by:
- If brand selected and design selected: design.blocked_by: ["brand/4-identity"]
- If brand selected and marketing selected: marketing.blocked_by: ["brand/6-brandbook"]
- If design selected and dev selected: no block (dev can start independently)
- If business selected and marketing selected: marketing gets additional blocked_by from business/2-offer bridge

### Step 6: Confirm and report

```
Artifact system configurado para {project}!

Estrutura criada:
   projects/{id}/pipeline-status.yaml
   projects/{id}/artifacts/{sector1}/
   projects/{id}/artifacts/{sector2}/
   projects/{id}/bridges/

Setores: {list} | Bridges: {count} definidos
Proximo: ative o agente do primeiro setor que quiser trabalhar.
```

### Step 7: Update checkpoint

Add to PROJECT-CHECKPOINT.md:
- Artifact system inicializado: {sectors} | pipeline-status.yaml criado

## Post-Conditions

- pipeline-status.yaml exists with selected sectors
- artifacts/{sector}/ directories exist for each selected sector
- bridges/ directory exists
- Checkpoint updated
