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

### `def_use_chains`

Intra-function def-use relationships extracted during AST traversal (§16.1).
Each row records a variable assignment inside a function body, plus the expression
that was assigned to it.

```sql
CREATE TABLE def_use_chains (
  id            INTEGER PRIMARY KEY,
  file          TEXT NOT NULL,
  function_name TEXT NOT NULL,
  variable      TEXT NOT NULL,   -- local variable name
  assigned_from TEXT NOT NULL,   -- the expression (e.g. "entity.source.path")
  line          INTEGER,
  UNIQUE(file, function_name, variable, assigned_from)
);
CREATE INDEX def_use_chains_file    ON def_use_chains(file);
CREATE INDEX def_use_chains_fn_var  ON def_use_chains(function_name, variable);
```

This table powers the `taint_propagation` feature in semantic rule checking:
when a `property_access` or `call` rule has `taint_propagation: true`, the rule
engine joins against `def_use_chains` to find variables that were assigned from
a matching expression, then checks whether those variables are subsequently used
in further accesses or calls within the same function.

## Intra-Function Def-Use Extraction

The AST extractor visits function bodies and records **local variable declarations**
whose initializer matches one of these node kinds:

| AST Node Kind | Example | Recorded as |
|---------------|---------|-------------|
| `member_expression` | `entity.source.path` | `assigned_from = "entity.source.path"` |
| `call_expression` | `parseRef(id)` | `assigned_from = "parseRef(id)"` |
| `await_expression` | `await fetch(url)` | `assigned_from = "await fetch(url)"` |

Only **local variables** within function/method bodies are tracked — top-level
declarations and module-level assignments are excluded. Tracking is strictly
intra-function: def-use chains do not follow values across function boundaries
or module exports.

### How Taint Propagation Works

Given this code:

```typescript
// apps/ui/src/components/EntityCard.tsx
function render(entity: Entity) {
  const path = entity.source.path;    // ← def-use chain recorded
  const label = path.split("/").pop(); // ← tainted call
  return label;
}
```

The rule engine:
1. Finds `entity.source.path` as a direct violation of the `property_access` chain `**.source.path`
2. Looks up `def_use_chains` for `(file, function_name = "render", assigned_from LIKE "%.source.path%")`
3. Finds `variable = "path"` was tainted
4. Scans for subsequent `property_access` or `call` expressions on `path` in the same function
5. Reports `path.split` as a secondary (taint-propagated) violation

Secondary violations are reported with a `(taint: path ← entity.source.path)` suffix
in CLI output so they are distinguishable from direct violations.
