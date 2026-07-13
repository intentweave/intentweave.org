---
title: CI Drift Check
description: Detect stale documentation in your CI pipeline.
---

## Usage

```bash
iw index check <changed...> [options]
```

Identifies documents that reference changed code and may need updating.

## Options

| Option                  | Default   | Description                              |
| ------------------------ | --------- | ------------------------------------------ |
| `<changed...>`          | —         | Changed files (positional, not a flag)   |
| `--severity <level>`    | `info`    | Minimum: `info`, `warning`, `critical`   |
| `-f, --format`          | `text`    | Output: `text`, `json`, `github`         |
| `--exclude <patterns...>` | —      | Exclude findings matching these globs    |
| `--db <path>`           | `.iw/index.db` | Path to CARI index                  |

## How It Works

1. You tell `check` which files changed (typically from `git diff`)
2. CARI looks up all annotations that reference those files
3. Any document with annotations pointing to changed code is flagged
4. The severity depends on how many references and how central the change is

## Exit Codes

| Code | Meaning |
|------|---------|
| `0`  | No drift detected |
| `1`  | Drift found (docs may need updating) |

## Examples

### Basic check

```bash
iw index check src/auth/service.ts src/auth/jwt.ts

# ⚠ docs/auth.md references AuthService (12 annotations) — may need updating
# ⚠ docs/api.md references JwtValidator (3 annotations) — may need updating
```

### GitHub Actions format

```bash
iw index check \
  $(git diff --name-only origin/main...HEAD) \
  --format github

# ::warning file=docs/auth.md::References changed code: AuthService (12 annotations)
# ::warning file=docs/api.md::References changed code: JwtValidator (3 annotations)
```

### JSON output

Use `--format json` to get machine-readable output. Each entry corresponds to one
`annotations` group per doc file — `annotationCount` is the number of annotation rows
linking that doc to the changed symbols (via `CariIndex.annotationsForFile()`):

```bash
iw index check src/auth.ts --format json

# [
#   {
#     "file": "docs/auth.md",
#     "severity": "warning",
#     "references": ["AuthService"],
#     "annotationCount": 12
#   }
# ]
```

### Filter by severity

```bash
# Only show critical drift (many references to heavily-changed code)
iw index check src/ --severity critical
```

## GitHub Actions Integration

```yaml
name: Doc Drift Check
on: pull_request

jobs:
  drift-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm install -g @intentweave/cli

      - run: iw index build

      - name: Check documentation drift
        run: |
          iw index check \
            $(git diff --name-only origin/main...HEAD) \
            --format github
```

## Next Steps

- [Health Report](/docs/cari/report/) — full corpus health dashboard
- [GitHub Actions / CI](/docs/integrations/ci/) — complete CI setup guide

## Programmatic API

```typescript
import { CariIndex } from "@intentweave/index";

const index = CariIndex.load(".iw/index.db");

// Equivalent to: iw index check src/auth.ts --severity warning
const drift = index.check({
  changed: ["src/auth.ts", "src/auth/jwt.ts"],
  severity: "warning",
});

for (const result of drift) {
  console.log(result.file);
  // result.severity, result.references, result.annotationCount
}

// Inspect which annotations triggered the flag
const annotations = index.annotationsForFile({ filePath: drift[0]?.file });

index.close();
```

`check()` queries the `annotations` table for entries where `symbol_file` matches any
changed file, then groups by `doc_file` and computes severity from `annotationCount`.
