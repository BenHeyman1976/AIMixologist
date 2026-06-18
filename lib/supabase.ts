import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────
// Supabase clients.
//
// We expose two helpers:
//  - getBrowserSupabase(): anon key, safe for the client.
//  - getServiceSupabase(): service-role key, server-only. Used by API
//    routes so they can write rows regardless of RLS during the MVP.
//
// If env vars are missing we return `null` and callers fall back to the
// in-memory mock store (lib/mockStore.ts). This keeps the app fully
// runnable with zero configuration for local demos.
// ─────────────────────────────────────────────────────────────

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(url && serviceKey);

let browserClient: SupabaseClient | null = null;
export function getBrowserSupabase(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  if (!browserClient) {
    browserClient = createClient(url, anonKey);
  }
  return browserClient;
}

let serviceClient: SupabaseClient | null = null;
export function getServiceSupabase(): SupabaseClient | null {
  if (!url || !serviceKey) return null;
  if (!serviceClient) {
    serviceClient = createClient(url, serviceKey, {
      auth: { persistSession: false },
    });
  }
  return serviceClient;
}
