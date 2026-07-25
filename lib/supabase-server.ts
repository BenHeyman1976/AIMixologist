import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./supabase";

// Server-side Supabase client bound to the request cookies, for reading the
// authenticated session in server components and route handlers. Returns null
// when auth isn't configured.
export function getSupabaseServer(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  const cookieStore = cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // In server components cookie writes throw; the middleware refreshes
        // the session cookie instead, so we can safely ignore failures here.
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          /* called from a server component — ignore */
        }
      },
    },
  });
}
