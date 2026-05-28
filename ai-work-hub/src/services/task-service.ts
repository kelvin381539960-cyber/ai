import { getDb } from '@/lib/db';
import { createId, nowIso } from '@/lib/ids';
import { taskTypeDefaults } from '@/lib/templates';
import { ensureInitialized } from './onboarding-service';

export function createTaskWithMaterial(input: {
  type: string;
  title: string;
  goal: string;
  expectedOutput?: string;
  materialTitle?: string;
  materialContent?: string;
}) {
  ensureInitialized();
  const db = getDb();
  const project = db.prepare('SELECT * FROM projects LIMIT 1').get() as { id: string; workspace_id: string };
  const defaults = taskTypeDefaults[input.type] || taskTypeDefaults.research;
  const assistant = db.prepare('SELECT * FROM assistants WHERE workspace_id = ? AND name = ? LIMIT 1').get(project.workspace_id, defaults.assistantName) as { id: string } | undefined;
  const workflow = db.prepare('SELECT * FROM workflows WHERE workspace_id = ? AND name = ? LIMIT 1').get(project.workspace_id, defaults.workflowName) as { id: string } | undefined;
  const now = nowIso();
  const taskId = createId('task');
  db.prepare(`INSERT INTO tasks (id, project_id, title, type, goal, expected_output, default_assistant_id, workflow_id, context_scope, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ready', ?, ?)`).run(
    taskId,
    project.id,
    input.title,
    input.type,
    input.goal,
    input.expectedOutput || '',
    assistant?.id || null,
    workflow?.id || null,
    defaults.contextScope,
    now,
    now
  );

  if (input.materialContent) {
    db.prepare(`INSERT INTO materials (id, task_id, type, title, content, usage_status, created_at, updated_at)
      VALUES (?, ?, 'text', ?, ?, 'key', ?, ?)`).run(createId('material'), taskId, input.materialTitle || '初始资料', input.materialContent, now, now);
  }

  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId) as any;
}
