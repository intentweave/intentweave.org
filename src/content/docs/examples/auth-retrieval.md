---
title: "Example: Auth Topic Retrieval"
description: Finding all files related to authentication using iw index retrieve.
---

## Scenario

You're new to a project and need to understand the authentication system.
Instead of grepping through hundreds of files, you ask CARI.

## Run It

```bash
iw index retrieve "authentication"
```

## Output

```
 1. src/auth/service.ts       (0.95)
    ├─ 12 annotations (AuthService class, login(), verify())
    ├─ Symbol: AuthService (exported class)
    └─ Reason: primary auth implementation

 2. docs/auth.md              (0.92)
    ├─ 18 mentions (AuthService, JwtValidator, session handling)
    └─ Reason: primary documentation for auth subsystem

 3. src/auth/jwt.ts           (0.78)
    ├─ 6 annotations (JwtValidator, signToken, verifyToken)
    ├─ Co-occurs with AuthService in 4 docs
    └─ Reason: JWT token handling, closely related

 4. src/middleware/guard.ts    (0.52)
    ├─ 3 annotations (authGuard, requireAuth)
    ├─ Co-changed with auth/service.ts (jaccard: 0.45)
    └─ Reason: middleware that calls AuthService

 5. test/auth.test.ts         (0.41)
    ├─ Co-changes with auth/service.ts (15 commits)
    └─ Reason: test file for auth
```

## What Makes This Better Than grep

`grep "auth"` would return every file containing the string "auth", including
imports, comments, and unrelated matches. No ranking, no context.

CARI combines:
- **Code structure** — knows AuthService is a class, `login()` is a method
- **Document semantics** — knows docs/auth.md is about authentication, not just mentions it
- **Git history** — knows test/auth.test.ts always changes with auth/service.ts
- **Co-occurrence** — knows JwtValidator is closely related to AuthService

## Try It Yourself

```bash
cd your-project
iw init && iw index build
iw index retrieve "your-topic-here"
```
