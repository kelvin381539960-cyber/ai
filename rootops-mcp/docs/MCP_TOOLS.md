# Initial MCP Tools

## Read/search/context tools

- `policy.check`
- `audit.list`
- `file.read`
- `file.read_many`
- `file.search`
- `file.outline`
- `file.hash`
- `local.context_pack`

## Snapshot and patch tools

### snapshot.create

Creates a snapshot copy of a file before editing.

```json
{
  "path": "/opt/AIX代码/src/index.ts",
  "reason": "before patch"
}
```

### patch.dry_run

Previews a text replacement patch. It checks `expected_hash` and does not write files.

```json
{
  "path": "/opt/AIX代码/src/index.ts",
  "expected_hash": "sha256...",
  "old_text": "old block",
  "new_text": "new block",
  "with_local_risk": true
}
```

### patch.apply

Applies a text replacement patch with expected_hash protection, auto snapshot, and verify.

```json
{
  "path": "/opt/AIX代码/src/index.ts",
  "expected_hash": "sha256...",
  "old_text": "old block",
  "new_text": "new block",
  "auto_snapshot": true
}
```

### patch.verify

Verifies expected text exists and optional old text is gone.

```json
{
  "path": "/opt/AIX代码/src/index.ts",
  "expected_text": "new block",
  "old_text": "old block"
}
```

### snapshot.restore

Restores a file from a snapshot id. This is destructive and should require confirmation.

```json
{
  "snapshot_id": "snap_...",
  "target_path": "/opt/AIX代码/src/index.ts"
}
```

## Local model tools

- `local.embed`
- `local.rerank`
- `local.summarize`

## Still excluded

No sudo/systemctl/git push/deploy tools are registered yet.
