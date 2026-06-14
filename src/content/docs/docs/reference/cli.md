---
title: CLI Reference
description: Complete reference for all iw commands.
---

## Installation

```bash
npm install -g @intentweave/cli
iw --version
```

Or with npx:

```bash
npx @intentweave/cli <command>
```

---

## CARI Commands (no LLM, no Neo4j)

### `iw init`

Initialize an IntentWeave workspace.

```bash
iw init [directory]
```

Creates a `.iw/` directory with config, cache, and index storage.

### `iw index build`

Build the CARI index.

```bash
iw index build [options]
```

| Option              | Default      | Description                                    |
| ------------------- | ------------ | ---------------------------------------------- |
| `--depth <mode>`    | `structured` | `structured` or `full` (body text + IDF)       |
| `--include <glob>`  | —            | Only index matching files                      |
| `--exclude <glob>`  | —            | Skip matching files                            |
| `-v, --verbose`     | off          | Show per-stage progress                        |

### `iw index retrieve`

Ranked file retrieval.

```bash
iw index retrieve <query> [options]
```

| Option           | Default | Description               |
| ---------------- | ------- | ------------------------- |
| `--limit <n>`    | `10`    | Maximum results           |
| `--scope <type>` | `all`   | `code`, `docs`, or `all`  |

### `iw index connections`

Cross-layer connection discovery.

```bash
iw index connections <entity> [options]
```

| Option             | Default | Description                              |
| ------------------ | ------- | ---------------------------------------- |
| `--limit <n>`      | `15`    | Maximum connections                      |
| `--include <type>` | all     | `doc_cooc`, `co_change`, `code_import`   |

### `iw index check`

CI drift detection.

```bash
iw index check [options]
```

| Option                | Default   | Description                        |
| --------------------- | --------- | ---------------------------------- |
| `--changed <files...>`| —         | Changed files                      |
| `--severity <level>`  | `info`    | `info`, `warning`, `critical`      |
| `-f, --format`        | `text`    | `text`, `json`, `github`           |

### `iw index report`

Corpus-wide health dashboard.

```bash
iw index report
```

### `iw index update`

Incremental index update.

```bash
iw index update [-v]
```

### CARI Analysis Subcommands

All analysis queries are available as `iw index` subcommands:

| Command                        | Purpose                                                  |
| ------------------------------ | -------------------------------------------------------- |
| `iw index clones`              | Exact clone detection (identical body hash)               |
| `iw index structural-clones`   | Type 2 clones (same control flow, different identifiers)  |
| `iw index circular-imports`    | Import cycle detection                                    |
| `iw index unused-exports`      | Exported symbols never imported                           |
| `iw index hotspot-priority`    | High-churn low-doc files ranked by urgency                |
| `iw index todos`               | TODO/FIXME/HACK/XXX inventory                             |
| `iw index module-coverage`     | Documentation coverage % per directory                    |
| `iw index orphaned-sections`   | Doc sections with all-ungrounded mentions                 |
| `iw index doc-completeness`    | Per-doc completeness vs. referenced exports               |
| `iw index cross-group-drift`   | Cross-group entity coverage conflicts                     |
| `iw index mentions-of <id>`    | Find doc mentions of a code or external entity            |
| `iw index annotations-for <path>` | List all annotations for a documentation file          |
| `iw index register-entities <file>` | Register external entities from JSON file            |
| `iw index test-coverage`      | Map test files to source files, find untested exports     |
| `iw index hubs`               | God-node / hub analysis (degree centrality)               |
| `iw index communities`        | Community detection (structural / semantic / temporal)    |
| `iw index surprises`          | Surprising connection ranking (composite score)           |
| `iw index rationale`          | WHY/NOTE/IMPORTANT/DESIGN rationale inventory             |
| `iw index terminology`        | Terminology inconsistency detection                       |
| `iw index dep-depth`          | Transitive import depth + fan-in/fan-out risk             |
| `iw index boundary-violations`| Cross-package internal import detection                   |
| `iw index layers-infer`       | Auto-infer architectural layers from import graph         |
| `iw index layers-check`       | Validate imports against layer boundaries                 |
| `iw index layers-check --compare` | As-is vs. as-should layer comparison                   |
| `iw index conformance`        | Interface conformance drift detection                     |
| `iw index dead-features`      | Dead feature detection (unused + undocumented + stale)    |
| `iw index api-surface`        | API surface changelog (additions, removals, sig changes)  |
| `iw index focus <target>`     | Focused architecture view around a target entity          |
| `iw index calls`              | Query the call graph (all edges)                          |
| `iw index calls --caller-file`| Calls from a specific file                                |
| `iw index calls --callee-name`| All callers of a function                                 |
| `iw index trace --entry`      | BFS call-path trace from entry-point file                 |
| `iw index rule-coverage`      | Packages with zero behavioral rules                       |
| `iw index export --book`      | Insights Book (15+ chapters, primary deliverable)         |
| `iw index export --html`      | §10.1 interactive standalone HTML architecture report     |
| `iw index export --focus <t>` | Focused Graphviz SVG architecture report                  |
| `iw intent check`             | Check all intent domains (structural/behavioral/documentary)|
| `iw intent check --domain`    | Target one domain: `structural`, `behavioral`, `documentary`, `all` |
| `iw intent check --baseline`  | Regression gating: fail only if violations increased      |
| `iw intent extract`           | Extract rules from an ADR via LLM                         |
| `iw intent living`            | Living documentation health (documentary domain)          |
| `iw intent score`             | Composite living documentation score (A–F, 4 dimensions)  |

All subcommands support `--db <path>` and `-f, --format <text|json>`.
Some also accept `-n, --limit` or `--kind`.

These queries are also available as MCP tools (e.g., `cari_clones`) and via the
`@intentweave/index` programmatic API.

### `iw index layers-infer`

Auto-infer architectural layers from your import graph topology.

```bash
iw index layers-infer [options]
```

| Option           | Default        | Description                    |
| ---------------- | -------------- | ------------------------------ |
| `--db <path>`    | `.iw/index.db` | Path to CARI index             |
| `-f, --format`   | `text`         | `text` or `json`               |

Uses topological sort of the import DAG to assign depth ranks, then buckets files
into layers (foundation at 0, entry points at the top). Outputs layer definitions
with file assignments.

### `iw index layers-check`

Validate all imports against inferred or configured layer boundaries.

```bash
iw index layers-check [options]
```

| Option                  | Default        | Description                              |
| ----------------------- | -------------- | ---------------------------------------- |
| `--db <path>`           | `.iw/index.db` | Path to CARI index                       |
| `--allow-skip-layer`    | off            | Don't flag skip-layer imports            |
| `--compare`             | off            | Show as-is vs. as-should delta view      |
| `-f, --format`          | `text`         | `text` or `json`                         |

Detects:
- **Reverse imports** — lower layer importing from higher layer
- **Skip-layer imports** — layer N importing from layer N+2 (skipping N+1)

Each violation includes source file, target file, source layer, target layer,
and a human-readable reason.

### `iw index export --html`

Generate a standalone interactive HTML architecture report.

```bash
iw index export --html [options]
```

| Option                | Default              | Description                               |
| --------------------- | -------------------- | ----------------------------------------- |
| `-o, --output <path>` | `architecture.html`  | Output file path                          |
| `--db <path>`         | `.iw/index.db`       | Path to CARI index                        |
| `-m, --mode <mode>`   | `structural`         | Community mode: structural, semantic, temporal |
| `--provider <name>`   | —                    | LLM provider for layer naming (`openai`)  |
| `--model <name>`      | `gpt-4o-mini`        | Model for LLM naming                      |
| `--api-key <key>`     | `$OPENAI_API_KEY`    | OpenAI API key (if not env var)           |

The report combines data from layers, communities, dependencies, and boundary
violations into three interactive views:

- **Layers** — tiered layout with import edges (violations in red)
- **Communities** — force-directed layout coloured by community, with switchable modes
  (structural, semantic, temporal) and vertical slice highlighting
- **Dependencies** — root-focused tree for any selected file

Features: directory aggregation, zoom/pan, edge filtering, search,
hover tooltips with per-file metrics, and optional LLM-generated names
for layers and directories.

### `iw index conformance`

Detect interface conformance drift — when a class claims to implement an interface
but method signatures have diverged.

```bash
iw index conformance [options]
```

| Option           | Default        | Description                    |
| ---------------- | -------------- | ------------------------------ |
| `--db <path>`    | `.iw/index.db` | Path to CARI index             |
| `-f, --format`   | `text`         | `text` or `json`               |

Reports: missing methods, missing properties, and signature mismatches.

### `iw index dead-features`

Combine three signals to surface likely dead features.

```bash
iw index dead-features [options]
```

| Option                  | Default        | Description                              |
| ----------------------- | -------------- | ---------------------------------------- |
| `--db <path>`           | `.iw/index.db` | Path to CARI index                       |
| `--min-signals <n>`     | `2`            | Minimum signals to report (1–3)          |
| `--staleness <months>`  | `6`            | Months since last modification           |
| `-n, --limit <n>`       | `100`          | Maximum results                          |
| `-f, --format`          | `text`         | `text` or `json`                         |

Signals: (a) unused export, (b) undocumented symbol, (c) stale file (no commits in N months).

### `iw index api-surface`

Track exported symbols over time via git history. Detects additions, removals,
and signature changes per release.

```bash
iw index api-surface [options]
```

| Option               | Default        | Description                              |
| -------------------- | -------------- | ---------------------------------------- |
| `--db <path>`        | `.iw/index.db` | Path to CARI index                       |
| `--baseline <ref>`   | latest git tag | Git ref to compare against               |
| `-f, --format`       | `text`         | `text` or `json`                         |

Example output: _"+40 added, −14 removed, ~1 signature changed across 28 files"_.

### `iw index focus`

Focused architecture view around a target file or symbol.

```bash
iw index focus <target> [options]
```

| Option               | Default        | Description                              |
| -------------------- | -------------- | ---------------------------------------- |
| `--db <path>`        | `.iw/index.db` | Path to CARI index                       |
| `--hops <n>`         | `2`            | Expansion depth from target              |
| `--max-nodes <n>`    | `20`           | Maximum nodes in the view                |
| `-f, --format`       | `text`         | `text` or `json`                         |

### `iw index export --focus`

Generate a focused Graphviz SVG architecture report.

```bash
iw index export --focus <target> [options]
```

| Option               | Default              | Description                              |
| -------------------- | -------------------- | ---------------------------------------- |
| `--hops <n>`         | `2`                  | Expansion depth                          |
| `--max-nodes <n>`    | `20`                 | Maximum nodes                            |
| `-o, --output`       | `focus.html`         | Output file path                         |

---

## Knowledge Graph Commands (require Neo4j)

KG queries are available via the MCP server (`iw mcp`) using GitHub Copilot tools
(`kg_query`, `kg_context`, `kg_entities`, `kg_impact`, `kg_doc_health`, `kg_schema`).
Set `NEO4J_URI`, `NEO4J_USER`, and `NEO4J_PASSWORD` environment variables before
starting the MCP server.

### `iw intent living`

Documentation freshness analysis. Three modes (least → most infrastructure):

1. `--lite` — Zero-infra keyword scan (no index needed)
2. _(default)_ — CARI-backed analysis from `.iw/index.db` (no Neo4j)
3. `--neo4j` — Full KG-based analysis (requires Neo4j + persisted KWG)

```bash
iw intent living [files...] [options]
```

| Option           | Default        | Description                                   |
| ---------------- | -------------- | --------------------------------------------- |
| `--db <path>`    | `.iw/index.db` | Path to CARI index (default mode)             |
| `--neo4j`        | off            | Full KG mode — requires Neo4j                 |
| `-s, --session`  | —              | Session ID (required for `--neo4j` only)      |
| `--only`         | all            | Specific detectors: doc-code,temporal,deps,doc-doc |
| `--lite`         | off            | Lightweight keyword-only mode                 |
| `-f, --format`   | `markdown`     | Output format: markdown \| json               |
| `-o, --output`   | —              | Write to file                                 |
| `-v, --verbose`  | off            | Show progress                                 |

### `iw persist`

> **Removed.** Persisting to Neo4j via CLI is no longer supported. Use the
> `kg_*` MCP tools from GitHub Copilot to query an existing Neo4j instance.

### `iw xlink`

> **Removed.** Cross-layer code linking is now handled automatically during
> `iw index build`.

### `iw mcp`

Start MCP server for GitHub Copilot.

```bash
iw mcp [options]
```

| Option           | Default | Description             |
| ---------------- | ------- | ----------------------- |
| `-s, --session`  | —       | Default session         |
| `-v, --verbose`  | off     | Log invocations         |

---

## Environment Variables

| Variable           | Default                 | Description                           |
| ------------------ | ----------------------- | ------------------------------------- |
| `NEO4J_URI`        | `bolt://localhost:7687` | Neo4j URI                             |
| `NEO4J_USERNAME`   | `neo4j`                 | Neo4j user                            |
| `NEO4J_PASSWORD`   | _(required for KG)_     | Neo4j password                        |
| `NEO4J_DATABASE`   | `neo4j`                 | Neo4j database                        |
| `IW_SESSION`       | `default`               | Default session ID                    |
| `OPENAI_API_KEY`   | _(optional)_            | For `--provider openai` + NL queries  |
| `IW_LLM_MODEL`    | `gpt-4o-mini`           | LLM model                             |
