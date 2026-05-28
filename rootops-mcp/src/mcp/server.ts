import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { DEFAULT_TASK_SCOPE } from '../config/default-policy.js';
import { AuditLog } from '../core/audit.js';
import { PolicyEngine } from '../core/policy-engine.js';
import { classifyToolRisk } from '../core/risk.js';
import { buildContextPack } from '../file/context-pack.js';
import { FileEngine } from '../file/file-engine.js';
import { LocalIntelligence } from '../local/local-intelligence.js';
import { OllamaClient } from '../local/ollama-client.js';
import { PatchEngine } from '../patch/patch-engine.js';
import type { PatchOperation, ToolCallContext, ToolProfile } from '../types.js';
import { toolDefinitions } from './tools.js';

const actor = process.env.ROOTOPS_ACTOR ?? 'gpt';
const defaultProfile = (process.env.ROOTOPS_PROFILE ?? 'read_only') as ToolProfile;

export async function startMcpServer(): Promise<void> {
  const policy = new PolicyEngine(DEFAULT_TASK_SCOPE);
  const audit = new AuditLog();
  await audit.init();
  const fileEngine = new FileEngine(DEFAULT_TASK_SCOPE.allowedRoots);
  const patchEngine = new PatchEngine(fileEngine);
  const ollama = new OllamaClient({ baseUrl: process.env.OLLAMA_BASE_URL ?? 'http://127.0.0.1:11434', embeddingModel: process.env.OLLAMA_EMBEDDING_MODEL ?? 'nomic-embed-text', instructModel: process.env.OLLAMA_INSTRUCT_MODEL ?? 'qwen2.5-coder:7b' });
  const local = new LocalIntelligence(ollama);
  const server = new Server({ name: 'aix-rootops-mcp', version: '0.1.0' }, { capabilities: { tools: {} } });
  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: toolDefinitions }));
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const name = request.params.name;
    const args = request.params.arguments ?? {};
    const ctx: ToolCallContext = { taskId: DEFAULT_TASK_SCOPE.taskId, actor, toolName: name, profile: defaultProfile, args, risk: classifyToolRisk(name) };
    const decision = policy.authorize(ctx);
    await audit.record({ ...ctx, decision });
    if (!decision.allowed) return jsonToolResult({ ok: false, error: 'authorization_required', decision });
    try {
      switch (name) {
        case 'policy.check': {
          const parsed = PolicyCheckArgs.parse(args);
          const risk = classifyToolRisk(parsed.tool_name);
          const check = policy.authorize({ taskId: DEFAULT_TASK_SCOPE.taskId, actor, toolName: parsed.tool_name, profile: parsed.profile ?? defaultProfile, args: parsed.args ?? {}, risk });
          return jsonToolResult({ ok: true, risk, decision: check });
        }
        case 'audit.list': {
          const parsed = AuditListArgs.parse(args);
          return jsonToolResult({ ok: true, events: parsed.source === 'disk' ? await audit.listFromDisk(parsed.date) : audit.list() });
        }
        case 'file.read': {
          const parsed = FileReadArgs.parse(args);
          return jsonToolResult({ ok: true, ...(await fileEngine.readLines(parsed.path, parsed.offset_line, parsed.limit_lines, { maxBytes: parsed.max_bytes, withLineNumbers: parsed.with_line_numbers })) });
        }
        case 'file.read_many': {
          const parsed = FileReadManyArgs.parse(args);
          return jsonToolResult({ ok: true, ...(await fileEngine.readMany(parsed.items, parsed.max_total_bytes)) });
        }
        case 'file.search': {
          const parsed = FileSearchArgs.parse(args);
          return jsonToolResult({ ok: true, ...(await fileEngine.search(parsed)) });
        }
        case 'file.outline': {
          const parsed = FileOutlineArgs.parse(args);
          return jsonToolResult({ ok: true, ...(await fileEngine.outline(parsed.path, parsed.max_bytes, parsed.max_items)) });
        }
        case 'file.hash': {
          const parsed = FileHashArgs.parse(args);
          return jsonToolResult({ ok: true, ...(await fileEngine.hash(parsed.path)) });
        }
        case 'snapshot.create': {
          const parsed = SnapshotCreateArgs.parse(args);
          return jsonToolResult({ ok: true, snapshot: await patchEngine.createSnapshot(parsed.path, parsed.reason) });
        }
        case 'snapshot.restore': {
          const parsed = SnapshotRestoreArgs.parse(args);
          return jsonToolResult({ ok: true, restore: await patchEngine.restoreSnapshot(parsed.snapshot_id, parsed.target_path) });
        }
        case 'patch.dry_run': {
          const parsed = PatchDryRunArgs.parse(args);
          const patch = toPatchOperation(parsed);
          const preview = await patchEngine.dryRun(patch);
          const localRisk = parsed.with_local_risk ? await local.classifyPatchRisk(patch).catch((error) => ({ error: String(error) })) : undefined;
          return jsonToolResult({ ok: true, preview, localRisk });
        }
        case 'patch.apply': {
          const parsed = PatchApplyArgs.parse(args);
          const patch = toPatchOperation(parsed);
          return jsonToolResult({ ok: true, result: await patchEngine.apply(patch) });
        }
        case 'patch.verify': {
          const parsed = PatchVerifyArgs.parse(args);
          return jsonToolResult({ ok: true, verify: await patchEngine.verify(parsed.path, parsed.expected_text, parsed.old_text) });
        }
        case 'local.embed': {
          const parsed = LocalEmbedArgs.parse(args);
          return jsonToolResult({ ok: true, embeddings: await local.embed(parsed.texts) });
        }
        case 'local.rerank': {
          const parsed = LocalRerankArgs.parse(args);
          return jsonToolResult({ ok: true, items: await local.rerank(parsed.query, parsed.candidates) });
        }
        case 'local.summarize': {
          const parsed = LocalSummarizeArgs.parse(args);
          return jsonToolResult({ ok: true, ...(await local.summarizeLargeText(parsed.text)) });
        }
        case 'local.context_pack': {
          const parsed = LocalContextPackArgs.parse(args);
          return jsonToolResult({ ok: true, ...(await buildContextPack(fileEngine, { root: parsed.root, query: parsed.query, maxFiles: parsed.max_files, maxTotalBytes: parsed.max_total_bytes, linesPerFile: parsed.lines_per_file, fileGlob: parsed.file_glob })) });
        }
        default: return jsonToolResult({ ok: false, error: `unknown tool: ${name}` });
      }
    } catch (error) {
      return jsonToolResult({ ok: false, error: error instanceof Error ? error.message : String(error) });
    }
  });
  await server.connect(new StdioServerTransport());
}

function jsonToolResult(value: unknown) { return { content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }] }; }
function toPatchOperation(parsed: z.infer<typeof PatchDryRunArgs>): PatchOperation { return { path: parsed.path, expectedHash: parsed.expected_hash, oldText: parsed.old_text, newText: parsed.new_text, risk: parsed.risk, dryRunRequired: parsed.dry_run_required, autoSnapshot: parsed.auto_snapshot }; }

const PolicyCheckArgs = z.object({ tool_name: z.string(), profile: z.string().optional() as z.ZodOptional<z.ZodType<ToolProfile>>, args: z.unknown().optional() });
const AuditListArgs = z.object({ source: z.enum(['memory', 'disk']).default('memory'), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional() });
const FileReadArgs = z.object({ path: z.string(), offset_line: z.number().int().min(1).default(1), limit_lines: z.number().int().min(1).max(2000).default(200), max_bytes: z.number().int().min(1).max(1024 * 1024).default(512 * 1024), with_line_numbers: z.boolean().default(true) });
const FileReadManyArgs = z.object({ items: z.array(z.object({ path: z.string(), offset_line: z.number().int().min(1).optional(), limit_lines: z.number().int().min(1).max(2000).optional(), max_bytes: z.number().int().min(1).max(1024 * 1024).optional(), with_line_numbers: z.boolean().optional() })).min(1).max(100), max_total_bytes: z.number().int().min(1).max(4 * 1024 * 1024).default(512 * 1024) });
const FileSearchArgs = z.object({ path: z.string().optional(), query: z.string().min(1), max_results: z.number().int().min(1).max(500).default(50), file_glob: z.string().optional(), regex: z.boolean().default(false), case_sensitive: z.boolean().default(false), include_filenames: z.boolean().default(true), include_contents: z.boolean().default(true), max_file_bytes: z.number().int().min(1).max(10 * 1024 * 1024).default(256 * 1024), context_before: z.number().int().min(0).max(20).default(0), context_after: z.number().int().min(0).max(20).default(0), cursor: z.string().optional(), backend: z.enum(['auto', 'rg', 'native']).default('auto') });
const FileOutlineArgs = z.object({ path: z.string(), max_bytes: z.number().int().min(1).max(2 * 1024 * 1024).default(512 * 1024), max_items: z.number().int().min(1).max(2000).default(300) });
const FileHashArgs = z.object({ path: z.string() });
const SnapshotCreateArgs = z.object({ path: z.string(), reason: z.string().default('manual') });
const SnapshotRestoreArgs = z.object({ snapshot_id: z.string(), target_path: z.string().optional() });
const PatchDryRunArgs = z.object({ path: z.string(), expected_hash: z.string(), old_text: z.string(), new_text: z.string(), risk: z.enum(['R0', 'R1', 'R2', 'R3', 'R4']).default('R1'), dry_run_required: z.boolean().default(true), auto_snapshot: z.boolean().default(true), with_local_risk: z.boolean().default(false) });
const PatchApplyArgs = PatchDryRunArgs.omit({ with_local_risk: true });
const PatchVerifyArgs = z.object({ path: z.string(), expected_text: z.string(), old_text: z.string().optional() });
const LocalEmbedArgs = z.object({ texts: z.array(z.string()).min(1).max(128) });
const LocalRerankArgs = z.object({ query: z.string(), candidates: z.array(z.object({ id: z.string(), text: z.string(), metadata: z.record(z.unknown()).optional() })).min(1).max(200) });
const LocalSummarizeArgs = z.object({ text: z.string().min(1) });
const LocalContextPackArgs = z.object({ root: z.string().optional(), query: z.string().min(1), max_files: z.number().int().min(1).max(50).default(8), max_total_bytes: z.number().int().min(1).max(4 * 1024 * 1024).default(512 * 1024), lines_per_file: z.number().int().min(1).max(1000).default(120), file_glob: z.string().optional() });
