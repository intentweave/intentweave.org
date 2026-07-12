---
title: Roadmap
description: What's planned for IntentWeave.
---

## Current Status

IntentWeave ships **three composable layers** of code intelligence. Layer 1 (CARI) is
**production-ready** with 1532 tests passing across 80 test files and 16 packages.
Layer 2 (Selective Enrichment) is **partially available** — the `cari_enrich` MCP tool
scores files for enrichment candidacy today (dry-run only; full LLM extraction isn't
yet wired up to a CLI command). Layer 3 (Intent
Verification) is **shipped** — `iw intent check` runs all three enforcement domains
(structural / behavioral / documentary) at $0 after a one-time LLM rule-extraction step.

## Architecture

```
Layer 3 — Intent Verification          (shipped)
  iw intent check: structural + behavioral + documentary domains
  Insights Book: 15+ chapter HTML deliverable
Layer 2 — Selective Semantic Enrichment (partially available)
  cari_enrich MCP tool — dry-run scoring of CARI-selected targets
Layer 1 — CARI                         (production-ready, $0)
  AST + keywords + git + SQLite → 60+ query modes
```

## Recently Shipped

### Dependency Maintenance & Rust Indexer Design (v0.13.0)

- ✅ **Rust Indexer Port design analysis** — full architecture plan for `packages/cari-native/`
  Rust binary. Benchmarked: KWG = 69% of 47 s build on 595 files. Phase R1 targets 10–20×
  speedup (47 s → 3–5 s). Phase R2: NAPI-RS warm incremental daemon.
  Library choices finalised: `oxc_parser`, `pulldown-cmark`, `rayon`, `rusqlite`, `gix`.
- ✅ **TypeScript 5.9** — upgraded from ^5.6.0
- ✅ **Prettier 3.8**, **Turbo 2.9**, **Vitest 2.1.9** — toolchain upgrades
- ✅ All 16 packages at `0.13.0`

### Intent Engine — Three-Domain Enforcement (v0.12.0)

- ✅ **`iw intent check --domain structural/behavioral/documentary/all`** — single-pass
  enforcement across all three domains
- ✅ **Behavioral domain** — Mermaid-based rules in `rules.yaml`: `sequenceDiagram`,
  `stateDiagram-v2`, `flowchart`. Zero-dep custom parser, $0 enforcement
- ✅ **Documentary domain** — four built-in CARI-backed checks (`doc.coverage.low`,
  `doc.terminology`, `doc.orphaned-section`, `doc.completeness.low`) with no configuration
  required
- ✅ **`.iw/config.yaml`** — per-domain CI thresholds; promote warn → error per domain

### Insights Book — 15+ Chapter HTML Deliverable (v0.12.0)

- ✅ **`iw index export --book`** — self-contained HTML with Executive Summary, Recommendations,
  Rules Catalog, Layer Architecture, Documentation & Source, Architecture (D3), Code Structure,
  Code Health, Violations, Coverage, Living Score, Priority Files, Tech Debt, Test Coverage,
  Call Graph, per-ADR Cytoscape.js chapters
- ✅ **Layer Sankey SVG** — two-column bezier flow visualization in Coverage chapter
- ✅ **Cross-chapter navigation** — domain pills and "Go to chapter" buttons

### Call Graph (v0.12.0)

- ✅ **`symbol_calls` / `property_accesses`** — full call-graph extraction from AST
- ✅ **`iw index calls`** — query call edges by caller file or callee name
- ✅ **`iw index trace`** — BFS call-path tracing (forward and backward)
- ✅ **`iw index rule-coverage`** — flag packages with zero behavioral rules
- ✅ **`cari_calls` / `cari_trace` MCP tools**

### Rule System Expansion (v0.12.0)

- ✅ `type: variable_assignment`, `type: cypher`, `type: property_chain_length`
- ✅ `--baseline` regression gating (13.5), `import_pattern: "**"` (13.6)
- ✅ `symbol_name` scope modifier, `context_import`, `except_symbol`, `count_mode: per_file`
- ✅ Import violation line numbers

### Signal-Layer Checks (v0.12.0)

- ✅ `@deprecated` caller detection, `@internal` / `_` enforcement
- ✅ `as any` inventory, naming conventions, comment-to-code ratio
- ✅ Decorator-derived layer assignment, ADR conformance trend, test description alignment

### Prescriptive Architecture (§17, v0.11.0)

- ✅ `allowed:` entries in `rules.yaml` with edge-level rationale
- ✅ Layer geometry rendering for SVG layout
- ✅ Rule-expressed element overlay with violation heat-map
- ✅ ASCII conformance diagram in `iw intent check` output
- ✅ LLM-assisted spec synthesis from ADR prose

### Plugin Architecture (v0.9.0)

- ✅ **Plugin system** — `PluginRegistry` with auto-discovery, 3 capability types
  (LLM, persistence, language)
- ✅ **CypherLite** — zero-dependency Cypher→SQL transpiler for SQLite-backed KG queries
- ✅ **plugin-kg-lite** — lightweight KG backend using CypherLite + SQLite (no Neo4j needed)
- ✅ **plugin-kg** — full Neo4j KG backend via `PersistenceCapability`
- ✅ **plugin-swift** / **plugin-python** — tree-sitter Swift and Python language plugins
- ✅ **plugin-llm** — OpenAI-based LLM capability

### Architecture Visualization (5.x / 10.x)

- ✅ Multi-view community detection — structural, semantic, temporal modes
- ✅ Vertical slice detection and hierarchical sub-layering
- ✅ Architecture report — D3-powered HTML with Layers, Communities, Dependencies views
- ✅ Focused architecture view — Graphviz WASM report centered on a target entity
- ✅ LLM layer naming — descriptive layer and directory names via OpenAI
- ✅ Layer inference + layer check (5.1a/b)

### CARI Core

- ✅ 60+ query modes: retrieve, connections, check, report, clones, structural clones,
  circular imports, unused exports, hotspot priority, TODOs, module coverage, orphaned
  sections, doc completeness, cross-group drift, mentions, annotations, test coverage,
  hubs, communities, surprises, rationale, terminology, dep depth, boundary violations,
  layers, focus, arch-check, living score, calls, trace, rule coverage, and more
- ✅ 58 MCP tools (6 KG + 52 CARI/intent) for GitHub Copilot
- ✅ `CariIndex` facade, Entity Bridge, Library API

### CI & Automation

- ✅ Watch mode — `iw index watch` continuous re-indexing on file changes
- ✅ CI GitHub Action — `uses: intentweave/doc-health-action@v1`
- ✅ Git hooks — `iw hook install/uninstall/status`
- ✅ REST API v1.0.0 with OpenAPI/Swagger UI

## Next Up

### Language Support

- ✅ Swift AST extraction — `@intentweave/swift-parser` + `@intentweave/plugin-swift`
- ✅ Python AST extraction — `@intentweave/python-parser` + `@intentweave/plugin-python`
- Planned: Go AST extraction (tree-sitter)
- Planned: Rust AST extraction (tree-sitter)
- Planned: Generic keyword-only fallback for unsupported extensions

### Selective Enrichment — Remaining Use Cases

| Use Case | Status | Notes |
|---|---|---|
| Completion backfill | Planned | Requires *generating* new doc content, not just extracting triples |
| Architecture narrative | Planned | `iw index narrative` — LLM prose from layer/community data |

### Semantic Clone Detection (Type 3)

LLM-powered similarity scoring to catch behaviourally equivalent but structurally different
snippets. Depends on enrichment pipeline.

### Decision Lifecycle Tracking

Track ADRs through state changes (proposed → accepted → deprecated) and detect
unimplemented decisions.

### Performance — Rust Indexer (Phase R1)

Replace the CARI build pipeline (AX + KWG stages) with a native Rust binary that writes
the same SQLite schema. The 57 TypeScript query files are unchanged.

**Design complete (v0.13.0):** benchmarks measured, library choices finalised, schema
compatibility contract defined.

| Phase | Scope | Target speedup |
|-------|-------|----------------|
| **R1-a/b** | KWG: Markdown + co-occurrence | **8–15× KWG** (32 s → 2–4 s) |
| **R1-c** | AX: `oxc_parser` + tree-sitter | **10–20× AX** (11 s → 0.5–1 s) |
| **R1-d** | TCG: `gix` crate | 1–2× (low priority) |
| **R1-f** | CLI shim + `cargo-dist` packaging | — |
| **R1 total** | Full build binary | **10–20× (47 s → 3–5 s)** |

Phase R2: NAPI-RS bridge for warm incremental daemon (optional, later).

### Ecosystem Integrations

Native plugins and exports for Docusaurus, Starlight, and Obsidian.

### Developer Experience

- VS Code extension with inline drift warnings (planned)
- Drift alerts pushed to editor/Slack when `iw index watch` detects doc-breaking changes

## Contributing

Have ideas? See [Contributing](/community/contributing/) or open a
[GitHub Discussion](https://github.com/intentweave/intentweave/discussions).

