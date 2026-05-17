---
title: Roadmap
description: What's planned for IntentWeave.
---

## Current Status

IntentWeave ships **three composable layers** of code intelligence. Layer 1 (CARI) is
**production-ready** with 1532 tests passing across 80 test files and 16 packages.
Layer 2 (Selective Enrichment) is **shipped** — `iw index enrich` is live. Layer 3 (Intent
Verification) is **shipped** — `iw intent check` runs all three enforcement domains
(structural / behavioral / documentary) at $0 after a one-time LLM rule-extraction step.

## Architecture

```
Layer 3 — Intent Verification          (shipped)
  iw intent check: structural + behavioral + documentary domains
  Insights Book: 15+ chapter HTML deliverable
Layer 2 — Selective Semantic Enrichment (shipped)
  iw index enrich — budget-controlled LLM on CARI-selected targets
Layer 1 — CARI                         (production-ready, $0)
  AST + keywords + git + SQLite → 60+ query modes
```

## Recently Shipped

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

### Performance — Rust Indexer

10–20× speedup for the KWX+COX pipeline stages on large repos (> 1 000 files). Design
analysis and benchmarks complete. Entry criterion met: 47 s / 595 files and 52 s / 1 299
files measured.

### Ecosystem Integrations

Native plugins and exports for Docusaurus, Starlight, and Obsidian.

### Developer Experience

- VS Code extension with inline drift warnings (planned)
- Drift alerts pushed to editor/Slack when `iw index watch` detects doc-breaking changes

## Contributing

Have ideas? See [Contributing](/community/contributing/) or open a
[GitHub Discussion](https://github.com/intentweave/intentweave/discussions).

### Plugin Architecture (11.x)

- ✅ **Plugin system** — `PluginRegistry` with auto-discovery, 3 capability types
  (LLM, persistence, language)
- ✅ **CypherLite** — zero-dependency Cypher→SQL transpiler for SQLite-backed KG queries
- ✅ **plugin-kg-lite** — lightweight KG backend using CypherLite + SQLite (no Neo4j needed)
- ✅ **plugin-kg** — full Neo4j KG backend via `PersistenceCapability`
- ✅ **plugin-swift** / **plugin-python** — tree-sitter Swift and Python language plugins (fully implemented, not just scaffolded)
- ✅ **plugin-llm** — OpenAI-based LLM capability

### Architecture Visualization (5.x / 10.x)

- ✅ **Multi-view community detection** — structural, semantic, temporal modes with live switching
- ✅ **Vertical slice detection** — cross-layer feature slices with interactive highlighting
- ✅ **Hierarchical sub-layering** — recursive splitting with four-strategy fallback
- ✅ **Architecture report** — D3-powered HTML report with Layers, Communities, Dependencies views
- ✅ **Focused architecture view** — Graphviz WASM report centered on a target entity
- ✅ **LLM layer naming** — descriptive layer and directory names via OpenAI
- ✅ Layer inference (`layersInfer`) — topological sort of import DAG
- ✅ Layer check (`layersCheck`) — reverse and skip-layer import violations

### CARI Core (1.x – 9.x)

- ✅ `CariIndex` facade — single-class API for build + query
- ✅ Entity Bridge — inject external entities for annotation matching
- ✅ Python AST extraction via `@intentweave/python-parser` (tree-sitter)
- ✅ Language-agnostic AX dispatch (`LanguageRegistry` + `LanguageAdapter`)
- ✅ Hub analysis, community detection, surprising connections, rationale extraction
- ✅ Terminology inconsistency detection
- ✅ Dependency depth + boundary violation detection
- ✅ Clone detection (exact + structural), unused exports, circular imports
- ✅ Module documentation coverage, orphaned sections, per-doc completeness
- ✅ Cross-group drift detection, TODO/FIXME inventory
- ✅ Test coverage mapping (`testCoverage()` query)
- ✅ 31 MCP tools (6 KG + 25 CARI) for GitHub Copilot
- ✅ Library API (`@intentweave/index` npm package)

### CI & Automation (8.x / 10.x)

- ✅ **Watch mode** — `iw index watch` continuous re-indexing on file changes (debounced, EMFILE-safe)
- ✅ **CI GitHub Action** — `uses: intentweave/doc-health-action@v1` composite action with living score badge, PR comments, and caching
- ✅ **Git hooks** — `iw hook install/uninstall/status` for `post-commit` + `post-checkout` hooks
- ✅ **REST API v1.0.0** — versioned HTTP API (`x-api-version` header), OpenAPI/Swagger UI, bearer auth, 11 endpoint groups

### Selective Semantic Enrichment (11.8)

`iw index enrich` — CARI signals guide targeted LLM extraction, spend tokens only where they matter:

- ✅ **Core engine** — budget-controlled scoring, FX+KX on top-N candidates, KG storage in the same `index.db`
- ✅ **Diagram validation** — LLM reads Mermaid/ASCII diagrams, CARI validates flows against real import graph (`iw index scan-diagrams`, `arch-check --from-scan`)
- ✅ **Decision tracking** — enrichment guided by rationale markers; FX extracts `DECIDED_FOR` triples from ADR files
- ✅ **Contradiction detection** — enrichment targets files flagged by `crossGroupDrift()`; conflicting predicates surfaced as conflicts
- ✅ **Config-to-docs sync** — enrichment on config files guided by low module coverage; value mismatches detected

### Intent Verification (12.x)

`iw intent` — weave the code graph and intent graph together:

- ✅ **Spec-to-code verification** (12.1) — check that each requirement/decision entity has code grounding; reports grounded, partial, and unimplemented
- ✅ **Constraint consistency** (12.2) — `iw intent check --consistency` detects contradictions across spec documents
- ✅ **Living documentation score** (12.3) — `iw intent score` composite 0–100/A–F grade across 4 dimensions (spec coverage, constraint consistency, doc freshness, arch conformance)

## Next Up

### Selective Enrichment — Remaining Use Cases

| Use Case | Status | Notes |
|---|---|---|
| Completion backfill | Planned | Requires *generating* new doc content, not just extracting triples |
| Architecture narrative | Planned | Standalone `iw index narrative` command — LLM prose from layer/community data |

### Language Support

- ✅ Swift AST extraction — `@intentweave/swift-parser` + `@intentweave/plugin-swift` (fully working, tree-sitter)
- ✅ Python AST extraction — `@intentweave/python-parser` + `@intentweave/plugin-python` (fully working, tree-sitter)
- Planned: Go AST extraction (tree-sitter)
- Planned: Rust AST extraction (tree-sitter)
- Planned: Generic keyword-only fallback for unsupported extensions

### Developer Experience

- VS Code extension with inline drift warnings (planned)

### Intent Verification — Remaining

- Drift alerts pushed to editor/Slack when `iw index watch` detects doc-breaking changes (planned)
- Natural-language queries over the combined CARI + KG graph without Neo4j (planned)

## Contributing

Have ideas? See [Contributing](/community/contributing/) or open a
[GitHub Discussion](https://github.com/intentweave/intentweave/discussions).
