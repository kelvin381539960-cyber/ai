import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { DEFAULT_TASK_SCOPE } from '../config/default-policy.js';
import { AuditLog } from '../core/audit.js';
import { PolicyEngine } from '../core/policy-engine.js';
import { classifyToolRisk } from '../core/risk.js';
import { FileEngine } from '../file/file-engine.js';
import { LocalIntelligence } from '../local/local-intelligence.js';
import { OllamaClient } from '../local/ollama-client.js';
import type { ToolCallContext, ToolProfile } from '../types.js';
import { toolDefinitions } from './tools.js';

const actor = process.env.ROOTOPS_ACTOR ?? 'gpt';
const defaultProfile = (process.env.ROOTOPS_PROFILE ?? 'read_only') as ToolProfile;

export async function startMcpServer(): Promise<void> {
  const policy = new PolicyEngine(DEFAULT_TASK_SCOPE);
  const audit = new AuditLog();
  await audit.init();

  const fileEngine = new FileEngine(DEFAULT_TASK_SCOPE.allowedRoots);
  const ollama = new OllamaClient({
    baseUrl: process.env.OLLAMA_BASE_URL ?? 'http://127.0.0.1:11434',
    embeddingModel: process.env.OLLAMA_EMBEDDING_MODEL ?? 'nomic-embed-text',
    instructModel: process.env.OLLAMA_INSTRUCT_MODEL ?? 'qwen2.5-coder:7b'
  });
  const local = new LocalIntelligence(ollama);

  const server = new Server(
    { name: 'aix-rootops-mcp', version: '0.1.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: toolDefinitions }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const name = request.params.name;
    const args = request.params.arguments ?? {};
    const ctx: ToolCallContext = {
      taskId: DEFAULT_TASK_SCOPE.taskId,
      actor,
      toolName: name,
      profile: defaultProfile,
      args,
      risk: classifyToolRisk(name)
    };

    const decision = policy.authorize(ctx);
    await audit.record({ ...ctx, decision });

    if (!decision.allowed) {
      return jsonToolResult({ ok: false, error: 'authorization_required', decision });
    }

    try {
      switch (name) {
        case 'policy.check': {
          const parsed = PolicyCheckArgs.parse(args);
          const risk = classifyToolRisk(parsed.tool_name);
          const check = policy.authorize({
            taskId: DEFAULT_TASK_SCOPE.taskId,
            actor,
            toolName: parsed.tool_name,
            profile: parsed.profile ?? defaultProfile,
            args: parsed.args ?? {},
            risk
          });
          return jsonToolResult({ ok: true, risk, decision: check });
        }

        case 'audit.list': {
          const parsed = AuditListArgs.parse(args);
          if (parsed.source === 'disk') {
            return jsonToolResult({ ok: true, events: await audit.listFromDisk(parsed.date) });
          }
          return jsonToolResult({ ok: true, events: audit.list() });
        }

        case 'file.read': {
          const parsed = FileReadArgs.parse(args);
          const result = await fileEngine.readLines(parsed.path, parsed.offset_line, parsed.limit_lines, {
            maxBytes: parsed.max_bytes,
            withLineNumbers: parsed.with_line_numbers
          });
          return jsonToolResult({ ok: true, ...result });
        }

        case 'file.read_many': {
          const parsed = FileReadManyArgs.parse(args);
          const result = await fileEngine.readMany(parsed.items, parsed.max_total_bytes);
          return jsonToolResult({ ok: true, ...result });
        }

        case 'file.search': {
          const parsed = FileSearchArgs.parse(args);
          const result = await fileEngine.search(parsed);
          return jsonToolResult({ ok: true, ...result });
        }

        case 'file.hash': {
          const parsed = FileHashArgs.parse(args);
          const result = await fileEngine.hash(parsed.path);
          return jsonToolResult({ ok: true, ...result });
        }

        case 'local.embed': {
          const parsed = LocalEmbedArgs.parse(args);
          const embeddings = await local.embed(parsed.texts);
          return jsonToolResult({ ok: true, embeddings });
        }

        case 'local.rerank': {
          const parsed = LocalRerankArgs.parse(args);
          const items = await local.rerank(parsed.query, parsed.candidates);
          return jsonToolResult({ ok: true, items });
        }

        case 'local.summarize': {
          const parsed = LocalSummarizeArgs.parse(args);
          const result = await local.summarizeLargeText(parsed.text);
          return jsonToolResult({ ok: true, ...result });
        }

        default:
          return jsonToolResult({ ok: false, error: `unknown tool: ${name}` });
      }
    } catch (error) {
      return jsonToolResult({ ok: false, error: error instanceof Error ? error.message : String(error) });
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

function jsonToolResult(value: unknown) {
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(value, null, 2)
      }
    ]
  };
}

const PolicyCheckArgs = z.object({
  tool_name: z.string(),
  profile: z.string().optional() as z.ZodOptional<z.ZodType<ToolProfile>>,
  args: z.unknown().optional()
});

const AuditListArgs = z.object({
  source: z.enum(['memory', 'disk']).default('memory'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

const FileReadArgs = z.object({
  path: z.string(),
  offset_line: z.number().int().min(1).default(1),
  limit_lines: z.number().int().min(1).max(2000).default(200),
  max_bytes: z.number().int().min(1).max(1024 * 1024).default(512 * 1024),
  with_line_numbers: z.boolean().default(true)
});

const FileReadManyArgs = z.object({
  items: z.array(z.object({
    path: z.string(),
    offset_line: z.number().int().min(1).optional(),
    limit_lines: z.number().int().min(1).max(2000).optional(),
    max_bytes: z.number().int().min(1).max(1024 * 1024).optional(),
    with_line_numbers: z.boolean().optional()
  })).min(1).max(100),
  max_total_bytes: z.number().int().min(1).max(4 * 1024 * 1024).default(512 * 1024)
});

const FileSearchArgs = z.object({
  path: z.string().optional(),
  query: z.string().min(1),
  max_results: z.number().int().min(1).max(500).default(50),
  file_glob: z.string().optional(),
  regex: z.boolean().default(false),
  case_sensitive: z.boolean().default(false),
  include_filenames: z.boolean().default(true),
  include_contents: z.boolean().default(true),
  max_file_bytes: z.number().int().min(1).max(10 * 1024 * 1024).default(256 * 1024),
  context_before: z.number().int().min(0).max(20).default(0),
  context_after: z.number().int().min(0).max(20).default(0),
  cursor: z.string().optional(),
  backend: z.enum(['auto', 'rg', 'native']).default('auto')
});

const FileHashArgs = z.object({ path: z.string() });

const LocalEmbedArgs = z.object({ texts: z.array(z.string()).min(1).max(128) });

const LocalRerankArgs = z.object({
  query: z.string(),
  candidates: z.array(z.object({ id: z.string(), text: z.string(), metadata: z.record(z.unknown()).optional() })).min(1).max(200)
});

const LocalSummarizeArgs = z.object({ text: z.string().min(1) });
