import { getDb } from '@/lib/db';
import { readTextFile } from '@/lib/fs-store';

export function getInitializationStatus(): { initialized: boolean; workspaceId?: string } {
  const db = getDb();
  const row = db.prepare('SELECT id FROM workspaces LIMIT 1').get() as { id: string } | undefined;
  return row ? { initialized: true, workspaceId: row.id } : { initialized: false };
}

export function listRecentTasks(limit = 10): Array<any> {
  const db = getDb();
  return db.prepare('SELECT * FROM tasks ORDER BY updated_at DESC LIMIT ?').all(limit);
}

export function getTaskDetail(taskId: string): any | null {
  const db = getDb();
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId) as any;
  if (!task) return null;
  const materials = db.prepare('SELECT * FROM materials WHERE task_id = ? ORDER BY created_at DESC').all(taskId);
  const outputs = db.prepare('SELECT * FROM outputs WHERE task_id = ? ORDER BY created_at DESC').all(taskId) as any[];
  const runs = db.prepare('SELECT * FROM runs WHERE task_id = ? ORDER BY created_at DESC').all(taskId) as any[];
  const defaultAssistant = task.default_assistant_id ? db.prepare('SELECT * FROM assistants WHERE id = ?').get(task.default_assistant_id) : null;
  const outputContentById: Record<string, string> = {};
  for (const output of outputs) outputContentById[output.id] = readTextFile(output.content_path);
  const promptByRunId: Record<string, string> = {};
  for (const run of runs) promptByRunId[run.id] = readTextFile(run.prompt_path);
  return { task, materials, outputs, runs, defaultAssistant, outputContentById, promptByRunId };
}
