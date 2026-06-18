import { NextResponse, type NextRequest } from "next/server";

// Keep this in sync with SESSION_COOKIE in lib/auth.ts. We inline it here
// rather than importing, because middleware runs in the edge runtime and
// lib/auth.ts imports `next/headers`, which isn't available there.
const SESSION_COOKIE = "bob_session";

// First-run gate: send users without a session to the login screen.
// API routes, the login page itself, and static assets are always allowed.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic =
    pathname.startsWith("/login") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico";

  if (isPublic) return NextResponse.next();

  const hasSession = req.cookies.has(SESSION_COOKIE);
  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    // Remember where they were heading so we can return them after login.
    if (pathname !== "/") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Run on everything except Next internals + common static files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
