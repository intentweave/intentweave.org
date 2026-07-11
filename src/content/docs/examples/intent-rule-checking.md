---
title: Turn ADRs into Enforceable Code Rules
description: See how IntentWeave extracts Architectural Decision Records into rules.yaml and checks them in CI in milliseconds — no Neo4j or LLM required to enforce them.
---

## The Problem

Vibe-coding AI agents and busy developers can easily implement against architectural decisions. While standard CI tools catch formatting and linting errors, they don't catch deviations from architectural intent. IntentWeave bridges this gap by turning your Architectural Decision Records (ADRs) and conventions into enforceable code constraints—without requiring Neo4j or LLMs in your CI pipeline.

## 1. Extract and Enforce ADRs

Translate intent from plain-text markdown and check it in CI milliseconds later.

### Extracting Rules

Use an LLM provider to extract explicit architectural constraints from a plain-text ADR document and save them locally to `.iw/rules.yaml`:

```bash
# LLM-assisted: Extract architectural constraints from an ADR into .iw/rules.yaml
iw index rules-extract docs/ADR-003.md --provider openai --output .iw/rules.yaml
```

**Key Options:**
* `--provider <name>`: LLM provider to use (e.g. `openai`).
* `--output <path>`: Where to save the output rules (defaults to `.iw/rules.yaml`).

### Checking Rules in CI

Validate if the codebase violates any of the extracted architectural rules in milliseconds, perfectly suited for incremental CI workflows:

```bash
# CI Validation: Check if the codebase violates any architectural rules
iw index rules-check --changed src/auth.ts --severity high --format text
```

**Key Options:**
* `--changed <files>`: Comma-separated list of changed files (incremental CI mode).
* `--severity <level>`: Minimum severity to report: `high`, `medium`, or `low` (default: `low`).
* `--rule-id <id>`: Only check a specific rule by its ID.
* `--config <path>`: Path to rules.yaml (default: `.iw/rules.yaml`).
* `--limit <n>`: Maximum violations to report.
* `--format <format>`: Output format: `text` or `json`.

## 2. Architecture Diagram Validation

Let the diagram *be* the specification. Extract component flows directly from Mermaid or ASCII diagrams in your markdown files and validate them against actual code imports. 

### Validate on-the-fly via Scanning

```bash
# Validate AST imports against flows found in diagrams directly
iw index arch-check --from-scan docs/ARCHITECTURE.md --provider openai --strict
```

**Key Options:**
* `--from-scan <paths>`: Scan markdown files for diagrams and interpret via LLM directly (no prior enrichment needed).
* `--provider <name>`: LLM provider for `--from-scan` (`openai` or `smart-mock`).
* `--strict`: Fail on undocumented flows. Exits with code 1 even if there are no violation matches but flows exist in code that are missing from the diagram.
* `--refresh`: Re-run the LLM scan even if a valid cache exists.
* `--config <path>`: Path to a manual `architecture.yaml` definition if skipping diagrams.

### Validate using pre-computed Diagrams

If you are already running Layer 2 Semantic Enrichment (`iw index enrich`), you can skip the LLM call entirely during the checks:

```bash
# Validate using pre-extracted diagram triples hidden inside your local index.db
iw index arch-check --from-diagrams
```

## 3. Built-in Intent Enforcements (Zero Config)

No LLM or config file is required for these commands. These built-in rules run via lightning-fast AST queries natively against the code index database.

### Deprecated Callers

Find active components ignoring `@deprecated` signals so you can finally delete old code safely.
```bash
iw index deprecated-callers --limit 50
```

### Internal Violations

Enforce `@internal` and `_` prefix visibility across package boundaries in monorepos. Prevent hidden coupling.
```bash
iw index internal-violations --changed src/ --no-underscore
```
* `--no-jsdoc`: Skip JSDoc enforcement.
* `--no-underscore`: Skip `_prefix` convention enforcement.

### Type Assertions Bypassed

Track down `as any` casts and double-casts specifically in files with high downstream dependency (high fan-in risk).
```bash
iw index type-assertions --kind as_any --risk-sort
```
* `--kind <kind>`: Filter by `as_any`, `double_cast`, `angle_cast`, or `as_cast`.
* `--risk-sort`: Sort by file fan-in (highest risk files appear first!).

### Test-Intent Drift

Catch test suites that have drifted from reality by detecting when their descriptions refer to code symbols that no longer exist or have been renamed.
```bash
iw index test-intent --format json
```

## Integrating With Copilot

All enforcement commands are exposed via IntentWeave's MCP server (`packages/cli/src/mcp/server.ts`)
so Copilot can interact with them while you code:

| MCP Tool | CLI Equivalent | What Copilot Can Do |
|----------|----------------|---------------------|
| `cari_arch_check` | `iw index arch-check` | Validate that new flows you're adding match the architecture diagram |
| `cari_rules_check` | `iw index rules-check` | Guard open files against ADR violations before you commit |
| `cari_deprecated_callers` | `iw index deprecated-callers` | Automatically find and clean up callers of deprecated symbols |
| `cari_internal_violations` | `iw index internal-violations` | Prevent hidden coupling across package boundaries |
| `cari_test_intent` | `iw index test-intent` | Detect test suites drifted from the functions they describe |

To enable this, add IntentWeave to your MCP configuration (see [MCP Setup](/docs/integrations/mcp/)).
Once connected, you can ask Copilot questions like:

```
@workspace Does this change violate any ADRs?
@workspace Are there deprecated callers I should fix in src/auth/?
@workspace Does the new flow in auth.ts match the architecture diagram?
```
