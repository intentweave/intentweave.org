---
title: GitHub Actions / CI
description: Add documentation drift checks to your CI pipeline.
---

## Composite Action (Recommended)

The easiest integration: one `uses:` line that handles index build, drift check, living
score, PR comment, and caching automatically.

```yaml
name: Doc Health
on:
  pull_request:
    branches: [main]

permissions:
  pull-requests: write

jobs:
  doc-health:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: intentweave/doc-health-action@v1
        with:
          severity-threshold: warning   # fail on warning or above
          post-comment: true            # update PR with grade + drift table
          score-threshold: "70"         # optional: fail if score < 70
```

The action posts a PR comment like:

```
## 🟢 A — Living Documentation Score: 91/100
| File | Issues |
|------|--------|
| docs/AUTH.md | 1 drift warning |

<details><summary>Findings</summary>…</details>
```

### Action Inputs

| Input               | Default     | Description                                    |
| ------------------- | ----------- | ---------------------------------------------- |
| `severity-threshold`| `warning`   | Fail level: `info`, `warning`, `error`         |
| `post-comment`      | `true`      | Post/update a PR comment with results          |
| `build-index`       | `true`      | Run `iw index build` (set false if pre-built)  |
| `score-threshold`   | _(none)_    | Fail if living score is below this number      |
| `iw-version`        | `latest`    | Pin `@intentweave/cli` version                 |
| `working-directory` | `.`         | Repo subdirectory containing the project       |

### Action Outputs

| Output        | Description                                    |
| ------------- | ---------------------------------------------- |
| `score`       | Living documentation score 0–100               |
| `grade`       | Letter grade (A–F)                             |
| `drift-count` | Number of drift findings                       |

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

## Git Hooks

Run drift detection automatically on every commit and checkout — no CI job needed for
local development:

```bash
iw hook install
```

This installs `post-commit` and `post-checkout` hooks that run `iw index update` after
each commit or branch switch, keeping the index fresh without manual intervention.

```bash
iw hook status      # show which hooks are managed by IntentWeave
iw hook uninstall   # remove only the iw-managed sections (leaves custom hooks intact)
```

Hooks append to existing hook scripts and are guarded by a `# managed-by-intentweave`
marker so they can be safely removed without affecting other hooks.

## Next Steps

- [CI Drift Check](/docs/cari/check/) — detailed check options
- [Copilot / MCP](/docs/integrations/mcp/) — editor integration
