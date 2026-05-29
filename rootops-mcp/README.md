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

Runnable MCP server with:

- file read/search/context
- transactional patch tools
- remote ops tools
- task-level authorization
- merged confirmation payloads
- emergency freeze
- audit export

## Docs

- `docs/MCP_TOOLS.md`
- `docs/REMOTE_OPS.md`
- `docs/AUTHORIZATION.md`
- `docs/ROADMAP.md`

## Next build order

1. Add explicit approval token apply flow.
2. Persist task scopes and confirmation queue.
3. Add tree-sitter outline.
4. Add SQLite FTS5 index.
5. Add embedding index.
6. Add real remote agent daemon.
