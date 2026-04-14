---
title: CARI Technical Specification
description: Detailed specification for the Code-Aware Retrieval Index.
---

## Status

**Implemented** — Phases 1–10 complete, 1248 tests passing across 63 test files.

## Design Goals

1. **Zero external cost** — no LLM calls, no paid APIs, no database servers
2. **Single-file output** — one SQLite database, portable and inspectable
3. **Three-signal fusion** — AST structure + document semantics + git temporal data
4. **Gap detection** — disagreements between signals are the most valuable findings
5. **CI-ready** — exit codes, machine-readable formats, fast execution

## Input Layers

### Layer 1: Code (AST)

Tree-sitter parses source files to produce a symbol registry:

- Classes, interfaces, type aliases, enums
- Functions (top-level and methods)
- Exported variables and constants
- Parameter types and return types (where available)

Supported languages: TypeScript, JavaScript, Swift, Python.

### Layer 2: Documents (Keywords)

Markdown documents are scanned for entity mentions:

| Source           | What It Captures              | Depth      |
| ---------------- | ----------------------------- | ---------- |
| Headings (H1-H6) | Section topics                | structured |
| Bold text        | Emphasized entities           | structured |
| Code spans       | Inline code references        | structured |
| Identifiers      | CamelCase / snake_case tokens | structured |
| Body text        | Dictionary-matched terms      | full only  |

### Layer 3: Git (Temporal)

Git log analysis produces:

- **Co-change Jaccard** — P(A∩B) / P(A∪B) for file pairs across commits
- **Recency weighting** — recent co-changes score higher
- **Hotspot detection** — files with high churn
- **Ownership** — most frequent committer per file
- **Staleness** — time since last modification relative to dependent code

## Annotation Engine

The annotator matches document mentions to code symbols:

1. For each keyword mention in a document, search the symbol registry
2. Exact matches get confidence 1.0
3. Partial/fuzzy matches get reduced confidence
4. In full mode, apply IDF penalties to body-text matches

### IDF Filtering (Full Mode)

Terms appearing in > 85% of documents are penalized:

- **Stopword baseline**: ~50 known-noisy terms (e.g., "data", "type", "value")
- **Ceiling**: 0.15 maximum IDF score for baseline terms
- **Exemptions**: Heading, bold, and code-span annotations are never penalized

## Benchmarks

Measured on the IntentWeave monorepo (264 code files, 7 docs, 5316 symbols):

| Metric                 |  Structured |        Full |  Delta |
| ---------------------- | ----------: | ----------: | -----: |
| Build time             |       1.1 s |       2.8 s | +1.7 s |
| Annotations            |       6,721 |      11,533 |   +72% |
| Grounded (code-linked) | 2,548 (38%) | 7,360 (64%) |  +189% |
| Co-occurrence edges    |       1,099 |       2,631 |  +139% |
| IDF terms tracked      |           — |       2,843 |      — |
| Index file size        |       ~2 MB |       ~4 MB |  +100% |

## Implementation Phases

All phases are complete:

| Phase               | Scope                                                                                                         |   Tests |
| ------------------- | ------------------------------------------------------------------------------------------------------------- | ------: |
| 1. Foundation       | Writer, schema, retrieval queries                                                                             |      22 |
| 2. Connections      | Co-occurrence, co-change, gap detection                                                                       |      20 |
| 3. CI Drift         | Check command, severity levels, formats                                                                       |      16 |
| 4. Incremental      | Content-hash updates, corpus report                                                                           |      12 |
| 5. Annotation Depth | Dictionary matching, IDF filtering, stopword baseline                                                         |      22 |
| 6. Code Quality     | Clone detection (exact + structural), circular imports, unused exports, TODO tracking, hotspot prioritization |       — |
| 7. Doc Completeness | Module coverage, orphaned sections, per-doc completeness, cross-group drift, doc-group classification         |       — |
| 8. Graph Topology   | Community detection, hub analysis, surprising connections, rationale extraction, terminology inconsistency     |       — |
| 9. Architecture     | Layer inference, layer check, dependency depth, boundary violations, HTML architecture report, LLM layer naming |       — |
| 10. Advanced Analysis | Focused architecture, interface conformance, dead feature detection, API surface changelog, layer comparison |       — |
| **Total**           |                                                                                                               | **1248** |

## Key Source Files

| File                                              | Purpose                               |
| ------------------------------------------------- | ------------------------------------- |
| `packages/index/src/writer.ts`                    | SQLite index builder                  |
| `packages/index/src/annotator.ts`                 | Mention→symbol matching + IDF         |
| `packages/index/src/idf.ts`                       | IDF scorer + stopword baseline        |
| `packages/index/src/schema.ts`                    | SQLite table definitions              |
| `packages/index/src/queries/retrieve.ts`          | Ranked retrieval                      |
| `packages/index/src/queries/connections.ts`       | Connection discovery                  |
| `packages/index/src/queries/check.ts`             | CI drift detection                    |
| `packages/index/src/queries/report.ts`            | Health dashboard                      |
| `packages/index/src/queries/clones.ts`            | Exact + structural clone detection    |
| `packages/index/src/queries/imports.ts`           | Circular imports + unused exports     |
| `packages/index/src/queries/hotspotPriority.ts`   | High-churn low-doc file ranking       |
| `packages/index/src/queries/todos.ts`             | TODO/FIXME/HACK/XXX inventory         |
| `packages/index/src/queries/moduleCoverage.ts`    | Documentation coverage per directory  |
| `packages/index/src/queries/orphanedSections.ts`  | Doc sections with ungrounded mentions |
| `packages/index/src/queries/docCompleteness.ts`   | Per-doc completeness vs. exports      |
| `packages/index/src/queries/crossGroupDrift.ts`   | Cross-group coverage conflicts        || `packages/index/src/queries/layersInfer.ts`       | Auto-infer architectural layers        |
| `packages/index/src/queries/layersCheck.ts`       | Validate imports against layers        |
| `packages/index/src/queries/layerNaming.ts`       | LLM-generated layer & directory names  |
| `packages/index/src/queries/archReport.ts`        | Architecture report data collector     |
| `packages/index/src/export/htmlReport.ts`         | Standalone HTML architecture renderer  |
| `packages/index/src/export/focusReport.ts`        | Focused Graphviz SVG report            |
| `packages/index/src/queries/focus.ts`             | Focused architecture query             |
| `packages/index/src/queries/interfaceConformance.ts` | Interface conformance drift         |
| `packages/index/src/queries/deadFeatures.ts`      | Dead feature detection (3 signals)     |
| `packages/index/src/queries/layersCompare.ts`     | As-is vs. as-should layer comparison   |
| `packages/cli/src/api-surface/apiSurface.ts`      | API surface changelog (git + AST)      || `packages/index/src/incremental.ts`               | Content-hash updates                  |
| `packages/analyzer/src/kwg/heuristicExtractor.ts` | Keyword extraction                    |
| `packages/analyzer/src/kwg/kwxStage.ts`           | KWX stage options                     |
| `packages/cli/src/commands/indexBuild.ts`         | Build orchestrator                    |
