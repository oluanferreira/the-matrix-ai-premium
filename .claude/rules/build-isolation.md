# Build Isolation — Vault de Inteligência vs Código

## Princípio (IMBURLÁVEL — Todos os Agentes)

**MINHA MATRIX é um VAULT DE INTELIGÊNCIA, não um repositório de código.**

Tudo que existe no vault deve servir a dois propósitos:
1. **Ser consultado por agentes** — contexto para decisões e continuidade
2. **Ser visualizado no Obsidian** — graph view, backlinks, dashboards, notes

Se não serve a nenhum dos dois → NÃO pertence ao vault.

## Arquitetura Correta

```
MINHA MATRIX/                              ← VAULT DE INTELIGÊNCIA (Obsidian)
│
├── HOME.md                                ← Dashboard principal
├── daily-notes/                           ← Notas diárias (humano)
├── dashboards/                            ← Dashboards visuais (Obsidian)
├── framework/                             ← Visual layer (MOCs, workflows, refs)
├── .claude/                               ← Rules, commands, settings (agentes)
├── .lmas-core/                            ← Engine (tasks, templates, schemas)
│
└── projects/                              ← CONTEXTO de cada projeto
    └── {id}/
        ├── .project.yaml                  ← code_path → FORA do vault
        ├── CLAUDE.md                      ← Convenções específicas do projeto
        ├── PROJECT-CHECKPOINT.md          ← Continuidade entre sessões
        ├── pipeline-status.yaml           ← Estado dos setores
        ├── risk-register.yaml             ← Riscos conhecidos
        ├── stories/                       ← Stories de desenvolvimento
        ├── brand/                         ← Brandbook, positioning, identity
        ├── prd/                           ← Product Requirements
        ├── architecture/                  ← ADRs, system design
        ├── artifacts/                     ← Artefatos de fase (handoff)
        └── bridges/                       ← Contratos cross-setor


C:\Users\luanf\projects\                   ← CÓDIGO (ISOLADO, FORA do vault)
├── maisum-v2/                             ← App puro — Expo mobile
├── maisum-admin/                          ← App puro — Admin web
├── maisum-landing/                        ← App puro — Landing page
├── openclaw/                              ← ClaWin
└── dash_i5x/                             ← i5x
```

## O que PERTENCE ao vault (projects/{id}/)

| Conteúdo | Por quê | Quem consome |
|----------|---------|--------------|
| Stories (.md) | Agentes leem para implementar | @dev, @qa, @po |
| Checkpoint (.md) | Continuidade entre sessões | Todos os agentes |
| Brand (positioning, identity, voice) | Referência para design e marketing | @kamala, @copywriter, @ux |
| PRD, Architecture (.md) | Contexto de produto | @pm, @architect, @dev |
| Pipeline status (.yaml) | Tracking de progresso | Morpheus, todos |
| Artifacts de fase (.md) | Handoff entre setores | Agente do próximo setor |
| Bridges (.yaml) | Contratos cross-setor | Agente receptor |

## O que NUNCA entra no vault

| Conteúdo | Por quê |
|----------|---------|
| `node_modules/` | 200MB+ de dependências. Obsidian trava, build sobe lixo |
| `.expo/`, `dist/`, `web-build/` | Cache de build. Regenerável |
| `android/`, `ios/` | Gerado por `expo prebuild`. Regenerável |
| `package-lock.json` | Lockfile de 50K+ linhas. Não é consultado por agente |
| Código fonte do app | Não é nota, não é contexto. É CÓDIGO |
| `.env` com secrets | Segurança. NUNCA no vault |

## Regras

### 1. Código SEMPRE fora do vault

Ao criar um novo projeto, o código DEVE ser inicializado FORA do vault:
```yaml
# projects/{id}/.project.yaml
code_path: "C:\\Users\\luanf\\projects\\{app-name}"
```

### 2. Fluxo do agente: vault → código → vault

```
Agente ativado
  → Lê projects/{id}/CHECKPOINT.md           (VAULT — contexto)
  → Lê projects/{id}/stories/MAISUM-8.2.md   (VAULT — o que fazer)
  → cd code_path                              (CÓDIGO — onde fazer)
  → Implementa, testa                         (CÓDIGO — execução pura)
  → Atualiza CHECKPOINT.md                    (VAULT — registrar)
```

### 3. Build SEMPRE da pasta do código

Nenhum comando de build (`eas build`, `expo prebuild`, `gradlew`, `xcodebuild`) pode ser executado de dentro do vault.

```bash
cd $(code_path)
npx eas build --platform android --profile preview
```

### 4. Zero poluição bidirecional

- **Vault → Código:** Nenhum artefato do framework (.claude/, .lmas-core/) entra na pasta do app
- **Código → Vault:** Nenhum artefato de código (node_modules, .expo/) entra no vault

Se o agente precisa de `.mcp.json` para dev, usar config global do Claude Code — NÃO copiar para dentro do app.

### 5. Validação pre-build (@devops)

Antes de qualquer build, @devops DEVE validar:
```bash
FORBIDDEN=".claude .lmas .lmas-core .codex .cursor .antigravity .gemini .synapse .smart-env skills-lock.json"
for f in $FORBIDDEN; do
  [ -e "$f" ] && echo "BLOQUEADO: $f encontrado na pasta do app" && exit 1
done
echo "Pasta limpa — build autorizado"
```

### 6. Git — Um repo por app

| Repositório | Conteúdo | Remoto |
|-------------|----------|--------|
| MINHA MATRIX | Framework + contexto de projetos | oluanferreira/the-matrix |
| maisum-v2 | App mobile puro | oluanferreira/maisum-v2 |
| maisum-admin | Admin web puro | oluanferreira/maisum-admin |
| openclaw | ClaWin puro | oluanferreira/openclaw |

### 7. Migração de projetos existentes

Para projetos que já vivem dentro do vault:
1. `mv {app}/ C:\Users\luanf\projects\{app}/`
2. Atualizar `projects/{id}/.project.yaml` → `code_path`
3. Limpar artefatos de framework de dentro do app
4. Verificar que imports não referenciam paths do vault
5. Testar build isolado
6. Remover pasta antiga do vault

## Por que isso importa

| Sem isolamento | Com isolamento |
|---------------|---------------|
| Build sobe 223MB (framework + node_modules) | Build sobe ~5MB (só app) |
| Obsidian graph poluído com .ts, .tsx | Graph limpo: stories ↔ brand ↔ architecture |
| Git mistura framework + app | Cada repo independente |
| Impossível buildar sem o vault | App compila em qualquer máquina |
| CI/CD precisa clonar vault inteiro | CI/CD clona só o app |
| Não dá pra dar o app pro Alex contribuir | Alex clona o repo do app e contribui |

## Exceção

A ÚNICA exceção é durante o `expo init` / scaffolding inicial — o projeto pode ser criado temporariamente dentro do vault e movido ANTES do primeiro build.
