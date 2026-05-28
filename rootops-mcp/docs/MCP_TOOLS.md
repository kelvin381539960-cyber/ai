# Initial MCP Tools

## policy.check

Checks whether a tool would be auto-allowed or require confirmation.

## audit.list

Lists audit events.

Arguments:

```json
{
  "source": "memory"
}
```

or:

```json
{
  "source": "disk",
  "date": "2026-05-28"
}
```

## file.read

Reads a text file by line window with byte budget.

## file.search

Searches filenames and contents under allowed roots.

Current implementation is native TypeScript scanning. Replace or augment with ripgrep in Phase 2.

## file.hash

Returns SHA-256 and byte length.

## local.embed

Uses Ollama `/api/embed`.

Environment:

```text
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
```

## local.rerank

Uses local instruct model to score candidate snippets.

## local.summarize

Uses local instruct model to summarize large text.

Environment:

```text
OLLAMA_INSTRUCT_MODEL=qwen2.5-coder:7b
```

## Intentional exclusions in this phase

No write tools are registered yet.
No sudo/systemctl/git push/deploy tools are registered yet.
The current server version is read/search/local-intelligence only.
