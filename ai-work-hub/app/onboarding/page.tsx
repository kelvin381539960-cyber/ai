import { redirect } from 'next/navigation';
import { initializeWorkspace } from '@/services/onboarding-service';
import { getInitializationStatus } from '@/services/query-service';

async function initAction(formData: FormData) {
  'use server';
  const workspaceName = String(formData.get('workspaceName') || '我的工作台');
  const dataDir = String(formData.get('dataDir') || '');
  initializeWorkspace({ workspaceName, dataDir: dataDir || undefined });
  redirect('/');
}

export default function OnboardingPage() {
  const status = getInitializationStatus();
  return (
    <main className="container">
      <div className="card">
        <h1>初始化 AI Work Hub</h1>
        <p className="muted">创建数据目录、默认工作区、默认助手和默认流程。</p>
        {status.initialized ? <p className="badge">已初始化</p> : null}
        <form action={initAction}>
          <label>Workspace 名称</label>
          <input className="input" name="workspaceName" defaultValue="我的工作台" />
          <label>数据目录，可留空</label>
          <input className="input" name="dataDir" placeholder="默认 ./data 或 AI_WORK_HUB_DATA_DIR" />
          <div style={{ marginTop: 18 }}>
            <button className="btn" type="submit">初始化 / 修复默认模板</button>
          </div>
        </form>
      </div>
    </main>
  );
}
