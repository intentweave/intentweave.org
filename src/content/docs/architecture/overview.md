---
title: Architecture Overview
description: How IntentWeave packages fit together.
---

## Package Structure

```
apps/
  server/               → Runnable Fastify server

packages/
  core/                 → @intentweave/core — shared types, predicates, interfaces
  analyzer/             → @intentweave/analyzer — pipeline stages (AX, KWX, COX, TCG, FX, KX, GX)
  index/                → @intentweave/index — CARI SQLite engine (writer, annotator, IDF, queries)
  cli/                  → @intentweave/cli — `iw` commands + MCP server
  server-core/          → @intentweave/server-core — Fastify + Neo4j + middleware
  server-open/          → @intentweave/server-open — open track API routes
  profiles/             → @intentweave/profiles — extraction profile packs
  ast-extractor/        → @intentweave/ast-extractor — tree-sitter TS/JS extraction
  swift-parser/         → @intentweave/swift-parser — tree-sitter Swift extraction
```

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

| Stage | Package | Input | Output |
|-------|---------|-------|--------|
| **AX** | `ast-extractor` | Source files | Symbol registry (classes, functions, exports) |
| **KWX** | `analyzer` | Docs + symbol dictionary | Keyword mentions per document |
| **COX** | `analyzer` | Mentions | Entity pair co-occurrence scores |
| **TCG** | `analyzer` | Git log | Co-change Jaccard, hotspot, ownership, staleness |
| **Annotate** | `index` | Mentions + symbols | Grounded annotations with IDF scores |
| **Write** | `index` | All above | SQLite database (`.iw/index.db`) |

## Knowledge Graph Pipeline (Optional)

For LLM-powered semantic extraction:

```
Documents ──► IN (chunk) ──► FX (extract) ──► KX (canonicalize) ──► GX (merge)
                                                                       │
                                                          Neo4j ◄──── Persist
```

| Stage | Purpose |
|-------|---------|
| **IN** | Chunk documents (semantic markdown splitting, ~16k chars/chunk) |
| **FX** | LLM extracts raw entity-relationship triples per chunk |
| **KX** | Canonicalize entities and predicates (30 predicate types) |
| **GX** | Cross-document entity deduplication (exact + fuzzy merge) |

## Server Architecture

```
┌──────────────────────────────────────────┐
│          @intentweave/server-core         │
│  Fastify 5 + Neo4j pool + context MW     │
│  Health + SSE + OpenAPI (Swagger)        │
└──────────┬───────────────────────────────┘
           │
┌──────────▼───────────────────────────────┐
│         @intentweave/server-open          │
│  POST /api/query   — KG query            │
│  POST /api/context — RAG context         │
│  POST /api/run     — pipeline execution  │
│  POST /api/persist — Neo4j persistence   │
│  POST /api/impact  — impact analysis     │
│  GET  /api/entities — entity listing     │
│  GET  /api/schema  — graph schema        │
└──────────────────────────────────────────┘
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript 5.6, ESM, strict mode |
| Monorepo | pnpm workspaces + Turbo |
| CLI | Commander.js |
| Server | Fastify 5 |
| Database (CARI) | SQLite via better-sqlite3 |
| Database (KG) | Neo4j 5 |
| AST parsing | tree-sitter (TS/JS/Swift) |
| LLM | OpenAI (gpt-4o-mini), pluggable |
| Testing | Vitest (800+ tests) |
| MCP | stdio transport |

## Next Steps

- [CARI Technical Spec](/architecture/cari-spec/) — detailed spec with benchmarks
- [CARI Internals](/docs/cari/internals/) — scoring, IDF, schema
