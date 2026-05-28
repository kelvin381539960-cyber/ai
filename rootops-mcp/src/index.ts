import { DEFAULT_TASK_SCOPE } from './config/default-policy.js';
import { AuditLog } from './core/audit.js';
import { PolicyEngine } from './core/policy-engine.js';
import { classifyToolRisk } from './core/risk.js';
import type { ToolCallContext } from './types.js';

const policy = new PolicyEngine(DEFAULT_TASK_SCOPE);
const audit = new AuditLog();

function smoke(): void {
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

if (process.argv.includes('--smoke')) {
  smoke();
} else {
  console.log('AIX RootOps MCP scaffold ready. Run npm run smoke.');
}
