import { DEFAULT_TASK_SCOPE } from './config/default-policy.js';
import { AuditLog } from './core/audit.js';
import { PolicyEngine } from './core/policy-engine.js';
import { classifyToolRisk } from './core/risk.js';
import { FileEngine } from './file/file-engine.js';
import type { ToolCallContext } from './types.js';

export async function runSmoke(): Promise<void> {
  const policy = new PolicyEngine(DEFAULT_TASK_SCOPE);
  const audit = new AuditLog({ auditDir: '.var/audit-smoke' });
  await audit.init();

  const ctx: ToolCallContext = {
    taskId: DEFAULT_TASK_SCOPE.taskId,
    actor: 'gpt',
    toolName: 'file.read',
    profile: 'read_only',
    args: { path: process.cwd() },
    risk: classifyToolRisk('file.read')
  };

  const decision = policy.authorize(ctx);
  const event = await audit.record({ ...ctx, decision });

  const fileEngine = new FileEngine([process.cwd()]);
  const readmePath = `${process.cwd()}/README.md`;
  const readme = await fileEngine.readLines(readmePath, 1, 20, { maxBytes: 64 * 1024, withLineNumbers: true }).catch((error) => ({ error: String(error) }));
  const search = await fileEngine.search({
    path: process.cwd(),
    query: 'RootOps',
    max_results: 10,
    regex: false,
    case_sensitive: false,
    include_filenames: true,
    include_contents: true,
    max_file_bytes: 256 * 1024,
    context_before: 1,
    context_after: 1
  });

  console.log(JSON.stringify({ ok: true, decision, event, readme, search }, null, 2));
}
