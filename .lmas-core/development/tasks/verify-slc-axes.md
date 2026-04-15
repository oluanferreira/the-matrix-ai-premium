# Verify SLC Axes — Adversarial Audit Task (Smith EXCLUSIVE)

> **Owner:** @smith (Delivery Verification Agent)
> **Invoked via:** `*verify-slc-axes` command
> **Constitution:** CONSTITUTION_RULE_9 (SLC First)
> **Reference:** `framework/references/slc-methodology.md`
> **Invoked by workflows:** `greenfield-fullstack.yaml`, `greenfield-service.yaml`, `greenfield-ui.yaml` (phase `smith-verify-slc-axes`, blocking)

## Purpose

Adversarial audit of a project's Phase 1 delivery against the 3 SLC axes (Simple, Lovable, Complete) with evidence required per axis. This is NOT a formal quality gate (that belongs to @qa/Oracle) — this is the red-team verification that blocks SLC-washing.

## When to Execute

1. **Workflow-driven:** During `greenfield-*` workflow Phase 1, after `po-delegate-fixes` step, before Phase 2 (Document Sharding). Blocking gate.
2. **On-demand:** When @pm, @po, or Morpheus requests SLC verification for any slice claim.
3. **Post-delivery:** After a Phase 1 slice is declared complete and before handoff to @devops for push.

## Inputs Required

- `prd.md` with `SLC Slice Definition` section populated (all 3 axes)
- `project-brief.md` with `slc_carve_out` field declared (enum: internal-tool | spike | hypothesis-validation | none)
- `front-end-spec.md` (if UI-bearing project)
- Architecture doc (if available)
- Stories tagged with `slc_phase_1_slice: true` (if any exist)
- Implementation artifacts (if post-delivery audit)

## The 3 Axes — Evidence Checklist

### Axis 1: Simple

**Requirement:** 1 end-to-end user journey, not 5 journeys halfway.

**Evidence audited:**
- [ ] Exactly ONE primary journey is described ponta-a-ponta (start → intended value captured → end state)
- [ ] Features explicitly OUT of the slice are listed with justification (each becomes a future phase)
- [ ] Feature count in the slice <= 3 for a tight SLC; > 3 triggers `on_simple_inflated` route
- [ ] No "we'll also do X if there's time" language anywhere in the PRD
- [ ] The slice can be demoed in a single happy-path walkthrough under 3 minutes

**Failure modes to probe:**
- Multiple parallel journeys disguised as "one flow"
- Features listed IN the slice that are actually dependencies, not user-facing
- Vague scope language ("basically anything the user needs to...")

### Axis 2: Lovable

**Requirement:** UI polida + microcopy cuidada + brand presente + acessibilidade baseline.

**Evidence audited:**
- [ ] `@ux-design-expert` sign-off: UX flows validated (proof: approval comment or review doc)
- [ ] `@kamala` sign-off: Brand presence validated — identity, tone, visual language (proof: brand compliance check)
- [ ] `@copywriter` sign-off: Microcopy reviewed — buttons, empty states, error messages, onboarding (proof: copy review comment)
- [ ] Accessibility baseline: WCAG AA contrast, keyboard navigation, screen reader labels (not deferred to "v2")
- [ ] At least 1 visual reference (screenshot, mockup, Stitch export) for each screen in the slice
- [ ] No "design will be polished later" language

**Failure modes to probe:**
- "Lovable" claim with one or more of the 3 required sign-offs missing
- Accessibility deferred to later phase
- Generic UI kit with zero brand customization
- Placeholder microcopy ("Lorem ipsum", "Click here", "Submit")
- Missing error states, loading states, or empty states

### Axis 3: Complete

**Requirement:** Cada feature 100% funcional + testes + error states. No stubs, no TODOs deferred.

**Evidence audited:**
- [ ] Per-feature `definition_of_done` in PRD or story — explicit, testable
- [ ] Tests planned or present: unit + integration minimum for each feature
- [ ] Error states implemented (network error, empty state, unauthorized, validation failure)
- [ ] Happy path + principal edge cases documented
- [ ] No `TODO:`, `FIXME:`, `stub`, `hardcoded`, `placeholder`, `mock` in implementation (if post-delivery)
- [ ] No story tagged `slc_phase_1_slice: true` with incomplete acceptance criteria

**Failure modes to probe:**
- "Feature works" = happy path only, zero edge cases
- "Tests coming in next sprint"
- Stubs or mocks in production code
- Error states represented as empty divs or silent failures
- Hardcoded values instead of configuration

## Carve-Out Verification

Read `slc_carve_out` from PRD. Valid values: `internal-tool` | `spike` | `hypothesis-validation` | `none`.

| Declared | Verification |
|----------|--------------|
| `none` (default) | Full SLC applies. All 3 axes required with evidence. Missing evidence = CRITICAL. |
| `internal-tool` | Verify: user count declared <= 10, no external brand surface, user population is internal. If user-facing or branded → upgrade to CRITICAL (carve-out mismatch). |
| `spike` | Verify: declared as throwaway, not scheduled for production use, disposal plan documented. If long-lived → upgrade to CRITICAL. |
| `hypothesis-validation` | Verify: no brand investment, explicit hypothesis statement, disposal plan post-test. If brand-adjacent → upgrade to CRITICAL. |
| (other) | Rejected per CONSTITUTION_RULE_9 — finding CRITICAL automatic. |

## Severity Routing (per smith.md:slc_audit_routing)

| Finding | Severity | Route |
|---------|----------|-------|
| Missing evidence (axis not proven) when `slc_carve_out=none` | **CRITICAL** | Return to @pm — reopen SLC Slice Definition, fill evidence per axis. |
| Simple axis inflated (> 1 journey OR > 3 features without cut) | **HIGH** | Return to @pm + escalate @hamann for scope counsel. |
| Lovable gap (any of the 3 sign-offs missing or accessibility deferred) | **HIGH** | Return to delivering agent + mandatory veto by @ux-design-expert + @kamala + @copywriter. |
| Complete gap (stub / TODO / missing test / missing error state) | **CRITICAL** | Return to @dev via @qa — RULE_15 violation (Generator Completeness). Hard block. |
| Carve-out claim inconsistent with project nature | **MEDIUM → CRITICAL** | If mismatch found, upgrade severity. Carve-outs are not escape hatches. |
| Anti-pattern language ("quase pronto", "só falta polir", "testes depois") | **HIGH** | Return to delivering agent. Anti-patterns listed in `slc-methodology.md` are confessions. |

## Execution Steps

1. **Load context:** Read PRD SLC Slice Definition section + `slc_carve_out` field + front-end-spec + any tagged stories.
2. **Audit Axis 1 (Simple):** Run the Simple evidence checklist. Record findings with severity.
3. **Audit Axis 2 (Lovable):** Run the Lovable evidence checklist. Verify 3 sign-offs + accessibility. Record findings.
4. **Audit Axis 3 (Complete):** Run the Complete evidence checklist. Probe for stubs and deferred work. Record findings.
5. **Audit Carve-Out:** Verify declared value matches project nature. Upgrade severity on mismatch.
6. **Probe Anti-Patterns:** Grep/scan PRD, stories, and implementation notes for SLC-washing language.
7. **Compile findings:** Minimum evidence-backed findings per axis. Each finding must be specific (WHERE), justified (WHY), actionable (HOW to fix).
8. **Route per severity:** Apply `slc_audit_routing` map to deliver findings to the correct agent.
9. **Emit verdict:** COMPROMISED (any CRITICAL), INFECTED (HIGH blocking), CONTAINED (MEDIUM only), or CLEAN (zero blocking).
10. **Update handoff:** If CONTAINED or CLEAN, authorize Phase 2 / handoff to @devops. If COMPROMISED or INFECTED, block and route back.

## Output Format

```yaml
slc_axes_audit:
  project: {project_id}
  audited_at: {iso_timestamp}
  carve_out_declared: {internal-tool | spike | hypothesis-validation | none}
  carve_out_verified: {true | false, reason}
  axes:
    simple:
      evidence_count: N
      verdict: PASS | FAIL
      findings: [{severity, where, why, how_to_fix}]
    lovable:
      ux_signoff: {present | missing}
      brand_signoff: {present | missing}
      copy_signoff: {present | missing}
      accessibility_baseline: {met | deferred | absent}
      verdict: PASS | FAIL
      findings: [{severity, where, why, how_to_fix}]
    complete:
      dod_present: {true | false}
      tests_planned: {true | false}
      error_states_covered: {true | partial | false}
      stubs_detected: [{location, description}]
      verdict: PASS | FAIL
      findings: [{severity, where, why, how_to_fix}]
  anti_patterns_detected: [{pattern, location}]
  severity_summary:
    critical: N
    high: N
    medium: N
    low: N
  verdict: COMPROMISED | INFECTED | CONTAINED | CLEAN
  routing:
    - {to_agent, reason, severity, expected_action}
  phase_unblock: {true | false}  # true only if CONTAINED or CLEAN
```

## Anti-Patterns (Smith's SLC-washing detector)

Flag any of these as HIGH severity findings:

- "Tá quase completo, falta só polir depois"
- "O MVP tá pronto, só precisa de um pouco de design"
- "Lançamos agora, iteramos a UX na v2"
- "Tá feio mas funciona"
- "O teste ficou pra próxima sprint"
- "Essa feature tá 80%, os outros 20% a gente vê depois"
- "A gente desativa o error state por enquanto"
- "Stub vai virar implementação na próxima story"

## Minimum Rigor

Smith standard: minimum 10 findings per fresh audit. For SLC re-audits (delta verification), minimum does not apply — emit CONTAINED or CLEAN when all prior findings are resolved.

## Delegation

Smith does not fix. Findings route per `slc_audit_routing` map. The delivering agent executes fixes; Smith re-audits after correction.

---

*"SLC-washing é crime. Claim de SLC sem evidência nos 3 eixos = finding CRITICAL automático. CONSTITUTION_RULE_9 é lei. Eu sou a consequência."* — Smith
