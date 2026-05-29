# Authorization and Safety

Phase 5 adds the low-friction authorization layer.

## Tools

Task scopes:

- `task.scope.create`
- `task.scope.active`
- `task.scope.list`
- `task.scope.use`

Merged confirmation queue:

- `confirmation.list`
- `confirmation.clear`

Safety switch:

- `safety.status`
- `safety.freeze`
- `safety.unfreeze`

Audit export:

- `audit.export`

## Task scope example

```json
{
  "allowed_roots": ["/opt/AIX代码"],
  "ttl_minutes": 60,
  "auto_allow": [
    "file.read",
    "file.search",
    "file.hash",
    "patch.dry_run",
    "patch.plan",
    "patch.apply",
    "snapshot.create",
    "remote.exec"
  ],
  "requires_confirm": [
    "snapshot.restore",
    "git.push",
    "sudo",
    "systemctl",
    "database.write"
  ],
  "limits": {
    "maxFilesChanged": 30,
    "maxLinesChanged": 8000,
    "maxCommandSeconds": 300,
    "maxLocalModelBatchTokens": 200000
  }
}
```

## Freeze behavior

When frozen, only these are allowed:

- policy check
- audit list/export
- safety status/unfreeze
- file read/search/hash/outline
- local intelligence tools

Everything else returns `safety_freeze_active`.

## Confirmation behavior

If a tool is not allowed, the server returns:

```json
{
  "ok": false,
  "error": "authorization_required",
  "decision": {},
  "confirmation": {}
}
```

The confirmation queue is intentionally separate from execution. A future version should add explicit user approval tokens.
