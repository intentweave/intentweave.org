---
title: IntentWeave vs. ArchUnitTS
description: How IntentWeave's Rules Catalog compares to ArchUnitTS, the TypeScript architecture testing library — and when it makes sense to use both.
---

import { Aside } from '@astrojs/starlight/components';

# IntentWeave vs. ArchUnitTS

<Aside type="note">
This page is maintained by the IntentWeave team. ArchUnitTS is a genuinely well-built library —
we've tried to represent it fairly. If something here is inaccurate or out of date,
[open an issue](https://github.com/intentweave/intentweave/issues).
</Aside>

**TL;DR:** ArchUnitTS is the most widely-adopted TypeScript architecture *testing* library —
your architecture rules live as tests in Jest/Vitest/Mocha, alongside classic software metrics
(cohesion, coupling, instability) that IntentWeave doesn't currently expose. IntentWeave overlaps
on layer and dependency rules, but adds AST-level pattern rules with taint tracking, behavioral
rules checked against your real call graph, doc↔code drift detection, ADR extraction, and RAG
context for AI coding agents — none of which are in ArchUnitTS's scope. If you want architecture
rules that run as ordinary tests with rich OO metrics, ArchUnitTS is a strong, proven choice. If
you also want violations caught that never show up in the import graph — or your docs and ADRs
enforced, not just described — that's where IntentWeave adds a layer on top.

## What ArchUnitTS does well

ArchUnitTS is the most-starred TypeScript architecture testing library, and it earns that
position:

- **Runs as ordinary tests.** Rules are written against your existing test framework — Jest,
  Vitest, Jasmine, Mocha, or anything else — with a `toPassAsync()` matcher. No separate CLI step,
  no separate CI job to wire up; architecture checks live next to your other tests.
- **Real software metrics.** LCOM (cohesion), cyclomatic complexity, coupling factor, abstractness,
  instability, and distance from the main sequence — the classic Robert Martin-style OO metrics —
  are built in. IntentWeave doesn't currently expose this metric set.
- **Empty test protection.** If a rule's file pattern matches nothing — usually because of a typo —
  ArchUnitTS fails the test instead of silently "passing" on zero files. A small but genuinely
  smart default.
- **Native Nx support.** Built-in validation against Nx project graphs, boundaries, and naming
  conventions, for teams already on Nx.
- **Diagram-vs-code validation.** Slice-based rules can be checked against a PlantUML diagram, so
  the diagram documents *and* enforces the layering — conceptually close to what IntentWeave does
  for Mermaid diagrams, just checked against the import graph rather than the call graph.
- **Class-level rules, not just files.** Beyond import relationships between files, class-based
  rules can check dependencies between classes and their members — a level deeper than pure
  import-path matching.

If "architecture rules as tests, with real OO metrics, inside the framework I already use" is what
you need, ArchUnitTS does that well and is already used in production at multiple companies.

## Where IntentWeave goes further

ArchUnitTS's class-based rules go beyond plain imports, but they're still fundamentally
**dependency** rules — checking *whether* one class or file depends on another. They don't reach
into what a function's body actually *does*: which specific properties it reads, which functions
it calls with which arguments, or whether a value derived from a forbidden source gets used two
lines later through a local variable.

```ts
// apps/ui/src/components/ItemCard.tsx
import { formatDate } from "../utils"; // ✅ legal import/dependency — ArchUnitTS is satisfied

// but inside the function body:
const path = item.resource.path;       // ❌ UI reaching into internal fields —
const label = path.split("/").pop();   //    and using it two lines later —
                                        //    both invisible to dependency-based rules
```

IntentWeave's rules engine adds:

- **AST-level rule types with taint tracking** — `property_access`, `call`, `symbol_name`,
  `variable_assignment`, and intra-function `taint_propagation`, so a forbidden access is still
  flagged even after it's assigned to a local variable and used indirectly.
- **Custom graph queries** — a `cypher` rule type runs CypherLite queries directly against
  IntentWeave's SQLite index for checks no built-in rule type can express, without Neo4j.
- **Diagrams checked against the call graph, not just the import graph** — IntentWeave validates
  Mermaid *sequence* diagrams against which functions actually call which, in what order —
  narrower than ArchUnitTS/ts-arch's PlantUML slice-diagram checks, which validate component-level
  dependency direction rather than call sequencing.
- **Doc↔code grounding and drift detection** — ArchUnitTS has no concept of documentation.
  IntentWeave grounds every doc mention to real exported symbols and flags docs referencing code
  that's since changed.
- **ADR extraction (optional LLM step)** — `iw index rules-extract` drafts a `rules.yaml` straight
  from a written ADR, instead of every rule being hand-written as a test.
- **RAG context for AI coding agents** — `iw index context-pack` hands Copilot/Claude a
  token-budgeted, ranked bundle of files, rules, and doc drift — entirely outside what an
  architecture *testing* library is designed to do.

## Rule syntax, side by side

Same rule — "the domain layer must never depend on infrastructure" — in both tools:

**ArchUnitTS** (as a Jest test):

```ts
import { projectFiles } from 'archunit';

it('domain should not depend on infrastructure', async () => {
  const rule = projectFiles()
    .inFolder('src/domain')
    .shouldNot()
    .dependOnFiles()
    .inFolder('src/infrastructure');
  await expect(rule).toPassAsync();
});
```

**IntentWeave** (`.iw/rules.yaml`):

```yaml
rules:
  - id: no-domain-to-infrastructure
    severity: high
    forbidden:
      - type: import_pattern
        pattern: "src/infrastructure/**"
        in: "src/domain/**"
```

This is the domain where the two genuinely overlap most. The difference shows up once you need a
rule about what code *does*, not just what it imports — that's outside ArchUnitTS's vocabulary
today.

## Feature comparison

| Capability | ArchUnitTS | IntentWeave |
|---|:---:|:---:|
| Import/layer boundary rules | ✅ | ✅ |
| Circular dependency detection | ✅ | ✅ |
| Class/member-level dependency rules | ✅ | Partial — via `call`/`property_access` rule types, different mechanism |
| Classic OO metrics (LCOM, coupling, instability, distance from main sequence) | ✅ | ❌ |
| Empty-match test protection | ✅ | — |
| Nx-native project graph support | ✅ | Generic monorepo/alias support (tsconfig paths, Webpack, Docusaurus) |
| Diagram-vs-code validation | ✅ (PlantUML vs. import graph) | ✅ (Mermaid vs. import graph *and* vs. call graph) |
| AST-level rules with taint tracking | Limited (class-member deps only) | ✅ |
| Custom graph queries (Cypher-style, no Neo4j) | ❌ | ✅ |
| Doc↔code grounding & drift detection | ❌ | ✅ |
| ADR → rules extraction (LLM-assisted) | ❌ | ✅ (optional) |
| RAG context for AI coding agents | ❌ | ✅ |
| Runs as | Tests in your existing framework | Dedicated CLI step in CI |
| Free, local, no LLM required for core | ✅ | ✅ |

## Can I use both?

Yes — they solve overlapping but not identical problems, and run differently (tests vs. a CLI
step), so there's no real conflict. Some teams keep ArchUnitTS for layer rules that live naturally
next to their existing test suite, especially where the OO metrics or Nx integration matter, and
add IntentWeave for AST/taint rules, behavioral call-graph checks, doc drift, and RAG context.

## Try it in 30 seconds

```bash
npm install -g @intentweave/cli
cd your-project
iw init
iw index build          # < 3 seconds, zero API calls
```

See the [Rules Catalog live on IntentWeave's own repo](https://intentweave.org/examples/live-rules-catalog/),
or read the [Semantic Rule Checking reference](https://intentweave.org/docs/cari/semantic-rules/) for
the full rule-type list.