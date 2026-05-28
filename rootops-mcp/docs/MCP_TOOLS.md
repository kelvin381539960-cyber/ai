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

## file.read_many

Reads multiple files in one call with a total byte budget.

Example:

```json
{
  "items": [
    { "path": "/opt/AIX代码/README.md", "limit_lines": 100 },
    { "path": "/opt/AIX代码/docs/ROADMAP.md", "limit_lines": 100 }
  ],
  "max_total_bytes": 524288
}
```

## file.search

Searches filenames and contents under allowed roots.

Backends:

- `auto`: use ripgrep when available, fallback to native TypeScript scanning.
- `rg`: require ripgrep.
- `native`: use TypeScript scanning only.

Supports cursor pagination through `nextCursor`.

Example:

```json
{
  "path": "/opt/AIX代码",
  "query": "RootOps",
  "max_results": 20,
  "backend": "auto"
}
```

Then continue:

```json
{
  "query": "RootOps",
  "cursor": "..."
}
```

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
