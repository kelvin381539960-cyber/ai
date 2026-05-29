# Embedding Index

Local semantic file search powered by Ollama embeddings.

## Tools

- `embedding.index_build`
- `embedding.index_search`
- `embedding.index_stats`

## Storage

Default path:

```text
.var/index/embedding-index.json
```

Override with:

```text
ROOTOPS_INDEX_DIR=/path/to/index
```

## Build

```json
{
  "root": "/opt/AIX代码",
  "file_glob": "**/*.{ts,tsx,js,jsx,py,go,rs,md}",
  "max_file_bytes": 524288,
  "chunk_chars": 3000,
  "force": false
}
```

## Search

```json
{
  "root": "/opt/AIX代码",
  "query": "where payment webhook signature is verified",
  "limit": 10
}
```

## Notes

- Requires Ollama to be running.
- Uses `OLLAMA_EMBEDDING_MODEL`, default `nomic-embed-text`.
- This is a lightweight JSON vector index for personal use.
- For huge repositories, replace with SQLite vector extension, Qdrant, LanceDB, or pgvector later.

## Relationship to other search tools

- `file.search`: immediate keyword search using ripgrep/native fallback.
- `file.index_search`: fast indexed keyword search with SQLite FTS5.
- `embedding.index_search`: semantic search using local embeddings.
