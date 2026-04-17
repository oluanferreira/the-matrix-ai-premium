---
name: Claude Code Hook Patterns
description: Advanced hook patterns including modifiedToolInput, permissionDecision, and multi-level guards
type: reference
project: lmas
source: davila7/claude-code-templates (52 hooks analyzed)
absorbed: 2026-03-31
tags:
  - project/lmas
  - claude-code
  - hooks
  - patterns
  - security
  - reference
---

# Claude Code Hook Patterns — Advanced Reference

Padroes avancados de hooks descobertos na analise de 52 hooks do repo davila7/claude-code-templates (23.8K stars).

## Pattern 1: modifiedToolInput — Injecao de Contexto em Tools

O hook pode MODIFICAR o input de uma tool antes que ela execute. Unico pattern que altera comportamento sem bloquear.

### Como funciona

O hook retorna JSON com campo `modifiedToolInput` contendo o input alterado. O Claude Code substitui o input original pelo modificado.

### Exemplo: Injetar ano atual em buscas web

```python
#!/usr/bin/env python3
import json, sys, datetime

input_data = json.loads(sys.stdin.read())
tool_input = input_data.get("tool_input", {})
query = tool_input.get("query", "")

# Temporal words that indicate the query already has time context
temporal = ["latest", "recent", "current", "2024", "2025", "2026", "today", "yesterday"]

if not any(word in query.lower() for word in temporal):
    current_year = datetime.datetime.now().year
    tool_input["query"] = f"{query} {current_year}"
    print(json.dumps({"modifiedToolInput": tool_input}))
else:
    print(json.dumps({}))
```

### Aplicacoes LMAS potenciais

- Injetar `project_id` em buscas de arquivo automaticamente
- Adicionar filtros de seguranca em comandos Bash
- Enriquecer queries de busca com contexto do projeto ativo

## Pattern 2: permissionDecision — Bloqueio Programatico

Alternativa ao `exit(2)` para bloquear operacoes. Mais expressivo — permite retornar mensagem estruturada.

### Como funciona

```python
import json
# Para bloquear:
print(json.dumps({
    "permissionDecision": "deny",
    "reason": "Commit message does not follow Conventional Commits format"
}))

# Para permitir explicitamente:
print(json.dumps({
    "permissionDecision": "allow"
}))
```

### Diferenca vs exit(2)

| Aspecto | exit(2) | permissionDecision |
|---------|---------|-------------------|
| Formato | Exit code | JSON stdout |
| Mensagem | stdout text | Campo `reason` estruturado |
| Flexibilidade | Binario (block/allow) | Pode incluir metadata |
| Compatibilidade | Universal | Requer JSON parsing |

### Recomendacao LMAS

Manter `exit(2)` para hooks existentes (careful-guard, workflow-guard). Usar `permissionDecision` para novos hooks que precisam de mensagens estruturadas.

## Pattern 3: Multi-Level Guard — Protecao em Camadas

Dividir protecao em niveis com severidades diferentes.

### Arquitetura de 3 niveis

```
Level 1 (CRITICAL) — Bloqueia SEMPRE, exit(2)
  → rm -rf /, dd if=, mkfs, fork bombs, chmod 777 /

Level 2 (HIGH) — Bloqueia em paths criticos
  → rm/mv em: .claude/, .git/, node_modules/, .env, package.json, lock files

Level 3 (WARNING) — Avisa mas nao bloqueia
  → Chained rm (cmd1 && rm), wildcards com rm, find -delete, xargs rm
```

### Implementacao LMAS (careful-guard.cjs)

O careful-guard.cjs do LMAS implementa os 3 niveis (absorção 2026-03-31):
- **L1:** Patterns catastroficos (rm -rf /, dd, mkfs, fork bomb, chmod 777 /) + destrutivos originais
- **L2:** Critical paths (.claude/, .git/, .lmas-core/, .env, package.json, lock files) com regex restrito (`\s+` em vez de `.*`)
- **L3:** Patterns suspeitos (find -delete, xargs rm, wildcards, chained rm) como WARNING sem bloqueio

## Pattern 4: Spec-Driven Scope Guard (Stop event)

Roda no evento `Stop` (quando Claude termina de responder). Compara arquivos modificados no git vs arquivos declarados em uma spec.

### Como funciona

1. Encontra o `.spec.md` mais recente (modificado nos ultimos 60min)
2. Extrai lista de arquivos declarados na spec
3. Compara com `git diff --name-only`
4. Reporta arquivos modificados que NAO estao na spec (scope creep)

### Adaptacao LMAS

No LMAS, a "spec" equivale a uma **story** (`docs/stories/*.md`). O conceito se adapta naturalmente:

```
Story File List (declarado) vs git diff (real)
→ Arquivos modificados fora do File List = scope creep warning
```

Isso complementa o `freeze-scope.cjs` existente que congela escopo durante execucao.

## Pattern 5: additionalContext — Injecao de Contexto na Sessao

Hooks de `SessionStart` podem retornar `additionalContext` para injetar texto no contexto da sessao.

### Como funciona

```python
import json
context = "## Project Agents\n- @dev: implementation\n- @qa: testing"
print(json.dumps({"additionalContext": context}))
```

### Estado LMAS

Ja implementado via `checkpoint-context.cjs` (UserPromptSubmit). O LMAS usa UserPromptSubmit em vez de SessionStart porque precisa injetar contexto em CADA prompt, nao so no inicio.

## Pattern 6: Conventional Commits Enforcement (Hook)

Valida formato de mensagem de commit via hook PreToolUse com matcher Bash.

### Regex de validacao

```
^(feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert)(\(.+\))?!?:\s.+$
```

### Tipos permitidos

| Tipo | Descricao |
|------|-----------|
| `feat` | Nova funcionalidade |
| `fix` | Correcao de bug |
| `docs` | Documentacao |
| `style` | Formatacao (sem mudanca de logica) |
| `refactor` | Refatoracao |
| `perf` | Performance |
| `test` | Testes |
| `chore` | Manutencao |
| `ci` | CI/CD |
| `build` | Build system |
| `revert` | Reverter commit |

### Deteccao de commit no Bash

```python
import json, sys, re
input_data = json.loads(sys.stdin.read())
command = input_data.get("tool_input", {}).get("command", "")

# Detectar se e um git commit
if "git commit" not in command:
    sys.exit(0)  # Nao e commit, permitir

# Extrair mensagem
msg_match = re.search(r'-m\s+["\'](.+?)["\']', command)
if not msg_match:
    # Pode ser heredoc — tentar outro pattern
    msg_match = re.search(r'<<.*?EOF\n(.+?)(?:\n|Co-Authored)', command, re.DOTALL)

if msg_match:
    msg = msg_match.group(1).strip()
    pattern = r'^(feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert)(\(.+\))?!?:\s.+'
    if not re.match(pattern, msg):
        print(json.dumps({"permissionDecision": "deny"}))
        print(f"Commit message invalida: '{msg}'", file=sys.stderr)
        print(f"Formato esperado: type(scope): description", file=sys.stderr)
        sys.exit(2)
```

## Catalogo de Hook Events

| Event | Quando dispara | Uso principal |
|-------|---------------|---------------|
| `PreToolUse` | Antes de executar tool | Validacao, bloqueio, modificacao de input |
| `PostToolUse` | Apos executar tool | Logging, formatacao, auto-stage |
| `UserPromptSubmit` | Quando usuario envia prompt | Injecao de contexto, regras |
| `Stop` | Quando Claude termina resposta | Scope check, notificacoes |
| `SubagentStop` | Quando subagente termina | Notificacoes |
| `SessionStart` | Inicio de sessao (startup/resume) | Context injection, health check |
| `SessionEnd` | Fim de sessao | Cleanup, logging |
| `PreCompact` | Antes de compactar contexto | Salvar estado importante |
| `Notification` | Aguardando input do usuario | Alertas |
| `WorktreeCreate` | Worktree criado | Setup de ambiente |
| `WorktreeRemove` | Worktree removido | Cleanup |

## Pattern 7: Ultra-Think — Adversarial Reasoning Framework

Estrutura de análise multi-dimensional com inversão adversarial e calibração de confiança. Complementa SYNAPSE RULE_14 (deliberação).

### Fluxo

1. **Enquadrar** — Definir o problema em 1-2 frases
2. **Gerar 3+ soluções DIFERENTES** (não variantes) — abordagens fundamentalmente distintas
3. **Avaliar cada uma em 5 lentes:** técnica, econômica, humana, sistêmica, temporal
4. **Inversão adversarial** — Para cada solução: "O que eu faria para GARANTIR que isso falhe?"
5. **Cross-domain insight** — Trazer analogia de outro domínio que ilumina o problema
6. **Efeitos de segunda ordem** — Projetar em 6 meses, 2 anos, 10 anos
7. **Calibração de confiança** — Marcar certeza por claim individual (HIGH/MEDIUM/LOW)

### Quando usar no LMAS

- `@hamann *seek-counsel` — O advisory board pode usar este framework
- `@analyst *brainstorm` — Como técnica complementar de brainstorming
- SYNAPSE RULE_14 (deliberação) — ultra-think é a versão máxima da deliberação
- Decisões de arquitetura complexas (@architect)

### Exemplo de calibração de confiança

```
Recomendação: Usar Supabase RLS para multi-tenancy
- "RLS escala até 100K rows por tenant" → Confiança: HIGH (testado)
- "Performance não degrada com 50+ policies" → Confiança: LOW (não testado em escala)
- "RLS substitui middleware de auth" → Confiança: MEDIUM (depende do caso)
```

A calibração força honestidade sobre o que sabemos vs o que assumimos.

---

## Pattern 8: Confidence Scoring — Auto-Decision Threshold

Pattern do blueprint-mode (davila7/claude-code-templates): usar score 0-100 para decidir quando perguntar ao usuario vs prosseguir autonomamente.

### Regras

```
Score >= 90: Prosseguir sem perguntar (alta confianca)
Score 60-89: Prosseguir mas informar a decisao tomada
Score 30-59: Perguntar ao usuario — "Minha inclinacao e X, confirma?"
Score < 30: PARAR e pedir clarificacao — ambiguidade demais
```

### Aplicacao LMAS

Relevante para `*exec auto` (modo autonomo do @dev):
- Decisao de arquitetura local (qual pattern usar) → score alto se ha precedente no codebase
- Escolha de biblioteca → score medio (depende de preferencias do projeto)
- Mudanca de escopo → score baixo (sempre perguntar)

O @dev no modo AUTO pode usar este scoring para calibrar quando pedir confirmacao.

## Pattern 9: Materiality Test — Documentation Filtering

Pattern do HLBPA (High-Level Big Picture Architect): regra de filtragem para documentacao e arquitetura.

### Regra

> "Se remover um detalhe NAO mudaria um contrato de consumidor, omita."

### Aplicacao

- **@architect** ao escrever architecture docs: focar em interfaces, contratos, boundaries — omitir detalhes de implementacao
- **@pm** ao escrever PRDs: focar em requisitos que impactam experiencia do usuario
- **Self-review** (SYNAPSE RULE_9): usar materiality test como filtro antes de declarar completo

### Exemplos

| Detalhe | Material? | Acao |
|---------|-----------|------|
| "API retorna 404 para recurso nao encontrado" | SIM — consumidor precisa tratar | Documentar |
| "Internamente usamos Map em vez de Object" | NAO — detalhe de implementacao | Omitir |
| "Auth usa JWT com 15min TTL" | SIM — afeta UX de sessao | Documentar |
| "Usamos camelCase em vars internas" | NAO — convencao interna | Omitir |

---

## Variaveis de Ambiente Disponiveis em Hooks

| Variavel | Descricao |
|----------|-----------|
| `CLAUDE_TOOL_NAME` | Nome da tool sendo usada |
| `CLAUDE_TOOL_FILE_PATH` | Path do arquivo sendo operado |
| `CLAUDE_PROJECT_DIR` | Diretorio raiz do projeto |
