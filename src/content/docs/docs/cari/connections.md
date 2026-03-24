---
title: Connections & Gaps
description: Cross-layer connection discovery — the insight is in the gaps.
---

## Usage

```bash
iw index connections <entity> [options]
```

Shows all connections for a given entity across three independent layers —
and highlights where these layers **disagree**.

## Options

| Option             | Default | Description                              |
| ------------------ | ------- | ---------------------------------------- |
| `--limit <n>`      | `15`    | Maximum connections                      |
| `--include <type>` | all     | Filter: `doc_cooc`, `co_change`, `code_import` |

## Three Layers

### 1. Document Co-mentions (`doc_cooc`)

Entities mentioned together in the same document section.
High co-mention scores suggest a semantic relationship even if the code
doesn't directly connect them.

### 2. Git Co-changes (`co_change`)

Files that change together in git history. Measured by Jaccard similarity
weighted by recency (recent co-changes score higher).

### 3. Code Imports (`code_import`)

Direct structural dependencies — imports, extends, implements.
These come from AST analysis and are always accurate.

## The Insight Is in the Gaps

When all three layers agree, a relationship is well-understood and well-documented.
When they **disagree**, you've found something interesting:

| Gap Pattern | What It Means |
|-------------|---------------|
| Co-mentioned in docs, no code import | **Hidden coupling** — docs describe a relationship the code doesn't formalize |
| Co-changed in git, not in docs | **Missing documentation** — related code changes without doc coverage |
| Code import exists, no doc co-mention | **Undocumented dependency** — structural link not reflected in docs |

## Example

```bash
iw index connections "AuthService"

# Co-mentioned in docs:
#   JwtValidator     (0.72, in 4 docs)
#   RateLimiter      (0.45, in 2 docs)
#   SessionManager   (0.38, in 3 docs)
#
# Co-changes in git:
#   src/auth/jwt.ts  (jaccard: 0.68, 15 commits)
#   src/middleware/rate-limit.ts  (jaccard: 0.22, 4 commits)
#
# Code imports:
#   JwtValidator     (direct import in service.ts)
#
# ⚠ Gaps:
#   RateLimiter: co-mentioned in 2 docs + co-changed 4 times,
#     but NO code import → hidden coupling?
#   SessionManager: mentioned in 3 docs,
#     but never co-changed and no import → stale reference?
```

## Filtering by Layer

```bash
# Only document co-mentions
iw index connections "AuthService" --include doc_cooc

# Only git co-changes
iw index connections "AuthService" --include co_change

# Only code dependencies
iw index connections "AuthService" --include code_import
```

## Next Steps

- [CI Drift Check](/docs/cari/check/) — automate gap detection in CI
- [Health Report](/docs/cari/report/) — corpus-wide gap analysis
