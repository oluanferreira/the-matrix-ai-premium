# UI/UX Industry Data — Reference Store

**Source:** [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
**License:** MIT
**Absorbed:** 2026-03-29 (ADAPT — dados only, sem CLI/plugin)
**Decision:** Stars infladas (54K/265 watchers = 0.49%), premium scam confirmado (Issue #161), mas dados open-source são valiosos.

## Datasets

| File | Rows | Description | Used By |
|------|------|-------------|---------|
| `colors.csv` | 161 | Full shadcn token palette by product type (18 tokens each) | @ux-design-expert (Phase 6) |
| `typography.csv` | 74 | Font pairings with CSS import + Tailwind config | @ux-design-expert (Phase 6) |
| `ui-reasoning.csv` | 162 | Decision rules: product → pattern + style + color + effects | @ux-design-expert (Phase 6), @architect |
| `styles.csv` | 85 | UI styles with AI prompts, CSS keywords, implementation checklists | @ux-design-expert, @dev |
| `products.csv` | 162 | Router: product type → recommended style/landing/color | @ux-design-expert (Phase 6) |
| `landing.csv` | 35 | Landing page patterns with conversion optimization | @ux-design-expert, @copywriter |
| `ux-guidelines.csv` | 99 | UX do/don't rules (web) | @ux-design-expert, @dev |
| `app-interface.csv` | 30 | Mobile app accessibility rules (React Native/iOS/Android) | @dev |
| `react-performance.csv` | 45 | React/Next.js performance patterns | @dev |
| `charts.csv` | 26 | Chart type selection guide with a11y and library recommendations | @ux-design-expert, @dev |
| `icons.csv` | 105 | Phosphor icons catalog with import code | @dev, @ux-design-expert |
| `stacks/react.csv` | 54 | React best practices | @dev |
| `stacks/nextjs.csv` | 53 | Next.js App Router guidelines | @dev |
| `stacks/shadcn.csv` | 61 | shadcn/ui component guidelines | @dev, @ux-design-expert |

## Skipped Files

| File | Reason |
|------|--------|
| `design.csv` (1775 lines) | Content in Chinese, design style descriptions |
| `draft.csv` (1778 lines) | Backup/reference in Chinese, not used by engine |
| `google-fonts.csv` (1924 lines) | Raw Google Fonts dump, no unique curation |
| `stacks/` (13 other files) | Lower priority frameworks (Flutter, SwiftUI, Laravel, etc.) — can be added later |

## Schema Differences vs Sati's CSVs

Sati's existing `ux/colors.csv` uses 10 columns (domain-based, generic).
This `colors.csv` uses 18 columns (product-type-based, full shadcn token system).

**Do NOT merge directly.** Different schemas serve different purposes:
- Sati's CSVs: design-system-level tokens (generic, reusable)
- These CSVs: industry-specific recommendations (lookup by product type)

Sati references these during Phase 6 (Industry Contextualization) for product-type-specific recommendations.

## How Agents Use This Data

1. **@ux-design-expert** — Phase 6: lookup `products.csv` by product type → get style/color/landing recommendation → cross-reference `ui-reasoning.csv` for decision rules → apply `colors.csv` palette
2. **@dev** — Reference `react-performance.csv`, `ux-guidelines.csv`, `stacks/*.csv` during implementation
3. **@architect** — Reference `ui-reasoning.csv` for technology/pattern decisions
