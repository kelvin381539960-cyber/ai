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

Runnable MCP server with read/search/context, transactional patch tools, and remote ops tools.

Registered tool groups:

- policy/audit
- file read/search/outline/hash
- snapshot/patch transaction
- local model sidecar
- remote SSH / streaming / pseudo PTY / tunnels / rsync / server groups / remote agent bootstrap

No sudo/systemctl/git push/deploy tools are registered as first-class tools yet.

## Docs

- `docs/MCP_TOOLS.md`
- `docs/REMOTE_OPS.md`
- `docs/ROADMAP.md`

## Next build order

1. Add task scope creation.
2. Add merged confirmation payload.
3. Add risk threshold limits.
4. Add audit export.
5. Add emergency freeze.
6. Add tree-sitter outline.
7. Add SQLite FTS5 index.
