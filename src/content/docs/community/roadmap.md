---
title: Roadmap
description: What's planned for IntentWeave.
---

## Current Status

IntentWeave ships **three composable layers** of code intelligence. Layer 1 (CARI) is
**production-ready** with 1375+ tests passing across 70 test files and 18 packages.
Layer 2 (Selective Enrichment) is **shipped** — `iw index enrich` is live. Layer 3 (Intent
Verification) is planned.

## Architecture

```
Layer 3 — Intent Verification          (planned)
  weave spec-to-code, verify invariants
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
- ✅ **plugin-swift** / **plugin-python** — tree-sitter language plugins
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

## Next Up

### Selective Enrichment — Remaining Use Cases

| Use Case | Status | Notes |
|---|---|---|
| Completion backfill | Planned | Requires *generating* new doc content, not just extracting triples |
| Architecture narrative | Planned | Standalone `iw index narrative` command — LLM prose from layer/community data |

### Language Support

- Swift AST extraction (tree-sitter) — plugin scaffolded
- Go AST extraction (tree-sitter)
- Rust AST extraction (tree-sitter)
- Generic fallback for unsupported languages

### Developer Experience

- VS Code extension with inline drift warnings
- Pre-built GitHub Action (`uses: intentweave/check-drift@v1`)

## Long-term — Intent Verification (Layer 3)

The vision: weave specifications to code and verify that implementation matches intent.

- Spec-to-code traceability links
- Invariant checking across spec + code + docs
- Drift alerts when code evolves but specs don't
- Natural-language queries over the combined graph

## Contributing

Have ideas? See [Contributing](/community/contributing/) or open a
[GitHub Discussion](https://github.com/intentweave/intentweave/discussions).
