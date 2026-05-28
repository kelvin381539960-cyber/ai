import { redirect } from 'next/navigation';
import { createTaskWithMaterial } from '@/services/task-service';
import { ensureInitialized } from '@/services/onboarding-service';

export const dynamic = 'force-dynamic';

const labels: Record<string, string> = {
  research: '做需求调研',
  prd: '写 PRD',
  competitive_analysis: '做竞品分析',
  ops_plan: '做运营方案',
  meeting_summary: '整理会议纪要',
  review: '做评审'
};

async function createTaskAction(formData: FormData) {
  'use server';
  ensureInitialized();
  const task = createTaskWithMaterial({
    type: String(formData.get('type') || 'research'),
    title: String(formData.get('title') || ''),
    goal: String(formData.get('goal') || ''),
    expectedOutput: String(formData.get('expectedOutput') || ''),
    materialTitle: String(formData.get('materialTitle') || '初始资料'),
    materialContent: String(formData.get('materialContent') || '')
  });
  redirect(`/tasks/${task.id}`);
}

export default async function NewTaskPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type = 'research' } = await searchParams;
  return (
    <main className="container">
      <div className="card">
        <h1>{labels[type] || '创建任务'}</h1>
        <p className="muted">填写目标和资料，系统会自动推荐默认助手和流程。</p>
        <form action={createTaskAction}>
          <input type="hidden" name="type" value={type} />
          <label>任务标题</label>
          <input className="input" name="title" placeholder="例如：调研 AI 工作流工具" required />
          <label>任务目标</label>
          <textarea name="goal" placeholder="你想解决什么问题？" required />
          <label>预期输出</label>
          <input className="input" name="expectedOutput" placeholder="例如：调研结论和下一步建议" />
          <label>资料标题</label>
          <input className="input" name="materialTitle" defaultValue="背景资料" />
          <label>初始资料，可先跳过</label>
          <textarea name="materialContent" placeholder="粘贴背景、用户反馈、会议记录或竞品资料" />
          <div style={{ marginTop: 18 }}>
            <button className="btn" type="submit">创建任务</button>
          </div>
        </form>
      </div>
    </main>
  );
}
