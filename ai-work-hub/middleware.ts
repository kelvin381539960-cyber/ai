import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATH_PREFIXES = [
  '/login',
  '/_next',
  '/favicon.ico'
];

export function middleware(request: NextRequest) {
  const token = process.env.AI_WORK_HUB_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  if (PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const cookieToken = request.cookies.get('ai_work_hub_token')?.value;
  if (cookieToken === token) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/login';
  loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!.*\\..*).*)']
};
