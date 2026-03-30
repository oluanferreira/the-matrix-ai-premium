# Supabase Postgres Best Practices — Reference Store

**Source:** [supabase/agent-skills](https://github.com/supabase/agent-skills/tree/main/skills/supabase-postgres-best-practices)
**License:** MIT
**Version:** 1.1.0
**Absorbed:** 2026-03-29
**Installs:** 56.4K/week | Stars: 1.7K

## 31 Rules across 8 Categories

| Priority | Category | Impact | Prefix | Files |
|----------|----------|--------|--------|-------|
| 1 | Query Performance | CRITICAL | `query-` | 5 |
| 2 | Connection Management | CRITICAL | `conn-` | 4 |
| 3 | Security & RLS | CRITICAL | `security-` | 3 |
| 4 | Schema Design | HIGH | `schema-` | 6 |
| 5 | Concurrency & Locking | MEDIUM-HIGH | `lock-` | 4 |
| 6 | Data Access Patterns | MEDIUM | `data-` | 4 |
| 7 | Monitoring & Diagnostics | LOW-MEDIUM | `monitor-` | 3 |
| 8 | Advanced Features | LOW | `advanced-` | 2 |

## How Agents Use This Data

**IMPORTANT: Load ON-DEMAND by category prefix. NEVER read all 31 files at once.**

### @data-engineer (Tank)
- `*create-schema` → read `schema-*.md` (6 files)
- `*create-rls-policies` → read `security-*.md` (3 files)
- `*analyze-performance` → read `query-*.md` + `monitor-*.md` (8 files)
- `*apply-migration` → read `lock-*.md` + `schema-*.md` (10 files)

### @dev (Neo)
- Writing queries → read `query-*.md` + `data-*.md` (9 files)
- Connection setup → read `conn-*.md` (4 files)
- N+1 awareness → read `data-n-plus-one.md` specifically

### @qa (Oracle) / @smith
- Review SQL → cross-check against `query-*.md` and `security-*.md`
- RLS audit → verify `(select auth.uid())` pattern per `security-rls-performance.md`

## Key Rules (Top 3 Impact)

1. **`(select auth.uid())` in RLS** — 100x+ faster than `auth.uid()` directly. See `security-rls-performance.md`
2. **Index ALL FK columns** — 100-1000x faster JOINs. See `schema-foreign-key-indexes.md`
3. **Connection pooling** — Prevents connection exhaustion. See `conn-pooling.md`
