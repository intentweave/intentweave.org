---
title: Retrieve
description: Ranked file retrieval by topic or symbol name.
---

## Usage

```bash
iw index retrieve <query> [options]
```

Returns a ranked list of files matching your query, with confidence scores
and explanations for why each file was returned.

## Options

| Option           | Default | Description               |
| ---------------- | ------- | ------------------------- |
| `--limit <n>`    | `10`    | Maximum results           |
| `--scope <type>` | `all`   | `code`, `docs`, or `all`  |

## How Scoring Works

Each file is scored by combining multiple signals:

1. **Annotation relevance** — how many document mentions match the query
2. **Symbol matching** — code symbols whose names match
3. **Co-occurrence boost** — entities that frequently appear with the query
4. **Co-change signal** — files that often change alongside query-relevant files

## Examples

### Topic search

```bash
iw index retrieve "authentication"

# 1. src/auth/service.ts     (0.95) — 12 annotations, AuthService class
# 2. docs/auth.md            (0.92) — 18 mentions, primary auth doc
# 3. src/auth/jwt.ts         (0.78) — co-occurs with AuthService
# 4. src/middleware/guard.ts  (0.52) — calls AuthService.verify()
# 5. test/auth.test.ts       (0.41) — test file, co-changes with service
```

### Scoped search

```bash
# Only code files
iw index retrieve "authentication" --scope code

# Only documentation
iw index retrieve "authentication" --scope docs
```

### Limit results

```bash
iw index retrieve "authentication" --limit 3
```

## Understanding the Output

Each result includes:
- **File path** — the matched file
- **Score** — 0.0 to 1.0, higher is more relevant
- **Reasons** — why this file ranked where it did (annotations, symbols, co-occurrence, etc.)

## Next Steps

- [Connections & Gaps](/docs/cari/connections/) — understand cross-layer relationships
- [CI Drift Check](/docs/cari/check/) — catch stale docs in CI
