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
iw index check [changed...] [options]
```

| Option                     | Default        | Description                            |
| -------------------------- | -------------- | ---------------------------------------- |
| `[changed...]`             | —              | Changed files (positional, not a flag) |
| `--severity <level>`       | `info`         | `info`, `warning`, `critical`          |
| `-f, --format`             | `text`         | `text`, `json`, `github`               |
| `--exclude <patterns...>`  | —              | Exclude findings matching these globs  |
| `--db <path>`              | `.iw/index.db` | Path to CARI index                     |

```bash
iw index check src/auth/service.ts src/auth/jwt.ts
iw index check $(git diff --name-only origin/main...HEAD) --format github
```

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

### `iw index context-pack`

Composite, token-budgeted RAG bundle (files + symbols + rules + connections + rationale + drift)
for LLM prompt injection, with adaptive ranking. See [Adaptive Context Package](/docs/cari/context-pack/).

```bash
iw index context-pack --query <text> [options]
```

| Option                | Default        | Description                                                 |
| --------------------- | -------------- | ------------------------------------------------------------ |
| `--query <text>`      | —              | Natural-language topic or task description                   |
| `--files <paths...>`  | —              | Files being edited/changed — anchors drift + symbol lookup    |
| `--entity <name>`     | —              | Anchor on a specific symbol/component                          |
| `--budget <n>`        | `4000`         | Approximate token budget (max `12000`)                        |
| `--sections <list>`   | all            | `files,symbols,rules,connections,rationale,drift`             |
| `--adaptive <mode>`   | `conservative` | `off`, `conservative`, `aggressive`                            |
| `--adaptive-explain`  | off            | Include per-file scoring diagnostics                          |

### `iw index eval`

Measure context-pack quality (noisy-path share, anchor hit rate, latency) on a fixed query set.

```bash
iw index eval --queries .iw/eval/queries.json --adaptive conservative
```

### `iw intent check`

Check architectural rules across three domains.

```bash
iw intent check                              # all domains
iw intent check --domain structural          # import + AST rules only
iw intent check --domain behavioral          # Mermaid sequence/flow rules
iw intent check --domain documentary         # coverage + stale docs + terminology
iw intent check --domain all                 # explicit all-domains pass

# CI: changed files only, high severity (comma-separated, no spaces)
iw intent check --changed src/auth.ts,src/auth/jwt.ts --severity high --format json

# Regression gating
iw intent check --baseline .iw/baseline.json
```

| Option                 | Default          | Description                                       |
| ---------------------- | ---------------- | -------------------------------------------------- |
| `--domain <d>`         | `all`            | `structural`, `behavioral`, `documentary`, `all`   |
| `--severity <level>`   | `info`           | Minimum: `info`, `medium`, `high`                  |
| `--changed <files>`    | —                | Comma-separated list of changed files (no spaces)  |
| `--config <path>`      | `.iw/rules.yaml` | Path to rules config                               |
| `--baseline <path>`    | —                | Regression gating: fail only on new violations     |
| `--format <f>`         | `text`           | `text`, `json`, `github`                           |

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
| `iw index cypher <query>`     | Ad-hoc CypherLite graph query over the CARI projection     |
| `iw index schema`             | Graph node/relationship schema + built-in query templates  |
| `iw index export --book`      | Insights Book (15+ chapters, primary deliverable)         |
| `iw index export --html`      | §10.1 interactive standalone HTML architecture report     |
| `iw index export --focus <t>` | Focused Graphviz SVG architecture report                  |
| `iw index rules-check`        | Canonical command behind `iw intent check` (same options) |
| `iw index rules-extract`      | Canonical command behind `iw intent extract` (same options) |
| `iw index scan-diagrams`      | Canonical command behind `iw intent scan` (same options)  |
| `iw index rules-trend`        | ADR conformance trend over git history                    |
| `iw index arch-check`         | Validate imports against a diagram/YAML architecture spec — `--from-scan <paths>` (LLM diagram scan, no config needed), `--from-diagrams` (use enriched triples), `--strict`, `--refresh` |
| `iw index deprecated-callers` | Active callers of `@deprecated` symbols                    |
| `iw index internal-violations`| `@internal`/`_`-prefix boundary violations across packages |
| `iw index type-assertions`    | Inventory of `as any` / double / angle-bracket casts       |
| `iw index test-intent`        | Test descriptions that no longer match real symbols        |
| `iw intent check`             | Check all intent domains (structural/behavioral/documentary)|
| `iw intent check --domain`    | Target one domain: `structural`, `behavioral`, `documentary`, `all` |
| `iw intent check --baseline`  | Regression gating: fail only if violations increased      |
| `iw intent extract`           | Extract rules from an ADR via LLM                         |
| `iw intent scan`              | Scan diagrams (Mermaid/PlantUML) for architecture components |
| `iw intent living`            | Living documentation health (documentary domain)          |
| `iw intent score`             | Composite living documentation score (A–F, 4 dimensions)  |

`iw intent check`, `iw intent extract`, and `iw intent scan` are thin aliases —
`iw index rules-check`, `iw index rules-extract`, and `iw index scan-diagrams` are the
underlying commands and accept the same options. `arch-check`, `deprecated-callers`,
`internal-violations`, `type-assertions`, and `test-intent` have no `iw intent` alias;
use the `iw index` form directly.

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

### `iw index cypher`

Run an ad-hoc [CypherLite](/docs/cari/semantic-rules/) query directly against the CARI graph
projection — a second layer on top of the 30+
built-in queries, for questions they don't cover. No Neo4j, no LLM — only `.iw/index.db`.
This queries the CARI SQLite projection only. For the separate LLM-powered Knowledge Graph
(Neo4j), use the `kg_query` MCP tool instead — see below.

```bash
iw index cypher <query> [options]
iw index schema                    # node labels, relationships, built-in templates
```

| Option                | Default        | Description                                                |
| --------------------- | -------------- | ------------------------------------------------------------ |
| `--db <path>`         | `.iw/index.db` | Path to CARI index                                            |
| `-p, --param <kv...>` | —              | Query parameters as `key=value` pairs                         |
| `--template <id>`     | —              | Run a named built-in template (alternative to `@:` prefix)    |
| `--list-templates`    | off            | List all available query templates and exit                   |
| `-f, --format`        | `table`        | `table`, `json`, or `csv`                                      |
| `--limit <n>`         | `50`           | Max rows to display                                            |
| `--show-sql`          | off            | Print the generated SQL before results                         |

```bash
iw index cypher "MATCH (a:SYMBOL)-[:CALLS]->(b:SYMBOL) RETURN a.name, b.name LIMIT 10"
iw index cypher --list-templates
iw index cypher @:callers-of --param calleeName=validateToken
iw index cypher --template co-changed-with --param file=src/auth.ts --format json
```

Node labels: `FILE`, `SYMBOL`, `DOCSPAN`, `TODO`, `RATIONALE`, `SEMANTIC`. Relationship
types: `IMPORTS`, `DEFINES`, `CALLS`, `ANNOTATED_BY`, `HAS_TODO`, `HAS_RATIONALE`,
`SUMMARIZED_BY`, `CO_OCCURS`, `CO_CHANGES`. Run `iw index schema` (or `--format json`)
for the full property reference and current template list.

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
