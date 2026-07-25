import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Keeps the Supabase auth session fresh on every request by rotating the
// session cookie. No-op when auth isn't configured.
export async function middleware(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const res = NextResponse.next({ request: req });
  if (!url || !anon) return res;

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          res.cookies.set(name, value, options)
        );
      },
    },
  });

  // Touch the session so expiring tokens get refreshed into the response cookie.
  await supabase.auth.getUser();
  return res;
}

export const config = {
  // Run on app routes but skip static assets and the auth callback's own needs.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webmanifest)).*)"],
};
