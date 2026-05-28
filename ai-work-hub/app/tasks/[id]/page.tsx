import { notFound, redirect } from 'next/navigation';
import { CopyButton } from '@/components/CopyButton';
import { getTaskDetail } from '@/services/query-service';
import { addMaterial } from '@/services/material-service';
import { runDefaultAssistant, completeRun } from '@/services/run-service';
import { updateOutput, markOutputFinal, createOutputVersion, convertOutputToMaterial } from '@/services/output-service';
import { startTaskWorkflow, continueWorkflowRun, cancelWorkflowRun } from '@/services/workflow-service';

export const dynamic = 'force-dynamic';

async function addMaterialAction(formData: FormData) {
  'use server';
  const taskId = String(formData.get('taskId'));
  addMaterial(taskId, {
    title: String(formData.get('title') || '资料'),
    content: String(formData.get('content') || ''),
    type: 'text',
    usageStatus: String(formData.get('usageStatus') || 'active') as 'active' | 'key' | 'excluded' | 'archived'
  });
  redirect(`/tasks/${taskId}`);
}

async function runAction(formData: FormData) {
  'use server';
  const taskId = String(formData.get('taskId'));
  const run = runDefaultAssistant(taskId);
  redirect(`/tasks/${taskId}?run=${run.id}`);
}

async function startWorkflowAction(formData: FormData) {
  'use server';
  const taskId = String(formData.get('taskId'));
  startTaskWorkflow(taskId);
  redirect(`/tasks/${taskId}`);
}

async function continueWorkflowAction(formData: FormData) {
  'use server';
  const taskId = String(formData.get('taskId'));
  continueWorkflowRun(String(formData.get('workflowRunId')));
  redirect(`/tasks/${taskId}`);
}

async function cancelWorkflowAction(formData: FormData) {
  'use server';
  const taskId = String(formData.get('taskId'));
  cancelWorkflowRun(String(formData.get('workflowRunId')));
  redirect(`/tasks/${taskId}`);
}

async function completeRunAction(formData: FormData) {
  'use server';
  const taskId = String(formData.get('taskId'));
  const run = completeRun(String(formData.get('runId')), {
    result: String(formData.get('result') || ''),
    outputTitle: String(formData.get('outputTitle') || '输出结果'),
    outputType: String(formData.get('outputType') || 'research_report')
  });
  if (run.workflow_run_id) {
    continueWorkflowRun(run.workflow_run_id);
  }
  redirect(`/tasks/${taskId}`);
}

async function updateOutputAction(formData: FormData) {
  'use server';
  const taskId = String(formData.get('taskId'));
  updateOutput(String(formData.get('outputId')), {
    title: String(formData.get('title') || ''),
    content: String(formData.get('content') || '')
  });
  redirect(`/tasks/${taskId}`);
}

async function newVersionAction(formData: FormData) {
  'use server';
  const taskId = String(formData.get('taskId'));
  createOutputVersion(String(formData.get('outputId')), {
    title: String(formData.get('title') || ''),
    content: String(formData.get('content') || '')
  });
  redirect(`/tasks/${taskId}`);
}

async function markFinalAction(formData: FormData) {
  'use server';
  const taskId = String(formData.get('taskId'));
  markOutputFinal(String(formData.get('outputId')));
  redirect(`/tasks/${taskId}`);
}

async function convertOutputAction(formData: FormData) {
  'use server';
  const taskId = String(formData.get('taskId'));
  convertOutputToMaterial(String(formData.get('outputId')), taskId);
  redirect(`/tasks/${taskId}`);
}

export default async function TaskDetailPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ run?: string }> }) {
  const { id } = await params;
  const { run } = await searchParams;
  const detail = getTaskDetail(id);
  if (!detail) notFound();
  const activeRun = run ? detail.runs.find((item) => item.id === run) : detail.runs.find((item) => item.status === 'waiting_user');
  const activePrompt = activeRun ? detail.promptByRunId[activeRun.id] || '' : '';

  return (
    <main className="container">
      <section className="card" style={{ marginBottom: 16 }}>
        <div className="row">
          <h1>{detail.task.title}</h1>
          <span className="badge">{detail.task.type}</span>
          <span className="badge">{detail.task.status}</span>
        </div>
        <p>{detail.task.goal}</p>
        <p className="muted">默认助手：{detail.defaultAssistant?.name || '未设置'} · 资料范围：{detail.task.context_scope}</p>
        <div className="row">
          <form action={runAction}>
            <input type="hidden" name="taskId" value={detail.task.id} />
            <button className="btn" type="submit">继续生成</button>
          </form>
          <form action={startWorkflowAction}>
            <input type="hidden" name="taskId" value={detail.task.id} />
            <button className="btn secondary" type="submit">运行推荐流程</button>
          </form>
        </div>
      </section>

      {activeRun ? (
        <section className="card" style={{ marginBottom: 16 }}>
          <h2>等待回填的助手运行</h2>
          <p className="muted">请确认 Prompt 中不包含不应发送给外部 AI 的敏感信息。复制后到外部 AI 执行，再把结果粘贴回来。</p>
          <div className="row" style={{ marginBottom: 12 }}>
            <CopyButton text={activePrompt} label="复制 Prompt" />
          </div>
          <pre>{activePrompt || 'Prompt 文件不存在'}</pre>
          <form action={completeRunAction}>
            <input type="hidden" name="taskId" value={detail.task.id} />
            <input type="hidden" name="runId" value={activeRun.id} />
            <input type="hidden" name="outputType" value="research_report" />
            <label>输出标题</label>
            <input className="input" name="outputTitle" defaultValue="调研结论 v1" />
            <label>粘贴外部 AI 输出</label>
            <textarea name="result" required />
            <div style={{ marginTop: 12 }}>
              <button className="btn" type="submit">保存为输出</button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="grid" style={{ marginBottom: 16 }}>
        <div className="card">
          <h2>任务资料</h2>
          {detail.materials.length === 0 ? <p className="muted">暂无资料。可先添加资料，也可以直接生成初稿。</p> : null}
          {detail.materials.map((m) => (
            <div key={m.id} style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 10 }}>
              <strong>{m.title}</strong> <span className="badge">{m.usage_status}</span>
              <p className="muted">{m.content}</p>
            </div>
          ))}
          <form action={addMaterialAction} style={{ marginTop: 12 }}>
            <input type="hidden" name="taskId" value={detail.task.id} />
            <label>新增资料</label>
            <input className="input" name="title" placeholder="资料标题" />
            <textarea name="content" placeholder="资料内容" />
            <select className="input" name="usageStatus" defaultValue="active">
              <option value="active">普通资料</option>
              <option value="key">重点资料</option>
              <option value="excluded">暂不使用</option>
            </select>
            <div style={{ marginTop: 12 }}><button className="btn secondary" type="submit">添加资料</button></div>
          </form>
        </div>

        <div className="card">
          <h2>任务流程</h2>
          {detail.workflowRuns.length === 0 ? <p className="muted">还没有运行流程。</p> : null}
          {detail.workflowRuns.map((workflowRun) => (
            <div key={workflowRun.id} style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 10 }}>
              <div className="row">
                <strong>{workflowRun.workflow_name}</strong>
                <span className="badge">{workflowRun.status}</span>
              </div>
              <p className="muted">当前步骤：{workflowRun.current_step_id || '无'}</p>
              <div style={{ display: 'grid', gap: 6 }}>
                {Object.entries(workflowRun.stepStates).map(([stepId, state]) => (
                  <div key={stepId} className="row">
                    <span className="badge">{state.status}</span>
                    <span>{state.title}</span>
                    {state.runId ? <span className="muted">Run: {state.runId}</span> : null}
                  </div>
                ))}
              </div>
              <div className="row" style={{ marginTop: 10 }}>
                {workflowRun.status === 'waiting_user' ? (
                  <form action={continueWorkflowAction}>
                    <input type="hidden" name="taskId" value={detail.task.id} />
                    <input type="hidden" name="workflowRunId" value={workflowRun.id} />
                    <button className="btn secondary" type="submit">确认并继续流程</button>
                  </form>
                ) : null}
                {workflowRun.status !== 'success' && workflowRun.status !== 'cancelled' ? (
                  <form action={cancelWorkflowAction}>
                    <input type="hidden" name="taskId" value={detail.task.id} />
                    <input type="hidden" name="workflowRunId" value={workflowRun.id} />
                    <button className="btn secondary" type="submit">取消流程</button>
                  </form>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <h2>执行记录</h2>
          {detail.runs.length === 0 ? <p className="muted">暂无执行记录。</p> : null}
          {detail.runs.map((item) => (
            <div key={item.id} style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 10 }}>
              <strong>{item.status}</strong>
              <p className="muted">{item.id}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>输出结果</h2>
        {detail.outputs.length === 0 ? <p className="muted">还没有输出。运行默认助手后，回填外部 AI 结果即可生成输出。</p> : null}
        <div style={{ display: 'grid', gap: 16 }}>
          {detail.outputs.map((output) => {
            const content = detail.outputContentById[output.id] || '';
            return (
              <div key={output.id} className="card">
                <form action={updateOutputAction}>
                  <input type="hidden" name="taskId" value={detail.task.id} />
                  <input type="hidden" name="outputId" value={output.id} />
                  <div className="row">
                    <span className="badge">v{output.version}</span>
                    {output.is_final ? <span className="badge">最终版</span> : null}
                    <CopyButton text={content} label="复制 Markdown" />
                  </div>
                  <label>标题</label>
                  <input className="input" name="title" defaultValue={output.title} />
                  <label>内容</label>
                  <textarea name="content" defaultValue={content} />
                  <div className="row" style={{ marginTop: 12 }}>
                    <button className="btn secondary" type="submit">保存编辑</button>
                    <button className="btn secondary" formAction={newVersionAction}>另存为新版本</button>
                  </div>
                </form>
                <div className="row" style={{ marginTop: 8 }}>
                  <form action={markFinalAction}>
                    <input type="hidden" name="taskId" value={detail.task.id} />
                    <input type="hidden" name="outputId" value={output.id} />
                    <button className="btn" type="submit">标记最终版</button>
                  </form>
                  <form action={convertOutputAction}>
                    <input type="hidden" name="taskId" value={detail.task.id} />
                    <input type="hidden" name="outputId" value={output.id} />
                    <button className="btn secondary" type="submit">转为任务资料</button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
