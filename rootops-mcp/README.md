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
- SQLite FTS5 index and Ollama embedding index
- transactional patch tools
- remote ops tools
- remote Node.js HTTP agent daemon bootstrap
- task-level authorization
- merged confirmation payloads
- one-time approval tokens
- persistent task scopes and confirmation queue
- emergency freeze
- audit export

## Docs

- `docs/MCP_TOOLS.md`
- `docs/REMOTE_OPS.md`
- `docs/REMOTE_AGENT_DAEMON.md`
- `docs/AUTHORIZATION.md`
- `docs/FILE_INDEX.md`
- `docs/EMBEDDING_INDEX.md`
- `docs/ROADMAP.md`

## Next build order

1. Add systemd service template for remote agent.
2. Add remote agent client tools.
3. Add install/test CI scripts.
