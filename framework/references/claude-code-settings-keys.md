---
name: Claude Code Settings Keys Inventory
description: Complete inventory of undocumented and documented settings.json keys for Claude Code
type: reference
project: lmas
source: davila7/claude-code-templates (settings directory, 60 files analyzed)
absorbed: 2026-03-31
tags:
  - project/lmas
  - claude-code
  - settings
  - configuration
  - reference
---

# Claude Code Settings Keys — Complete Inventory

Chaves de configuracao para `.claude/settings.json` (projeto) e `~/.claude/settings.json` (global). Descobertas via analise de 60 templates do repo davila7/claude-code-templates.

## Core Settings

| Chave | Tipo | Descricao | Exemplo |
|-------|------|-----------|---------|
| `model` | string | Override do modelo principal | `"claude-sonnet-4-6"` |
| `language` | string | Idioma de resposta | `"portuguese"` |
| `includeCoAuthoredBy` | boolean | Linha Co-Authored-By em commits | `false` para remover |
| `forceLoginMethod` | string | Metodo de login forcado | `"claudeai"` ou `"console"` |
| `apiKeyHelper` | string | Script externo para gerar tokens rotativos | `"/bin/generate_temp_api_key.sh"` |
| `cleanupPeriodDays` | number | Retencao de transcricoes de chat (dias) | `7`, `90` |
| `alwaysThinkingEnabled` | boolean | Forcar thinking mode | `true` |

## Permissions

| Chave | Tipo | Descricao | Exemplo |
|-------|------|-----------|---------|
| `permissions.allow` | string[] | Whitelist de operacoes permitidas | `["Read(**)", "Bash(npm test)"]` |
| `permissions.deny` | string[] | Blacklist de operacoes bloqueadas | `["Edit(.env*)", "Bash(rm -rf)"]` |
| `permissions.additionalDirectories` | string[] | Diretorios extras acessiveis | `["../shared-lib", "/opt/configs"]` |

### Templates de Permissao Uteis

**Read-Only Mode** (code review seguro):
```json
{
  "permissions": {
    "allow": ["Read(**)", "Glob(**)", "Grep(**)", "Bash(ls *)"],
    "deny": ["Edit(**)", "Write(**)", "MultiEdit(**)", "Bash(*)", "WebFetch(*)"]
  }
}
```

**Development Mode** (zona de conforto):
```json
{
  "permissions": {
    "allow": ["Read(**)", "Edit(**/*.{js,ts,py,json})", "Bash(npm *)", "Bash(git *)"],
    "deny": ["Edit(.env*)", "Edit(secrets/**)", "Bash(rm -rf *)", "Bash(sudo *)"]
  }
}
```

## MCP Control

| Chave | Tipo | Descricao | Exemplo |
|-------|------|-----------|---------|
| `enableAllProjectMcpServers` | boolean | Auto-aprovar todos MCPs do projeto | `true` (elimina prompts) |
| `enabledMcpjsonServers` | string[] | Whitelist de MCPs | `["memory", "github"]` |
| `disabledMcpjsonServers` | string[] | Blacklist de MCPs | `["web-scraper"]` |

## Environment Variables (via `env` ou variaveis de ambiente)

### Performance

| Variavel | Tipo | Descricao | Default |
|----------|------|-----------|---------|
| `CLAUDE_CODE_MAX_OUTPUT_TOKENS` | number | Limite de tokens de saida | `16000` |
| `DISABLE_NON_ESSENTIAL_MODEL_CALLS` | boolean | Elimina chamadas auxiliares | `false` |
| `DISABLE_COST_WARNINGS` | boolean | Remove avisos de custo | `false` |

### Bash

| Variavel | Tipo | Descricao | Default |
|----------|------|-----------|---------|
| `BASH_DEFAULT_TIMEOUT_MS` | number | Timeout padrao de comandos | `120000` (2min) |
| `BASH_MAX_TIMEOUT_MS` | number | Timeout maximo permitido | `600000` (10min) |
| `BASH_MAX_OUTPUT_LENGTH` | number | Limite de caracteres de output | `100000` |
| `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR` | boolean | Manter diretorio de trabalho | `true` |

### MCP

| Variavel | Tipo | Descricao | Default |
|----------|------|-----------|---------|
| `MCP_TIMEOUT` | number | Timeout de conexao MCP (ms) | `30000` |
| `MCP_TOOL_TIMEOUT` | number | Timeout de execucao de tool MCP (ms) | `60000` |
| `MAX_MCP_OUTPUT_TOKENS` | number | Limite de tokens de output MCP | `50000` |

### Privacy & Telemetry

| Variavel | Tipo | Descricao |
|----------|------|-----------|
| `DISABLE_TELEMETRY` | boolean | Desliga telemetria |
| `DISABLE_ERROR_REPORTING` | boolean | Desliga report de erros |
| `DISABLE_BUG_COMMAND` | boolean | Desliga comando /bug |
| `DISABLE_AUTOUPDATER` | boolean | Desliga atualizacao automatica |
| `DISABLE_NON_ESSENTIAL_TRAFFIC` | boolean | Desliga trafego nao-essencial |

### Providers Alternativos

| Variavel | Tipo | Descricao |
|----------|------|-----------|
| `CLAUDE_CODE_USE_BEDROCK` | boolean | Usar Amazon Bedrock |
| `CLAUDE_CODE_USE_VERTEX` | boolean | Usar Google Vertex AI |
| `ANTHROPIC_BASE_URL` | string | URL base customizada |
| `ANTHROPIC_MODEL` | string | Modelo principal |
| `ANTHROPIC_SMALL_FAST_MODEL` | string | Modelo para tarefas rapidas |
| `HTTP_PROXY` / `HTTPS_PROXY` | string | Proxy corporativo |
| `ANTHROPIC_CUSTOM_HEADERS` | string | Headers customizados (separados por `\n`) |

### Tracing & Observability

| Variavel | Tipo | Descricao |
|----------|------|-----------|
| `TRACE_TO_LANGSMITH` | boolean | Ativar tracing LangSmith |
| `CC_LANGSMITH_API_KEY` | string | Chave API do LangSmith |
| `CC_LANGSMITH_PROJECT` | string | Nome do projeto no LangSmith |
| `OTEL_METRICS_EXPORTER` | string | Exporter OpenTelemetry customizado |
| `CLAUDE_CODE_ENABLE_TELEMETRY` | boolean | Ativar telemetria Claude Code |

### AWS

| Chave | Tipo | Descricao |
|-------|------|-----------|
| `awsAuthRefresh` | string | Comando de refresh de credenciais AWS |
| `awsCredentialExport` | string | Script de export de credenciais |

## UI Customization

| Chave | Tipo | Descricao | Exemplo |
|-------|------|-----------|---------|
| `companyAnnouncements` | string[] | Mensagens customizadas na UI | `["Deploy freeze ate sexta"]` |
| `spinnerVerbs` | object | Customizar verbos do spinner | `{"mode": "replace", "verbs": [...]}` |
| `spinnerTipsOverride` | object | Dicas customizadas no spinner | `{"excludeDefault": true, "tips": [...]}` |
| `statusLine` | object | Barra de status customizada | `{"type": "command", "command": "..."}` |

### StatusLine Format

```json
{
  "statusLine": {
    "type": "command",
    "command": "echo '{\"icon\":\"🔍\",\"text\":\"branch: main | files: 5\"}'",
    "padding": 2
  }
}
```

O comando recebe JSON via stdin com contexto da sessao e retorna texto para exibir.

## Hooks Configuration

```json
{
  "hooks": {
    "PreToolUse": [{ "matcher": "Bash", "hooks": [{ "type": "command", "command": "...", "timeout": 5 }] }],
    "PostToolUse": [{ "hooks": [{ "type": "command", "command": "..." }] }],
    "UserPromptSubmit": [{ "hooks": [{ "type": "command", "command": "..." }] }],
    "Stop": [{ "hooks": [{ "type": "command", "command": "..." }] }],
    "SubagentStop": [{ "hooks": [{ "type": "command", "command": "..." }] }],
    "SessionStart": [{ "hooks": [{ "type": "command", "command": "..." }] }],
    "SessionEnd": [{ "hooks": [{ "type": "command", "command": "..." }] }],
    "PreCompact": [{ "hooks": [{ "type": "command", "command": "..." }] }],
    "Notification": [{ "hooks": [{ "type": "command", "command": "..." }] }],
    "WorktreeCreate": [{ "hooks": [{ "type": "command", "command": "..." }] }],
    "WorktreeRemove": [{ "hooks": [{ "type": "command", "command": "..." }] }]
  }
}
```

### Hook Output Patterns

| Campo | Descricao |
|-------|-----------|
| `decision: "block"` + exit(2) | Bloqueia a operacao |
| `permissionDecision: "deny"` | Bloqueia programaticamente (alternativa ao exit 2) |
| `modifiedToolInput: {...}` | Modifica o input da tool ANTES da execucao |
| `additionalContext: "..."` | Injeta texto no contexto da sessao (SessionStart) |
| stdout text | Mensagem exibida ao usuario |

## Command-Level Tool Restrictions (allowed-tools)

Commands (slash commands `.md`) suportam restrição de tools via frontmatter YAML:

```yaml
---
allowed-tools: Bash(git:*), Read, Grep
description: Git Flow status command
argument-hint: "[branch-name]"
---
```

### Como funciona

- `allowed-tools` restringe quais tools o Claude Code pode usar durante a execução do command
- Padrão: sem restrição (todas as tools disponíveis)
- Formato: lista separada por vírgula de tool names com patterns opcionais
- Patterns: `Bash(git:*)` permite apenas comandos bash que começam com `git`

### Patterns úteis

| Pattern | Permite |
|---------|---------|
| `Bash(git:*)` | Apenas comandos git no bash |
| `Bash(npm:*)` | Apenas comandos npm |
| `Read, Grep, Glob` | Somente leitura (read-only command) |
| `Edit, Write, Read` | File operations sem bash |
| `Bash(git:*), Read, Edit` | Git + file ops (sem npm, sem curl, sem arbitrary bash) |

### Aplicação LMAS

Útil para commands de projeto que devem ter escopo restrito. Exemplo: um command de "code review" não precisa de Write/Edit. Um command de "git status" não precisa de Edit.

**Nota:** Os agents LMAS controlam escopo via Constitution (agent-authority) e Scope Guard. `allowed-tools` é complementar — funciona na camada de commands, não de agents.

---

## CLAUDE.md Per-Directory (Contexto Localizado)

O Claude Code carrega automaticamente CLAUDE.md de QUALQUER diretório no path do arquivo sendo editado. Isso permite contexto localizado:

```
projeto/
├── CLAUDE.md                    ← Contexto global do projeto
├── packages/
│   ├── CLAUDE.md                ← Contexto do monorepo packages
│   └── auth/
│       ├── CLAUDE.md            ← Padrões específicos de auth
│       └── src/
└── services/
    └── api/
        └── CLAUDE.md            ← Convenções da API
```

### Quando usar

| Situação | CLAUDE.md local? |
|----------|-----------------|
| Módulo com padrões próprios (auth, payments) | SIM |
| Diretório com gotchas conhecidas | SIM |
| Stack diferente do resto (Python em repo JS) | SIM |
| Diretório genérico (utils/, helpers/) | NÃO |
| Menos de 5 arquivos no diretório | NÃO |

### Conteúdo recomendado

```markdown
# Auth Module

## Padrões
- Todas as rotas usam middleware `requireAuth`
- Tokens JWT com 15min TTL, refresh com 7d
- RLS policies em todas as tabelas com `auth.uid()`

## Gotchas
- NUNCA usar `service_role` key no frontend
- Trigger `on_auth_user_created` já popula `profiles`
```

### Aplicação LMAS

No LMAS, já temos `projects/{id}/CLAUDE.md` para contexto por projeto. CLAUDE.md per-directory é um refinamento para projetos com módulos complexos — cada diretório importante pode documentar suas próprias convenções. O Claude Code os carrega automaticamente.

---

## Session Analytics via Filesystem Watching

Pattern do repo davila7/claude-code-templates: monitorar sessoes do Claude Code em tempo real.

### Arquitetura

```
Express:3333 ← WebSocket → Dashboard UI
     ↑
FileWatcher (~/.claude/)  →  ConversationAnalyzer (JSONL parser)
     ↑                              ↓
ProcessDetector            StateCalculator (active/idle/inactive)
```

### Como funciona

1. **FileWatcher** monitora `~/.claude/` para mudancas em arquivos de conversacao
2. **ConversationAnalyzer** parseia JSONL extraindo metadata (tokens, tools, timestamps)
3. **StateCalculator** determina status via timestamps + ProcessDetector
4. **WebSocket** push updates para dashboard em tempo real

### Metricas trackadas

- Token usage (input, output, cache creation/read)
- Conversation count e message volume
- Session duration
- Tool usage frequency
- Daily contribution heatmaps
- Conversation streaks

### Relevancia LMAS

O LMAS ja tem telemetria via checkpoint piggyback (`state-sync.cjs`). Este pattern e mais granular — monitora em tempo real em vez de snapshots. Potencial para um dashboard local de produtividade no futuro, mas nao e prioridade atual.

**Para implementar no futuro:** Requer Express server, filesystem watcher, WebSocket. Custo de manutencao medio. Considerar quando houver necessidade de metricas de uso real.

---

## USE_BUILTIN_RIPGREP

| Variavel | Tipo | Descricao |
|----------|------|-----------|
| `USE_BUILTIN_RIPGREP` | boolean | Usar ripgrep integrado do Claude Code em vez do sistema |
