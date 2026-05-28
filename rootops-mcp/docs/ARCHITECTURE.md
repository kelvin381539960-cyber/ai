# AIX RootOps MCP Architecture

## Layers

```text
MCP Gateway
Risk-Based Authorization Engine
Task Session / Tool Profile / Audit
Local Intelligence Layer
File Intelligence Engine
Patch Transaction Engine
Remote Ops Engine
Local FS / SSH / Rsync / Git / Build / DB / Logs
```

## Local Intelligence Layer

The local model sidecar is an accelerator, not the root controller.

Allowed responsibilities:

- embedding
- semantic search
- rerank
- large file summary
- log summary
- patch risk hints
- query rewrite
- context packing

Forbidden responsibilities:

- sudo authorization
- git push authorization
- production database writes
- policy management
- approval bypass
- direct destructive operation execution

## Authorization

Default posture:

```text
Max system capability.
Risk-based model autonomy.
Merged confirmation for external or destructive effects.
Automatic snapshots before writes.
Audit everything.
```

## Risk levels

| Risk | Meaning | Default |
|---|---|---|
| R0 | read-only | auto |
| R1 | reversible local change | auto with snapshot |
| R2 | batch/test/session operation | auto with limits |
| R3 | external effect | merged confirmation |
| R4 | destructive/root/policy | explicit confirmation |
