# Initial MCP Tools

## policy.check

Checks whether a tool would be auto-allowed or require confirmation.

## audit.list

Lists audit events from memory or disk.

## file.read

Reads a text file by line window with byte budget.

## file.read_many

Reads multiple files in one call with a total byte budget.

## file.search

Searches filenames and contents under allowed roots. Uses ripgrep when available and supports cursor pagination.

## file.outline

Extracts a lightweight structure summary from a source file.

## file.hash

Returns SHA-256 and byte length.

## snapshot.create

Creates a snapshot copy of a file before editing.

Example:

```json
{
  "path": "/opt/AIX代码/src/index.ts",
  "reason": "before payment webhook patch"
}
```

## patch.dry_run

Previews a text replacement patch. It checks `expected_hash` and does not write files.

Example:

```json
{
  "path": "/opt/AIX代码/src/index.ts",
  "expected_hash": "sha256...",
  "old_text": "old block",
  "new_text": "new block",
  "with_local_risk": true
}
```

## local.embed

Uses Ollama `/api/embed`.

## local.rerank

Uses local instruct model to score candidate snippets.

## local.summarize

Uses local instruct model to summarize large text.

## local.context_pack

Builds a compact context package from search hits and file windows.

## Intentional exclusions in this phase

`patch.dry_run` is available, but real write/apply is not exposed as an MCP tool yet.
No sudo/systemctl/git push/deploy tools are registered yet.
