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

Runnable MCP server with read/search/context and transactional patch tools.

Registered tools:

- `policy.check`
- `audit.list`
- `file.read`
- `file.read_many`
- `file.search`
- `file.outline`
- `file.hash`
- `snapshot.create`
- `snapshot.restore`
- `patch.dry_run`
- `patch.plan`
- `patch.apply`
- `patch.verify`
- `local.embed`
- `local.rerank`
- `local.summarize`
- `local.context_pack`

No sudo/systemctl/git push/deploy tools are registered yet.

## Next build order

1. Add SSH session pool and streaming exec.
2. Add rsync pull/push.
3. Add server groups.
4. Add tree-sitter outline.
5. Add SQLite FTS5 index.
6. Add embedding index.
