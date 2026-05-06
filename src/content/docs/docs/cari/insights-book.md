---
title: Insights Book
description: A self-contained multi-chapter HTML architecture report — prescriptive diagram, per-ADR flow views, violations, coverage, living score, and code health — all in a single shareable file.
---

## What Is the Insights Book?

The **Insights Book** is a multi-chapter, self-contained HTML report that brings together
all of CARI's architecture intelligence in one interactive document. It combines:

- The [prescriptive architecture diagram](/docs/cari/prescriptive-diagram/) (intended layer topology)
- Per-ADR interactive flow diagrams
- A complete violations table with severity filtering
- Per-layer documentation coverage and hotspot files
- The [Living Documentation Score](/docs/cari/report/) (spec + consistency + freshness + arch conformance)
- Code health: clones, circular imports, boundary violations, unused exports

```bash
iw index build
iw index export --book
open insights-book.html
```

![Insights Book — sidebar navigation with Overview, ADR flow chapters, Violations, Coverage, Living Score, and Code Health](/screenshots/insights-book-view.png)

The output is a fully self-contained HTML file (~1–3 MB) with no external dependencies.
Share it with your team or commit it as a generated artifact in CI.

## Quick Start

```bash
# Minimal — just needs the index
iw index build
iw index export --book

# With living score and code health included
iw index export --book --with-score --with-health

# Custom output path
iw index export --book -o reports/architecture-book.html
```

## The Chapters

The sidebar divides the book into four sections. Each section is a group of chapters
navigated by clicking sidebar items.

### Overview

The **Overview** chapter shows a stat dashboard and embeds the full
[prescriptive architecture diagram](/docs/cari/prescriptive-diagram/) as an interactive
panel — the same SVG you get from `iw index export --prescriptive`, but embedded inline.

Stats shown:
- Total files and symbols indexed
- Rule violations (with red/green indicator)
- Layer violations
- Number of ADR chapters

### Control & Data Flow

One chapter per ADR rule that contains an `expresses` block. Each chapter shows an
interactive [Cytoscape.js](https://cytoscape.org/) diagram with:

- **Named components** (`expresses.elements`) as nodes
- **Directed flows** (`expresses.flows`) as edges — green for allowed, red dashed for forbidden
- Toggle overlays: actual import edges, violations, hotspot scores, hub degree
- Rule metadata: severity, ADR reference, description, violation count

Use the overlay toggles to compare **declared intent** against **observed behaviour**:

```
[x] Actual imports    — do real imports follow the declared flows?
[x] Violations        — which files breach this rule?
[ ] Hotspot score     — which components are high-churn?
[ ] Hub degree        — which components are architecturally central?
```

### All Violations

A severity-sorted table of every rule and layer violation in the codebase.
Filter by severity, sort by rule or file, and click any row to jump to the
per-ADR flow chapter for that rule.

Columns: rule ID · ADR · severity · file · line · detail · autofix hint

### Coverage

Per-layer documentation coverage derived from the annotation engine:
- What percentage of exported symbols in each layer are mentioned in docs?
- Which are the highest-urgency hotspot files (high churn, low coverage)?

The hotspot table is sorted by urgency score and shows churn count, coverage %, and
the layer the file belongs to.

### Living Score *(optional)*

When built with `--with-score`, a dedicated chapter shows the composite
[Living Documentation Score](/docs/cari/report/) — a 0–100 / A–F grade built from four dimensions:

| Dimension | Weight | What It Measures |
|-----------|--------|-----------------|
| **Spec coverage** | 35% | How many exported symbols are mentioned in documentation |
| **Consistency** | 25% | Whether the same symbol is named consistently across all docs |
| **Freshness** | 20% | Whether recently changed files still have current documentation |
| **Arch conformance** | 20% | Whether imports follow the declared layer and rule constraints |

### Code Health *(optional)*

When built with `--with-health`, a chapter showing:
- **Exact clones** — files with identical function body hashes
- **Structural clones** — type-2 clones (same control flow, different identifiers)
- **Circular imports** — import cycles and their length
- **Boundary violations** — cross-package internal imports
- **Unused exports** — exported symbols that are never imported

## CLI Options

```bash
iw index export --book [options]
```

| Flag | Default | Description |
|------|---------|-------------|
| `--book` | *(required)* | Generate the Insights Book |
| `--with-score` | *(off)* | Include the Living Documentation Score chapter |
| `--with-health` | *(off)* | Include the Code Health chapter |
| `--show-rule-elements` | *(off)* | Render `expresses.elements` chips in the embedded prescriptive diagram |
| `--rules-config <path>` | `.iw/rules.yaml` | Path to rules.yaml |
| `-o, --output <path>` | `insights-book.html` | Output file path |
| `--db <path>` | *(auto)* | Path to index.db |

## Using with Prescriptive Rules

The Insights Book uses the same `rules.yaml` and `layers.yaml` as the prescriptive diagram.
The per-ADR chapters are generated from rules that have an `expresses` block:

```yaml
# .iw/rules.yaml
rules:
  - id: adr003-pipeline-flow
    description: "Intended ADR-003 pipeline: Providers → Adapters → Workers"
    adr: ADR-003
    severity: low
    expresses:
      elements:
        - name: SourceProvider
          kind: component
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
    forbidden: []
```

A rule without `expresses` still appears in the **All Violations** chapter (if it has violations)
but does not get its own per-ADR flow chapter.

## Example: CI Artifact

Generate the book as a CI artifact and attach it to every PR:

```yaml
# .github/workflows/arch.yml
- name: Generate Insights Book
  run: |
    iw index build
    iw index export --book \
      --with-score \
      --with-health \
      -o architecture-book.html

- name: Upload Insights Book
  uses: actions/upload-artifact@v4
  with:
    name: architecture-book
    path: architecture-book.html
    retention-days: 30

- name: Check Living Score
  run: |
    iw verify --score --format json > score.json
    # Fail CI if grade is below C (score < 60)
    node -e "const s=require('./score.json'); process.exit(s.score < 60 ? 1 : 0)"
```

## Comparison: Book vs. Other Reports

| Report | Command | What it shows |
|--------|---------|--------------|
| **Full architecture** | `iw index export --html` | Inferred layers, community clusters, actual import graph |
| **Focused view** | `iw index export --focus <target>` | N-hop neighbourhood around one file or symbol |
| **Prescriptive diagram** | `iw index export --prescriptive` | Declared intent — allowed/forbidden flows |
| **Insights Book** | `iw index export --book` | All of the above, plus violations, coverage, living score, and code health in one file |

The Insights Book is the most comprehensive output and the right choice for sharing with
stakeholders, architecture reviews, or quarterly health checks.

## Next Steps

- [Prescriptive Architecture Diagram](/docs/cari/prescriptive-diagram/) — understand the embedded SVG
- [Semantic Rule Checking](/docs/cari/semantic-rules/) — write rules that generate per-ADR flow chapters
- [Health Report](/docs/cari/report/) — run the living score without the full book
- [CI Drift Check](/docs/cari/check/) — gate CI on rule conformance
