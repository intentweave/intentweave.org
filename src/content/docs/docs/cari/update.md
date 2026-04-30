---
title: Incremental Update
description: Re-index only changed files in under a second.
---

## Usage

```bash
iw index update [options]
```

Re-indexes only files whose content has changed since the last build.
Typical update time: **< 1 second**.

## Options

| Option       | Default | Description                |
| ------------ | ------- | -------------------------- |
| `-v`         | off     | Show what changed          |

## How It Works

CARI tracks a **SHA-256 content hash** for every indexed file. When you run
`iw index update`, it:

1. Scans the workspace for files
2. Computes the current hash for each file
3. Compares against the stored hash in `.iw/index.db`
4. Re-indexes only files that changed

Unchanged files are completely skipped — no AST parsing, no keyword extraction,
no git analysis.

## Example

```bash
# After editing src/auth/service.ts:
iw index update -v

# Updated 1 file:
#   src/auth/service.ts (content changed)
# Skipped 263 files (unchanged)
# Time: 0.3s
```

## When to Use Update vs Build

| Scenario | Command |
|----------|---------|
| First time | `iw index build` |
| After editing a few files | `iw index update` |
| After changing depth mode | `iw index build --depth full` |
| After pulling lots of changes | `iw index build` |
| In CI (fresh checkout) | `iw index build` |

## Next Steps

- [Build the Index](/docs/cari/build/) — full build options
- [CI Drift Check](/docs/cari/check/) — pair with incremental updates

## Programmatic API

```typescript
import { CariIndex } from "@intentweave/index";

// Equivalent to: iw index update -v
await CariIndex.update({
  workspaceRoot: process.cwd(),
  verbose: true,
});

// Or: load existing index and inspect freshness
const index = CariIndex.load(".iw/index.db");
const report = index.report();
console.log(`${report.staleCount} stale files`);
index.close();
```

`CariIndex.update()` uses the same SHA-256 content-hash comparison as `iw index update`.
Only files whose hash differs from the `files` table entry are re-processed through the
**AX → KWX → COX → Annotate** stages.
