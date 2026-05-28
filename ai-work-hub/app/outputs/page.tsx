import { CopyButton } from '@/components/CopyButton';
import { listOutputs } from '@/services/query-service';

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
          </article>
        ))}
      </div>
    </main>
  );
}
