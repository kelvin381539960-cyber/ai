import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const requiredToken = process.env.AI_WORK_HUB_ACCESS_TOKEN;
  if (!requiredToken) return NextResponse.next();

  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const cookieToken = request.cookies.get("ai_work_hub_token")?.value;
  const headerToken =
    request.headers.get("x-ai-work-hub-token") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (cookieToken === requiredToken || headerToken === requiredToken) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
