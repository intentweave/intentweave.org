---
title: Plugins & Capabilities
description: What each IntentWeave plugin adds, and how they combine.
---

IntentWeave ships a **lean core** that does everything with zero cost. Plugins add
capabilities on top — LLM intelligence, graph persistence, or language support.
Install only what you need.

## The Layers

| Layer | What You Get | Cost | Requirements |
|-------|-------------|------|-------------|
| **Core (CARI)** | 30+ query modes, architecture visualization, CI drift checks, clone detection, community detection, hub analysis, and more | $0 | Node ≥ 20, Git |
| **+ plugin-llm** | LLM-generated layer names, selective enrichment (diagram validation, decision tracking, contradiction detection) | Pay-per-use (OpenAI) | OpenAI API key |
| **+ plugin-kg-lite** | Cypher queries over a local SQLite-backed knowledge graph — no external database needed | $0 | _(none)_ |
| **+ plugin-kg** | Full Neo4j persistence, semantic queries, impact analysis, cross-document reasoning | $0 (self-hosted) | Neo4j 5 |
| **+ plugin-swift** | Swift AST extraction via tree-sitter | $0 | _(none)_ |
| **+ plugin-python** | Python AST extraction via tree-sitter | $0 | _(none)_ |

## Combinations Matrix

Each row is a use case. Columns show which plugins are needed. Core is always included.

| Use Case | Core | plugin-llm | plugin-kg-lite | plugin-kg |
|----------|:----:|:----------:|:--------------:|:---------:|
| **Ranked file retrieval** | ✅ | | | |
| **CI drift detection** | ✅ | | | |
| **Clone detection** (exact + structural) | ✅ | | | |
| **Circular import detection** | ✅ | | | |
| **Unused export detection** | ✅ | | | |
| **Community detection** (3 modes) | ✅ | | | |
| **Architecture layer inference** | ✅ | | | |
| **Interactive HTML report** | ✅ | | | |
| **Focused architecture view** | ✅ | | | |
| **Dependency depth analysis** | ✅ | | | |
| **Boundary violation checks** | ✅ | | | |
| **TODO/rationale inventory** | ✅ | | | |
| **Terminology consistency** | ✅ | | | |
| **Hub / god-node analysis** | ✅ | | | |
| **Cross-group drift** | ✅ | | | |
| **Doc completeness scoring** | ✅ | | | |
| **LLM-generated layer names** | ✅ | ✅ | | |
| **LLM-generated directory names** | ✅ | ✅ | | |
| **Diagram validation** *(planned)* | ✅ | ✅ | | |
| **Decision tracking** *(planned)* | ✅ | ✅ | | |
| **Contradiction detection** *(planned)* | ✅ | ✅ | | |
| **Config-to-docs sync** *(planned)* | ✅ | ✅ | | |
| **Local Cypher queries** | ✅ | | ✅ | |
| **Full semantic KG queries** | ✅ | | | ✅ |
| **Impact analysis** | ✅ | | | ✅ |
| **Cross-document reasoning** | ✅ | | | ✅ |
| **KG persistence** | ✅ | | | ✅ |
| **Enrichment + local KG** | ✅ | ✅ | ✅ | |
| **Enrichment + full KG** | ✅ | ✅ | | ✅ |

## Recommended Setups

### Solo developer, open-source project

```bash
iw index build                     # Core only — $0, < 3 seconds
iw index export --html             # architecture report
iw index check --changed $(git diff --name-only HEAD~1)
```

**Plugins needed:** none.

### Team with documentation standards

```bash
iw index build --depth full        # deeper annotation matching
iw index export --html --provider openai --model gpt-4o-mini
```

**Plugins needed:** `plugin-llm` (for readable layer/directory names in the report).

### Architecture review / tech debt audit

```bash
iw index build --depth full
iw index export --html --provider openai
iw index clones                    # find duplicated logic
iw index dep-depth                 # find deeply nested dependencies
iw index boundary-violations       # find cross-package leaks
iw index hubs                      # find god-nodes
```

**Plugins needed:** `plugin-llm` (optional, for named layers).

### Decision archaeology / knowledge management

```bash
iw run docs/*.md --track open --provider openai -i --persist -v
iw query "What decisions were made about authentication?"
iw impact src/auth/service.ts
```

**Plugins needed:** `plugin-llm` + `plugin-kg`.

## Installing Plugins

Plugins are auto-discovered from your `node_modules`. Install them as dev dependencies:

```bash
# LLM capability
npm install -D @intentweave/plugin-llm

# Local KG (Cypher over SQLite)
npm install -D @intentweave/plugin-kg-lite

# Full KG (Neo4j)
npm install -D @intentweave/plugin-kg

# Language support
npm install -D @intentweave/plugin-swift
npm install -D @intentweave/plugin-python
```

Verify what's loaded:

```bash
iw plugin list
```

No configuration files needed — plugins register their capabilities automatically via
the `PluginRegistry`.

## Plugin Architecture

```
┌─────────────────────────────────────────────────────┐
│                   PluginRegistry                     │
│                                                     │
│  Capabilities:                                      │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │   LLM    │  │ Persistence  │  │   Language    │ │
│  │          │  │              │  │               │ │
│  │plugin-llm│  │plugin-kg-lite│  │ plugin-swift  │ │
│  │          │  │  plugin-kg   │  │ plugin-python │ │
│  └──────────┘  └──────────────┘  └───────────────┘ │
│                                                     │
│  Discovery: scan node_modules for @intentweave/*    │
│  Registration: each plugin declares its capability  │
│  Resolution: CLI/API asks registry for capability   │
└─────────────────────────────────────────────────────┘
```

Three capability types, each with a clean interface:

- **LLMCapability** — text generation, entity extraction, naming
- **PersistenceCapability** — store/query knowledge graph triples
- **LanguageCapability** — AST extraction for a specific language
