import type { TaskScope } from '../types.js';

export const DEFAULT_TASK_SCOPE: TaskScope = {
  taskId: 'default',
  allowedRoots: ['/opt/AIX代码', '/opt/feishu-bridge', '/opt/cursor-bridge', '/opt/crawlx', '/opt/prd'],
  expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  autoAllow: [
    'file.read', 'file.read_many', 'file.list', 'file.search', 'file.hash', 'file.outline', 'file.related',
    'patch.dry_run', 'patch.plan', 'patch.verify', 'patch.apply', 'snapshot.create',
    'git.status', 'git.diff', 'git.log', 'build.run',
    'local.embed', 'local.rerank', 'local.summarize', 'local.patch_risk', 'local.context_pack'
  ],
  requiresConfirm: ['snapshot.restore', 'git.push', 'git.rollback', 'file.delete.large', 'sudo', 'systemctl', 'database.write', 'policy.manage', 'deploy.apply'],
  limits: { maxFilesChanged: 30, maxLinesChanged: 8000, maxCommandSeconds: 300, maxLocalModelBatchTokens: 200000 }
};

export const DANGEROUS_TOOL_NAMES = new Set(['approval.bypass', 'policy.manage', 'sudo', 'systemctl', 'database.write', 'git.push', 'git.rollback', 'file.delete.large', 'deploy.apply', 'snapshot.restore']);
