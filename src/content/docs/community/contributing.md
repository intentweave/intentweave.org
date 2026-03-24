---
title: Contributing
description: How to contribute to IntentWeave.
---

Thank you for considering contributing to IntentWeave!

## Project Philosophy

1. **OSS-first, vendor-neutral** — usable without proprietary dependencies
2. **Evidence over hallucination** — graph edges must be explainable and traceable
3. **Separation of stages** — explicit pipeline phases
4. **Profiles over forks** — domain-specific behavior in profiles, not hard-coded
5. **CLI is first-class** — everything automatable and CI-friendly

## How You Can Contribute

### Ideas & Discussions

- Architecture feedback
- Graph modeling questions
- LLM robustness insights

Use **GitHub Discussions** or open an issue.

### Bug Reports

Include:
- IntentWeave version / commit
- CLI command used
- Expected vs. actual behavior
- Minimal reproducible input

### Documentation

Docs improvements are always welcome — even small fixes.

### Code

Common areas:
- CLI commands
- CARI queries and scoring
- AST extraction for new languages
- LLM adapters
- Profile system
- Testing

## Getting Started

```bash
git clone https://github.com/intentweave/intentweave.git
cd intentweave
pnpm install && pnpm build
pnpm test
```

Use the dev wrapper for quick iteration:

```bash
./iw.sh index build
./iw.sh index retrieve "test"
```

## Contribution Guidelines

### Good Candidates

- Generic mechanisms
- Clear semantics
- Testable behavior
- Profile-driven extensions

### Please Avoid

- Hard-coded domain assumptions
- SaaS-only dependencies
- Behavior without traceability
- Untested changes

## CLA

All contributions require signing the [Contributor License Agreement](https://github.com/intentweave/intentweave/blob/main/CLA.md).

## License

IntentWeave is licensed under **Apache-2.0**.
