# File Index MCP Wiring

This module prepares the MCP-facing wiring for SQLite FTS5 file index tools.

## Tools

- `file.index_build`
- `file.index_search`
- `file.index_stats`

## Wiring module

```text
src/mcp/file-index-wiring.ts
```

Exports:

- `fileIndexToolDefinitions`
- `FileIndexBuildArgs`
- `FileIndexSearchArgs`
- `FileIndexStatsArgs`
- `callFileIndexTool(fileIndex, name, args)`
- `isFileIndexTool(name)`

## Intended server integration

In `src/mcp/tools.ts`:

```ts
import { fileIndexToolDefinitions } from './file-index-wiring.js';

export const toolDefinitions = [
  ...baseToolDefinitions,
  ...fileIndexToolDefinitions
];
```

In `src/mcp/server.ts`:

```ts
import { FileIndex } from '../file/file-index.js';
import { callFileIndexTool, isFileIndexTool } from './file-index-wiring.js';

let fileIndex = new FileIndex(activeScope.allowedRoots);

if (isFileIndexTool(name)) {
  return jsonToolResult({ ok: true, ...(await callFileIndexTool(fileIndex, name, cleanArgs)) });
}
```

## Status

The core index engine already exists in `src/file/file-index.ts`. This wiring module keeps MCP schema and handler logic in one place so the main server can import it without adding large inline switch cases.
