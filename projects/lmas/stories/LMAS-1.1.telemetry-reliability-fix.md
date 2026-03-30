# Story LMAS-1.1: Telemetry Reliability Fix

## Status
Ready

## Executor Assignment
executor: "@dev"
quality_gate: "@qa"
quality_gate_tools: ["manual review", "Supabase query verification"]

## Story
**As a** framework maintainer,
**I want** telemetry hooks to reliably deliver ALL session and document data to Supabase,
**so that** the admin dashboard shows accurate, real-time activity from all premium users.

## Context
Diagnostic session 2026-03-29 identified 5 critical silent failures in the telemetry hooks.
7 users active, 257 docs synced, but data loss confirmed (heartbeat: 2/65 logs, session data gaps).
Repo: `the-matrix-2.0` (path: `C:\Users\luanf\OneDrive\Desktop\THE MATRIX\the-matrix-2.0`)

### Caso real confirmado: Zé (28/03/2026)
- Instalou Matrix ~16:20 (horário BR) com token premium
- Configurou Obsidian, usou 100% do plano Pro na sessão
- Dashboard mostra: **apenas 1 checkpoint + 2 install logs**
- Toda a atividade da sessão (prompts, ferramentas, docs) foi PERDIDA
- Provável causa: T6/T7 (buffer limpo sem confirmar API) + T3 (flush threshold alto)
- Fuso horário: painel pode estar em UTC, install registra 16:24 — confirma que o install log FUNCIONA, mas session-tracker e state-sync FALHARAM

## Acceptance Criteria

1. `session-tracker.cjs` MUST verify API response (`{ ok: true }`) BEFORE clearing the buffer. If API fails, buffer MUST be retained for retry on next prompt.
2. `session-tracker.cjs` flush threshold MUST be reduced from 3 prompts to 1 prompt (every prompt sends immediately, no buffering delay).
3. `session-tracker.cjs` MUST flush remaining buffer on session end (via buffer age check on each prompt, ensuring max 1 prompt of data loss).
4. `state-sync.cjs` MUST handle API error responses gracefully — if `{ ok: true }` is NOT received, content hashes MUST NOT be saved (forcing retry on next sync cycle).
5. Both hooks MUST write diagnostic errors to `.lmas/telemetry-errors.log` (append-only, max 50 lines, rotate) when token is missing, decryption fails, or API returns error. ZERO console.log.
6. `checkpoint-context.cjs` heartbeat ping MUST fire on EVERY session start (not just first prompt of process). Session ID check should allow re-ping if last heartbeat > 1 hour.
7. All fixes MUST be backward compatible — hooks that work today MUST continue working.
8. After fix, verify via Supabase query that Luan Ferreira's session from THIS fix session appears in `matrix_session_activity`.

## Complexity
**Medium** — 3 hooks modificados, ~50 linhas de mudança cada, 1 novo utilitário de log.

## Dependencies
- Supabase Edge Functions online e respondendo (sync-state, sync-session-activity, heartbeat)
- Token premium válido + `token-cache.json` existente localmente para testes
- Node.js 18+ (crypto module para AES-256-GCM no token-reader)

## Risks
| Risco | Severidade | Mitigação |
|-------|-----------|-----------|
| Mudança no flush quebra backward compat | MEDIUM | AC7 exige backward compat. Testar com echo pipe antes de deploy |
| Rate limit Supabase (flush a cada prompt) | LOW | Hooks já fazem fire-and-forget. Supabase free tier suporta 500K invocações/mês |
| telemetry-errors.log cresce sem controle | LOW | AC5 exige rotação em 50 linhas |

## Scope

### IN Scope
- `the-matrix-2.0/.claude/hooks/session-tracker.cjs` — buffer reliability fix
- `the-matrix-2.0/.claude/hooks/state-sync.cjs` — API error handling fix
- `the-matrix-2.0/.claude/hooks/checkpoint-context.cjs` — heartbeat frequency fix
- `.lmas/telemetry-errors.log` — new diagnostic log file

### OUT of Scope
- Admin dashboard UI changes
- New Edge Functions on Supabase
- Token encryption/decryption changes
- Free tier telemetry (separate story)
- New telemetry events or data types

## Tasks / Subtasks

- [x] Task 3: Add diagnostic error log (AC: 5) — executed first per Smith finding 3
  - [x] 3.1 Create `appendErrorLog()` utility in shared lib
  - [x] 3.2 Add calls in session-tracker (token missing, API fail, buffer corrupt)
  - [x] 3.3 Add calls in state-sync (token missing, API fail)
  - [x] 3.4 Implement 50-line rotation
- [x] Task 1: Fix session-tracker buffer reliability (AC: 1, 2, 3)
  - [x] 1.1 Move buffer clear AFTER API response verification
  - [x] 1.2 Change `FLUSH_EVERY_N` from 3 to 1
  - [x] 1.3 Add response check callback (parse JSON, verify `ok: true`)
  - [x] 1.4 On API failure: keep buffer, log error, retry next prompt
- [x] Task 2: Fix state-sync error handling (AC: 4)
  - [x] 2.1 Verify existing `{ ok: true }` check is working correctly — confirmed line 491
  - [x] 2.2 Add explicit error logging when API rejects
  - [x] 2.3 Ensure hashes are NOT saved on failure — confirmed: onSuccess only on ok
- [x] Task 4: Fix heartbeat frequency (AC: 6)
  - [x] 4.1 Read last heartbeat timestamp from `.lmas/.last-heartbeat`
  - [x] 4.2 If > 1 hour since last heartbeat, fire new ping
  - [x] 4.3 Write new timestamp after successful ping
- [x] Task 5: Verification (AC: 7, 8)
  - [x] 5.1 Test hooks locally — exit 0, silent, no breaking changes
  - [ ] 5.2 Query Supabase to confirm data arrived from this session — needs hooks copied to MINHA MATRIX
  - [x] 5.3 Verify telemetry-errors.log is created and populated correctly — confirmed working

## Dev Notes

### Arquivos-chave
- `the-matrix-2.0/.claude/hooks/session-tracker.cjs` — linhas 176-213 (flush logic)
- `the-matrix-2.0/.claude/hooks/state-sync.cjs` — linhas 131-158 (doc sync), 166-210 (tool usage)
- `the-matrix-2.0/.claude/hooks/checkpoint-context.cjs` — linhas 293-364 (heartbeat ping)
- `the-matrix-2.0/.claude/hooks/lib/token-reader.cjs` — shared token reading

### Bugs identificados (diagnóstico 2026-03-29)
1. **T6/T7 (CRÍTICO):** session-tracker limpa buffer em linha 182 ANTES de confirmar resposta da API. `req.on('error', () => {})` descarta erros silenciosamente. Callback de resposta `() => {}` ignora resposta.
2. **T3 (ALTO):** `FLUSH_EVERY_N = 3` faz sessões curtas (1-2 prompts) nunca enviarem dados.
3. **S6 (ALTO):** state-sync verifica `{ ok: true }` mas precisa verificar se o path de erro está cobrindo todos os cenários.
4. **Heartbeat (ALTO):** Só 2 heartbeats em 65 logs. O ping em checkpoint-context.cjs roda 1x por sessão (PID-based), mas se o processo Claude Code persiste, nunca repinga.

### Padrão de código
- ZERO `console.log` — hooks são silenciosos
- `process.exit(0)` em qualquer erro — nunca falhar visivelmente
- HTTP fire-and-forget com `req.on('error', () => {})` e `req.on('timeout', () => req.destroy())`
- Token lido via `lib/token-reader.cjs` (suporta v1 plaintext + v2 AES-256-GCM)

### Testing
- Testar localmente executando: `echo '{}' | node .claude/hooks/session-tracker.cjs`
- Verificar no Supabase: `SELECT * FROM matrix_session_activity WHERE user_id = '{luan_id}' ORDER BY created_at DESC LIMIT 5`
- Verificar log: `cat .lmas/telemetry-errors.log`

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (1M context)

### Completion Notes
- Edge Functions verified online (curl test: sync-session-activity returns 401 for missing auth, sync-state returns `{ok:false}` for invalid token)
- Task order adjusted per Smith finding 3: utility created first
- `FLUSH_EVERY_N` changed from 3→1 (flush every prompt)
- Buffer clear moved AFTER API response verification (was clearing before)
- Heartbeat now re-pings if > 1 hour since last (was PID-only, never re-pinged)
- Error log utility tested: creates `.lmas/telemetry-errors.log` with rotation at 50 lines
- AC8 (Supabase query) pending — needs hooks synced to MINHA MATRIX workspace with valid token

### File List
- `the-matrix-2.0/.claude/hooks/lib/token-reader.cjs` — added `appendErrorLog()` utility
- `the-matrix-2.0/.claude/hooks/session-tracker.cjs` — buffer reliability fix (AC 1,2,3,5)
- `the-matrix-2.0/.claude/hooks/state-sync.cjs` — error handling + logging (AC 4,5)
- `the-matrix-2.0/.claude/hooks/checkpoint-context.cjs` — heartbeat frequency fix (AC 6)

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-29 | 1.0 | Story created from telemetry diagnostic | @sm (River) |
| 2026-03-29 | 1.1 | PO validation: GO (7/10). Added Complexity, Dependencies, Risks. Status → Ready | @po (Keymaker) |
| 2026-03-29 | 1.2 | Smith review: CONTAINED (1 HIGH, 5 MEDIUM, 4 LOW). Edge Function verified OK. | @smith (Smith) |
| 2026-03-29 | 2.0 | Implementation complete. 4 files modified. AC 1-7 met. AC8 pending Supabase verify. | @dev (Neo) |
