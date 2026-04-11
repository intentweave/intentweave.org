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
| `iw index export --html`      | Interactive standalone HTML architecture report           |

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

---

## Knowledge Graph Commands (require Neo4j)

### `iw run`

Extract knowledge from documents.

```bash
iw run [files...] [options]
```

| Option                | Default      | Description                          |
| --------------------- | ------------ | ------------------------------------ |
| `-t, --track <track>` | `main`       | `main`, `open`, `both`               |
| `--provider <name>`   | `smart-mock` | `smart-mock`, `openai`               |
| `--model <name>`      | `gpt-4o-mini`| OpenAI model                         |
| `-i, --incremental`   | off          | Content-addressed cache              |
| `--persist`           | off          | Auto-persist to Neo4j                |
| `--force`             | off          | Ignore cache                         |
| `-p, --profile <name>`| `standard`   | Extraction profile                   |
| `--concurrency <n>`   | `5`          | Parallel LLM calls                   |
| `--from-fx <source>`  | —            | Skip FX, reuse cached output         |
| `-v, --verbose`       | off          | Stage details                        |

### `iw query`

Query the knowledge graph.

```bash
iw query <question> [options]
iw query --cypher <cypher> [options]
```

| Option             | Default | Description                    |
| ------------------ | ------- | ------------------------------ |
| `-s, --session`    | —       | Neo4j session scope            |
| `-f, --format`     | `table` | `table`, `json`                |
| `-o, --output`     | —       | Write to file                  |
| `-v, --verbose`    | off     | Show generated Cypher          |

### `iw context`

Build RAG context.

```bash
iw context <topic> [options]
iw context -e <entity> [options]
iw context --all [options]
```

| Option          | Default | Description                      |
| --------------- | ------- | -------------------------------- |
| `-s, --session` | —       | Session scope                    |
| `-e, --entity`  | —       | Seed entity                      |
| `--hops <n>`    | `2`     | Expansion depth                  |
| `--all`         | off     | Dump everything                  |
| `--code-refs`   | off     | Include source references        |
| `-f, --format`  | `text`  | `text`, `json`                   |
| `-o, --output`  | —       | Write to file                    |

### `iw impact`

Semantic impact analysis.

```bash
iw impact <files...> [options]
```

| Option          | Default | Description         |
| --------------- | ------- | ------------------- |
| `-s, --session` | —       | Session scope       |
| `--hops <n>`    | `2`     | Ripple depth        |
| `-f, --format`  | `text`  | Output format       |
| `-o, --output`  | —       | Write to file       |

### `iw doc-health`

Documentation freshness analysis. Three modes (least → most infrastructure):

1. `--lite` — Zero-infra keyword scan (no index needed)
2. _(default)_ — CARI-backed analysis from `.iw/index.db` (no Neo4j)
3. `--neo4j` — Full KG-based analysis (requires Neo4j + persisted KWG)

```bash
iw doc-health [files...] [options]
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

Write to Neo4j.

```bash
iw persist [run-id] [options]
```

| Option           | Default | Description                     |
| ---------------- | ------- | ------------------------------- |
| `--latest`       | off     | Persist most recent run         |
| `--file <path>`  | —       | Persist from specific file      |
| `-v, --verbose`  | off     | Details                         |

### `iw xlink`

Cross-layer code linking.

```bash
iw xlink [directory] [options]
```

| Option           | Default | Description                     |
| ---------------- | ------- | ------------------------------- |
| `-s, --session`  | —       | Session scope                   |
| `--persist`      | off     | Write links to Neo4j            |
| `-v, --verbose`  | off     | Details                         |

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
