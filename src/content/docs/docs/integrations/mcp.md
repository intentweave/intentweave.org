---
title: Copilot / MCP Integration
description: Use CARI tools directly in VS Code via GitHub Copilot.
---

## What Is MCP?

The **Model Context Protocol** (MCP) lets AI agents like GitHub Copilot call
external tools. IntentWeave exposes its index queries as MCP tools, so Copilot
can search your code index, find connections, and check drift — all from chat.

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

### Usage Examples

Ask Copilot:

- **"Find files about authentication"** → Copilot calls `cari_retrieve` with query="authentication"
- **"What's connected to AuthService?"** → Copilot calls `cari_connections` with entity="AuthService"
- **"I changed auth.ts — any docs to update?"** → Copilot calls `cari_check` with changed files

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
