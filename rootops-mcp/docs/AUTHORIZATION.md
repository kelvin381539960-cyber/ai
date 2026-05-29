# Authorization and Safety

Phase 5 provides the low-friction authorization layer.

## Tools

Task scopes:

- `task.scope.create`
- `task.scope.active`
- `task.scope.list`
- `task.scope.use`

Merged confirmation queue:

- `confirmation.list`
- `confirmation.clear`
- `confirmation.approve`

Safety switch:

- `safety.status`
- `safety.freeze`
- `safety.unfreeze`

Audit export:

- `audit.export`

## Persistent state

State is stored under:

```text
.var/state/task-scopes.json
.var/state/confirmations.json
```

Override with:

```text
ROOTOPS_STATE_DIR=/path/to/state
```

## Approval token flow

1. A high-risk or non-allowed tool call returns `authorization_required` and a confirmation object.
2. Approve it:

```json
{
  "confirmation_id": "confirm_...",
  "ttl_minutes": 10
}
```

3. Retry the exact same tool call with:

```json
{
  "approval_token": "appr_..."
}
```

The token is single-use and bound to:

- tool name
- arguments, excluding `approval_token`
- expiry time

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
