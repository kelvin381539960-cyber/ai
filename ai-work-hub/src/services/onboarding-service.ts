import { getDb } from '@/lib/db';
import { ensureDataDirs, getDataDir } from '@/lib/fs-store';
import { createId, nowIso } from '@/lib/ids';
import { seedAssistants, seedWorkflows } from '@/lib/templates';

export function ensureInitialized(): void {
  const db = getDb();
  const workspace = db.prepare('SELECT id FROM workspaces LIMIT 1').get();
  if (!workspace) initializeWorkspace({ workspaceName: '我的工作台' });
}

export function initializeWorkspace(input: { workspaceName: string; dataDir?: string }) {
  const db = getDb();
  const dataDir = input.dataDir || getDataDir();
  ensureDataDirs(dataDir);
  const existing = db.prepare('SELECT * FROM workspaces LIMIT 1').get() as { id: string } | undefined;
  const now = nowIso();
  const workspaceId = existing?.id || createId('workspace');

  if (!existing) {
    db.prepare('INSERT INTO workspaces (id, name, data_dir, created_at, updated_at) VALUES (?, ?, ?, ?, ?)')
      .run(workspaceId, input.workspaceName, dataDir, now, now);
    db.prepare('INSERT INTO projects (id, workspace_id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(createId('project'), workspaceId, '默认项目', '默认业务空间', now, now);
  }

  installSeedTemplates(workspaceId);
  return db.prepare('SELECT * FROM workspaces WHERE id = ?').get(workspaceId);
}

export function installSeedTemplates(workspaceId: string): void {
  const db = getDb();
  const now = nowIso();
  for (const assistant of seedAssistants) {
    const exists = db.prepare('SELECT id FROM assistants WHERE workspace_id = ? AND name = ?').get(workspaceId, assistant.name);
    if (!exists) {
      db.prepare(`INSERT INTO assistants (id, workspace_id, name, type, applicable_task_types_json, capabilities_json, prompt_template, default_context_scope, enabled, config_json, is_seed, created_at, updated_at)
        VALUES (?, ?, ?, 'manual', ?, ?, ?, ?, 1, '{}', 1, ?, ?)`).run(
        createId('assistant'),
        workspaceId,
        assistant.name,
        JSON.stringify(assistant.applicableTaskTypes),
        JSON.stringify(assistant.capabilities),
        assistant.promptTemplate,
        assistant.defaultContextScope,
        now,
        now
      );
    }
  }

  for (const workflow of seedWorkflows) {
    const exists = db.prepare('SELECT id FROM workflows WHERE workspace_id = ? AND name = ?').get(workspaceId, workflow.name);
    if (!exists) {
      const steps = workflow.steps.map((title, index) => ({ id: `step_${index + 1}`, title, type: index === 0 ? 'manual_input' : 'assistant_run', useDefaultAssistant: true, required: true }));
      db.prepare(`INSERT INTO workflows (id, workspace_id, name, description, applicable_task_types_json, steps_json, enabled, is_seed, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?, ?)`).run(
        createId('workflow'),
        workspaceId,
        workflow.name,
        workflow.name,
        JSON.stringify(workflow.applicableTaskTypes),
        JSON.stringify(steps),
        now,
        now
      );
    }
  }
}
