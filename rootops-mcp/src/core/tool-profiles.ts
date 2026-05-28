import type { ToolProfile } from '../types.js';

export const TOOL_PROFILES: Record<ToolProfile, string[]> = {
  read_only: [
    'file.read',
    'file.list',
    'file.search',
    'file.hash',
    'git.status',
    'git.diff',
    'git.log',
    'local.embed',
    'local.rerank',
    'local.summarize'
  ],
  code_edit: [
    'file.read',
    'file.search',
    'file.patch',
    'file.write',
    'snapshot.create',
    'git.status',
    'git.diff',
    'build.run',
    'local.patch_risk',
    'local.context_pack'
  ],
  server_ops: [
    'ssh.exec',
    'ssh.exec_stream',
    'ssh.session.open',
    'ssh.session.send',
    'ssh.session.close',
    'rsync.push',
    'rsync.pull',
    'health.check',
    'log.tail'
  ],
  deploy: ['deploy.plan', 'deploy.apply', 'deploy.rollback', 'systemctl', 'log.tail'],
  database: ['database.read', 'database.explain', 'database.write'],
  emergency: ['ssh.exec', 'systemctl', 'log.tail', 'git.rollback', 'deploy.rollback'],
  admin: ['policy.read', 'policy.manage', 'audit.query', 'audit.export'],
  local_intelligence: [
    'local.embed',
    'local.rerank',
    'local.summarize',
    'local.patch_risk',
    'local.query_rewrite',
    'local.context_pack',
    'local.extract_symbols'
  ]
};

export function toolsForProfile(profile: ToolProfile): string[] {
  return TOOL_PROFILES[profile];
}
