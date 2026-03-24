---
title: Health Report
description: Corpus-wide documentation health dashboard.
---

## Usage

```bash
iw index report
```

No arguments needed. Produces a health dashboard for your entire project.

## What It Reports

### Documentation Coverage

Percentage of **exported code symbols** that are mentioned in at least one document.
Low coverage means public APIs are undocumented.

### Stale Documents

Documents that reference code which has changed recently (by git commits)
but the document itself hasn't been updated. These are likely to contain
outdated information.

### Hidden Couplings

Entity pairs that are **co-mentioned in documentation** but have **no code
dependency** (no import, no extends, no implements). These suggest an implicit
relationship that the code doesn't formalize.

### Undocumented Dependencies

Code imports/dependencies that are **never mentioned in any document**.
Important structural relationships that documentation doesn't cover.

## Example Output

```
📊 Documentation Health Report
================================

Coverage:     72% (184/256 exported symbols documented)
Stale docs:   3 files
Hidden:       7 entity pairs
Undocumented: 12 dependencies

Stale Documents:
  ⚠ docs/auth.md          — last updated 45 days ago, code changed 3 days ago
  ⚠ docs/api-reference.md — last updated 90 days ago, code changed 12 days ago
  ⚠ docs/deployment.md    — last updated 120 days ago, code changed 30 days ago

Hidden Couplings:
  AuthService ↔ RateLimiter    (co-mentioned in 4 docs, no code link)
  UserService ↔ EmailProvider  (co-mentioned in 2 docs, no code link)
  ...

Undocumented Dependencies:
  src/auth/service.ts → src/crypto/hash.ts  (imported, never in docs)
  src/api/router.ts → src/middleware/cors.ts (imported, never in docs)
  ...
```

## Next Steps

- [Connections & Gaps](/docs/cari/connections/) — drill into specific entities
- [CI Drift Check](/docs/cari/check/) — automate checks in CI
