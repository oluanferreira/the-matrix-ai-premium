---
type: reference
title: "Rails Doctrine Patterns — Knowledge Reference"
tags:
  - reference/absorption
  - rails
  - doctrine
  - patterns
absorbed: 2026-04-09
source: "https://github.com/rails/rails"
decision: "3 ABSORB, 4 ADAPT, 7 SKIP"
---

# Rails Doctrine Patterns — Knowledge Reference

> **Source:** [rails/rails](https://github.com/rails/rails) (~56K stars, 6K+ contributors, MIT)
> **Site:** [rubyonrails.org](https://rubyonrails.org/) | [Doctrine](https://rubyonrails.org/doctrine)
> **Version analyzed:** Rails 8.1.3 (March 2026)
> **Absorbed:** 2026-04-09 via repo-absorption pipeline (Flow D)
> **Analyst:** Atlas (Phase 1 SCAN) → Morpheus (Phase 2-3 EVALUATE/DECIDE) → Neo (Phase 4 IMPLEMENT)

---

## The Rails Doctrine — 9 Pillars

Rails' enduring success comes from its controversial doctrine — 9 philosophical pillars that guide every design decision.

### Pilar 1: Optimize for Programmer Happiness

Ruby was created for programmer happiness. Rails inherits this — beautiful API > marginal performance gains. Developer experience is the primary metric.

**LMAS parallel:** Agent DX — commands should feel natural, outputs should be clear, friction should be minimal.

### Pilar 2: Convention over Configuration

Smart defaults eliminate 80% of decisions. Name `ArticlesController` and Rails auto-maps to `/articles`, `articles` table, `Article` model.

**6 layers of CoC in Rails:**

| Layer | Convention | What it eliminates |
|-------|-----------|-------------------|
| Names | `Article` → `articles` table → `ArticlesController` → `/articles` | Zero routing/DB config |
| Directories | `app/models/`, `app/controllers/`, `app/views/` | Zero autoloading config |
| Migrations | Timestamp-prefixed, reversible by default | Zero versioning config |
| Associations | `has_many :comments` infers `article_id` as FK | Zero relationship config |
| Routes | `resources :articles` generates 7 REST routes | Zero CRUD endpoint config |
| Generators | `rails generate scaffold Article title:string` | Zero boilerplate |

**LMAS decision: ADAPT** — Formalize as SYNAPSE rule. LMAS already uses naming conventions (agent-id.md → skill path) but should make resolution explicit.

### Pilar 3: The Menu is Omakase

One chef decides the menu. Rails chooses the tools (Minitest, Puma, SQLite). Reduces choice paralysis.

**LMAS decision: ADAPT** — Already applied via tool-registry and agent defaults. Formalize as philosophical principle.

### Pilar 4: No One Paradigm

Pragmatism > purism. MVC + concerns + service objects + DSLs. Use the best pattern for each problem.

**LMAS decision: SKIP** — Already multi-paradigm by design.

### Pilar 5: Exalt Beautiful Code

Code is read more than written. APIs should read like prose.

**LMAS decision: SKIP** — Covered by coding standards.

### Pilar 6: Provide Sharp Knives

Powerful tools for competent developers. No excessive guardrails.

**LMAS decision: SKIP** — `*exec auto` mode already implements this philosophy.

### Pilar 7: Value Integrated Systems

Full-stack monolith > fragmented microservices. One cohesive system.

**LMAS decision: SKIP** — LMAS is already an orchestrated monolith.

### Pilar 8: Progress over Stability

Breaking changes accepted if they improve the framework. Deprecation warnings, not feature freeze.

**LMAS decision: SKIP** — Constitution vs evolution is an existing productive tension.

### Pilar 9: Push Up a Big Tent

Inclusive community, multiple styles accepted. Don't need to agree on everything.

**LMAS decision: SKIP** — Squads already operate with autonomy.

---

## Pattern Catalog — 14 Extracted Patterns

### P1: Convention over Configuration (ADAPT)

**How Rails does it:** Naming conventions auto-resolve behavior across 6 layers (names, dirs, migrations, associations, routes, generators).

**LMAS application:** Formalized as SYNAPSE GLOBAL_RULE_16. Examples: `agent-id.md` → `/LMAS:agents:{id}`, `{epic}.{story}.story.md` → story ID, `projects/{id}/` → project context path.

### P2: Generators Produce Complete Artifacts (ADAPT)

**How Rails does it:** `rails generate scaffold` always produces model + controller + views + routes + tests + migration. Never code without its test.

**LMAS application:** Formalized as SYNAPSE GLOBAL_RULE_14. All `create-*` tasks should produce artifact + test + config. `create-service.md` already does this (8 files). Other generators need alignment.

### P3: Migration System — Versioned, Reversible, Tracked (ABSORB)

**How Rails does it:**
- Timestamp-prefixed files (YYYYMMDDHHMMSS)
- `change` method auto-reverses; `up/down` for complex cases
- `schema_migrations` table tracks applied versions
- `db/schema.rb` = current state snapshot
- `in_batches(of: 1000)` for safe data migrations
- Staged deploys: add → migrate data → remove old

**LMAS application:** @data-engineer already has migration tasks but lacks centralized tracking. Key principles to apply:
1. Every schema change via formal migration (never ad-hoc)
2. Rollback plan is mandatory (SECTOR_DEV_RULE_3 already covers this)
3. Batch processing for large data changes
4. Schema snapshot for zero-to-current reconstruction

### P4: Security by Default (ABSORB)

**How Rails does it:**

| Attack Vector | Rails Protection | Mechanism |
|---------------|-----------------|-----------|
| Mass Assignment | Strong Parameters | `params.expect(article: [:title, :content])` — explicit whitelist |
| CSRF | `protect_from_forgery` | Auto-token in every form |
| SQL Injection | Parameterized queries | ActiveRecord uses prepared statements |
| XSS | Output escaping | ERB auto-escapes HTML |
| Session hijacking | Encrypted cookies | Session data encrypted by default |
| Credentials | `credentials.yml.enc` | Encrypted secrets in repo |

**LMAS application:** Formalized as SYNAPSE GLOBAL_RULE_15. Security is ON by default. Turning it OFF requires explicit justification + @cyber-chief approval.

### P5: Rich Model, Thin Controller (SKIP)

**How Rails does it:** Business logic lives in models (validations, callbacks, scopes, associations). Controllers only route requests and render responses.

**Why SKIP:** LMAS agents are already "rich models" — each agent has internal business logic, commands, and domain expertise. No gap.

### P6: Fixtures over Factories for Speed (SKIP)

**How Rails does it:** Fixtures (YAML) load once into DB. Factories (FactoryBot) create per test. Fixtures are 10-100x faster.

**Why SKIP:** Ruby-specific testing optimization. @qa has its own testing patterns.

### P7: Solid Trifecta Eliminates Redis (SKIP)

**How Rails does it:** Solid Queue (jobs), Solid Cache (caching), Solid Cable (WebSockets) — all via SQLite/Postgres. No Redis dependency.

**Why SKIP:** Ruby-specific infrastructure. Not applicable to LMAS framework.

### P8: Kamal = Deploy Without PaaS (SKIP)

**How Rails does it:** `kamal setup` configures any VM for production. Docker + Thruster proxy + Let's Encrypt SSL. Zero-downtime deploys.

**Why SKIP:** Reference for @devops but not absorbable as pattern. LMAS already uses Coolify/VPS.

### P9: Monorepo of Decoupled Components (SKIP)

**How Rails does it:** rails/rails is a monorepo with independent gems (activerecord, actionpack, activesupport, etc.). Each gem usable standalone.

**Why SKIP:** LMAS already implements this — `.lmas-core/` with independent tasks, templates, agents.

### P10: Omakase — Opinionated Defaults (ADAPT)

**How Rails does it:** Rails chooses the stack. Minitest, not RSpec. Puma, not Unicorn. SQLite for dev, Postgres for prod. Fewer choices = faster starts.

**LMAS application:** Already applied (tool-registry, agent defaults) but not formalized as principle. Part of the philosophical foundation.

### P11: Hotwire/Turbo — Server-Rendered Reactivity (SKIP)

**How Rails does it:** Turbo Frames + Turbo Streams = SPA-like UX without JavaScript SPA frameworks. Server renders HTML, Turbo updates DOM selectively.

**Why SKIP:** Frontend pattern for web projects, not framework-level.

### P12: Modular Monolith + Packwerk Boundaries (ADAPT)

**How Rails does it:**
- Engines = mini Rails apps (isolation within monolith)
- Concerns = shared behavior modules
- Packwerk (Shopify) = boundary enforcement via `package.yml` dependency declarations
- Scale proof: Shopify's 2.8M LOC monolith handled 173B requests on Black Friday 2024

**LMAS application:** SYNAPSE domains provide logical boundaries. Agent authority provides operational boundaries. Missing: automatic violation detection when agents cross domain boundaries. Concept of "declared dependencies" between domains could strengthen SYNAPSE.

### P13: Doctrine as Living Document (ABSORB)

**How Rails does it:** The Rails Doctrine is a separate philosophical document from the technical guides. It explains WHY Rails makes certain choices, not just HOW to use it. 9 pillars that have evolved over a decade.

**LMAS application:** LMAS Constitution covers governance (articles = rules). Missing: a "LMAS Doctrine" that explains the philosophical WHY behind the framework's design choices. Constitution says WHAT is required; Doctrine would say WHY it matters.

### P14: Sharp Knives — Trust Developers (SKIP)

**How Rails does it:** Provides powerful tools without excessive guardrails. Trusts developers to use them responsibly.

**Why SKIP:** `*exec auto` mode already implements this. No gap.

---

## Decision Summary

| Decision | Count | Patterns |
|----------|-------|---------|
| **ABSORB** | 3 | P3 (migration tracking), P4 (security by default), P13 (doctrine document) |
| **ADAPT** | 4 | P1 (CoC formalized), P2 (generator completeness), P10 (omakase), P12 (boundary enforcement) |
| **SKIP** | 7 | P5, P6, P7, P8, P9, P11, P14 |

## SYNAPSE Rules Created

- `GLOBAL_RULE_14` — Generator Completeness (from P2)
- `GLOBAL_RULE_15` — Security by Default (from P4)
- `GLOBAL_RULE_16` — Convention Resolution (from P1)

## Sources

- [Rails Doctrine](https://rubyonrails.org/doctrine)
- [Rails GitHub](https://github.com/rails/rails)
- [Rails 8 Release Notes](https://guides.rubyonrails.org/8_0_release_notes.html)
- [Rails Security Guide](https://guides.rubyonrails.org/security.html)
- [Rails Testing Guide](https://guides.rubyonrails.org/testing.html)
- [Rails Migrations Guide](https://guides.rubyonrails.org/active_record_migrations.html)
- [Shopify Modular Monolith](https://shopify.engineering/shopify-monolith)
- [Rails 8: No PaaS Required](https://rubyonrails.org/2024/11/7/rails-8-no-paas-required)
