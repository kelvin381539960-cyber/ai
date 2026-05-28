# AIX RootOps MCP

High-permission, low-friction personal AI operations MCP.

## Goal

AIX RootOps MCP is designed to let GPT/Claude/Cursor-style agents operate codebases and cloud servers with maximum capability, minimal authorization friction, and strong rollback/audit controls.

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

Runnable MCP server with read/search/context, transactional patch tools, and first remote ops tools.

Registered tool groups:

- policy/audit
- file read/search/outline/hash
- snapshot/patch transaction
- local model sidecar
- remote SSH / rsync / server groups

No sudo/systemctl/git push/deploy tools are registered as first-class tools yet.

## Docs

- `docs/MCP_TOOLS.md`
- `docs/REMOTE_OPS.md`
- `docs/ROADMAP.md`

## Next build order

1. Add streaming exec.
2. Add persistent PTY sessions.
3. Add tunnel management.
4. Add remote agent bootstrap.
5. Add tree-sitter outline.
6. Add SQLite FTS5 index.
