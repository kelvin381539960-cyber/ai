import { getDb } from '@/lib/db';
import { readTextFile } from '@/lib/fs-store';
import { listTaskWorkflowRuns, getStepStates } from './workflow-service';
import type { AssistantRow, MaterialRow, OutputRow, RunRow, TaskRow, WorkflowRunRow, StepState } from '@/types/db';

export function getInitializationStatus(): { initialized: boolean; workspaceId?: string } {
  const db = getDb();
  const row = db.prepare('SELECT id FROM workspaces LIMIT 1').get() as { id: string } | undefined;
  return row ? { initialized: true, workspaceId: row.id } : { initialized: false };
}

export function listRecentTasks(limit = 10): TaskRow[] {
  const db = getDb();
  return db.prepare('SELECT * FROM tasks ORDER BY updated_at DESC LIMIT ?').all(limit) as TaskRow[];
}

export function listOutputs(limit = 100): Array<OutputRow & { task_title: string; content: string }> {
  const db = getDb();
  const rows = db.prepare(`SELECT outputs.*, tasks.title AS task_title FROM outputs JOIN tasks ON tasks.id = outputs.task_id ORDER BY outputs.updated_at DESC LIMIT ?`).all(limit) as Array<OutputRow & { task_title: string }>;
  return rows.map((row) => ({ ...row, content: readTextFile(row.content_path) }));
}

export function getTaskDetail(taskId: string): null | {
  task: TaskRow;
  materials: MaterialRow[];
  outputs: OutputRow[];
  runs: RunRow[];
  workflowRuns: Array<WorkflowRunRow & { workflow_name: string; stepStates: Record<string, StepState> }>;
  defaultAssistant: AssistantRow | null;
  outputContentById: Record<string, string>;
  promptByRunId: Record<string, string>;
} {
  const db = getDb();
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId) as TaskRow | undefined;
  if (!task) return null;
  const materials = db.prepare('SELECT * FROM materials WHERE task_id = ? ORDER BY created_at DESC').all(taskId) as MaterialRow[];
  const outputs = db.prepare('SELECT * FROM outputs WHERE task_id = ? ORDER BY created_at DESC').all(taskId) as OutputRow[];
  const runs = db.prepare('SELECT * FROM runs WHERE task_id = ? ORDER BY created_at DESC').all(taskId) as RunRow[];
  const workflowRuns = listTaskWorkflowRuns(taskId).map((workflowRun) => ({ ...workflowRun, stepStates: getStepStates(workflowRun) }));
  const defaultAssistant = task.default_assistant_id ? db.prepare('SELECT * FROM assistants WHERE id = ?').get(task.default_assistant_id) as AssistantRow : null;
  const outputContentById: Record<string, string> = {};
  for (const output of outputs) outputContentById[output.id] = readTextFile(output.content_path);
  const promptByRunId: Record<string, string> = {};
  for (const run of runs) promptByRunId[run.id] = readTextFile(run.prompt_path);
  return { task, materials, outputs, runs, workflowRuns, defaultAssistant, outputContentById, promptByRunId };
}
