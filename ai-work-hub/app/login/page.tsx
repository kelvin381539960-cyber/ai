import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function loginAction(formData: FormData) {
  'use server';
  const expected = process.env.AI_WORK_HUB_ACCESS_TOKEN;
  const token = String(formData.get('token') || '');
  const next = String(formData.get('next') || '/');

  if (!expected) {
    redirect(next || '/');
  }

  if (token !== expected) {
    redirect(`/login?error=1&next=${encodeURIComponent(next || '/')}`);
  }

  const cookieStore = await cookies();
  cookieStore.set('ai_work_hub_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30
  });

  redirect(next || '/');
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next = '/', error } = await searchParams;

  return (
    <main className="container">
      <section className="card" style={{ maxWidth: 520, margin: '48px auto' }}>
        <h1>访问 AI Work Hub</h1>
        <p className="muted">请输入访问令牌。未设置环境变量时，本页面不会拦截访问。</p>
        {error ? <p style={{ color: '#b42318' }}>令牌不正确。</p> : null}
        <form action={loginAction}>
          <input type="hidden" name="next" value={next} />
          <label>访问令牌</label>
          <input className="input" name="token" type="password" autoFocus />
          <div style={{ marginTop: 16 }}>
            <button className="btn" type="submit">进入</button>
          </div>
        </form>
      </section>
    </main>
  );
}
