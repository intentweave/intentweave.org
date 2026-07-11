---
title: IntentWeave vs. Other Tools
description: How IntentWeave compares to Semgrep, ArchUnitTS, and dependency-cruiser — and when it makes sense to use them together.
---

IntentWeave overlaps with several existing tools on import/dependency rules, but goes further into
architecture governance, doc↔code drift, and RAG context for AI coding agents — a combination none
of them cover on their own. These pages compare IntentWeave against specific tools your team may
already use, so you can decide what to replace and what to keep running alongside it.

**In short:** for most teams, IntentWeave is more complementary than competing with the tools
below. A common setup is dependency-cruiser or ArchUnitTS for layer rules already wired into an
existing workflow, Semgrep for security scanning, and IntentWeave for AST/taint rules, behavioral
call-graph checks, doc↔code drift, and RAG context — none of which the others cover.

## The Comparisons

| Tool | Primary focus | Where IntentWeave overlaps | Where IntentWeave goes further |
|---|---|---|---|
| [Semgrep](/compare/vs-semgrep/) | Security vulnerability scanning (SAST), 30+ languages | Custom AST pattern rules | Layer/import rules as a first-class concept, behavioral call-graph rules, doc↔code drift, ADR extraction, RAG context |
| [ArchUnitTS](/compare/vs-archunitts/) | Architecture rules as unit tests, classic OO metrics | Import/layer boundary rules | AST-level rules with taint tracking, custom graph queries, behavioral call-graph rules, doc↔code drift, ADR extraction, RAG context |
| [dependency-cruiser](/compare/vs-dependency-cruiser/) | Import graph validation & visualization | Import/dependency boundary rules, circular dependency detection | AST-level rules with taint tracking, custom graph queries, behavioral call-graph rules, doc↔code drift, ADR extraction, RAG context |

## What's Consistently Outside These Tools' Scope

A few capabilities show up as an IntentWeave-only column across all three comparisons, because
none of these tools were built for them:

- **Doc↔code grounding and drift detection** — none of the three have any concept of documentation.
- **ADR extraction (optional LLM step)** — `iw index rules-extract` drafts a `rules.yaml` from a
  written ADR instead of every rule being hand-authored.
- **RAG context for AI coding agents** — `iw index context-pack` hands your AI coding agent a
  token-budgeted, ranked bundle of files, rules, and doc drift for a query.
- **Custom graph queries** — a `cypher` rule type runs CypherLite queries directly against
  IntentWeave's SQLite index, without requiring Neo4j.

## Try it in 30 seconds

```bash
npm install -g @intentweave/cli
cd your-project
iw init
iw index build          # < 3 seconds, zero API calls
```

See the [Rules Catalog live on IntentWeave's own repo](/examples/live-rules-catalog/), or read the
[Semantic Rule Checking reference](/docs/cari/semantic-rules/) for the full rule-type list.
