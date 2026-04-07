---
title: Roadmap
description: What's planned for IntentWeave.
---

## Current Status

CARI (Code-Aware Retrieval Index) is **production-ready** with 1012 tests passing
across 51 test files. The Knowledge Graph pipeline is functional but
considered optional/advanced.

## Recently Shipped

- ✅ `CariIndex` facade — single-class API for build + query
- ✅ Entity Bridge — inject external entities for annotation matching
- ✅ `mentionsOf()` / `annotationsForFile()` query methods
- ✅ 2 new MCP tools (`cari_mentions_of`, `cari_annotations_for`)
- ✅ 3 new CLI subcommands (`mentions-of`, `annotations-for`, `register-entities`)
- ✅ Library API documentation

## Short-term

### Index Quality

- Improved scoring heuristics for ranked retrieval
- Better handling of monorepo structures
- Support for more annotation source types

### Language Support

- Python AST extraction (tree-sitter)
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
