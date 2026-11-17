import { type NextRequest, NextResponse } from "next/server";

// Fast first check for the admin panel: no session cookie → go to login.
// This only looks at the cookie; pages verify the session in the database (src/server/auth/dal.ts).

const SESSION_COOKIE = "topx_session";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname.startsWith("/admin/login")) return NextResponse.next();

  if (!request.cookies.get(SESSION_COOKIE)?.value) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
