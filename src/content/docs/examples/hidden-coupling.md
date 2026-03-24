---
title: "Example: Hidden Coupling"
description: Discovering relationships that code doesn't formalize using connections + gaps.
---

## Scenario

Your architecture docs mention that `AuthService` and `RateLimiter` work together.
But in the code, there's no import between them. Is the documentation wrong,
or is there a hidden coupling that exists through shared middleware?

## Run It

```bash
iw index connections "AuthService"
```

## Output

```
Co-mentioned in docs:
  JwtValidator     (0.72, in 4 docs)
  RateLimiter      (0.45, in 2 docs)
  SessionManager   (0.38, in 3 docs)

Co-changes in git:
  src/auth/jwt.ts             (jaccard: 0.68, 15 commits)
  src/middleware/rate-limit.ts (jaccard: 0.22, 4 commits)
  src/session/manager.ts      (jaccard: 0.12, 2 commits)

Code imports:
  JwtValidator  (direct import in service.ts)

⚠ Gaps:
  RateLimiter
    ├─ Co-mentioned in 2 docs with AuthService
    ├─ Co-changed in git 4 times
    └─ NO code import → hidden coupling?

  SessionManager
    ├─ Co-mentioned in 3 docs with AuthService
    ├─ Rarely co-changed (2 times)
    └─ NO code import → possibly stale reference
```

## Analysis

### RateLimiter — Real Hidden Coupling

Three signals point to a relationship:
1. **Docs** mention them together (2 documents)
2. **Git** shows they change together (4 times)
3. **Code** has no direct import

This is likely a real dependency mediated through shared middleware or
configuration. The docs are correct — the code just doesn't make the
relationship explicit. Consider:
- Adding an explicit import or interface
- Documenting the middleware chain that connects them

### SessionManager — Possibly Stale

Only one signal is strong:
1. **Docs** mention them together (3 documents)
2. **Git** rarely changes together (only 2 times)
3. **Code** has no import

This might be an outdated documentation reference. The docs describe a
relationship that no longer exists in practice.

## The Value of Gaps

Most tools show you what **is** connected. CARI also shows you what
**should be** connected (according to docs and git) but **isn't**
(according to code). These mismatches are often the most valuable findings.

## Try It Yourself

```bash
cd your-project
iw init && iw index build
iw index connections "YourClassName"
```
