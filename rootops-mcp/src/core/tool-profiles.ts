import type { ToolProfile } from '../types.js';

export const TOOL_PROFILES: Record<ToolProfile, string[]> = {
  read_only: ['file.read', 'file.read_many', 'file.list', 'file.search', 'file.hash', 'file.outline', 'git.status', 'git.diff', 'git.log', 'local.embed', 'local.rerank', 'local.summarize', 'local.context_pack'],
  code_edit: ['file.read', 'file.read_many', 'file.search', 'file.hash', 'file.outline', 'patch.dry_run', 'patch.plan', 'patch.apply', 'patch.verify', 'snapshot.create', 'git.status', 'git.diff', 'build.run', 'local.patch_risk', 'local.context_pack'],
  server_ops: ['remote.session.open', 'remote.session.list', 'remote.session.close', 'remote.exec', 'remote.exec_stream.start', 'remote.exec_stream.read', 'remote.exec_stream.kill', 'remote.exec_stream.list', 'remote.pty.open', 'remote.pty.write', 'remote.pty.read', 'remote.pty.close', 'remote.pty.list', 'remote.tunnel.open', 'remote.tunnel.list', 'remote.tunnel.close', 'remote.agent.bootstrap', 'remote.rsync_push', 'remote.rsync_pull', 'remote.group.register', 'remote.group.exec'],
  deploy: ['deploy.plan', 'deploy.apply', 'deploy.rollback', 'systemctl', 'log.tail'],
  database: ['database.read', 'database.explain', 'database.write'],
  emergency: ['safety.freeze', 'safety.status', 'remote.exec', 'remote.exec_stream.start', 'remote.exec_stream.kill', 'remote.pty.open', 'remote.pty.write', 'systemctl', 'log.tail', 'git.rollback', 'deploy.rollback', 'snapshot.restore'],
  admin: ['policy.read', 'policy.manage', 'audit.query', 'audit.export', 'task.scope.create', 'task.scope.use', 'confirmation.list', 'safety.freeze', 'safety.unfreeze'],
  local_intelligence: ['local.embed', 'local.rerank', 'local.summarize', 'local.patch_risk', 'local.query_rewrite', 'local.context_pack', 'local.extract_symbols']
};

export function toolsForProfile(profile: ToolProfile): string[] { return TOOL_PROFILES[profile]; }
