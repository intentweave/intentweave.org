---
title: Build the Index
description: Run iw index build to create the CARI SQLite index.
---

## Basic Usage

```bash
iw index build
```

This runs the full pipeline and writes `.iw/index.db`.

## Options

| Option              | Default      | Description                                    |
| ------------------- | ------------ | ---------------------------------------------- |
| `--depth <mode>`    | `structured` | `structured` or `full` (see below)             |
| `--include <glob>`  | —            | Only index files matching glob                 |
| `--exclude <glob>`  | —            | Skip files matching glob                       |
| `-v, --verbose`     | off          | Show per-stage progress                        |

## Depth Modes

### `structured` (default)

Scans only **headings, bold text, code spans, and identifiers** in documents.
Fast and precise — best for everyday use.

```bash
iw index build
# or explicitly:
iw index build --depth structured
```

### `full`

Adds **body text scanning** with dictionary matching and IDF-based noise filtering.

```bash
iw index build --depth full
```

Full mode produces significantly more annotations:

| Metric | Structured | Full |
|--------|----------:|-----:|
| Annotations | 6,721 | 11,533 (+72%) |
| Grounded links | 2,548 | 7,360 (+189%) |
| Co-occurrences | 1,099 | 2,631 (+139%) |
| Build time | 1.1 s | 2.8 s |

The IDF filter removes noise by penalizing terms that appear in nearly every document
(common words like "data", "type", "config"). A baseline of 50 stopwords with a ceiling
of 0.15 keeps precision high while allowing the richer recall.

## Pipeline Stages

The build runs these stages in order:

1. **AX** — AST extraction (tree-sitter) → builds a symbol registry with all
   classes, functions, interfaces, types, exports
2. **KWX** — Keyword extraction → scans documents for entity mentions.
   In `full` mode, receives the symbol dictionary for body text matching
3. **COX** — Co-occurrence scoring → finds entity pairs mentioned together
4. **TCG** — Git analysis → co-change Jaccard scores, hotspot detection,
   ownership, staleness flags
5. **Annotate** — Matches document mentions to code symbols, applies IDF penalties
6. **Write** — Persists everything to SQLite

## Filtering Files

```bash
# Only index src/ and docs/
iw index build --include "src/**" --include "docs/**"

# Exclude test files
iw index build --exclude "**/*.test.ts" --exclude "**/__tests__/**"
```

## Output

The build creates `.iw/index.db` with these tables:

| Table | Contents |
|-------|----------|
| `symbols` | Code symbols from AST (name, kind, file, line, exported) |
| `annotations` | Doc spans → code symbols (confidence, source, IDF score) |
| `co_occurrences` | Entity pairs co-mentioned in docs or co-imported in code |
| `co_changes` | File pairs that change together in git (Jaccard + recency) |
| `files` | Per-file metadata (last modified, churn, hotspot, owner, content hash) |

## Next Steps

- [Retrieve](/docs/cari/retrieve/) — query the index for relevant files
- [Incremental Update](/docs/cari/update/) — re-index only changed files
