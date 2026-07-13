---
title: Catch Stale Documentation Before It Ships
description: See how iw index check flags documentation affected by a pull request's code changes, so reviewers catch drift automatically in CI before it merges.
---

## Scenario

You've refactored `AuthService` in a PR. The code changes are solid, tests pass.
But three documentation files still reference the old API. Without a drift check,
those docs ship stale.

## Run It

```bash
# Simulate: check which docs are affected by the PR's changed files
iw index check src/auth/service.ts src/auth/jwt.ts
```

## Output (text)

```
⚠ docs/auth.md
  References AuthService (12 annotations)
  References JwtValidator (5 annotations)
  → Likely needs updating

⚠ docs/api-reference.md
  References AuthService.login() (3 annotations)
  → May need updating

ℹ docs/getting-started.md
  References AuthService (1 annotation, low confidence)
  → Review recommended
```

Exit code: `1` (drift detected)

## Output (GitHub Actions)

```bash
iw index check \
  src/auth/service.ts src/auth/jwt.ts \
  --format github
```

```
::warning file=docs/auth.md::References changed code: AuthService (12 annotations), JwtValidator (5 annotations)
::warning file=docs/api-reference.md::References changed code: AuthService.login() (3 annotations)
::notice file=docs/getting-started.md::References changed code: AuthService (1 annotation)
```

These annotations appear directly in the PR diff on GitHub.

## Output (JSON)

```bash
iw index check src/auth/service.ts --format json
```

```json
[
  {
    "file": "docs/auth.md",
    "severity": "warning",
    "references": ["AuthService", "JwtValidator"],
    "annotationCount": 17,
    "message": "References changed code — likely needs updating"
  },
  {
    "file": "docs/api-reference.md",
    "severity": "warning",
    "references": ["AuthService.login()"],
    "annotationCount": 3,
    "message": "References changed code — may need updating"
  }
]
```

## CI Integration

Add this to your PR workflow:

```yaml
name: Doc Drift
on: pull_request

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npx @intentweave/cli init && npx @intentweave/cli index build
      - run: |
          npx @intentweave/cli index check \
            $(git diff --name-only origin/main...HEAD) \
            --format github
```

## Try It Yourself

```bash
cd your-project
iw init && iw index build

# Check against your current uncommitted changes
iw index check $(git diff --name-only)
```

## Programmatic API

```typescript
import { CariIndex } from "@intentweave/index";

const index = CariIndex.load(".iw/index.db");

// Same as: iw index check src/auth/service.ts
const drift = index.check({
  changed: ["src/auth/service.ts", "src/auth/jwt.ts"],
});

for (const result of drift) {
  console.log(result.file, result.severity, result.annotationCount);
  // e.g. docs/auth.md warning 12
}

// Inspect individual file annotations
const annotations = index.annotationsForFile({ filePath: "docs/auth.md" });
console.log(annotations.map((a) => a.mention));
// → ["AuthService", "JwtValidator", "login", ...]

index.close();
```

`check()` returns the same data as `--format json`. The `annotationsForFile()`
call shows exactly which mentions created the drift signal.

## Next Steps

- [CI Drift Check](/docs/cari/check/) — full `iw index check` reference
- [GitHub Actions / CI](/docs/integrations/ci/) — complete workflow setup
