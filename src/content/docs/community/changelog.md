---
title: Changelog
description: Release history and notable changes in IntentWeave.
---

import { Aside } from '@astrojs/starlight/components';

This page summarises notable changes and new capabilities by sprint or release.
The backlog spec that drives each change is referenced as §N.N.

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
- id: no-source-path-in-ui
  severity: high
  forbidden:
    - type: property_access
      chain: "**.source.path"
      in: "apps/ui/src/**"
      taint_propagation: true
```

Without `taint_propagation`, only the direct access `entity.source.path` is
flagged. With it, any local variable that is assigned from `entity.source.path`
and subsequently used in a call or property access in the same function is also
reported — with a `(taint: path ← entity.source.path)` annotation in the output.

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
