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

## Current status

Initial architecture scaffold.

## Next build order

1. Implement MCP Gateway transport.
2. Wire tool registry and profiles.
3. Implement risk policy engine.
4. Implement local intelligence via Ollama.
5. Implement file read/search/hash primitives.
6. Implement patch dry-run/snapshot/apply/verify flow.
7. Implement SSH/rsync remote adapter.
8. Add tests and smoke runner.
