---
title: Semantic Rule Checking
description: Enforce architectural decisions at the AST level — property access chains, function calls, symbol names, import patterns, and custom Cypher queries — without Neo4j or runtime overhead.
---

import { Aside, Code, Tabs, TabItem } from '@astrojs/starlight/components';

## What Is a Semantic Rule?

CARI's `layers-check` and `boundary-violations` commands detect violations in the **import graph** — which module imports which. Semantic rules go one level deeper: they detect violations in the **AST** of each file — what a module _does_ inside its own code.

```
Import-graph violations (layers-check):
  File A  ──imports──►  File B     ← edge in the import graph

Semantic violations (rules-check):
  File A  ──accesses──► item.resource.path   ← property access chain
  File A  ──calls─────► parseRef()           ← function invocation
  File A  ──defines───► itemsById Map        ← forbidden symbol pattern
  File A  ──imports───► packages/data/**     ← import path pattern
```

This matters because **import boundaries can be clean while the code still violates architectural intent**. A UI component that accesses `item.resource.path` and applies domain parsing logic may have legal imports — but it's doing resolver work that belongs in the adapter layer.

## Quick Start

```bash
# Extract rules from an ADR
iw index rules-extract docs/ADR-003.md --provider openai --output .iw/rules.yaml

# Check the codebase
iw index rules-check

# CI: only changed files, only high severity
iw index rules-check --changed src/auth.ts --severity high --format json
```

## The `rules.yaml` File

Rules live in `.iw/rules.yaml` (or the path given to `--config`):

```yaml
version: 1

# Optional: explicit allowed layer flows for the prescriptive diagram (§17.2)
allowed:
  - from_layer: apps/ui
    to_layer: apps/api
    description: "UI may call the API gateway"

rules:
  - id: no-internal-field-access-in-ui
    description: "UI components must not access internal resource fields directly"
    adr: ADR-001
    severity: high
    forbidden:
      - type: property_access
        chain: "**.resource.path"
        in: "apps/ui/src/components/**"
```

### Top-Level `allowed:` Block

When present, the `allowed:` list declares which layer-to-layer flows are explicitly sanctioned.
This powers the green arrows in the [Prescriptive Architecture Diagram](#prescriptive-architecture-diagram).
When absent, the diagram derives permitted flows from layer order automatically.

| Field | Required | Description |
|-------|----------|-------------|
| `from_layer` | yes | Source layer name (must match a layer in `.iw/layers.yaml` or inferred) |
| `to_layer` | yes | Destination layer name |
| `description` | no | Rationale shown in the CLI and diagram hover panel |

## Rule Types

Each rule has one or more `forbidden` clauses. Every clause has a `type`:

### `import_pattern` — Forbidden Import Paths

Flags any import whose resolved path matches the given glob.

```yaml
- id: no-ui-to-db
  severity: high
  forbidden:
    - type: import_pattern
      pattern: "packages/data/**"   # glob matched against the imported file path
      in: "apps/ui/**"              # only check these files
```

This is the only type that works without full AST extraction — it uses the existing import graph.
Use it when the ADR says "layer X must never import layer Y".

| Field | Description |
|-------|-------------|
| `pattern` | Glob matched against the imported file path |
| `in` | Restrict to files matching this glob |
| `except` | Whitelist files that are allowed to break the rule |
| `target_layer` | Only flag if the imported file belongs to this named layer (prevents false positives when path patterns overlap across packages) |

---

### `property_access` — Forbidden Property Chains

Flags any access to a property chain matching the pattern (e.g. `item.resource.path`).

```yaml
- id: no-internal-field-access-in-ui
  severity: high
  forbidden:
    - type: property_access
      chain: "**.resource.path"    # glob-style chain matcher; ** matches any prefix
      in: "apps/ui/src/**"
      except: "apps/ui/src/adapters/**"
```

Chains are extracted from the AST: `member_expression` nodes deeper than 2 levels are
recorded in the `property_accesses` table with their full chain.

| Field | Description |
|-------|-------------|
| `chain` | Glob pattern matched against the full property chain (e.g. `**.source.path`) |
| `in` | Restrict to files matching this glob |
| `except` | Whitelist files or directories |
| `except_pattern` | Whitelist accesses whose _enclosing symbol name_ matches this regex |
| `taint_propagation` | `true` to track variables assigned from this chain (§16.1) |

---

### `call` — Forbidden Function Calls

Flags any call to a function whose name matches the pattern.

```yaml
- id: no-parse-path-in-ui
  severity: high
  forbidden:
    - type: call
      callee: "parseCategory|parsePath|normalizeRef"  # pipe-separated names or regex
      in: "apps/ui/src/**"
```

Combine with `context_access` to only flag calls that co-occur with a forbidden property access:

```yaml
- id: no-regex-on-source-metadata
  severity: high
  forbidden:
    - type: call
      callee: "match|exec"
      in: "apps/**"
      context_access: "**.resource.path"  # only flag when .resource.path is accessed nearby
```

| Field | Description |
|-------|-------------|
| `callee` | Pipe-separated name list or regex |
| `in` | Restrict to files matching this glob |
| `except` | Whitelist files |
| `context_access` | Only flag when co-located with an access chain matching this pattern |
| `taint_propagation` | `true` to track calls on variables assigned from a tainted source (§16.1) |

---

### `symbol_name` — Forbidden Symbol Declarations

Flags any symbol (variable, constant, function, class) whose name matches the pattern.

```yaml
- id: no-entity-map-in-views
  severity: medium
  forbidden:
    - type: symbol_name
      pattern: "itemsById"            # exact name or regex
      in: "apps/ui/src/components/**"
```

Use `scope` to restrict to only exported or top-level symbols:

```yaml
- id: no-exported-helpers-in-views
  severity: low
  forbidden:
    - type: symbol_name
      pattern: ".*Helper$"
      in: "apps/ui/src/**"
      scope: exported               # exported | top-level | any (default: any)
```

| Field | Description |
|-------|-------------|
| `pattern` | Name pattern (exact or regex) |
| `in` | Restrict to files matching this glob |
| `scope` | `exported`, `top-level`, or `any` (default) |

---

### `cypher` — Custom Graph Queries (CypherLite)

Run a custom Cypher query against the CARI SQLite graph. Returns one row per violation.
The query must return columns `file`, `line`, and `detail`.

```yaml
- id: no-untested-public-api
  description: "Exported functions in packages/ must have a corresponding test"
  severity: medium
  forbidden:
    - type: cypher
      query: >
        MATCH (s:Symbol {kind: 'function', exported: true})
        WHERE s.file STARTS WITH 'packages/'
        AND NOT EXISTS {
          MATCH (t:Symbol) WHERE t.file CONTAINS '/test/' AND t.name CONTAINS s.name
        }
        RETURN s.file AS file, s.line AS line, s.name AS detail
```

CypherLite supports a subset of Cypher syntax directly against the SQLite schema — no Neo4j required. Use this for custom cross-table checks that the built-in types cannot express.

---

### `variable_assignment` — Forbidden Assignment Patterns

Flags variable assignments where the right-hand side matches a pattern.

```yaml
- id: no-hardcoded-base-url
  severity: medium
  forbidden:
    - type: variable_assignment
      rhs_pattern: "https?://[^/]+\\.(prod|staging)\\.example\\.com"
      in: "src/**"
      except: "src/config/**"
```

---

### `property_chain_length` — Overly Deep Property Access

Flags any property chain access exceeding a maximum depth.

```yaml
- id: no-deep-access-in-ui
  description: "Warn when UI accesses deeply nested properties (often a layering smell)"
  severity: low
  forbidden:
    - type: property_chain_length
      max_length: 4                  # flag chains with more than 4 segments
      in: "apps/ui/src/components/**"
```

---

## Rule Options

### `taint_propagation` — Track Values Through Variable Assignments

When a forbidden `property_access` or `call` result is stored in a local variable, the violation can silently escape detection if only the original expression is checked. Enable `taint_propagation: true` to have CARI follow **intra-function def-use chains** and flag any subsequent access or call through tainted variables.

```yaml
- id: no-internal-field-access-in-ui
  severity: high
  forbidden:
    - type: property_access
      chain: "**.resource.path"
      in: "apps/ui/src/**"
      taint_propagation: true   # also flag uses of vars assigned from .resource.path
```

Without taint propagation, this code is not flagged:

```typescript
// apps/ui/src/components/ItemCard.tsx
const path = item.resource.path;     // direct access — flagged ✓
const label = path.split("/").pop(); // indirect use — NOT flagged without taint_propagation
```

With `taint_propagation: true`, the assignment `const path = item.resource.path` taints the
variable `path`, and any subsequent `property_access` or `call` on `path` within the same function
is also reported as a violation.

```
FAIL  no-internal-field-access-in-ui [high]
  apps/ui/src/components/ItemCard.tsx:4   item.resource.path  (direct)
  apps/ui/src/components/ItemCard.tsx:5   path.split          (taint: path ← item.resource.path)
```

Taint tracking is **intra-function only** — it does not follow values across function boundaries or
module exports. For inter-procedural analysis, combine with a `call` rule that targets the function
that consumes the tainted value.

<Aside type="note">
Taint propagation applies to `property_access` and `call` forbidden clauses only. It has no effect
on `import_pattern`, `symbol_name`, `variable_assignment`, `property_chain_length`, or `cypher`
types.
</Aside>

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `taint_propagation` | boolean | `false` | Follow intra-function def-use chains from the forbidden expression |

---

### `count_mode` — Deduplication

By default, each occurrence in a file counts as a separate violation. Use `count_mode: per_file`
to report at most one violation per file:

```yaml
- id: no-any-cast-in-services
  severity: low
  count_mode: per_file              # at most one violation per file (not per occurrence)
  forbidden:
    - type: symbol_name
      pattern: "as any"
      in: "packages/services/**"
```

### `autofix` — Suggested Fixes

Attach a human-readable fix hint that appears in `rules-check` output and JSON reports:

```yaml
- id: no-source-path-in-ui
  severity: high
  autofix:
    suggestion: "Use entity.properties.displayPath instead of entity.source.path"
    docs_url: "https://example.com/adr/ADR-003#resolver-layer"
  forbidden:
    - type: property_access
      chain: "**.source.path"
      in: "apps/ui/**"
```

### `expresses` — Visualization Intent

A rule may carry an `expresses` block to define **named components and their flows** for the
[Prescriptive Architecture Diagram](/docs/cari/prescriptive-diagram/). These are visualization-only
rules — they produce no CI violations.

```yaml
- id: adr003-provider-adapter-flow
  description: "Intended ADR-003 pipeline: Providers → Adapters → Pipeline Workers"
  adr: ADR-003
  severity: low
  expresses:
    elements:
      - name: SourceProvider
        kind: component          # component | interface | service | store
        layer: "packages/providers"
      - name: AdapterParser
        kind: component
        layer: "packages/adapters"
      - name: PipelineWorker
        kind: component
        layer: "packages/pipeline"
    flows:
      - from: SourceProvider
        to: AdapterParser
        policy: allowed
        kind: data
      - from: AdapterParser
        to: PipelineWorker
        policy: allowed
        kind: control
  forbidden: []                  # explicit empty — no CI enforcement
```

Combine `expresses` with a real `forbidden` clause to both visualize intent _and_ enforce it:

```yaml
- id: no-ui-to-db
  expresses:
    elements:
      - name: UILayer
        kind: component
        layer: "apps/ui"
      - name: DatabaseLayer
        kind: component
        layer: "packages/data"
    flows:
      - from: UILayer
        to: DatabaseLayer
        policy: forbidden
  forbidden:
    - type: import_pattern
      pattern: "packages/data/**"
      in: "apps/ui/**"
```

## Checking Rules

### CLI

```bash
# Check all rules, all files
iw index rules-check

# ASCII conformance diagram (default) — omit with --no-diagram
iw index rules-check --no-diagram

# CI: only changed files, only high severity, JSON output
iw index rules-check --changed src/auth.ts,src/data/repo.ts \
  --severity high --format json

# Check a single rule by ID
iw index rules-check --rule-id no-source-path-in-ui

# Use a custom config path
iw index rules-check --config infra/rules.yaml
```

### CLI Output — ASCII Conformance Diagram

By default `rules-check` prints an ASCII conformance diagram summarising the layer topology:

```
  Architecture Conformance

  [OK]   apps/ui ──✓──▶ apps/api          UI may call the API gateway
  [OK]   apps/api ──✓──▶ packages/services API may use domain services
  [HIGH] apps/ui ─────▶ packages/data     no-ui-to-db: 3 violation(s)
         ● no-service-names-in-ui [MED]

  15/17 rules clean · 3 total violation(s)
```

Suppress the diagram with `--no-diagram` for minimal CI output.

### CLI Options

| Flag | Default | Description |
|------|---------|-------------|
| `--config <path>` | `.iw/rules.yaml` | Path to rules.yaml |
| `--changed <files>` | *(all files)* | Comma-separated changed file list for incremental CI |
| `--severity <level>` | `low` | Minimum severity: `high`, `medium`, or `low` |
| `--rule-id <id>` | *(all rules)* | Check only a specific rule |
| `--limit <n>` | `100` | Maximum violations to report |
| `--format <fmt>` | `text` | Output format: `text` or `json` |
| `--no-diagram` | *(off)* | Suppress the ASCII conformance diagram |
| `--db <path>` | *(auto)* | Path to index.db |

## Extracting Rules from ADRs

Use `rules-extract` to have an LLM read your ADRs and draft a `rules.yaml`:

```bash
# Basic extraction — forbidden rules only
iw index rules-extract docs/ADR-003.md --provider openai --output .iw/rules.yaml

# Also synthesize allowed: entries from ADR prose (§17.3)
iw index rules-extract docs/ADR-003.md docs/ADR-005.md \
  --provider openai \
  --output .iw/rules.yaml \
  --with-allowed

# Also extract architectural layer hints
iw index rules-extract docs/ADR-003.md \
  --provider openai \
  --output .iw/rules.yaml \
  --with-allowed \
  --with-layer-hints \
  --layers-output .iw/layers.hints.yaml

# Append newly found rules without overwriting existing ones
iw index rules-extract docs/ADR-006.md --provider openai \
  --output .iw/rules.yaml --append
```

### `rules-extract` Options

| Flag | Default | Description |
|------|---------|-------------|
| `--provider <name>` | `openai` | LLM provider: `openai` or `smart-mock` |
| `--model <name>` | `gpt-4o` | Model name |
| `--api-key <key>` | `$OPENAI_API_KEY` | API key override |
| `--output <path>` | *(stdout)* | Output path for the rules.yaml draft |
| `--append` | *(off)* | Append new rules, skipping duplicate IDs |
| `--with-allowed` | *(off)* | Also extract explicit allowed: permission entries |
| `--with-layer-hints` | *(off)* | Also extract architectural layer hints |
| `--layers-output <path>` | `.iw/layers.hints.yaml` | Output path for layer hints YAML |
| `-v, --verbose` | *(off)* | Show prompt and response details |

The extracted YAML is a draft — always review before committing. The LLM only emits
rules for constraints that are _explicitly stated_ in the ADR.

## Using in CI

```yaml
# .github/workflows/arch.yml
- name: Check architectural rules
  run: |
    iw index rules-check \
      --changed "${{ steps.changed.outputs.files }}" \
      --severity high \
      --format json > violations.json
    jq -e '.violations | length == 0' violations.json
```

See [GitHub Actions / CI](/docs/integrations/ci/) for a full workflow example.

## MCP Integration

`rules-check` is available as a Copilot tool:

| MCP Tool | Purpose |
|----------|---------|
| `cari_rules_check` | Check rules, optionally for changed files only |

```
@workspace Does this change violate any ADRs?
```

## Example: A Complete `rules.yaml`

```yaml
version: 1

allowed:
  - from_layer: apps/ui
    to_layer: apps/api
    description: "UI may call the API gateway"
  - from_layer: apps/api
    to_layer: packages/services
    description: "API handlers use domain service interfaces"
  - from_layer: packages/services
    to_layer: packages/data
    description: "Services access repositories"

rules:
  - id: no-ui-to-db
    description: "UI must never import the data layer directly"
    adr: ADR-003
    severity: high
    forbidden:
      - type: import_pattern
        pattern: "packages/data/**"
        in: "apps/ui/**"

  - id: no-source-path-in-ui
    description: "UI components must not access entity.source.path"
    adr: ADR-003
    severity: high
    autofix:
      suggestion: "Use entity.properties.displayPath instead"
    forbidden:
      - type: property_access
        chain: "**.source.path"
        in: "apps/ui/src/components/**"

  - id: no-ref-resolution-in-ui
    description: "UI components must not resolve $ref strings"
    adr: ADR-003
    severity: medium
    forbidden:
      - type: call
        callee: "refToId|idToName"
        in: "apps/ui/src/components/**"
      - type: property_access
        chain: "**.$ref"
        in: "apps/ui/src/components/**"
        except: "apps/ui/src/components/resolver/**"

  - id: no-entitybyid-in-views
    description: "entityById maps must not be built in view components"
    adr: ADR-003
    severity: medium
    forbidden:
      - type: symbol_name
        pattern: "entityById"
        in: "apps/ui/src/components/views/**"

  - id: adr003-pipeline-flow
    description: "Intended pipeline: Providers → Adapters → Workers (viz only)"
    adr: ADR-003
    severity: low
    expresses:
      elements:
        - { name: SourceProvider, kind: component, layer: "packages/providers" }
        - { name: AdapterParser,  kind: component, layer: "packages/adapters"  }
        - { name: PipelineWorker, kind: component, layer: "packages/pipeline"  }
      flows:
        - { from: SourceProvider, to: AdapterParser,  policy: allowed, kind: data    }
        - { from: AdapterParser,  to: PipelineWorker, policy: allowed, kind: control }
    forbidden: []
```

## Next Steps

- [Prescriptive Architecture Diagram](/docs/cari/prescriptive-diagram/) — visualize your rules as a layered SVG architecture report
- [Architecture Analysis](/examples/architecture-layers/) — layer inference, boundary checks, and the full architecture report
- [Ensure Intent in Code](/examples/intent-rule-checking/) — CI integration patterns
- [CLI Reference](/docs/reference/cli/) — full command documentation
