import path from 'node:path';
import { getDb } from '@/lib/db';
import { getDataDir, writeTextFile } from '@/lib/fs-store';
import { createId, nowIso } from '@/lib/ids';
import { buildPrompt } from './context-builder';
import type { RunRow } from '@/types/db';

export function runDefaultAssistant(taskId: string): RunRow {
  const db = getDb();
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId) as { default_assistant_id?: string } | undefined;
  if (!task?.default_assistant_id) throw new Error('任务未设置默认助手');
  return createManualRun({ taskId, assistantId: task.default_assistant_id, reason: 'continue' });
}

export function createManualRun(input: {
  taskId: string;
  assistantId: string;
  reason: string;
  workflowRunId?: string;
  workflowStepId?: string;
}): RunRow {
  const db = getDb();
  const now = nowIso();
  const runId = createId('run');
  const { prompt, usedMaterialIds } = buildPrompt(input.taskId, input.assistantId);
  const promptPath = path.join(getDataDir(), 'runs', runId, 'prompt.md');
  writeTextFile(promptPath, prompt);
  db.prepare(`INSERT INTO runs (id, task_id, assistant_id, workflow_run_id, workflow_step_id, reason, context_scope, prompt_path, status, used_material_ids_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'standard', ?, 'waiting_user', ?, ?)`).run(
    runId,
    input.taskId,
    input.assistantId,
    input.workflowRunId || null,
    input.workflowStepId || null,
    input.reason,
    promptPath,
    JSON.stringify(usedMaterialIds),
    now
  );
  db.prepare('UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?').run('running', now, input.taskId);
  return db.prepare('SELECT * FROM runs WHERE id = ?').get(runId) as RunRow;
}

export function completeRun(runId: string, input: { result: string; outputTitle: string; outputType: string }): RunRow {
  const db = getDb();
  const run = db.prepare('SELECT * FROM runs WHERE id = ?').get(runId) as RunRow | undefined;
  if (!run) throw new Error('Run 不存在');
  const now = nowIso();
  const resultPath = path.join(getDataDir(), 'runs', runId, 'result.md');
  writeTextFile(resultPath, input.result);
  db.prepare('UPDATE runs SET result_path = ?, status = ?, completed_at = ? WHERE id = ?').run(resultPath, 'success', now, runId);

  const outputId = createId('output');
  const contentPath = path.join(getDataDir(), 'outputs', `${outputId}.md`);
  writeTextFile(contentPath, input.result);
  const usedMaterialIds = JSON.parse(run.used_material_ids_json || '[]');
  db.prepare(`INSERT INTO outputs (id, task_id, type, title, content_path, version, is_final, source_run_ids_json, source_material_ids_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 1, 0, ?, ?, ?, ?)`).run(outputId, run.task_id, input.outputType, input.outputTitle, contentPath, JSON.stringify([runId]), JSON.stringify(usedMaterialIds), now, now);
  db.prepare('UPDATE tasks SET updated_at = ? WHERE id = ?').run(now, run.task_id);
  return db.prepare('SELECT * FROM runs WHERE id = ?').get(runId) as RunRow;
}
