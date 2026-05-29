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

## file.outline

Extracts a source outline.

Backends:

- `auto`: try tree-sitter and fallback to regex.
- `tree_sitter`: try tree-sitter and fallback to regex with diagnostics if unavailable.
- `regex`: force regex backend.

Example:

```json
{
  "path": "/opt/AIX代码/src/index.ts",
  "outline_backend": "auto",
  "max_items": 500
}
```

The result includes `backend` and optional `diagnostics`.

## Snapshot and patch tools

### snapshot.create

Creates a snapshot copy of a file before editing.

### patch.dry_run

Previews a text replacement patch. It checks `expected_hash`, returns a unified diff preview, and does not write files.

### patch.plan

Builds a batch patch plan. It dry-runs each patch, estimates files/lines changed, and reports blockers. It does not write files.

### patch.apply

Applies a text replacement patch with expected_hash protection, auto snapshot, and verify.

### patch.verify

Verifies expected text exists and optional old text is gone.

### snapshot.restore

Restores a file from a snapshot id. This is destructive and should require confirmation.

## Local model tools

- `local.embed`
- `local.rerank`
- `local.summarize`

## Still excluded

No sudo/systemctl/git push/deploy tools are registered yet.
