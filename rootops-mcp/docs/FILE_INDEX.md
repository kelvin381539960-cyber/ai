# File Index

SQLite FTS5 index for fast large-project content search.

## Optional dependency

`file.index_*` tools require `better-sqlite3`.

```bash
npm install
```

If the optional native dependency is unavailable, normal `file.search` still works through ripgrep/native fallback.

## Storage

Default index path:

```text
.var/index/files-fts.db
```

Override:

```text
ROOTOPS_INDEX_DIR=/path/to/index
```

## Tools

### file.index_build

Builds or incrementally updates an index.

```json
{
  "root": "/opt/AIX代码",
  "file_glob": "**/*.{ts,tsx,js,jsx,py,go,rs,md,json}",
  "max_file_bytes": 1048576,
  "force": false
}
```

Incremental rule:

- unchanged `mtime + size` files are skipped
- changed files are reinserted into FTS
- deleted files are removed from metadata and FTS

### file.index_search

Searches the index.

```json
{
  "root": "/opt/AIX代码",
  "query": "payment webhook signature",
  "limit": 20,
  "offset": 0,
  "snippet_chars": 400
}
```

### file.index_stats

Shows indexed roots and counts.

```json
{
  "root": "/opt/AIX代码"
}
```

## Design

This index is complementary to `file.search`:

- `file.search`: immediate, no setup, uses ripgrep when available
- `file.index_search`: faster repeated searches after indexing

Use `local.context_pack` for task-specific context assembly after finding relevant files.
