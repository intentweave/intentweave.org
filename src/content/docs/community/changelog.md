---
title: Changelog
description: Release history and notable changes in IntentWeave.
---

import { Aside } from '@astrojs/starlight/components';

This page summarises notable changes and new capabilities by sprint or release.
The backlog spec that drives each change is referenced as §N.N.

---

## v0.13.0 — Dependency Maintenance & Rust Indexer Design

**Released:** 2026-05-17 · [npm](https://www.npmjs.com/package/@intentweave/cli)

Maintenance release bumping all 16 packages to `0.13.0`. Includes a complete **Rust Indexer Port
design analysis** now available in the project BACKLOG, plus toolchain upgrades.

### Added

- **Rust Indexer Port design analysis** — detailed architecture plan for replacing the CARI build
  pipeline with a native Rust binary. Measured bottlenecks: KWG stage = 69% of 47 s total build
  time on a 595-file corpus. The plan targets a 10–20× speedup (47 s → 3–5 s) using `oxc_parser`,
  `pulldown-cmark`, `rayon`, `rusqlite`, and `gix`. The 57 TypeScript query files are unchanged.
  Two implementation phases:
  - **Phase R1** — Rust build binary (`packages/cari-native/`) replacing AX + KWG + TCG stages
  - **Phase R2** — optional NAPI-RS bridge for warm incremental daemon

### Changed

- **TypeScript 5.9** — upgraded from `^5.6.0`
- **Prettier 3.8** — upgraded from `^3.3.0`
- **Turbo 2.9** — upgraded from `^2.8.14`
- **Vitest 2.1.9** — upgraded from `^2.1.0`
- **@types/node** — bumped to `^20.19.41`

---

## v0.12.0 — Intent Engine, Insights Book & Call Graph

**Released:** 2026-05-17 · [npm](https://www.npmjs.com/package/@intentweave/cli)

This is the biggest release since the initial CARI launch. The three-domain **Intent Engine**,
the **Insights Book** multi-chapter deliverable, and the **Call Graph** pipeline ship together
as a cohesive enforcement-to-delivery loop.

### Intent Engine — three-domain enforcement

`iw intent check` now supports `--domain structural | behavioral | documentary | all`.
All three domains run in a single pass; warn-only domains do not fail CI unless promoted
via `.iw/config.yaml`.

**Behavioral domain — Mermaid rules** (Phase 3): express architectural intent as inline or
ADR-sourced Mermaid diagrams directly in `rules.yaml`. CARI validates against the live import
graph at $0 in < 100 ms — no LLM, no DOM parser:

| Diagram type      | Check type         | Confidence | Default mode |
|-------------------|--------------------|------------|--------------|
| `sequenceDiagram` | `must_call`        | 0.70       | warn         |
| `sequenceDiagram` | `must_not_call`    | 0.85       | error        |
| `stateDiagram-v2` | `valid_transition` | 0.50       | warn         |
| `flowchart`       | `must_precede`     | 0.30       | warn         |

**Documentary domain — built-in CARI checks** (Phase 1): four automatic checks run whenever
`--domain documentary` (or `all`) is passed — no `rules.yaml` entry required:

| Rule ID                | Threshold      | Default mode |
|------------------------|----------------|--------------|
| `doc.coverage.low`     | coverage < 50% | warn         |
| `doc.terminology`      | any mismatch   | warn         |
| `doc.orphaned-section` | any orphan     | warn         |
| `doc.completeness.low` | complete < 40% | warn         |

**`.iw/config.yaml`** — override thresholds and promote warn-only domains to CI-blocking.

### Insights Book (`iw index export --book`)

A single self-contained HTML deliverable that answers _"is this project OK?"_ at a glance.
15+ navigable chapters:

| Chapter | Contents |
|---------|----------|
| Executive Summary | Living score badge, violation domain pills, top-3 actions |
| Recommendations | Top-20 cross-domain issues ranked by severity |
| Rules Catalog | Full `rules.yaml` inventory with domain/severity filters |
| Layer Architecture | §17 prescriptive SVG (iframe), rule overlays |
| Documentation & Source | Three-panel explorer: docs, source, evidence |
| Architecture | D3 interactive chart (Layers / Violations / Communities) |
| Code Structure | Dependency depth table with CRITICAL / HIGH indicators |
| Code Health | Exact clones, structural clones, circular imports |
| Violations | Domain-grouped: Structural / Behavioral / Documentary |
| Coverage | Per-layer doc coverage; Layer Sankey SVG when data is available |
| Living Score | 4-dimension breakdown (spec · consistency · freshness · arch) |
| Priority Files | High-churn / low-doc hotspot table |
| Tech Debt | TODO / FIXME / HACK / XXX inventory |
| Test Coverage | Symbol-level coverage % + per-directory breakdown |
| Call Graph | Butterfly trace, entry file selector, depth/mode controls |
| Per-ADR chapters | Cytoscape.js + dagre flow diagrams, CARI overlay, rule panel |

Opens on **Executive Summary** by default. Cross-chapter navigation via domain pills and
"Go to chapter" buttons.

### Call Graph (Phase 4)

Full call-graph pipeline extracted from the AST:

- `iw index calls` — query `symbol_calls` edges by caller file or callee name
- `iw index trace` — BFS call-path tracing from an entry-point file (forward or backward)
- `iw index rule-coverage` — flag packages with zero behavioral rules
- MCP: `cari_calls`, `cari_trace`

### Rule types and modifiers (13.5–13.11, 15.1–15.5)

- `type: variable_assignment` — flag assignments to forbidden variables (13.10)
- `type: cypher` — custom graph queries via CypherLite (13.11)
- `type: property_chain_length` — limit chained property access depth (15.3)
- `--baseline` regression gating — fail CI only on regressions (13.5)
- `import_pattern: "**"` glob across path separators (13.6)
- `symbol_name` scope modifier — restrict to exports / internals / tests (13.9)
- `context_import` modifier — apply only when a specific import is present (15.1)
- `except_symbol` exclusion list (15.2)
- `count_mode: per_file` (15.4)
- Autofix hints in rules output (15.5)
- Import violation line numbers (13.7)

### Signal-layer checks (14.1–14.6)

- `@deprecated` caller detection (`iw index deprecated-callers`)
- `@internal` / `_`-prefixed symbol boundary enforcement
- `as any` and forced type-assertion inventory
- Decorator-derived layer assignment (no manual `layers.yaml` needed for `@Controller` etc.)
- ADR conformance trend over git history
- Test description ↔ symbol alignment

### Other additions

- **Intra-function def-use chains** (§16.1) — already documented below; now ships with
  full taint-propagation support across all signal-layer checks
- **Naming convention checks** (6.1) — `iw index naming-violations`
- **Comment-to-code ratio** (6.4) — `iw index comment-code-ratio`
- **Cross-layer clone analysis** (5.9)
- **58 MCP tools** total (up from 35)

### Fixed

- Spurious change reports in watch / incremental update cycles (mtime vs. content hash)
- Hub analysis crash on projects with null import data
- `rules-check` JSON output incorrectly redirected when combined with `--output`

---

## §16 — Intra-Function Analysis

### §16.1 — Def-Use Chains & Taint Propagation

**Status:** ✅ Released

Adds intra-function def-use tracking so semantic rules can catch violations that
escape through local variable assignments.

**What changed:**

- **AST extractor** now records `def_use_chains` — local variable declarations
  inside function bodies whose initializers are member-expression, call, or
  await-expression nodes.
- **New SQLite table** `def_use_chains` (schema v13) indexes the extracted chains
  by file, function name, and variable name.
- **`taint_propagation` flag** added to `property_access` and `call` forbidden
  clauses in `rules.yaml`. When `true`, the rule engine follows intra-function
  def-use edges to find secondary usages of tainted values.
- **Schema version** bumped from 12 → 13. Re-run `iw index build` to migrate.

**Example:**

```yaml
- id: no-internal-field-access-in-ui
  severity: high
  forbidden:
    - type: property_access
      chain: "**.resource.path"
      in: "apps/ui/src/**"
      taint_propagation: true
```

Without `taint_propagation`, only the direct access `item.resource.path` is
flagged. With it, any local variable that is assigned from `item.resource.path`
and subsequently used in a call or property access in the same function is also
reported — with a `(taint: path ← item.resource.path)` annotation in the output.

**Scope:** Intra-function only. Taint does not follow values across function
boundaries or module exports.

**Docs:** [Semantic Rule Checking — `taint_propagation`](/docs/cari/semantic-rules/#taint_propagation----track-values-through-variable-assignments) ·
[CARI Internals — Def-Use Extraction](/docs/cari/internals/#def_use_chains)

---

## §17–§18 — Prescriptive Architecture & Insights Book

### §17.2a — Prescriptive Diagram from `rules.yaml`

**Status:** ✅ Released

`iw index export --html` now embeds a **§17 Prescriptive Architecture SVG** alongside the
interactive D3 graph. The SVG renders declared layers top-down with green allowed-flow
arrows and red forbidden-flow arrows, with rule chips inside each layer band. Hover
a chip or edge for rule details; click to show a flow mini-diagram.

### §17.2b — Allowed Flows in `rules.yaml`

**Status:** ✅ Released

The top-level `allowed:` block in `rules.yaml` declares explicit sanctioned
layer-to-layer flows. These power the green arrows in the prescriptive SVG and
appear as conformance rows in `iw index rules-check` ASCII output.

### §17.3 — `rules-extract --with-allowed`

**Status:** ✅ Released

`iw index rules-extract` now accepts `--with-allowed` to extract explicit `allowed:`
permission entries from ADR prose in addition to forbidden rules. Also supports
`--with-layer-hints` to extract architectural layer hints into a separate YAML file.

### §18 — Insights Book

**Status:** ✅ Released

`iw index export --book` produces a **self-contained multi-chapter HTML report** with:

| Chapter | Contents |
|---------|----------|
| Layer Architecture | §17 prescriptive SVG embedded in an iframe |
| Control & Data Flow | Rule overview table with per-rule interactive flow diagrams (Cytoscape.js) |
| Arch Graph | §10.1 D3 interactive architecture graph (when available) |
| Per-ADR chapters | Cytoscape.js dagre flow diagram + CARI overlay toggles (churn, hub, community, imports) |
| All Violations | Severity-sorted violation table with ADR back-links |
| Coverage | Per-layer doc coverage % + hotspot files |
| Living Score | §12.3 composite living documentation score (A–F) |
| Code Health | Clones, circular imports, unused exports, boundary violations |
| Hotspots | High-churn files, deep dependency chains, hub entities, code communities |
| Documentation | Orphaned sections, doc completeness, rationale inventory, terminology |

---

## §16.1 Upgrade Guide

If you have an existing `.iw/index.db` at schema version 12, re-run the index build:

```bash
iw index build
```

The writer will detect the version mismatch and recreate the schema. Alternatively,
delete `.iw/index.db` and rebuild from scratch. No configuration changes are required
unless you want to enable `taint_propagation` in your rules.

---

## Earlier Changes

Older sprint history is tracked in the internal backlog at `docs/BACKLOG.md` in the
monorepo and will be progressively migrated here.
