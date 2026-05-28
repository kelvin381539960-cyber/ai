import { notFound, redirect } from 'next/navigation';
import { getTaskDetail } from '@/services/query-service';
import { addMaterial } from '@/services/material-service';
import { runDefaultAssistant } from '@/services/run-service';
import { completeRun } from '@/services/run-service';
import { updateOutput, markOutputFinal } from '@/services/output-service';

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

async function completeRunAction(formData: FormData) {
  'use server';
  const taskId = String(formData.get('taskId'));
  completeRun(String(formData.get('runId')), {
    result: String(formData.get('result') || ''),
    outputTitle: String(formData.get('outputTitle') || '输出结果'),
    outputType: String(formData.get('outputType') || 'research_report')
  });
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

async function markFinalAction(formData: FormData) {
  'use server';
  const taskId = String(formData.get('taskId'));
  markOutputFinal(String(formData.get('outputId')));
  redirect(`/tasks/${taskId}`);
}

export default function TaskDetailPage({ params, searchParams }: { params: { id: string }, searchParams: { run?: string } }) {
  const detail = getTaskDetail(params.id);
  if (!detail) notFound();
  const activeRun = searchParams.run ? detail.runs.find((run) => run.id === searchParams.run) : detail.runs.find((run) => run.status === 'waiting_user');

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
        <form action={runAction}>
          <input type="hidden" name="taskId" value={detail.task.id} />
          <button className="btn" type="submit">继续生成</button>
        </form>
      </section>

      {activeRun ? (
        <section className="card" style={{ marginBottom: 16 }}>
          <h2>等待回填的助手运行</h2>
          <p className="muted">请复制 Prompt 到外部 AI，再把结果粘贴回来。</p>
          <pre>{detail.promptByRunId[activeRun.id] || 'Prompt 文件不存在'}</pre>
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
          <h2>执行记录</h2>
          {detail.runs.length === 0 ? <p className="muted">暂无执行记录。</p> : null}
          {detail.runs.map((run) => (
            <div key={run.id} style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 10 }}>
              <strong>{run.status}</strong>
              <p className="muted">{run.id}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>输出结果</h2>
        {detail.outputs.length === 0 ? <p className="muted">还没有输出。</p> : null}
        <div style={{ display: 'grid', gap: 16 }}>
          {detail.outputs.map((output) => (
            <div key={output.id} className="card">
              <form action={updateOutputAction}>
                <input type="hidden" name="taskId" value={detail.task.id} />
                <input type="hidden" name="outputId" value={output.id} />
                <div className="row">
                  <span className="badge">v{output.version}</span>
                  {output.is_final ? <span className="badge">最终版</span> : null}
                </div>
                <label>标题</label>
                <input className="input" name="title" defaultValue={output.title} />
                <label>内容</label>
                <textarea name="content" defaultValue={detail.outputContentById[output.id] || ''} />
                <div className="row" style={{ marginTop: 12 }}>
                  <button className="btn secondary" type="submit">保存编辑</button>
                </div>
              </form>
              <form action={markFinalAction} style={{ marginTop: 8 }}>
                <input type="hidden" name="taskId" value={detail.task.id} />
                <input type="hidden" name="outputId" value={output.id} />
                <button className="btn" type="submit">标记最终版</button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
