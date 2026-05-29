import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { AuditLog } from '../core/audit.js';
import { ConfirmationQueue, stripApprovalToken } from '../core/confirmation.js';
import { PolicyEngine } from '../core/policy-engine.js';
import { classifyToolRisk } from '../core/risk.js';
import { SafetySwitch } from '../core/safety-switch.js';
import { TaskScopeStore } from '../core/task-scope-store.js';
import { buildContextPack } from '../file/context-pack.js';
import { EmbeddingIndex } from '../file/embedding-index.js';
import { FileIndex } from '../file/file-index.js';
import { FileEngine } from '../file/file-engine.js';
import { LocalIntelligence } from '../local/local-intelligence.js';
import { OllamaClient } from '../local/ollama-client.js';
import { PatchEngine } from '../patch/patch-engine.js';
import { buildPatchPlan } from '../patch/patch-plan.js';
import { AgentBootstrap } from '../remote/agent-bootstrap.js';
import { RemoteAgentClient } from '../remote/remote-agent-client.js';
import { RemoteAgentSystemd } from '../remote/remote-agent-systemd.js';
import { PtyManager } from '../remote/pty-manager.js';
import { RemoteOps } from '../remote/remote-ops.js';
import { ServerGroupRegistry } from '../remote/server-groups.js';
import { RemoteSessionPool } from '../remote/session-pool.js';
import { StreamManager } from '../remote/stream-manager.js';
import { TunnelManager } from '../remote/tunnel-manager.js';
import type { PatchOperation, ToolCallContext, ToolProfile } from '../types.js';
import { toolDefinitions } from './tools.js';

const actor = process.env.ROOTOPS_ACTOR ?? 'gpt';
const defaultProfile = (process.env.ROOTOPS_PROFILE ?? 'read_only') as ToolProfile;

export async function startMcpServer(): Promise<void> {
  const taskScopes = new TaskScopeStore();
  await taskScopes.init();
  const safety = new SafetySwitch();
  const confirmations = new ConfirmationQueue();
  await confirmations.init();
  const audit = new AuditLog();
  await audit.init();
  let activeScope = taskScopes.active();
  let fileEngine = new FileEngine(activeScope.allowedRoots);
  let fileIndex = new FileIndex(activeScope.allowedRoots);
  let patchEngine = new PatchEngine(fileEngine);
  const remote = new RemoteOps();
  const sessions = new RemoteSessionPool();
  const groups = new ServerGroupRegistry();
  const streams = new StreamManager();
  const ptys = new PtyManager();
  const tunnels = new TunnelManager();
  const agent = new AgentBootstrap(remote);
  const agentClient = new RemoteAgentClient();
  const agentSystemd = new RemoteAgentSystemd(remote);
  const ollama = new OllamaClient({ baseUrl: process.env.OLLAMA_BASE_URL ?? 'http://127.0.0.1:11434', embeddingModel: process.env.OLLAMA_EMBEDDING_MODEL ?? 'nomic-embed-text', instructModel: process.env.OLLAMA_INSTRUCT_MODEL ?? 'qwen2.5-coder:7b' });
  const local = new LocalIntelligence(ollama);
  let embeddingIndex = new EmbeddingIndex(activeScope.allowedRoots, ollama);
  const server = new Server({ name: 'aix-rootops-mcp', version: '0.1.0' }, { capabilities: { tools: {} } });
  const reloadScope = () => { activeScope = taskScopes.active(); fileEngine = new FileEngine(activeScope.allowedRoots); fileIndex = new FileIndex(activeScope.allowedRoots); embeddingIndex = new EmbeddingIndex(activeScope.allowedRoots, ollama); patchEngine = new PatchEngine(fileEngine); };
  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: toolDefinitions }));
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const name = request.params.name;
    const args = request.params.arguments ?? {};
    const approvalToken = extractApprovalToken(args);
    const cleanArgs = stripApprovalToken(args);
    const ctx: ToolCallContext = { taskId: activeScope.taskId, actor, toolName: name, profile: defaultProfile, args: cleanArgs, risk: classifyToolRisk(name) };
    if (!safety.allows(name)) return jsonToolResult({ ok: false, error: 'safety_freeze_active', safety: safety.status() });
    const policy = new PolicyEngine(activeScope);
    const decision = policy.authorize(ctx);
    const approvedByToken = !decision.allowed && decision.requiresConfirmation ? await confirmations.consume(name, args, approvalToken) : false;
    await audit.record({ ...ctx, decision: approvedByToken ? { ...decision, allowed: true, requiresConfirmation: false, reason: 'approved by one-time token' } : decision });
    if (!decision.allowed && !approvedByToken) {
      const confirmation = decision.requiresConfirmation ? await confirmations.create(ctx, decision.reason) : undefined;
      return jsonToolResult({ ok: false, error: 'authorization_required', decision, confirmation });
    }
    try {
      switch (name) {
        case 'policy.check': { const parsed = PolicyCheckArgs.parse(cleanArgs); const risk = classifyToolRisk(parsed.tool_name); const check = policy.authorize({ taskId: activeScope.taskId, actor, toolName: parsed.tool_name, profile: parsed.profile ?? defaultProfile, args: parsed.args ?? {}, risk }); return jsonToolResult({ ok: true, risk, decision: check }); }
        case 'task.scope.create': { const parsed = TaskScopeCreateArgs.parse(cleanArgs); const scope = await taskScopes.create({ allowedRoots: parsed.allowed_roots, autoAllow: parsed.auto_allow, requiresConfirm: parsed.requires_confirm, ttlMinutes: parsed.ttl_minutes, limits: parsed.limits }); reloadScope(); return jsonToolResult({ ok: true, scope }); }
        case 'task.scope.active': return jsonToolResult({ ok: true, scope: taskScopes.active() });
        case 'task.scope.list': return jsonToolResult({ ok: true, scopes: taskScopes.list() });
        case 'task.scope.use': { const parsed = TaskScopeUseArgs.parse(cleanArgs); const scope = await taskScopes.setActive(parsed.task_id); reloadScope(); return jsonToolResult({ ok: true, scope }); }
        case 'confirmation.list': return jsonToolResult({ ok: true, confirmations: confirmations.list() });
        case 'confirmation.clear': { const parsed = ConfirmationClearArgs.parse(cleanArgs); return jsonToolResult(await confirmations.clear(parsed.confirmation_id)); }
        case 'confirmation.approve': { const parsed = ConfirmationApproveArgs.parse(cleanArgs); return jsonToolResult({ ok: true, ...(await confirmations.approve(parsed.confirmation_id, parsed.ttl_minutes)) }); }
        case 'safety.status': return jsonToolResult({ ok: true, safety: safety.status() });
        case 'safety.freeze': { const parsed = SafetyFreezeArgs.parse(cleanArgs); return jsonToolResult({ ok: true, safety: safety.freeze(parsed.reason) }); }
        case 'safety.unfreeze': { const parsed = SafetyFreezeArgs.parse(cleanArgs); return jsonToolResult({ ok: true, safety: safety.unfreeze(parsed.reason) }); }
        case 'audit.list': { const parsed = AuditListArgs.parse(cleanArgs); return jsonToolResult({ ok: true, events: parsed.source === 'disk' ? await audit.listFromDisk(parsed.date) : audit.list() }); }
        case 'audit.export': { const parsed = AuditListArgs.parse(cleanArgs); const events = parsed.source === 'disk' ? await audit.listFromDisk(parsed.date) : audit.list(); return jsonToolResult({ ok: true, format: 'json', events }); }
        case 'file.read': { const parsed = FileReadArgs.parse(cleanArgs); return jsonToolResult({ ok: true, ...(await fileEngine.readLines(parsed.path, parsed.offset_line, parsed.limit_lines, { maxBytes: parsed.max_bytes, withLineNumbers: parsed.with_line_numbers })) }); }
        case 'file.read_many': { const parsed = FileReadManyArgs.parse(cleanArgs); return jsonToolResult({ ok: true, ...(await fileEngine.readMany(parsed.items, parsed.max_total_bytes)) }); }
        case 'file.search': { const parsed = FileSearchArgs.parse(cleanArgs); return jsonToolResult({ ok: true, ...(await fileEngine.search(parsed)) }); }
        case 'file.index_build': { const parsed = FileIndexBuildArgs.parse(cleanArgs); return jsonToolResult({ ok: true, ...(await fileIndex.build({ root: parsed.root, fileGlob: parsed.file_glob, maxFileBytes: parsed.max_file_bytes, force: parsed.force })) }); }
        case 'file.index_search': { const parsed = FileIndexSearchArgs.parse(cleanArgs); return jsonToolResult({ ok: true, ...(await fileIndex.search({ root: parsed.root, query: parsed.query, limit: parsed.limit, offset: parsed.offset, snippetChars: parsed.snippet_chars })) }); }
        case 'file.index_stats': { const parsed = FileIndexStatsArgs.parse(cleanArgs); return jsonToolResult({ ok: true, ...(await fileIndex.stats(parsed.root)) }); }
        case 'embedding.index_build': { const parsed = EmbeddingIndexBuildArgs.parse(cleanArgs); return jsonToolResult({ ok: true, ...(await embeddingIndex.build({ root: parsed.root, fileGlob: parsed.file_glob, maxFileBytes: parsed.max_file_bytes, chunkChars: parsed.chunk_chars, force: parsed.force })) }); }
        case 'embedding.index_search': { const parsed = EmbeddingIndexSearchArgs.parse(cleanArgs); return jsonToolResult({ ok: true, ...(await embeddingIndex.search({ root: parsed.root, query: parsed.query, limit: parsed.limit })) }); }
        case 'embedding.index_stats': { const parsed = EmbeddingIndexStatsArgs.parse(cleanArgs); return jsonToolResult({ ok: true, ...(await embeddingIndex.stats(parsed.root)) }); }
        case 'file.outline': { const parsed = FileOutlineArgs.parse(cleanArgs); return jsonToolResult({ ok: true, ...(await fileEngine.outline(parsed.path, parsed.max_bytes, parsed.max_items, parsed.outline_backend)) }); }
        case 'file.hash': { const parsed = FileHashArgs.parse(cleanArgs); return jsonToolResult({ ok: true, ...(await fileEngine.hash(parsed.path)) }); }
        case 'snapshot.create': { const parsed = SnapshotCreateArgs.parse(cleanArgs); return jsonToolResult({ ok: true, snapshot: await patchEngine.createSnapshot(parsed.path, parsed.reason) }); }
        case 'snapshot.restore': { const parsed = SnapshotRestoreArgs.parse(cleanArgs); return jsonToolResult({ ok: true, restore: await patchEngine.restoreSnapshot(parsed.snapshot_id, parsed.target_path) }); }
        case 'patch.dry_run': { const parsed = PatchDryRunArgs.parse(cleanArgs); const patch = toPatchOperation(parsed); const preview = await patchEngine.dryRun(patch); const localRisk = parsed.with_local_risk ? await local.classifyPatchRisk(patch).catch((error) => ({ error: String(error) })) : undefined; return jsonToolResult({ ok: true, preview, localRisk }); }
        case 'patch.plan': { const parsed = PatchPlanArgs.parse(cleanArgs); const patches = parsed.patches.map(toPatchOperation); return jsonToolResult({ ok: true, plan: await buildPatchPlan(patchEngine, { patches, maxFilesChanged: parsed.max_files_changed, maxLinesChanged: parsed.max_lines_changed }) }); }
        case 'patch.apply': { const parsed = PatchApplyArgs.parse(cleanArgs); return jsonToolResult({ ok: true, result: await patchEngine.apply(toPatchOperation(parsed)) }); }
        case 'patch.verify': { const parsed = PatchVerifyArgs.parse(cleanArgs); return jsonToolResult({ ok: true, verify: await patchEngine.verify(parsed.path, parsed.expected_text, parsed.old_text) }); }
        case 'remote.session.open': { const parsed = RemoteSessionOpenArgs.parse(cleanArgs); return jsonToolResult({ ok: true, session: sessions.open(parsed.target, parsed.cwd) }); }
        case 'remote.session.list': return jsonToolResult({ ok: true, sessions: sessions.list() });
        case 'remote.session.close': { const parsed = RemoteSessionCloseArgs.parse(cleanArgs); return jsonToolResult(sessions.close(parsed.session_id)); }
        case 'remote.exec': { const parsed = RemoteExecArgs.parse(cleanArgs); const session = parsed.session_id ? sessions.get(parsed.session_id) : undefined; const target = parsed.target ?? session?.target; if (!target) throw new Error('target or session_id required'); return jsonToolResult({ ok: true, result: await remote.sshExec(target, parsed.command, { cwd: parsed.cwd ?? session?.cwd, timeoutMs: parsed.timeout_ms }) }); }
        case 'remote.exec_stream.start': { const parsed = RemoteStreamStartArgs.parse(cleanArgs); return jsonToolResult({ ok: true, stream: streams.start(parsed.target, parsed.command, { cwd: parsed.cwd }) }); }
        case 'remote.exec_stream.read': { const parsed = RemoteStreamReadArgs.parse(cleanArgs); return jsonToolResult({ ok: true, stream: streams.read(parsed.stream_id, parsed.clear) }); }
        case 'remote.exec_stream.kill': { const parsed = RemoteStreamKillArgs.parse(cleanArgs); return jsonToolResult(streams.kill(parsed.stream_id, parsed.signal as NodeJS.Signals)); }
        case 'remote.exec_stream.list': return jsonToolResult({ ok: true, streams: streams.list() });
        case 'remote.pty.open': { const parsed = RemotePtyOpenArgs.parse(cleanArgs); return jsonToolResult({ ok: true, pty: ptys.open(parsed.target, parsed.cwd) }); }
        case 'remote.pty.write': { const parsed = RemotePtyWriteArgs.parse(cleanArgs); return jsonToolResult(ptys.write(parsed.pty_id, parsed.input)); }
        case 'remote.pty.read': { const parsed = RemotePtyReadArgs.parse(cleanArgs); return jsonToolResult({ ok: true, pty: ptys.read(parsed.pty_id, parsed.clear) }); }
        case 'remote.pty.close': { const parsed = RemotePtyCloseArgs.parse(cleanArgs); return jsonToolResult(ptys.close(parsed.pty_id)); }
        case 'remote.pty.list': return jsonToolResult({ ok: true, ptys: ptys.list() });
        case 'remote.tunnel.open': { const parsed = RemoteTunnelOpenArgs.parse(cleanArgs); return jsonToolResult({ ok: true, tunnel: tunnels.open({ target: parsed.target, localHost: parsed.local_host, localPort: parsed.local_port, remoteHost: parsed.remote_host, remotePort: parsed.remote_port }) }); }
        case 'remote.tunnel.list': return jsonToolResult({ ok: true, tunnels: tunnels.list() });
        case 'remote.tunnel.close': { const parsed = RemoteTunnelCloseArgs.parse(cleanArgs); return jsonToolResult(tunnels.close(parsed.tunnel_id)); }
        case 'remote.agent.bootstrap': { const parsed = RemoteAgentBootstrapArgs.parse(cleanArgs); return jsonToolResult({ ok: true, result: await agent.install(parsed.target, parsed.install_path) }); }
        case 'remote.agent.systemd_install': { const parsed = RemoteAgentSystemdInstallArgs.parse(cleanArgs); return jsonToolResult({ ok: true, result: await agentSystemd.install(parsed) }); }
        case 'remote.agent.systemd_start': { const parsed = RemoteAgentSystemdActionArgs.parse(cleanArgs); return jsonToolResult({ ok: true, result: await agentSystemd.action(parsed.target, parsed.service_name, 'start') }); }
        case 'remote.agent.systemd_stop': { const parsed = RemoteAgentSystemdActionArgs.parse(cleanArgs); return jsonToolResult({ ok: true, result: await agentSystemd.action(parsed.target, parsed.service_name, 'stop') }); }
        case 'remote.agent.systemd_status': { const parsed = RemoteAgentSystemdActionArgs.parse(cleanArgs); return jsonToolResult({ ok: true, result: await agentSystemd.action(parsed.target, parsed.service_name, 'status') }); }
        case 'remote.agent.systemd_uninstall': { const parsed = RemoteAgentSystemdActionArgs.parse(cleanArgs); return jsonToolResult({ ok: true, result: await agentSystemd.uninstall(parsed.target, parsed.service_name) }); }
        case 'remote.agent.systemd_rotate_token': { const parsed = RemoteAgentSystemdRotateTokenArgs.parse(cleanArgs); return jsonToolResult({ ok: true, token: await agentSystemd.rotateToken(parsed.target, parsed.service_name, parsed.new_token) }); }
        case 'remote.agent.health': { const parsed = RemoteAgentClientBaseArgs.parse(cleanArgs); return jsonToolResult({ ok: true, ...(await agentClient.health(parsed.base_url, parsed.token)) }); }
        case 'remote.agent.hash': { const parsed = RemoteAgentHashArgs.parse(cleanArgs); return jsonToolResult({ ok: true, ...(await agentClient.hash(parsed.base_url, parsed.token, parsed.path)) }); }
        case 'remote.agent.read': { const parsed = RemoteAgentReadArgs.parse(cleanArgs); return jsonToolResult({ ok: true, ...(await agentClient.read(parsed.base_url, parsed.token, parsed.path, parsed.offset, parsed.length)) }); }
        case 'remote.agent.search': { const parsed = RemoteAgentSearchArgs.parse(cleanArgs); return jsonToolResult({ ok: true, ...(await agentClient.search(parsed.base_url, parsed.token, parsed.root, parsed.query, parsed.max)) }); }
        case 'remote.agent.exec': { const parsed = RemoteAgentExecArgs.parse(cleanArgs); return jsonToolResult({ ok: true, ...(await agentClient.exec(parsed.base_url, parsed.token, parsed.command, parsed.cwd, parsed.timeout_ms)) }); }
        case 'remote.rsync_push': { const parsed = RemoteRsyncPushArgs.parse(cleanArgs); return jsonToolResult({ ok: true, result: await remote.rsyncPush(parsed.source, parsed.target, parsed.destination) }); }
        case 'remote.rsync_pull': { const parsed = RemoteRsyncPullArgs.parse(cleanArgs); return jsonToolResult({ ok: true, result: await remote.rsyncPull(parsed.target, parsed.source, parsed.destination) }); }
        case 'remote.group.register': { const parsed = RemoteGroupRegisterArgs.parse(cleanArgs); return jsonToolResult({ ok: true, group: groups.register(parsed.name, parsed.targets) }); }
        case 'remote.group.exec': { const parsed = RemoteGroupExecArgs.parse(cleanArgs); const group = groups.get(parsed.name); return jsonToolResult({ ok: true, results: await remote.groupExec(group.targets, parsed.command, { cwd: parsed.cwd, timeoutMs: parsed.timeout_ms }) }); }
        case 'local.embed': { const parsed = LocalEmbedArgs.parse(cleanArgs); return jsonToolResult({ ok: true, embeddings: await local.embed(parsed.texts) }); }
        case 'local.rerank': { const parsed = LocalRerankArgs.parse(cleanArgs); return jsonToolResult({ ok: true, items: await local.rerank(parsed.query, parsed.candidates) }); }
        case 'local.summarize': { const parsed = LocalSummarizeArgs.parse(cleanArgs); return jsonToolResult({ ok: true, ...(await local.summarizeLargeText(parsed.text)) }); }
        case 'local.context_pack': { const parsed = LocalContextPackArgs.parse(cleanArgs); return jsonToolResult({ ok: true, ...(await buildContextPack(fileEngine, { root: parsed.root, query: parsed.query, maxFiles: parsed.max_files, maxTotalBytes: parsed.max_total_bytes, linesPerFile: parsed.lines_per_file, fileGlob: parsed.file_glob })) }); }
        default: return jsonToolResult({ ok: false, error: `unknown tool: ${name}` });
      }
    } catch (error) { return jsonToolResult({ ok: false, error: error instanceof Error ? error.message : String(error) }); }
  });
  await server.connect(new StdioServerTransport());
}

function jsonToolResult(value: unknown) { return { content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }] }; }
function extractApprovalToken(value: unknown): string | undefined { return value && typeof value === 'object' ? (value as Record<string, unknown>).approval_token as string | undefined : undefined; }
function toPatchOperation(parsed: z.infer<typeof PatchDryRunArgs>): PatchOperation { return { path: parsed.path, expectedHash: parsed.expected_hash, oldText: parsed.old_text, newText: parsed.new_text, risk: parsed.risk, dryRunRequired: parsed.dry_run_required, autoSnapshot: parsed.auto_snapshot }; }

const SshTargetSchema = z.object({ host: z.string(), user: z.string().optional(), port: z.number().int().min(1).max(65535).optional(), identityFile: z.string().optional() });
const PolicyCheckArgs = z.object({ tool_name: z.string(), profile: z.string().optional() as z.ZodOptional<z.ZodType<ToolProfile>>, args: z.unknown().optional() });
const TaskScopeCreateArgs = z.object({ allowed_roots: z.array(z.string()).optional(), auto_allow: z.array(z.string()).optional(), requires_confirm: z.array(z.string()).optional(), ttl_minutes: z.number().int().min(1).max(1440).default(60), limits: z.object({ maxFilesChanged: z.number().int().optional(), maxLinesChanged: z.number().int().optional(), maxCommandSeconds: z.number().int().optional(), maxLocalModelBatchTokens: z.number().int().optional() }).optional() });
const TaskScopeUseArgs = z.object({ task_id: z.string() });
const ConfirmationClearArgs = z.object({ confirmation_id: z.string() });
const ConfirmationApproveArgs = z.object({ confirmation_id: z.string(), ttl_minutes: z.number().int().min(1).max(60).default(10) });
const SafetyFreezeArgs = z.object({ reason: z.string().default('manual') });
const AuditListArgs = z.object({ source: z.enum(['memory', 'disk']).default('memory'), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional() });
const FileReadArgs = z.object({ path: z.string(), offset_line: z.number().int().min(1).default(1), limit_lines: z.number().int().min(1).max(2000).default(200), max_bytes: z.number().int().min(1).max(1024 * 1024).default(512 * 1024), with_line_numbers: z.boolean().default(true) });
const FileReadManyArgs = z.object({ items: z.array(z.object({ path: z.string(), offset_line: z.number().int().min(1).optional(), limit_lines: z.number().int().min(1).max(2000).optional(), max_bytes: z.number().int().min(1).max(1024 * 1024).optional(), with_line_numbers: z.boolean().optional() })).min(1).max(100), max_total_bytes: z.number().int().min(1).max(4 * 1024 * 1024).default(512 * 1024) });
const FileSearchArgs = z.object({ path: z.string().optional(), query: z.string().min(1), max_results: z.number().int().min(1).max(500).default(50), file_glob: z.string().optional(), regex: z.boolean().default(false), case_sensitive: z.boolean().default(false), include_filenames: z.boolean().default(true), include_contents: z.boolean().default(true), max_file_bytes: z.number().int().min(1).max(10 * 1024 * 1024).default(256 * 1024), context_before: z.number().int().min(0).max(20).default(0), context_after: z.number().int().min(0).max(20).default(0), cursor: z.string().optional(), backend: z.enum(['auto', 'rg', 'native']).default('auto') });
const FileIndexBuildArgs = z.object({ root: z.string().optional(), file_glob: z.string().optional(), max_file_bytes: z.number().int().min(1).max(10 * 1024 * 1024).default(1024 * 1024), force: z.boolean().default(false) });
const FileIndexSearchArgs = z.object({ root: z.string().optional(), query: z.string().min(1), limit: z.number().int().min(1).max(200).default(20), offset: z.number().int().min(0).default(0), snippet_chars: z.number().int().min(80).max(2000).default(400) });
const FileIndexStatsArgs = z.object({ root: z.string().optional() });
const EmbeddingIndexBuildArgs = z.object({ root: z.string().optional(), file_glob: z.string().optional(), max_file_bytes: z.number().int().min(1).max(5 * 1024 * 1024).default(512 * 1024), chunk_chars: z.number().int().min(500).max(12000).default(3000), force: z.boolean().default(false) });
const EmbeddingIndexSearchArgs = z.object({ root: z.string().optional(), query: z.string().min(1), limit: z.number().int().min(1).max(100).default(10) });
const EmbeddingIndexStatsArgs = z.object({ root: z.string().optional() });
const FileOutlineArgs = z.object({ path: z.string(), max_bytes: z.number().int().min(1).max(2 * 1024 * 1024).default(512 * 1024), max_items: z.number().int().min(1).max(2000).default(300), outline_backend: z.enum(['auto', 'tree_sitter', 'regex']).default('auto') });
const FileHashArgs = z.object({ path: z.string() });
const SnapshotCreateArgs = z.object({ path: z.string(), reason: z.string().default('manual') });
const SnapshotRestoreArgs = z.object({ snapshot_id: z.string(), target_path: z.string().optional() });
const PatchDryRunArgs = z.object({ path: z.string(), expected_hash: z.string(), old_text: z.string(), new_text: z.string(), risk: z.enum(['R0', 'R1', 'R2', 'R3', 'R4']).default('R1'), dry_run_required: z.boolean().default(true), auto_snapshot: z.boolean().default(true), with_local_risk: z.boolean().default(false) });
const PatchApplyArgs = PatchDryRunArgs.omit({ with_local_risk: true });
const PatchPlanArgs = z.object({ patches: z.array(PatchApplyArgs).min(1).max(100), max_files_changed: z.number().int().min(1).max(100).default(30), max_lines_changed: z.number().int().min(1).max(20000).default(8000) });
const PatchVerifyArgs = z.object({ path: z.string(), expected_text: z.string(), old_text: z.string().optional() });
const RemoteSessionOpenArgs = z.object({ target: SshTargetSchema, cwd: z.string().optional() });
const RemoteSessionCloseArgs = z.object({ session_id: z.string() });
const RemoteExecArgs = z.object({ target: SshTargetSchema.optional(), session_id: z.string().optional(), command: z.string(), cwd: z.string().optional(), timeout_ms: z.number().int().min(1000).max(3600000).default(300000) });
const RemoteStreamStartArgs = z.object({ target: SshTargetSchema, command: z.string(), cwd: z.string().optional() });
const RemoteStreamReadArgs = z.object({ stream_id: z.string(), clear: z.boolean().default(false) });
const RemoteStreamKillArgs = z.object({ stream_id: z.string(), signal: z.string().default('SIGTERM') });
const RemotePtyOpenArgs = z.object({ target: SshTargetSchema, cwd: z.string().optional() });
const RemotePtyWriteArgs = z.object({ pty_id: z.string(), input: z.string() });
const RemotePtyReadArgs = z.object({ pty_id: z.string(), clear: z.boolean().default(false) });
const RemotePtyCloseArgs = z.object({ pty_id: z.string() });
const RemoteTunnelOpenArgs = z.object({ target: SshTargetSchema, local_host: z.string().default('127.0.0.1'), local_port: z.number().int().min(1).max(65535), remote_host: z.string().default('127.0.0.1'), remote_port: z.number().int().min(1).max(65535) });
const RemoteTunnelCloseArgs = z.object({ tunnel_id: z.string() });
const RemoteAgentBootstrapArgs = z.object({ target: SshTargetSchema, install_path: z.string().default('/tmp/aix-rootops-agent.js') });
const RemoteAgentSystemdInstallArgs = z.object({ target: SshTargetSchema, install_path: z.string().default('/opt/aix-rootops-agent/aix-rootops-agent.js'), service_name: z.string().default('aix-rootops-agent'), port: z.number().int().min(1).max(65535).default(18765), token: z.string().optional(), user: z.string().default('root') });
const RemoteAgentSystemdActionArgs = z.object({ target: SshTargetSchema, service_name: z.string().default('aix-rootops-agent') });
const RemoteAgentSystemdRotateTokenArgs = z.object({ target: SshTargetSchema, service_name: z.string().default('aix-rootops-agent'), new_token: z.string().optional() });
const RemoteAgentClientBaseArgs = z.object({ base_url: z.string().url(), token: z.string() });
const RemoteAgentHashArgs = RemoteAgentClientBaseArgs.extend({ path: z.string() });
const RemoteAgentReadArgs = RemoteAgentClientBaseArgs.extend({ path: z.string(), offset: z.number().int().min(0).default(0), length: z.number().int().min(1).max(1024 * 1024).default(65536) });
const RemoteAgentSearchArgs = RemoteAgentClientBaseArgs.extend({ root: z.string(), query: z.string(), max: z.number().int().min(1).max(200).default(50) });
const RemoteAgentExecArgs = RemoteAgentClientBaseArgs.extend({ command: z.string(), cwd: z.string().optional(), timeout_ms: z.number().int().min(1000).max(3600000).default(300000) });
const RemoteRsyncPushArgs = z.object({ source: z.string(), target: SshTargetSchema, destination: z.string() });
const RemoteRsyncPullArgs = z.object({ target: SshTargetSchema, source: z.string(), destination: z.string() });
const RemoteGroupRegisterArgs = z.object({ name: z.string(), targets: z.array(SshTargetSchema).min(1).max(100) });
const RemoteGroupExecArgs = z.object({ name: z.string(), command: z.string(), cwd: z.string().optional(), timeout_ms: z.number().int().min(1000).max(3600000).default(300000) });
const LocalEmbedArgs = z.object({ texts: z.array(z.string()).min(1).max(128) });
const LocalRerankArgs = z.object({ query: z.string(), candidates: z.array(z.object({ id: z.string(), text: z.string(), metadata: z.record(z.unknown()).optional() })).min(1).max(200) });
const LocalSummarizeArgs = z.object({ text: z.string().min(1) });
const LocalContextPackArgs = z.object({ root: z.string().optional(), query: z.string().min(1), max_files: z.number().int().min(1).max(50).default(8), max_total_bytes: z.number().int().min(1).max(4 * 1024 * 1024).default(512 * 1024), lines_per_file: z.number().int().min(1).max(1000).default(120), file_glob: z.string().optional() });
