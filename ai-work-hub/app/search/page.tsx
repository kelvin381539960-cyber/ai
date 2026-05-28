import { searchAll } from '@/services/search-service';
import { CopyButton } from '@/components/CopyButton';

export default function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q || '';
  const results = q ? searchAll(q) : { tasks: [], materials: [], outputs: [] };

  return (
    <main className="container">
      <section className="card" style={{ marginBottom: 16 }}>
        <h1>搜索</h1>
        <form>
          <label>关键词</label>
          <div className="row">
            <input className="input" name="q" defaultValue={q} placeholder="搜索任务、资料、输出" style={{ flex: 1 }} />
            <button className="btn" type="submit">搜索</button>
          </div>
        </form>
      </section>

      {!q ? <p className="muted">输入关键词搜索历史任务、资料和输出。</p> : null}

      <section className="card" style={{ marginBottom: 16 }}>
        <h2>任务</h2>
        {results.tasks.length === 0 ? <p className="muted">没有匹配任务。</p> : null}
        {results.tasks.map((task) => (
          <a key={task.id} className="card" href={`/tasks/${task.id}`} style={{ display: 'block', marginTop: 10 }}>
            <strong>{task.title}</strong>
            <p className="muted">{task.goal}</p>
          </a>
        ))}
      </section>

      <section className="card" style={{ marginBottom: 16 }}>
        <h2>资料</h2>
        {results.materials.length === 0 ? <p className="muted">没有匹配资料。</p> : null}
        {results.materials.map((material) => (
          <a key={material.id} className="card" href={`/tasks/${material.task_id}`} style={{ display: 'block', marginTop: 10 }}>
            <strong>{material.title}</strong>
            <p className="muted">{material.content}</p>
          </a>
        ))}
      </section>

      <section className="card">
        <h2>输出</h2>
        {results.outputs.length === 0 ? <p className="muted">没有匹配输出。</p> : null}
        {results.outputs.map((output) => (
          <article key={output.id} className="card" style={{ marginTop: 10 }}>
            <div className="row">
              <strong>{output.title}</strong>
              <span className="badge">v{output.version}</span>
              <CopyButton text={output.content} label="复制 Markdown" />
            </div>
            <pre>{output.content}</pre>
          </article>
        ))}
      </section>
    </main>
  );
}
