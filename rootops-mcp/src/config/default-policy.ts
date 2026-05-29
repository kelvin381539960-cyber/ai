import type { TaskScope } from '../types.js';

export const DEFAULT_TASK_SCOPE: TaskScope = {
  taskId: 'default',
  allowedRoots: ['/opt/AIX代码', '/opt/feishu-bridge', '/opt/cursor-bridge', '/opt/crawlx', '/opt/prd'],
  expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  autoAllow: [
    'policy.check', 'task.scope.create', 'task.scope.active', 'task.scope.list', 'task.scope.use', 'confirmation.list', 'confirmation.clear', 'safety.status', 'safety.freeze', 'safety.unfreeze', 'audit.list', 'audit.export',
    'file.read', 'file.read_many', 'file.list', 'file.search', 'file.index_build', 'file.index_search', 'file.index_stats', 'embedding.index_build', 'embedding.index_search', 'embedding.index_stats', 'file.hash', 'file.outline', 'file.related',
    'patch.dry_run', 'patch.plan', 'patch.verify', 'patch.apply', 'snapshot.create',
    'remote.session.open', 'remote.session.list', 'remote.session.close', 'remote.exec', 'remote.exec_stream.start', 'remote.exec_stream.read', 'remote.exec_stream.kill', 'remote.exec_stream.list',
    'remote.pty.open', 'remote.pty.write', 'remote.pty.read', 'remote.pty.close', 'remote.pty.list',
    'remote.tunnel.open', 'remote.tunnel.list', 'remote.tunnel.close', 'remote.agent.bootstrap', 'remote.agent.systemd_install', 'remote.agent.systemd_start', 'remote.agent.systemd_stop', 'remote.agent.systemd_status', 'remote.agent.systemd_uninstall', 'remote.agent.systemd_rotate_token', 'remote.agent.health', 'remote.agent.hash', 'remote.agent.read', 'remote.agent.search', 'remote.agent.exec',
    'remote.rsync_push', 'remote.rsync_pull', 'remote.group.register', 'remote.group.exec',
    'git.status', 'git.diff', 'git.log', 'build.run',
    'local.embed', 'local.rerank', 'local.summarize', 'local.patch_risk', 'local.context_pack'
  ],
  requiresConfirm: ['snapshot.restore', 'git.push', 'git.rollback', 'file.delete.large', 'sudo', 'systemctl', 'database.write', 'policy.manage', 'deploy.apply'],
  limits: { maxFilesChanged: 30, maxLinesChanged: 8000, maxCommandSeconds: 300, maxLocalModelBatchTokens: 200000 }
};

export const DANGEROUS_TOOL_NAMES = new Set(['approval.bypass', 'policy.manage', 'sudo', 'systemctl', 'database.write', 'git.push', 'git.rollback', 'file.delete.large', 'deploy.apply', 'snapshot.restore']);
