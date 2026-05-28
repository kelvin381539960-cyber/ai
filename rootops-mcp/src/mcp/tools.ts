export const toolDefinitions = [
  {
    name: 'policy.check',
    description: 'Check whether a tool call would be auto-allowed or require merged confirmation.',
    inputSchema: { type: 'object', properties: { tool_name: { type: 'string' }, profile: { type: 'string' }, args: { type: 'object' } }, required: ['tool_name'] }
  },
  {
    name: 'audit.list',
    description: 'List audit events for this MCP process. Can read memory or persisted JSONL by date.',
    inputSchema: { type: 'object', properties: { source: { type: 'string', enum: ['memory', 'disk'], default: 'memory' }, date: { type: 'string', description: 'YYYY-MM-DD, only used for disk source.' } } }
  },
  {
    name: 'file.read',
    description: 'Read a text file by line window with byte budget and optional line numbers.',
    inputSchema: { type: 'object', properties: { path: { type: 'string' }, offset_line: { type: 'number', default: 1 }, limit_lines: { type: 'number', default: 200 }, max_bytes: { type: 'number', default: 524288 }, with_line_numbers: { type: 'boolean', default: true } }, required: ['path'] }
  },
  {
    name: 'file.read_many',
    description: 'Read multiple files with per-file windows and a total byte budget.',
    inputSchema: { type: 'object', properties: { items: { type: 'array', items: { type: 'object', properties: { path: { type: 'string' }, offset_line: { type: 'number' }, limit_lines: { type: 'number' }, max_bytes: { type: 'number' }, with_line_numbers: { type: 'boolean' } }, required: ['path'] } }, max_total_bytes: { type: 'number', default: 524288 } }, required: ['items'] }
  },
  {
    name: 'file.search',
    description: 'Search filenames and/or file contents under an allowed root. Uses ripgrep when available and supports cursor pagination.',
    inputSchema: { type: 'object', properties: { path: { type: 'string' }, query: { type: 'string' }, max_results: { type: 'number', default: 50 }, file_glob: { type: 'string' }, regex: { type: 'boolean', default: false }, case_sensitive: { type: 'boolean', default: false }, include_filenames: { type: 'boolean', default: true }, include_contents: { type: 'boolean', default: true }, max_file_bytes: { type: 'number', default: 262144 }, context_before: { type: 'number', default: 0 }, context_after: { type: 'number', default: 0 }, cursor: { type: 'string' }, backend: { type: 'string', enum: ['auto', 'rg', 'native'], default: 'auto' } }, required: ['query'] }
  },
  {
    name: 'file.outline',
    description: 'Summarize a file structure: imports, exports, classes, functions, methods, constants, todos with line numbers.',
    inputSchema: { type: 'object', properties: { path: { type: 'string' }, max_bytes: { type: 'number', default: 524288 }, max_items: { type: 'number', default: 300 } }, required: ['path'] }
  },
  { name: 'file.hash', description: 'Return SHA-256 hash and byte size for a file inside an allowed root.', inputSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] } },
  { name: 'snapshot.create', description: 'Create a snapshot copy of a file before editing.', inputSchema: { type: 'object', properties: { path: { type: 'string' }, reason: { type: 'string', default: 'manual' } }, required: ['path'] } },
  { name: 'snapshot.restore', description: 'Restore a file from a snapshot id. High-risk; should require confirmation in production profile.', inputSchema: { type: 'object', properties: { snapshot_id: { type: 'string' }, target_path: { type: 'string' } }, required: ['snapshot_id'] } },
  {
    name: 'patch.dry_run',
    description: 'Preview a text replacement patch with expected_hash protection. Does not write files.',
    inputSchema: { type: 'object', properties: { path: { type: 'string' }, expected_hash: { type: 'string' }, old_text: { type: 'string' }, new_text: { type: 'string' }, risk: { type: 'string', enum: ['R0', 'R1', 'R2', 'R3', 'R4'], default: 'R1' }, dry_run_required: { type: 'boolean', default: true }, auto_snapshot: { type: 'boolean', default: true }, with_local_risk: { type: 'boolean', default: false } }, required: ['path', 'expected_hash', 'old_text', 'new_text'] }
  },
  {
    name: 'patch.apply',
    description: 'Apply a text replacement patch with expected_hash protection, auto snapshot, and verify. Requires code_edit profile and policy allowance.',
    inputSchema: { type: 'object', properties: { path: { type: 'string' }, expected_hash: { type: 'string' }, old_text: { type: 'string' }, new_text: { type: 'string' }, risk: { type: 'string', enum: ['R0', 'R1', 'R2', 'R3', 'R4'], default: 'R1' }, dry_run_required: { type: 'boolean', default: true }, auto_snapshot: { type: 'boolean', default: true } }, required: ['path', 'expected_hash', 'old_text', 'new_text'] }
  },
  {
    name: 'patch.verify',
    description: 'Verify that a file contains expected text and optionally no longer contains old text.',
    inputSchema: { type: 'object', properties: { path: { type: 'string' }, expected_text: { type: 'string' }, old_text: { type: 'string' } }, required: ['path', 'expected_text'] }
  },
  { name: 'local.embed', description: 'Generate local embeddings through the configured local model sidecar.', inputSchema: { type: 'object', properties: { texts: { type: 'array', items: { type: 'string' } } }, required: ['texts'] } },
  { name: 'local.rerank', description: 'Rerank candidate snippets for a query using the configured local model sidecar.', inputSchema: { type: 'object', properties: { query: { type: 'string' }, candidates: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, text: { type: 'string' }, metadata: { type: 'object' } }, required: ['id', 'text'] } } }, required: ['query', 'candidates'] } },
  { name: 'local.summarize', description: 'Summarize a large text locally into summary, risks, and key facts.', inputSchema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] } },
  { name: 'local.context_pack', description: 'Build a compact context pack from search hits and file windows for a task query.', inputSchema: { type: 'object', properties: { root: { type: 'string' }, query: { type: 'string' }, max_files: { type: 'number', default: 8 }, max_total_bytes: { type: 'number', default: 524288 }, lines_per_file: { type: 'number', default: 120 }, file_glob: { type: 'string' } }, required: ['query'] } }
];
