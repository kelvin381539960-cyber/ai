import { getDb } from '@/lib/db';
import { createId, nowIso } from '@/lib/ids';
import { createManualRun } from './run-service';
import type { StepState, WorkflowRow, WorkflowRunRow, WorkflowStep } from '@/types/db';

function parseSteps(workflow: WorkflowRow): WorkflowStep[] {
  return JSON.parse(workflow.steps_json || '[]') as WorkflowStep[];
}

function parseStepStates(workflowRun: WorkflowRunRow): Record<string, StepState> {
  return JSON.parse(workflowRun.step_states_json || '{}') as Record<string, StepState>;
}

function saveWorkflowRunState(workflowRunId: string, status: WorkflowRunRow['status'], currentStepId: string | null, states: Record<string, StepState>) {
  const db = getDb();
  db.prepare('UPDATE workflow_runs SET status = ?, current_step_id = ?, step_states_json = ?, updated_at = ? WHERE id = ?')
    .run(status, currentStepId, JSON.stringify(states), nowIso(), workflowRunId);
}

export function listTaskWorkflowRuns(taskId: string): Array<WorkflowRunRow & { workflow_name: string }> {
  const db = getDb();
  return db.prepare(`SELECT workflow_runs.*, workflows.name AS workflow_name FROM workflow_runs JOIN workflows ON workflows.id = workflow_runs.workflow_id WHERE workflow_runs.task_id = ? ORDER BY workflow_runs.updated_at DESC`).all(taskId) as Array<WorkflowRunRow & { workflow_name: string }>;
}

export function startTaskWorkflow(taskId: string): WorkflowRunRow {
  const db = getDb();
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId) as { workflow_id?: string | null } | undefined;
  if (!task?.workflow_id) throw new Error('任务未设置推荐流程');
  const workflow = db.prepare('SELECT * FROM workflows WHERE id = ?').get(task.workflow_id) as WorkflowRow | undefined;
  if (!workflow) throw new Error('流程不存在');

  const steps = parseSteps(workflow);
  const states: Record<string, StepState> = {};
  for (const step of steps) {
    states[step.id] = { status: 'pending', title: step.title, type: step.type };
  }

  const workflowRunId = createId('workflow_run');
  const now = nowIso();
  db.prepare(`INSERT INTO workflow_runs (id, task_id, workflow_id, status, current_step_id, step_states_json, created_at, updated_at)
    VALUES (?, ?, ?, 'pending', NULL, ?, ?, ?)`).run(workflowRunId, taskId, workflow.id, JSON.stringify(states), now, now);
  return advanceWorkflowRun(workflowRunId);
}

export function advanceWorkflowRun(workflowRunId: string): WorkflowRunRow {
  const db = getDb();
  const workflowRun = db.prepare('SELECT * FROM workflow_runs WHERE id = ?').get(workflowRunId) as WorkflowRunRow | undefined;
  if (!workflowRun) throw new Error('流程运行不存在');
  if (workflowRun.status === 'cancelled' || workflowRun.status === 'success') return workflowRun;

  const workflow = db.prepare('SELECT * FROM workflows WHERE id = ?').get(workflowRun.workflow_id) as WorkflowRow;
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(workflowRun.task_id) as { default_assistant_id?: string | null };
  const steps = parseSteps(workflow);
  const states = parseStepStates(workflowRun);

  const nextStep = steps.find((step) => states[step.id]?.status === 'pending' || states[step.id]?.status === 'running');
  if (!nextStep) {
    saveWorkflowRunState(workflowRunId, 'success', null, states);
    return db.prepare('SELECT * FROM workflow_runs WHERE id = ?').get(workflowRunId) as WorkflowRunRow;
  }

  states[nextStep.id] = { ...states[nextStep.id], status: 'running' };
  saveWorkflowRunState(workflowRunId, 'running', nextStep.id, states);

  if (nextStep.type === 'manual_input' || nextStep.type === 'add_material') {
    states[nextStep.id] = { ...states[nextStep.id], status: 'waiting_user', note: '等待用户确认或补充资料' };
    saveWorkflowRunState(workflowRunId, 'waiting_user', nextStep.id, states);
    return db.prepare('SELECT * FROM workflow_runs WHERE id = ?').get(workflowRunId) as WorkflowRunRow;
  }

  if (nextStep.type === 'assistant_run' || nextStep.type === 'review_prompt') {
    const assistantId = nextStep.assistantId || task.default_assistant_id;
    if (!assistantId) throw new Error('当前步骤没有可用助手');
    const run = createManualRun({
      taskId: workflowRun.task_id,
      assistantId,
      reason: `workflow:${nextStep.title}`,
      workflowRunId,
      workflowStepId: nextStep.id
    });
    states[nextStep.id] = { ...states[nextStep.id], status: 'waiting_user', runId: run.id };
    saveWorkflowRunState(workflowRunId, 'waiting_user', nextStep.id, states);
    return db.prepare('SELECT * FROM workflow_runs WHERE id = ?').get(workflowRunId) as WorkflowRunRow;
  }

  states[nextStep.id] = { ...states[nextStep.id], status: 'success' };
  saveWorkflowRunState(workflowRunId, 'running', null, states);
  return advanceWorkflowRun(workflowRunId);
}

export function continueWorkflowRun(workflowRunId: string): WorkflowRunRow {
  const db = getDb();
  const workflowRun = db.prepare('SELECT * FROM workflow_runs WHERE id = ?').get(workflowRunId) as WorkflowRunRow | undefined;
  if (!workflowRun) throw new Error('流程运行不存在');
  const states = parseStepStates(workflowRun);
  if (workflowRun.current_step_id && states[workflowRun.current_step_id]) {
    states[workflowRun.current_step_id] = { ...states[workflowRun.current_step_id], status: 'success' };
  }
  saveWorkflowRunState(workflowRunId, 'running', null, states);
  return advanceWorkflowRun(workflowRunId);
}

export function cancelWorkflowRun(workflowRunId: string): WorkflowRunRow {
  const db = getDb();
  const workflowRun = db.prepare('SELECT * FROM workflow_runs WHERE id = ?').get(workflowRunId) as WorkflowRunRow | undefined;
  if (!workflowRun) throw new Error('流程运行不存在');
  saveWorkflowRunState(workflowRunId, 'cancelled', workflowRun.current_step_id, parseStepStates(workflowRun));
  return db.prepare('SELECT * FROM workflow_runs WHERE id = ?').get(workflowRunId) as WorkflowRunRow;
}

export function getStepStates(workflowRun: WorkflowRunRow): Record<string, StepState> {
  return parseStepStates(workflowRun);
}
