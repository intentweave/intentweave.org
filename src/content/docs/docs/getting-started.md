---
title: Installation & Quick Start
description: Get up and running with IntentWeave in under 2 minutes.
---

## Install

```bash
# Global install — adds `iw` to your PATH
npm install -g @intentweave/cli

# Verify
iw --version
```

Or use `npx` without installing:

```bash
npx @intentweave/cli index build
npx @intentweave/cli index retrieve "authentication"
```

### Requirements

| Requirement | Version | Notes                                     |
| ----------- | ------- | ----------------------------------------- |
| **Node.js** | ≥ 20    | `node -v` to check                        |
| **Git**     | any     | For co-change analysis (`iw index build`) |

That's it. CARI needs no database, no API keys, no Docker.

---

## Initialize Your Workspace

```bash
cd /path/to/your/project
iw init
```

This creates a `.iw/` directory for config, cache, and the index database.

---

## Build the Index

```bash
iw index build
```

This runs the full CARI pipeline:

1. **AX** — AST extraction → builds a symbol registry from your code (TS/JS/Swift/Python)
2. **KWX** — Keyword extraction → scans docs for entity mentions
3. **COX** — Co-occurrence scoring → finds entities mentioned together
4. **TCG** — Git analysis → co-changes, hotspots, ownership, staleness
5. **Annotate** — Matches document mentions to code symbols
6. **Write** — Persists everything to `.iw/index.db` (SQLite)

Typical build time: **< 3 seconds** for most projects.

---

## Depth Modes

### Structured (default)

```bash
iw index build
# or explicitly:
iw index build --depth structured
```

Scans **headings, bold text, code spans, and identifiers** only.
Fast and precise — ideal for most workflows.

### Full

```bash
iw index build --depth full
```

Adds **body text scanning** with dictionary matching and IDF-based noise filtering.
Produces +72% more annotations and +189% more grounded links.

Use this when you want maximum recall — for example, when running `report` to
find undocumented dependencies.

---

## First Queries

### Find relevant files

```bash
iw index retrieve "authentication"

# 1. src/auth/service.ts     (0.95) — 12 annotations, AuthService class
# 2. docs/auth.md            (0.92) — 18 mentions, primary auth doc
# 3. src/auth/jwt.ts         (0.78) — co-occurs with AuthService
```

### Explore connections

```bash
iw index connections "AuthService"

# Co-mentioned in docs:
#   JwtValidator     (0.72, in 4 docs)
#   RateLimiter      (0.45, in 2 docs)
#
# Co-changes in git:
#   src/auth/jwt.ts  (jaccard: 0.68, 15 commits)
#
# ⚠ Gaps:
#   RateLimiter co-mentioned but NO code dependency → hidden coupling?
```

### Health dashboard

```bash
iw index report
```

Shows documentation coverage, stale docs, hidden couplings, and undocumented dependencies.

### CI drift check

```bash
iw index check --changed $(git diff --name-only origin/main...HEAD)
```

Exit code 0 = clean, 1 = drift found (docs may need updating).

---

## Next Steps

- [CARI Overview](/docs/cari/overview/) — understand how CARI works
- [CI Integration](/docs/integrations/ci/) — add drift checks to your pipeline
- [Copilot / MCP](/docs/integrations/mcp/) — use CARI tools in VS Code
- [Knowledge Graph](/docs/kg/overview/) — optional deep semantic extraction
