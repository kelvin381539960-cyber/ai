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

Optional tree-sitter parsers improve `file.outline` precision. If they fail to install, `file.outline` falls back to regex.

## Current status

Runnable MCP server with:

- file read/search/context
- tree-sitter outline backend with regex fallback
- transactional patch tools
- remote ops tools
- task-level authorization
- merged confirmation payloads
- one-time approval tokens
- persistent task scopes and confirmation queue
- emergency freeze
- audit export

## Docs

- `docs/MCP_TOOLS.md`
- `docs/REMOTE_OPS.md`
- `docs/AUTHORIZATION.md`
- `docs/ROADMAP.md`

## Next build order

1. Add SQLite FTS5 index.
2. Add embedding index.
3. Add real remote agent daemon.
4. Add install/test CI scripts.
