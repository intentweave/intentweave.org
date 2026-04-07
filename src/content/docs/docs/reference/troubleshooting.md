---
title: Troubleshooting
description: Common issues and how to resolve them.
---

## CARI Issues

### "No index found" / Empty results

```bash
iw index retrieve "something"
# Error: No index found at .iw/index.db
```

**Fix:** Run `iw init` then `iw index build` first.

### Index is empty (0 annotations)

If `iw index build` completes but queries return nothing:

1. Check your project has source files (`.ts`, `.js`, `.swift`, `.py`) and Markdown docs
2. Run with verbose: `iw index build -v` to see stage output
3. Verify tree-sitter can parse your files (currently supports TS/JS/Swift/Python)

### "tree-sitter build failed"

tree-sitter requires a C compiler for native bindings.

**macOS:**

```bash
xcode-select --install
```

**Ubuntu/Debian:**

```bash
sudo apt-get install build-essential
```

**Alpine (Docker):**

```bash
apk add python3 make g++
```

### Slow build times

For most projects, `iw index build` takes 1–3 seconds. If it's slow:

- Check file count: CARI indexes all files in the workspace
- Use `--include` to limit scope: `iw index build --include "src/**" --include "docs/**"`
- Use `--exclude` to skip large directories: `iw index build --exclude "node_modules/**"`

---

## Neo4j Issues (Knowledge Graph)

### "Neo4j connection refused"

```
Error: Connection refused to bolt://localhost:7687
```

**Fix:** Start Neo4j:

```bash
docker run -d --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/codegraph \
  neo4j:5
```

### "Authentication failed"

```
Error: Neo4j authentication failed
```

**Fix:** Set the password environment variable:

```bash
export NEO4J_PASSWORD=codegraph
```

Or match whatever you set in `NEO4J_AUTH` when starting the container.

### Neo4j not needed for CARI

If you only use `iw index` commands, you don't need Neo4j at all.
Neo4j is only required for: `iw run`, `iw query`, `iw context`, `iw impact`,
`iw doc-health --neo4j`, `iw persist`, `iw xlink`.

---

## MCP Issues

### Copilot doesn't see IntentWeave tools

1. Verify `.vscode/mcp.json` exists:

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

2. Restart VS Code after adding the config

3. Check the MCP server starts manually:
   ```bash
   iw mcp --session my-project -v
   ```

### MCP tools return errors

- **CARI tools** (`cari_retrieve`, etc.): Run `iw index build` first
- **KG tools** (`kg_query`, etc.): Start Neo4j and set `NEO4J_PASSWORD`

---

## General Issues

### "iw: command not found"

Install globally:

```bash
npm install -g @intentweave/cli
```

Or use npx:

```bash
npx @intentweave/cli <command>
```

### Node.js version

IntentWeave requires Node.js ≥ 20:

```bash
node -v
# Should show v20.x or higher
```

### Cache issues

If results seem stale:

```bash
# Rebuild from scratch
iw index build --force

# Or for KG:
iw run docs/*.md --force
```
