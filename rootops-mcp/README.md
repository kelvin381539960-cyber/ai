# AIX RootOps MCP

High-permission, low-friction personal AI operations MCP.

## Goal

AIX RootOps MCP is designed to let GPT/Claude/Cursor-style agents operate codebases and cloud servers with maximum capability, minimal authorization friction, and strong rollback/audit controls.

This project is not a low-permission toy MCP. It is a production-grade personal RootOps layer with:

- MCP Gateway
- Risk-based authorization
- Tool profiles
- Local model sidecar
- File intelligence engine
- Patch transaction engine
- Remote SSH / rsync operations
- Git / snapshot / rollback integration
- Audit trail

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

## Design rule

```text
GPT is the brain.
Local model is the accelerator.
MCP is the hands.
Policy engine is the brake.
Snapshot / rollback is the insurance.
Audit log is the black box.
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
# Ubuntu/Debian
sudo apt-get install ripgrep

# macOS
brew install ripgrep
```

## MCP client examples

See:

- `examples/claude_desktop_config.json`
- `examples/cursor_mcp_config.json`

Update `cwd` to your absolute local path before use.

## Local model sidecar

Default Ollama settings:

```text
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
OLLAMA_INSTRUCT_MODEL=qwen2.5-coder:7b
```

The local model is used for embedding, rerank, summarize, and patch risk hints. It must not become the root controller.

## Current status

Runnable MCP server with read-only and local intelligence tools.

Registered tools:

- `policy.check`
- `audit.list`
- `file.read`
- `file.read_many`
- `file.search`
- `file.outline`
- `file.hash`
- `local.embed`
- `local.rerank`
- `local.summarize`
- `local.context_pack`

## Next build order

1. Add tree-sitter outline.
2. Add SQLite FTS5 index.
3. Add embedding index.
4. Add patch dry-run/snapshot/apply/verify flow.
5. Add SSH session pool and rsync pull.
6. Add merged confirmation payload.
