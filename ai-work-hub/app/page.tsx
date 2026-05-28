import { getInitializationStatus, listRecentTasks } from '@/services/query-service';

export const dynamic = 'force-dynamic';

const taskTypes = [
  { type: 'research', title: '做需求调研', desc: '整理问题、资料和机会点，形成调研结论。' },
  { type: 'prd', title: '写 PRD', desc: '根据背景和反馈生成 PRD 草稿。' },
  { type: 'competitive_analysis', title: '做竞品分析', desc: '对比竞品功能、差异点和跟进建议。' },
  { type: 'ops_plan', title: '做运营方案', desc: '生成活动方案、节奏、指标和执行清单。' },
  { type: 'meeting_summary', title: '整理会议纪要', desc: '从会议记录提取决策、行动项和待确认问题。' },
  { type: 'review', title: '做评审', desc: '检查方案风险、遗漏点和改进建议。' }
];

export default async function HomePage() {
  const status = getInitializationStatus();
  if (!status.initialized) {
    return (
      <main className="container">
        <div className="card">
          <h1>欢迎使用 AI Work Hub</h1>
          <p className="muted">首次使用需要初始化数据目录和默认模板。</p>
          <a className="btn" href="/onboarding">开始初始化</a>
        </div>
      </main>
    );
  }

  const recentTasks = listRecentTasks();

  return (
    <main className="container">
      <section style={{ marginBottom: 28 }}>
        <h1>你想完成什么？</h1>
        <p className="muted">从任务类型开始，系统会推荐默认助手和流程。</p>
      </section>

      <section className="grid" style={{ marginBottom: 32 }}>
        {taskTypes.map((item) => (
          <a className="card" key={item.type} href={`/tasks/new?type=${item.type}`}>
            <h3>{item.title}</h3>
            <p className="muted">{item.desc}</p>
          </a>
        ))}
      </section>

      <section className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2>最近任务</h2>
          <a className="btn secondary" href="/tasks">查看全部</a>
        </div>
        {recentTasks.length === 0 ? (
          <p className="muted">还没有任务。选择上方任务类型开始。</p>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {recentTasks.map((task) => (
              <a className="card" key={task.id} href={`/tasks/${task.id}`}>
                <div className="row">
                  <strong>{task.title}</strong>
                  <span className="badge">{task.type}</span>
                  <span className="badge">{task.status}</span>
                </div>
                <p className="muted">{task.goal}</p>
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
