---
title: Roadmap
description: What's planned for IntentWeave.
---

## Current Status

IntentWeave ships **three composable layers** of code intelligence. Layer 1 (CARI) is
**production-ready** with 1375+ tests passing across 70 test files and 18 packages.
Layer 2 (Selective Enrichment) is **shipped** — `iw index enrich` is live. Layer 3 (Intent
Verification) core is **shipped** — `iw verify` with spec-to-code, constraint consistency,
and living documentation score.

## Architecture

```
Layer 3 — Intent Verification          (core shipped)
  iw verify: spec-to-code, constraint consistency, living doc score
Layer 2 — Selective Semantic Enrichment (shipped)
  iw index enrich — budget-controlled LLM on CARI-selected targets
Layer 1 — CARI                         (production-ready, $0)
  AST + keywords + git + SQLite → 30+ query modes
```

## Recently Shipped

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

`iw verify` — weave the code graph and intent graph together:

- ✅ **Spec-to-code verification** (12.1) — check that each requirement/decision entity has code grounding; reports grounded, partial, and unimplemented
- ✅ **Constraint consistency** (12.2) — `iw verify --consistency` detects contradictions across spec documents
- ✅ **Living documentation score** (12.3) — `iw verify --score` composite 0–100/A–F grade across 4 dimensions (spec coverage, constraint consistency, doc freshness, arch conformance)

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
