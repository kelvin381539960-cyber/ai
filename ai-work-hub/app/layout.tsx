import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'AI Work Hub',
  description: '产品经理 / 运营的 AI 工作台'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <header className="nav">
          <strong>AI Work Hub</strong>
          <nav>
            <a href="/">首页</a>
            <a href="/tasks">任务</a>
            <a href="/outputs">输出</a>
            <a href="/search">搜索</a>
            <a href="/onboarding">设置</a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
