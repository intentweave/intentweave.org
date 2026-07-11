---
title: Adaptive Context Package
description: A composite, token-budgeted RAG bundle for LLM prompt injection, with adaptive ranking driven by repo shape and anchor files.
---

`iw index context-pack` builds a single context bundle for feeding an LLM (Copilot, Claude,
your own agent) real, evidence-backed information about your codebase — instead of letting
it guess. It combines six CARI signals in one call and renders a deterministic,
token-budgeted markdown block:

- **Relevant files** — ranked by annotation match, symbol match, and co-occurrence
- **Exported symbols** — from the top-ranked files
- **Architecture rules** — active violations first, then clean rules
- **Cross-layer connections** — linked entities + hidden coupling gaps
- **Design rationale** — WHY/NOTE/DESIGN comments from context files
- **Documentation drift** — docs that reference changed files (when `--files` is passed)

Empty sections are omitted automatically. No LLM calls, no servers — the bundle is built
entirely from the local SQLite index.

## Usage

```bash
iw index context-pack [options]
```

| Option                | Default        | Description                                                 |
| --------------------- | -------------- | ------------------------------------------------------------ |
| `--query <text>`      | —              | Natural-language topic or task description                   |
| `--files <paths...>`  | —              | Files being edited/changed — anchors drift + symbol lookup    |
| `--entity <name>`     | —              | Anchor on a specific symbol/component for connection discovery |
| `--budget <n>`        | `4000`         | Approximate token budget for the output (max `12000`)         |
| `--sections <list>`   | all            | Comma-separated: `files,symbols,rules,connections,rationale,drift` |
| `--adaptive <mode>`   | `conservative` | `off`, `conservative`, or `aggressive` (see below)             |
| `--adaptive-explain`  | off            | Include per-file scoring diagnostics in the `reason` field     |
| `-f, --format <fmt>`  | `markdown`     | `markdown` or `json`                                          |

It's also exposed as the `cari_context_pack` MCP tool and via the `@intentweave/index`
library API (`contextPack(dbPath, input)`), so it works the same way from Copilot Chat,
a CI script, or your own tooling.

## Adaptive Ranking

Adaptive mode reorders the `files` section using signals CARI already computes from your
import graph and directory structure — no LLM, no extra indexing pass.

| Mode           | What it does                                                              |
| -------------- | -------------------------------------------------------------------------- |
| `off`          | Raw annotation/FTS ranking only — deterministic baseline, no adaptation.  |
| `conservative` | Repo-shape priors + anchor-aware boosting (below). **Default.**          |
| `aggressive`   | Reserved for upcoming intent/confidence/feedback layers (see Roadmap) — currently behaves the same as `conservative`. |

### Repo-shape adaptation

Downweights low-signal and "meta" paths using per-directory annotation density computed
from the `annotations` table — directories like `.changeset/`, `.specstory/`, `archive/`,
`legacy/`, `node_modules/`, and `dist/` get penalized automatically. Pin exceptions in
`.iw/config.yaml`:

```yaml
adaptive:
  mode: conservative
  path_exceptions:
    - path: docs/decisions/
      multiplier: 1.2
    - path: packages/core-api/README
      multiplier: 1.5
```

### Anchor-aware adaptation

When you pass `--files`, non-anchor results get boosted by their graph distance from the
anchor, read directly from the `imports` table:

| Relationship to anchor       | Boost  |
| ----------------------------- | ------ |
| Exact anchor file              | `1.5×` |
| Same folder                    | `1.2×` |
| Same monorepo package          | `1.1×` |
| 1-hop import-neighbor           | `1.05×`|

Pass `--adaptive-explain` to see which boost applied to each file in its `reason` field
(e.g. `anchor-neighbor: import`, `anchor-neighbor: same folder`).

## Example

```bash
iw index context-pack \
  --query "context-pack ranking noise" \
  --files packages/index/src/queries/contextPack.ts \
  --adaptive conservative --adaptive-explain \
  --sections files --format json
```

```json
{
  "path": "packages/index/src/queries/retrieve.ts",
  "score": 1.96,
  "role": "code",
  "reason": "anchor-neighbor: import"
}
```

See the [live demo](/examples/live-context-pack/) for a real before/after comparison, and
[Measuring Quality](#measuring-quality) below to reproduce the metrics on your own repo.

## Measuring Quality

`iw index eval` runs a fixed query set through `context-pack` and reports noisy-path share
and anchor-neighborhood hit rate — the two guardrail metrics used to validate adaptive mode
before it became the default.

```bash
iw index eval --queries .iw/eval/queries.json --adaptive conservative --top-k 20
```

Query-set format (`.iw/eval/queries.json`) — plain strings or objects with optional anchors:

```json
[
  "CARI index build pipeline",
  { "query": "shared CARI query helpers and DB access", "files": ["packages/index/src/queries/shared.ts"] }
]
```

Real validation results from IntentWeave's own M2 gate (`off` → `conservative`):

| Repo               | Noisy-path share | Anchor hit rate | p50 latency |
| ------------------- | ---------------: | --------------: | ----------: |
| intentweave          | 0% → 0%          | 100% → 100%     | 7.5ms       |
| backstage            | 21% → 0%         | 0% → 88.9%      | 35.9ms      |
| codegraphchat-v2     | 14% → 3.7%       | 70% → 90%       | 111.3ms     |

## Roadmap

Repo-shape (Phase B) and anchor-aware (Phase C) adaptation shipped in `v0.16.0`. Deterministic
intent classification (code-task vs. architecture vs. docs), per-section confidence budgeting,
and an opt-in feedback-loop cache are specced but not yet implemented — `aggressive` mode is
reserved for them and currently behaves identically to `conservative`.

## Next Steps

- [Live Demo: Adaptive Context Package](/examples/live-context-pack/) — real before/after ranking
- [Copilot / MCP](/docs/integrations/mcp/) — use `cari_context_pack` from an agent
- [Retrieve](/docs/cari/retrieve/) — the underlying ranked file retrieval query
