import { listRecentTasks } from '@/services/query-service';

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  const tasks = listRecentTasks(100);
  return (
    <main className="container">
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <h1>任务</h1>
          <p className="muted">管理所有 AI 工作任务。</p>
        </div>
        <a className="btn" href="/">创建任务</a>
      </div>
      <div style={{ display: 'grid', gap: 12 }}>
        {tasks.map((task) => (
          <a className="card" href={`/tasks/${task.id}`} key={task.id}>
            <div className="row">
              <strong>{task.title}</strong>
              <span className="badge">{task.type}</span>
              <span className="badge">{task.status}</span>
            </div>
            <p className="muted">{task.goal}</p>
          </a>
        ))}
        {tasks.length === 0 ? <div className="card muted">还没有任务。</div> : null}
      </div>
    </main>
  );
}
