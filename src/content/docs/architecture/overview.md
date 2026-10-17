---
title: Architecture Overview
description: How IntentWeave packages fit together.
---

## Package Structure

```
packages/
  core/                 → @intentweave/core — shared types, predicates, interfaces
  analyzer/             → @intentweave/analyzer — pipeline stages (AX, KWX, COX, TCG)
  index/                → @intentweave/index — CARI SQLite engine (writer, annotator, IDF, queries,
                                                 architecture analysis, HTML report)
  cli/                  → @intentweave/cli — `iw` commands + MCP server (58 tools)
  cypher-lite/          → @intentweave/cypher-lite — zero-dep Cypher→SQL transpiler for SQLite KG
  ast-extractor/        → @intentweave/ast-extractor — tree-sitter TS/JS extraction
  swift-parser/         → @intentweave/swift-parser — tree-sitter Swift extraction
  python-parser/        → @intentweave/python-parser — tree-sitter Python extraction

plugins/                                        # install only what you need
  plugin-llm/           → @intentweave/plugin-llm — LLM provider (OpenAI)
  plugin-python/        → @intentweave/plugin-python — Python language support
  plugin-swift/         → @intentweave/plugin-swift — Swift language support
  plugin-kg-lite → SQLite KG persistence (published separately,
                   installed via `iw plugin add kg-lite`)
```

> The standalone REST API server (`apps/server`, `@intentweave/server-core`,
> `@intentweave/server-open`) has been removed. Supported integration surfaces are
> the CLI, MCP tools, and the `@intentweave/index` programmatic API.

## CARI Pipeline

The CARI index is built by a sequence of pipeline stages, orchestrated by
`packages/cli/src/commands/indexBuild.ts`:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│     AX      │    │    KWX      │    │    COX      │
│ AST Extract │───►│  Keywords   │───►│ Co-occur    │
│ (symbols)   │    │ (mentions)  │    │ (pairs)     │
└─────────────┘    └─────────────┘    └──────┬──────┘
                                             │
┌─────────────┐    ┌─────────────┐    ┌──────▼──────┐
│    TCG      │    │  Annotate   │    │   Write     │
│ Git History │───►│ (match +    │───►│  (SQLite)   │
│ (co-change) │    │  IDF filter)│    │ .iw/index.db│
└─────────────┘    └─────────────┘    └─────────────┘
```

### Stage Details

| Stage        | Package                        | Input                    | Output                                           |
| ------------ | ------------------------------ | ------------------------ | ------------------------------------------------ |
| **AX**       | `analyzer` (language registry) | Source files             | Symbol registry (classes, functions, exports)    |
| **KWX**      | `analyzer`                     | Docs + symbol dictionary | Keyword mentions per document                    |
| **COX**      | `analyzer`                     | Mentions                 | Entity pair co-occurrence scores                 |
| **TCG**      | `analyzer`                     | Git log                  | Co-change Jaccard, hotspot, ownership, staleness |
| **Annotate** | `index`                        | Mentions + symbols       | Grounded annotations with IDF scores             |
| **Write**    | `index`                        | All above                | SQLite database (`.iw/index.db`)                 |

## Knowledge Graph Querying (Optional)

IntentWeave can query a graph through MCP tools (`kg_query`, `kg_context`, `kg_entities`,
`kg_doc_health`, `kg_schema`). The graph is stored by the `plugin-kg-lite` persistence
plugin, in a local SQLite file. IntentWeave does not fill that graph from documents.

## Technology Stack

| Layer           | Technology                       |
| --------------- | -------------------------------- |
| Language        | TypeScript 5.6, ESM, strict mode |
| Monorepo        | pnpm workspaces + Turbo          |
| CLI             | Commander.js                     |
| Database (CARI) | SQLite via `node:sqlite` (built-in, Node 22.15+) |
| Database (KG)   | SQLite (optional, via `plugin-kg-lite`) |
| AST parsing     | tree-sitter (TS/JS/Swift/Python) |
| LLM             | OpenAI (gpt-4o-mini), pluggable  |
| Visualization   | D3.js v7 (inline in HTML report) |
| Testing         | Vitest (1248 tests)              |
| MCP             | stdio transport                  |

## Next Steps

- [CARI Technical Spec](/architecture/cari-spec/) — detailed spec with benchmarks
- [CARI Internals](/docs/cari/internals/) — scoring, IDF, schema
