---
title: Copilot / MCP Integration
description: Use CARI tools directly in VS Code via GitHub Copilot.
---

## What Is MCP?

The **Model Context Protocol** (MCP) lets AI agents like GitHub Copilot call
external tools. IntentWeave exposes its index queries as MCP tools, so Copilot
can search your code index, find connections, and check drift — all from chat.

Prefer an agent that reads files and runs shell commands instead of connecting to a
tool server (Claude Code, Cursor)? See the [Agent Skill](/docs/integrations/agent-skill/)
page instead — same underlying `iw` CLI, no running MCP server required.

## Setup

### 1. Start the MCP server

```bash
iw mcp --session my-project -v
```

### 2. Configure VS Code

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "intentweave-kg": {
      "command": "npx",
      "args": ["@intentweave/cli", "mcp", "--session", "my-project", "-v"]
    }
  }
}
```

VS Code Copilot will auto-discover the server and make the tools available in chat.

## CARI Tools

These tools work with the local SQLite index — no Neo4j or LLM needed.

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `cari_retrieve` | Ranked file retrieval by topic or symbol | `query`, `scope?`, `limit?` |
| `cari_connections` | Cross-layer connections + gap detection | `entity`, `include?`, `limit?` |
| `cari_check` | CI drift detection for changed files | `changed`, `severity?` |
| `cari_clones` | Exact code clone detection | _(none)_ |
| `cari_structural_clones` | Type 2 clone detection | _(none)_ |
| `cari_circular_imports` | Import cycle detection | _(none)_ |
| `cari_unused_exports` | Unused exported symbols | `limit?` |
| `cari_hotspot_priority` | High-churn low-doc file ranking | `limit?` |
| `cari_todos` | TODO/FIXME/HACK/XXX inventory | `kind?`, `limit?` |
| `cari_module_coverage` | Documentation coverage per directory | _(none)_ |
| `cari_orphaned_sections` | Doc sections with ungrounded mentions | _(none)_ |
| `cari_doc_completeness` | Per-doc completeness scoring | _(none)_ |
| `cari_cross_group_drift` | Cross-group entity coverage conflicts | _(none)_ |
| `cari_mentions_of` | Entity → doc mentions | `entityId`, `minConfidence?`, `limit?` |
| `cari_annotations_for` | File → all annotations | `filePath`, `minConfidence?`, `limit?` |
| `cari_test_coverage` | Test→source mapping + gaps | `limit?` |
| `cari_hubs` | God-node / hub analysis | `limit?` |
| `cari_communities` | Community detection (3 modes) | `mode?`, `resolution?`, `limit?` |
| `cari_surprises` | Surprising connection ranking | `limit?` |
| `cari_rationale` | WHY/NOTE/IMPORTANT/DESIGN inventory | `kind?`, `limit?` |
| `cari_terminology` | Terminology inconsistency detection | `limit?` |
| `cari_dep_depth` | Transitive import depth analysis | `limit?` |
| `cari_boundary_violations` | Package boundary violation detection | _(none)_ |
| `cari_layers_infer` | Auto-infer architectural layers | _(none)_ |
| `cari_layers_check` | Validate imports against layer config | `allowSkipLayer?` |
| `cari_layers_name` | LLM-generated layer & directory names | `provider`, `model?`, `api_key?` |
| `cari_focus` | Focused architecture view around a target | `target`, `hops?`, `maxNodes?` |
| `cari_cypher` | Ad-hoc CypherLite query over the CARI graph projection | `query`, `limit?` |
| `cari_graph_schema` | CARI graph schema — node/relationship types, query templates | _(none)_ |

All CARI tools are also available as CLI subcommands (e.g., `iw index clones`).
See the [CLI Reference](/docs/reference/cli/) for the full command list.

### Usage Examples

Ask Copilot:

- **"Find files about authentication"** → Copilot calls `cari_retrieve` with query="authentication"
- **"What's connected to AuthService?"** → Copilot calls `cari_connections` with entity="AuthService"
- **"I changed auth.ts — any docs to update?"** → Copilot calls `cari_check` with changed files
- **"Find duplicate code"** → Copilot calls `cari_clones`
- **"Show circular dependencies"** → Copilot calls `cari_circular_imports`
- **"What TODOs exist?"** → Copilot calls `cari_todos`
- **"Which modules lack docs?"** → Copilot calls `cari_module_coverage`
- **"Where is AuthService mentioned?"** → Copilot calls `cari_mentions_of` with entityId
- **"What entities appear in AUTH.md?"** → Copilot calls `cari_annotations_for` with filePath
- **"What are the architectural layers?"** → Copilot calls `cari_layers_infer`
- **"Are there any layer violations?"** → Copilot calls `cari_layers_check`
- **"Name my layers with AI"** → Copilot calls `cari_layers_name` with provider="openai"
- **"Show communities by git history"** → Copilot calls `cari_communities` with mode="temporal"
- **"Show me the architecture around auth.ts"** → Copilot calls `cari_focus` with target="auth.ts"
- **"Which files call `validateToken`?"** → Copilot calls `cari_cypher` with a query, or `iw index cypher @:callers-of --param calleeName=validateToken`

## Knowledge Graph Tools (Optional)

If you have Neo4j running, additional tools are available:

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `kg_query` | Natural language or Cypher query | `question`, `cypher?`, `limit?` |
| `kg_context` | Build RAG context from graph | `topic?`, `entity?`, `hops?` |
| `kg_entities` | List/search entities | `type?`, `search?`, `limit?` |
| `kg_impact` | Semantic impact analysis | `files`, `hops?` |
| `kg_doc_health` | Documentation freshness (requires Neo4j) | `files?` |
| `kg_schema` | Graph schema description | _(none)_ |

## MCP Server Options

```bash
iw mcp [options]
```

| Option           | Default | Description             |
| ---------------- | ------- | ----------------------- |
| `-s, --session`  | —       | Default session scope   |
| `-v, --verbose`  | off     | Log tool invocations    |

## Next Steps

- [CARI Overview](/docs/cari/overview/) — understand what the tools query
- [CI Integration](/docs/integrations/ci/) — automate with GitHub Actions
- [Agent Skill](/docs/integrations/agent-skill/) — the file-based alternative for Claude Code / Cursor
