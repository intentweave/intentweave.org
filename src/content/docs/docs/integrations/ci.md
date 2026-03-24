---
title: GitHub Actions / CI
description: Add documentation drift checks to your CI pipeline.
---

## Minimal Workflow

Two lines to add drift detection to any GitHub Actions workflow:

```yaml
- run: npx @intentweave/cli index build
- run: npx @intentweave/cli index check --changed $(git diff --name-only origin/main...HEAD)
```

Exit code 0 = clean, 1 = drift found.

## Full Example

```yaml
name: Doc Drift Check
on:
  pull_request:
    branches: [main]

jobs:
  drift-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # needed for git diff

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Build CARI index
        run: |
          npx @intentweave/cli init
          npx @intentweave/cli index build

      - name: Check documentation drift
        run: |
          npx @intentweave/cli index check \
            --changed $(git diff --name-only origin/main...HEAD) \
            --format github
```

The `--format github` flag outputs GitHub Actions annotation format, which displays
warnings directly on the PR diff:

```
::warning file=docs/auth.md::References changed code: AuthService (12 annotations)
```

## Caching the Index

For faster CI runs, cache the `.iw/` directory:

```yaml
      - uses: actions/cache@v4
        with:
          path: .iw
          key: iw-index-${{ hashFiles('**/*.ts', '**/*.md') }}
          restore-keys: iw-index-

      - name: Build or update index
        run: |
          npx @intentweave/cli init
          npx @intentweave/cli index build
```

## Other CI Systems

### GitLab CI

```yaml
doc-drift:
  image: node:20
  script:
    - npx @intentweave/cli init
    - npx @intentweave/cli index build
    - npx @intentweave/cli index check --changed $(git diff --name-only origin/main...HEAD)
  only:
    - merge_requests
```

### Generic

Any CI system that supports Node.js can run the same commands:

```bash
npx @intentweave/cli init
npx @intentweave/cli index build
npx @intentweave/cli index check --changed <list-of-changed-files>
```

The exit code tells you whether drift was detected.

## Next Steps

- [CI Drift Check](/docs/cari/check/) — detailed check options
- [Copilot / MCP](/docs/integrations/mcp/) — editor integration
