import path from 'node:path';
import { getDb } from '@/lib/db';
import { getDataDir, readTextFile, writeTextFile } from '@/lib/fs-store';
import { createId, nowIso } from '@/lib/ids';
import { taskTypeDefaults } from '@/lib/templates';
import type { OutputRow } from '@/types/db';

export function updateOutput(outputId: string, input: { title: string; content: string }) {
  const db = getDb();
  const output = db.prepare('SELECT * FROM outputs WHERE id = ?').get(outputId) as OutputRow | undefined;
  if (!output) throw new Error('Output 不存在');
  writeTextFile(output.content_path, input.content);
  const now = nowIso();
  db.prepare('UPDATE outputs SET title = ?, updated_at = ? WHERE id = ?').run(input.title, now, outputId);
  db.prepare('UPDATE tasks SET updated_at = ? WHERE id = ?').run(now, output.task_id);
  return db.prepare('SELECT * FROM outputs WHERE id = ?').get(outputId);
}

export function createOutputVersion(outputId: string, input: { title: string; content: string }) {
  const db = getDb();
  const output = db.prepare('SELECT * FROM outputs WHERE id = ?').get(outputId) as OutputRow | undefined;
  if (!output) throw new Error('Output 不存在');
  const row = db.prepare('SELECT MAX(version) AS maxVersion FROM outputs WHERE task_id = ? AND type = ?').get(output.task_id, output.type) as { maxVersion: number | null };
  const nextVersion = (row.maxVersion || 0) + 1;
  const now = nowIso();
  const newId = createId('output');
  const contentPath = path.join(getDataDir(), 'outputs', `${newId}.md`);
  writeTextFile(contentPath, input.content);
  db.prepare(`INSERT INTO outputs (id, task_id, type, title, content_path, version, is_final, source_run_ids_json, source_material_ids_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`).run(
    newId,
    output.task_id,
    output.type,
    input.title,
    contentPath,
    nextVersion,
    output.source_run_ids_json,
    output.source_material_ids_json,
    now,
    now
  );
  db.prepare('UPDATE tasks SET updated_at = ? WHERE id = ?').run(now, output.task_id);
  return db.prepare('SELECT * FROM outputs WHERE id = ?').get(newId);
}

export function markOutputFinal(outputId: string) {
  const db = getDb();
  const output = db.prepare('SELECT * FROM outputs WHERE id = ?').get(outputId) as OutputRow | undefined;
  if (!output) throw new Error('Output 不存在');
  const now = nowIso();
  db.prepare('UPDATE outputs SET is_final = 0 WHERE task_id = ? AND type = ?').run(output.task_id, output.type);
  db.prepare('UPDATE outputs SET is_final = 1, updated_at = ? WHERE id = ?').run(now, outputId);
  db.prepare('UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?').run('done', now, output.task_id);
  return { ...output, content: readTextFile(output.content_path), is_final: 1 };
}

export function convertOutputToMaterial(outputId: string, targetTaskId?: string) {
  const db = getDb();
  const output = db.prepare('SELECT * FROM outputs WHERE id = ?').get(outputId) as OutputRow | undefined;
  if (!output) throw new Error('Output 不存在');
  const taskId = targetTaskId || output.task_id;
  const now = nowIso();
  const content = readTextFile(output.content_path);
  const materialId = createId('material');
  db.prepare(`INSERT INTO materials (id, task_id, type, title, content, usage_status, created_at, updated_at)
    VALUES (?, ?, 'ai_output', ?, ?, 'key', ?, ?)`).run(
    materialId,
    taskId,
    `输出资料：${output.title}`,
    content,
    now,
    now
  );
  db.prepare('UPDATE tasks SET updated_at = ? WHERE id = ?').run(now, taskId);
  return db.prepare('SELECT * FROM materials WHERE id = ?').get(materialId);
}

export function createTaskFromOutput(outputId: string, input: { type: string; title: string; goal: string }) {
  const db = getDb();
  const output = db.prepare('SELECT * FROM outputs WHERE id = ?').get(outputId) as OutputRow | undefined;
  if (!output) throw new Error('Output 不存在');
  const sourceTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(output.task_id) as { project_id: string } | undefined;
  if (!sourceTask) throw new Error('来源任务不存在');
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(sourceTask.project_id) as { id: string; workspace_id: string };
  const defaults = taskTypeDefaults[input.type] || taskTypeDefaults.research;
  const assistant = db.prepare('SELECT * FROM assistants WHERE workspace_id = ? AND name = ? LIMIT 1').get(project.workspace_id, defaults.assistantName) as { id: string } | undefined;
  const workflow = db.prepare('SELECT * FROM workflows WHERE workspace_id = ? AND name = ? LIMIT 1').get(project.workspace_id, defaults.workflowName) as { id: string } | undefined;
  const now = nowIso();
  const taskId = createId('task');
  const content = readTextFile(output.content_path);

  db.prepare(`INSERT INTO tasks (id, project_id, title, type, goal, expected_output, default_assistant_id, workflow_id, context_scope, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ready', ?, ?)`).run(
    taskId,
    project.id,
    input.title,
    input.type,
    input.goal,
    '基于已有输出继续推进',
    assistant?.id || null,
    workflow?.id || null,
    defaults.contextScope,
    now,
    now
  );

  db.prepare(`INSERT INTO materials (id, task_id, type, title, content, usage_status, created_at, updated_at)
    VALUES (?, ?, 'ai_output', ?, ?, 'key', ?, ?)`).run(
    createId('material'),
    taskId,
    `来源输出：${output.title}`,
    content,
    now,
    now
  );

  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
}
