---
title: Roadmap
description: What's planned for IntentWeave.
---

## Current Status

CARI (Code-Aware Retrieval Index) is **production-ready** with 1174 tests passing
across 58 test files. The Knowledge Graph pipeline is functional but
considered optional/advanced.

## Recently Shipped

- ✅ **Architecture analysis & visualization (5.1a/b/c, 10.1)** — auto-infer layers, validate
  imports, generate interactive HTML report with three views (Layers, Communities, Dependencies),
  directory aggregation, and optional LLM-generated names for layers and directories
- ✅ Layer inference (`layersInfer`) — topological sort of import DAG into architectural tiers
- ✅ Layer check (`layersCheck`) — detect reverse and skip-layer import violations
- ✅ Standalone HTML architecture report (`export --html`) — D3-powered, zero-dependency, shareable
- ✅ LLM layer naming (`cari_layers_name`) — descriptive layer and directory names via OpenAI
- ✅ `CariIndex` facade — single-class API for build + query
- ✅ Entity Bridge — inject external entities for annotation matching
- ✅ `mentionsOf()` / `annotationsForFile()` query methods
- ✅ 2 new MCP tools (`cari_mentions_of`, `cari_annotations_for`)
- ✅ 3 new CLI subcommands (`mentions-of`, `annotations-for`, `register-entities`)
- ✅ Library API documentation
- ✅ Test coverage mapping (`testCoverage()` query)
- ✅ Python AST extraction via `@intentweave/python-parser` (tree-sitter)
- ✅ Language-agnostic AX dispatch (`LanguageRegistry` + `LanguageAdapter`)
- ✅ Hub analysis, community detection, surprising connections, rationale extraction
- ✅ Terminology inconsistency detection
- ✅ Dependency depth + boundary violation detection

## Short-term

### Index Quality

- Improved scoring heuristics for ranked retrieval
- Better handling of monorepo structures
- Support for more annotation source types

### Language Support

- Go AST extraction (tree-sitter)
- Rust AST extraction (tree-sitter)
- Generic fallback for unsupported languages (regex-based symbol detection)

### Developer Experience

- `iw index watch` — continuous re-indexing on file changes
- Richer `report` output with actionable suggestions
- Better error messages and onboarding flow

## Medium-term

### Richer Signals

- ✅ Import/dependency graph integration into connections
- Test coverage correlation (if test framework metadata available)
- PR review history as a co-change signal
- ✅ Comment/TODO tracking
- ✅ Clone detection (exact + structural)
- ✅ Unused export detection
- ✅ Module documentation coverage
- ✅ Orphaned section detection
- ✅ Per-doc completeness scoring
- ✅ Cross-group drift detection
- ✅ Entity Bridge (external entity injection for annotation matching)
- ✅ Hub analysis + community detection + surprising connections
- ✅ Terminology inconsistency detection
- ✅ Dependency depth analysis + boundary violation detection
- ✅ Architectural layer inference + validation
- ✅ Interactive HTML architecture report
- ✅ LLM-powered layer & directory naming

### Editor Integration

- VS Code extension with inline drift warnings
- Hover providers showing CARI context for symbols
- CodeLens for annotation density

### CI Enhancements

- Pre-built GitHub Action (`uses: intentweave/check-drift@v1`)
- Support for GitLab CI, CircleCI templates
- Baseline comparison (track drift trend over time)

## Knowledge Graph

The KG pipeline (LLM extraction → Neo4j) is functional but under evaluation:

- Useful for architecture exploration and decision archaeology
- Cost (LLM API calls) and complexity (Neo4j) limit adoption
- Keeping it as an optional advanced path
- May evolve based on community feedback and use cases

## Contributing

Have ideas? See [Contributing](/community/contributing/) or open a
[GitHub Discussion](https://github.com/intentweave/intentweave/discussions).
