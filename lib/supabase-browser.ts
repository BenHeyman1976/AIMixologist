"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Browser-side Supabase client for real Auth (magic link / OAuth). Uses the
// public anon key. Returns null when auth isn't configured, so the UI can fall
// back to the mock preview login.
let client: SupabaseClient | null = null;

export function getSupabaseBrowser(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  if (!client) client = createBrowserClient(url, anon);
  return client;
}
