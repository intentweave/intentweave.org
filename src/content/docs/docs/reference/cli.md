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

Documentation freshness analysis.

```bash
iw doc-health [files...] [options]
```

| Option          | Default | Description         |
| --------------- | ------- | ------------------- |
| `-s, --session` | —       | Session scope       |
| `-f, --format`  | `text`  | Output format       |
| `-o, --output`  | —       | Write to file       |

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
