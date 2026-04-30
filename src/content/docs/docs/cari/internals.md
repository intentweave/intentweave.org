---
title: CARI Internals
description: Scoring formulas, IDF filtering, and annotation schema details.
---

## Scoring Formula

CARI's retrieval score combines four signals into a single ranked score:

```
score = w_ann × annotation_relevance
      + w_sym × symbol_match
      + w_cooc × co_occurrence_boost
      + w_coch × co_change_signal
```

Each signal is normalized to `[0, 1]` before weighting.

This formula is implemented in the `retrieve` query (`packages/index/src/queries/retrieve.ts`)
and is exposed via `CariIndex.retrieve()` and the `cari_retrieve` MCP tool. The four
component tables are `annotations`, `symbols`, `co_occurrences`, and `co_changes`.

## Annotation Sources

Annotations are created when a document mention matches a code symbol. Each annotation
records its **source** — how the match was discovered:

| Source | Description | Depth Mode |
|--------|-------------|------------|
| `heading` | H1–H6 heading text | structured |
| `bold` | Bold/strong text | structured |
| `code_span` | Inline code (backticks) | structured |
| `identifier` | CamelCase / snake_case tokens | structured |
| `dictionary` | Body text matched against symbol dictionary | full only |

## IDF Noise Filtering

In `full` depth mode, body text scanning can match many common words that happen to
be symbol names (e.g., "data", "error", "config"). The IDF (Inverse Document Frequency)
filter penalizes terms that appear in nearly every document.

### How It Works

1. After all annotations are computed, calculate the **document frequency** for each term
2. Terms appearing in > 85% of documents get an IDF penalty
3. A **stopword baseline** of ~50 known-noisy terms (like "data", "type", "value")
   starts with a ceiling IDF of 0.15

### Configuration

The IDF system is automatic — no configuration needed. The stopword baseline and
ceiling are tuned for typical codebases:

- **STOPWORD_BASELINE**: 50 terms known to be noisy across most projects
- **STOPWORD_CEILING**: 0.15 — maximum IDF score for baseline terms
- **Exemptions**: Annotations from `heading`, `bold`, and `code_span` sources are
  never penalized (they're explicit mentions, not body-text noise)

## SQLite Schema

The index database (`.iw/index.db`) contains these tables:

### `symbols`

```sql
CREATE TABLE symbols (
  id        INTEGER PRIMARY KEY,
  name      TEXT NOT NULL,
  kind      TEXT NOT NULL,    -- 'class', 'function', 'interface', 'type', 'enum', etc.
  file      TEXT NOT NULL,
  line      INTEGER,
  exported  INTEGER DEFAULT 0,
  UNIQUE(name, kind, file, line)
);
```

### `annotations`

```sql
CREATE TABLE annotations (
  id          INTEGER PRIMARY KEY,
  doc_file    TEXT NOT NULL,
  symbol_id   INTEGER REFERENCES symbols(id),
  mention     TEXT NOT NULL,
  source      TEXT NOT NULL,    -- 'heading', 'bold', 'code_span', 'identifier', 'dictionary'
  confidence  REAL DEFAULT 1.0,
  idf_score   REAL DEFAULT 1.0,
  line        INTEGER
);
```

### `co_occurrences`

```sql
CREATE TABLE co_occurrences (
  entity_a    TEXT NOT NULL,
  entity_b    TEXT NOT NULL,
  doc_file    TEXT,
  score       REAL DEFAULT 1.0,
  layer       TEXT NOT NULL,   -- 'doc_cooc', 'code_import'
  UNIQUE(entity_a, entity_b, layer, doc_file)
);
```

### `co_changes`

```sql
CREATE TABLE co_changes (
  file_a      TEXT NOT NULL,
  file_b      TEXT NOT NULL,
  jaccard     REAL NOT NULL,
  commit_count INTEGER DEFAULT 0,
  recency     REAL DEFAULT 0.0,
  UNIQUE(file_a, file_b)
);
```

### `files`

```sql
CREATE TABLE files (
  path          TEXT PRIMARY KEY,
  last_modified INTEGER,
  content_hash  TEXT,
  churn         INTEGER DEFAULT 0,
  hotspot       REAL DEFAULT 0.0,
  owner         TEXT,
  kind          TEXT   -- 'code' or 'doc'
);
```
