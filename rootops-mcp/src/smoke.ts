import { DEFAULT_TASK_SCOPE } from './config/default-policy.js';
import { AuditLog } from './core/audit.js';
import { PolicyEngine } from './core/policy-engine.js';
import { classifyToolRisk } from './core/risk.js';
import type { ToolCallContext } from './types.js';

export async function runSmoke(): Promise<void> {
  const policy = new PolicyEngine(DEFAULT_TASK_SCOPE);
  const audit = new AuditLog();

  const ctx: ToolCallContext = {
    taskId: DEFAULT_TASK_SCOPE.taskId,
    actor: 'gpt',
    toolName: 'file.read',
    profile: 'read_only',
    args: { path: '/opt/AIX代码/README.md' },
    risk: classifyToolRisk('file.read')
  };

  const decision = policy.authorize(ctx);
  const event = audit.record({ ...ctx, decision });

  console.log(JSON.stringify({ ok: true, decision, event }, null, 2));
}
