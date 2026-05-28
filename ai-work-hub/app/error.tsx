'use client';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <main className="container">
      <section className="card">
        <h1>页面出错</h1>
        <p className="muted">操作未完成。可以重试，或返回首页。</p>
        <pre>{error.message}</pre>
        <div className="row">
          <button className="btn" onClick={reset}>重试</button>
          <a className="btn secondary" href="/">返回首页</a>
        </div>
      </section>
    </main>
  );
}
