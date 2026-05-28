# AIX RootOps MCP

High-permission, low-friction personal AI operations MCP.

## Goal

AIX RootOps MCP is designed to let GPT/Claude/Cursor-style agents operate codebases and cloud servers with maximum capability, minimal authorization friction, and strong rollback/audit controls.

## Architecture

```text
GPT / Claude / Cursor / Agent
  ↓
MCP Gateway
  ↓
Risk-Based Authorization Engine
  ↓
Task Session / Tool Profile / Audit
  ↓
Local Intelligence Layer / Local Model Sidecar
  ↓
File Intelligence Engine
  ↓
Patch Transaction Engine
  ↓
Remote Ops Engine
  ↓
Local FS / SSH / Rsync / Git / Build / DB / Logs
```

## Quick start

```bash
cd rootops-mcp
cp .env.example .env
npm install
npm run check
npm run smoke
npm run dev
```

Install ripgrep for faster search:

```bash
sudo apt-get install ripgrep
# or
brew install ripgrep
```

## Current status

Runnable MCP server with read/search/context and safe patch preview tools.

Registered tools:

- `policy.check`
- `audit.list`
- `file.read`
- `file.read_many`
- `file.search`
- `file.outline`
- `file.hash`
- `snapshot.create`
- `patch.dry_run`
- `local.embed`
- `local.rerank`
- `local.summarize`
- `local.context_pack`

Real file write/apply is intentionally not exposed yet.

## Next build order

1. Add patch apply tool behind risk policy.
2. Add verify and rollback tools.
3. Add tree-sitter outline.
4. Add SQLite FTS5 index.
5. Add embedding index.
6. Add SSH session pool and rsync pull.
