---
title: CARI Overview
description: What is the Code-Aware Retrieval Index and why does it exist?
---

## What Is CARI?

**CARI** (Code-Aware Retrieval Index) is a lightweight, pre-computed index that connects your
code, documentation, and git history into a single queryable database.

- **Zero cost** — no LLM calls, no external services, no API keys
- **Single file** — everything lives in `.iw/index.db` (SQLite)
- **Fast** — builds in seconds, queries in milliseconds
- **Deterministic** — same input always produces the same output

## Why Not Just grep?

`grep` finds strings. CARI finds **relationships**:

| What you need                      | grep            | CARI                                               |
| ---------------------------------- | --------------- | -------------------------------------------------- |
| "Which files mention auth?"        | ✅ String match | ✅ Ranked by relevance                             |
| "What's connected to AuthService?" | ❌              | ✅ Doc co-mentions + git co-changes + code imports |
| "What docs are stale?"             | ❌              | ✅ Cross-references changed code to doc mentions   |
| "What's undocumented?"             | ❌              | ✅ Exported symbols with no doc coverage           |
| "Find duplicate code"              | ❌              | ✅ Exact + structural clone detection              |
| "Show circular imports"            | ❌              | ✅ Import cycle detection                          |
| "What TODOs exist?"                | ❌              | ✅ TODO/FIXME/HACK/XXX inventory                   |

## Why SQLite?

- Uses Node.js built-in `node:sqlite` (Node 22.15+) — no native compilation, no server process
- The entire index is one portable file (2–4 MB for typical projects)
- Queries are pre-written SQL views — no query language to learn
- Works offline, in CI, in Docker, anywhere Node runs

## Three Independent Signals

CARI's power comes from combining **three layers** that most tools treat separately:

### 1. Code Structure (AST)

Tree-sitter parses your source files to extract classes, functions, interfaces, exports.
This creates a **symbol registry** — the ground truth for "what exists in the code."

### 2. Document Semantics (Keywords)

Headings, bold text, code spans, and (optionally) body text are scanned for entity mentions.
Each mention is linked to a code symbol when possible, creating **annotations**.

### 3. Git History (Temporal)

`git log` analysis is run by the **TCG** stage during `iw index build`. It computes:

- **Co-change** — which file pairs change together across commits (Jaccard similarity, stored in `co_changes`)
- **Hotspot** — files with high churn frequency (drives `hotspotPriority`)
- **Staleness** — how recently each file was updated (surfaced in `iw index report`)
- **Ownership** — primary committer per file

These signals are stored in the `files` and `co_changes` tables and used by queries like
`hotspotPriority`, `connections`, and `retrieve` to weight results by temporal relevance.

### The Insight Is in the Gaps

When all three signals agree, you have a well-documented, well-structured codebase.
When they **disagree**, that's where the interesting findings are:

- **Co-mentioned in docs but no code dependency** → hidden coupling
- **Co-changed in git but not documented together** → missing documentation
- **Exported symbol with no doc mention** → undocumented public API

## Architecture

```
packages/
  index/        → @intentweave/index — the CARI engine
  analyzer/     → @intentweave/analyzer — pipeline stages (AX, KWX, COX, TCG)
  ast-extractor/→ @intentweave/ast-extractor — tree-sitter TS/JS extraction
  python-parser/→ @intentweave/python-parser — tree-sitter Python extraction
  cli/          → @intentweave/cli — `iw index` commands + MCP tools
```

## Next Steps

- [Build the Index](/docs/cari/build/) — run your first build
- [Retrieve](/docs/cari/retrieve/) — ranked file search
- [Connections & Gaps](/docs/cari/connections/) — cross-layer discovery

## All Query Modes

CARI provides 27 built-in query modes — all available via CLI (`iw index <command>`),
MCP tools (`cari_*`), and the `@intentweave/index` programmatic API:

| Query              | Purpose                                            |
| ------------------ | -------------------------------------------------- |
| `retrieve`         | Ranked file retrieval by topic or symbol           |
| `connections`      | Cross-layer connections + gap detection            |
| `check`            | CI drift detection for changed files               |
| `report`           | Corpus-wide health dashboard                       |
| `clones`           | Exact clone detection (identical body hash)        |
| `structuralClones` | Type 2 clones (same control flow, different names) |
| `circularImports`  | Import cycle detection                             |
| `unusedExports`    | Exported symbols never imported                    |
| `hotspotPriority`  | High-churn low-doc files ranked by urgency         |
| `todos`            | TODO/FIXME/HACK/XXX inventory                      |
| `moduleCoverage`   | Documentation coverage % per directory             |
| `orphanedSections` | Doc sections with all-ungrounded mentions          |
| `docCompleteness`  | Per-doc completeness vs. referenced exports        |
| `crossGroupDrift`  | Cross-group entity coverage conflicts              |
| `mentionsOf`       | Entity → doc mentions                              |
| `annotationsFor`   | File → all annotations                             |
| `testCoverage`     | Test→source mapping + untested exports             |
| `hubs`             | God-node / hub analysis (degree centrality)        |
| `communities`      | Community detection (structural / semantic / temporal)  |
| `surprises`        | Surprising connection ranking (composite score)    |
| `rationale`        | WHY/NOTE/IMPORTANT/DESIGN rationale inventory      |
| `terminology`      | Terminology inconsistency detection                |
| `dependencyDepth`  | Transitive import depth + fan-in/fan-out risk      |
| `boundaryViolations` | Cross-package internal import detection          |
| `layersInfer`      | Auto-infer architectural layers from import graph  |
| `layersCheck`      | Validate imports against layer boundaries          |
| `export --html`    | Interactive HTML architecture report               |
