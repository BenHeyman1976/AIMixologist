import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// OAuth / magic-link callback. Supabase redirects here with a `code`, which we
// exchange for a session cookie, then send the user on to `next`.
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/";

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (code && url && anon) {
    const res = NextResponse.redirect(`${origin}${next}`);
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
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return res;
  }

  // Something went wrong — bounce back to login with a flag.
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
