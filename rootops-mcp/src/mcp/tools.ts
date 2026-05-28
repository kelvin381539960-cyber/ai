export const toolDefinitions = [
  {
    name: 'policy.check',
    description: 'Check whether a tool call would be auto-allowed or require merged confirmation.',
    inputSchema: {
      type: 'object',
      properties: {
        tool_name: { type: 'string' },
        profile: { type: 'string' },
        args: { type: 'object' }
      },
      required: ['tool_name']
    }
  },
  {
    name: 'audit.list',
    description: 'List audit events for this MCP process. Can read memory or persisted JSONL by date.',
    inputSchema: {
      type: 'object',
      properties: {
        source: { type: 'string', enum: ['memory', 'disk'], default: 'memory' },
        date: { type: 'string', description: 'YYYY-MM-DD, only used for disk source.' }
      }
    }
  },
  {
    name: 'file.read',
    description: 'Read a text file by line window with byte budget and optional line numbers.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string' },
        offset_line: { type: 'number', default: 1 },
        limit_lines: { type: 'number', default: 200 },
        max_bytes: { type: 'number', default: 524288 },
        with_line_numbers: { type: 'boolean', default: true }
      },
      required: ['path']
    }
  },
  {
    name: 'file.read_many',
    description: 'Read multiple files with per-file windows and a total byte budget.',
    inputSchema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              path: { type: 'string' },
              offset_line: { type: 'number', default: 1 },
              limit_lines: { type: 'number', default: 200 },
              max_bytes: { type: 'number', default: 131072 },
              with_line_numbers: { type: 'boolean', default: true }
            },
            required: ['path']
          }
        },
        max_total_bytes: { type: 'number', default: 524288 }
      },
      required: ['items']
    }
  },
  {
    name: 'file.search',
    description: 'Search filenames and/or file contents under an allowed root. Uses ripgrep when available and supports cursor pagination.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string' },
        query: { type: 'string' },
        max_results: { type: 'number', default: 50 },
        file_glob: { type: 'string' },
        regex: { type: 'boolean', default: false },
        case_sensitive: { type: 'boolean', default: false },
        include_filenames: { type: 'boolean', default: true },
        include_contents: { type: 'boolean', default: true },
        max_file_bytes: { type: 'number', default: 262144 },
        context_before: { type: 'number', default: 0 },
        context_after: { type: 'number', default: 0 },
        cursor: { type: 'string' },
        backend: { type: 'string', enum: ['auto', 'rg', 'native'], default: 'auto' }
      },
      required: ['query']
    }
  },
  {
    name: 'file.hash',
    description: 'Return SHA-256 hash and byte size for a file inside an allowed root.',
    inputSchema: {
      type: 'object',
      properties: { path: { type: 'string' } },
      required: ['path']
    }
  },
  {
    name: 'local.embed',
    description: 'Generate local embeddings through the configured local model sidecar.',
    inputSchema: {
      type: 'object',
      properties: { texts: { type: 'array', items: { type: 'string' } } },
      required: ['texts']
    }
  },
  {
    name: 'local.rerank',
    description: 'Rerank candidate snippets for a query using the configured local model sidecar.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        candidates: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              text: { type: 'string' },
              metadata: { type: 'object' }
            },
            required: ['id', 'text']
          }
        }
      },
      required: ['query', 'candidates']
    }
  },
  {
    name: 'local.summarize',
    description: 'Summarize a large text locally into summary, risks, and key facts.',
    inputSchema: {
      type: 'object',
      properties: { text: { type: 'string' } },
      required: ['text']
    }
  }
];
