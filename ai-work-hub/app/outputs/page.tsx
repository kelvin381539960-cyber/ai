import { redirect } from 'next/navigation';
import { CopyButton } from '@/components/CopyButton';
import { listOutputs } from '@/services/query-service';
import { createTaskFromOutput } from '@/services/output-service';

async function createTaskFromOutputAction(formData: FormData) {
  'use server';
  const task = createTaskFromOutput(String(formData.get('outputId')), {
    type: String(formData.get('type') || 'prd'),
    title: String(formData.get('title') || '基于输出的新任务'),
    goal: String(formData.get('goal') || '基于已有输出继续推进')
  }) as { id: string };
  redirect(`/tasks/${task.id}`);
}

export default function OutputsPage() {
  const outputs = listOutputs();
  return (
    <main className="container">
      <div style={{ marginBottom: 18 }}>
        <h1>输出</h1>
        <p className="muted">集中查看任务生成的结果。</p>
      </div>
      <div style={{ display: 'grid', gap: 16 }}>
        {outputs.length === 0 ? <div className="card muted">还没有输出。</div> : null}
        {outputs.map((output) => (
          <article className="card" key={output.id}>
            <div className="row">
              <h2 style={{ margin: 0 }}>{output.title}</h2>
              <span className="badge">{output.type}</span>
              <span className="badge">v{output.version}</span>
              {output.is_final ? <span className="badge">最终版</span> : null}
              <CopyButton text={output.content} label="复制 Markdown" />
            </div>
            <p className="muted">任务：{output.task_title}</p>
            <pre>{output.content}</pre>
            <details style={{ marginTop: 12 }}>
              <summary>基于这个输出创建新任务</summary>
              <form action={createTaskFromOutputAction} style={{ marginTop: 12 }}>
                <input type="hidden" name="outputId" value={output.id} />
                <label>新任务类型</label>
                <select className="input" name="type" defaultValue="prd">
                  <option value="prd">PRD 生成</option>
                  <option value="review">评审</option>
                  <option value="ops_plan">运营方案</option>
                  <option value="research">需求调研</option>
                </select>
                <label>新任务标题</label>
                <input className="input" name="title" defaultValue={`基于 ${output.title} 继续推进`} />
                <label>新任务目标</label>
                <textarea name="goal" defaultValue="基于已有输出继续推进下一步工作。" />
                <div style={{ marginTop: 12 }}>
                  <button className="btn" type="submit">创建新任务</button>
                </div>
              </form>
            </details>
          </article>
        ))}
      </div>
    </main>
  );
}
