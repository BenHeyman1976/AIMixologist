// ─────────────────────────────────────────────────────────────
// Auth.
//
// Two modes, chosen automatically:
//  - Real Supabase Auth (magic link / Google OAuth) when NEXT_PUBLIC_SUPABASE_URL
//    + anon key are set. The signed-in user is read from the Supabase session.
//  - Mock cookie login (the original PoC behaviour) when Supabase isn't
//    configured, so local demos still work with zero config.
//
// getCurrentUser() always returns *some* user (the demo user for anonymous
// visitors) so public browsing and server rendering never crash. Use
// getSessionUser() when you need to know whether someone is genuinely signed in.
// ─────────────────────────────────────────────────────────────

import { cookies } from "next/headers";
import { getSupabaseServer } from "./supabase-server";
import {
  getServiceSupabase,
  isSupabaseAuthConfigured,
} from "./supabase";

export type AuthMethod = "google" | "apple" | "email";

export interface SessionUser {
  id: string;
  username: string;
  plan: "free" | "paid";
  method?: AuthMethod;
}

export const DEMO_USER: SessionUser = {
  id: "00000000-0000-0000-0000-000000000001",
  username: "demo_mixologist",
  plan: "free",
};

export const SESSION_COOKIE = "bob_session";

interface SessionPayload {
  username: string;
  method: AuthMethod;
}

/** Reads the (mock) session cookie, if present. */
function readMockSession(): SessionPayload | null {
  try {
    const raw = cookies().get(SESSION_COOKIE)?.value;
    if (!raw) return null;
    const parsed = JSON.parse(decodeURIComponent(raw));
    if (parsed?.username) return parsed as SessionPayload;
  } catch {
    /* malformed / no request scope */
  }
  return null;
}

function usernameFromEmail(email: string | undefined, uid: string): string {
  const base = (email?.split("@")[0] ?? "")
    .replace(/[^a-z0-9_]/gi, "")
    .toLowerCase();
  return base || `mixologist_${uid.slice(0, 6)}`;
}

/**
 * Ensures a public.users row exists for an authenticated Supabase user and
 * returns their profile. Uses the service client to bypass RLS.
 */
async function ensureUserRow(
  uid: string,
  email: string | undefined
): Promise<SessionUser> {
  const svc = getServiceSupabase();
  if (!svc) {
    return { id: uid, username: usernameFromEmail(email, uid), plan: "free" };
  }

  const { data: existing } = await svc
    .from("users")
    .select("id, username, plan")
    .eq("id", uid)
    .maybeSingle();
  if (existing) {
    return {
      id: (existing as any).id,
      username: (existing as any).username,
      plan: (existing as any).plan ?? "free",
    };
  }

  // Create the row, retrying once with a uid suffix if the username collides.
  const base = usernameFromEmail(email, uid);
  for (const username of [base, `${base}_${uid.slice(0, 4)}`]) {
    const { error } = await svc
      .from("users")
      .insert({ id: uid, email: email ?? null, username, plan: "free" });
    if (!error) return { id: uid, username, plan: "free" };
  }
  // Fall back to a definitely-unique username.
  const unique = `${base}_${uid.slice(0, 8)}`;
  await svc
    .from("users")
    .insert({ id: uid, email: email ?? null, username: unique, plan: "free" })
    .select();
  return { id: uid, username: unique, plan: "free" };
}

/** The genuinely-signed-in user, or null. Real auth first, then mock cookie. */
export async function getSessionUser(): Promise<SessionUser | null> {
  if (isSupabaseAuthConfigured) {
    const supabase = getSupabaseServer();
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) return ensureUserRow(user.id, user.email ?? undefined);
    }
    return null;
  }

  // Mock mode
  const session = readMockSession();
  if (session) {
    return { ...DEMO_USER, username: session.username, method: session.method };
  }
  return null;
}

/** True when a user is genuinely signed in. */
export async function isLoggedIn(): Promise<boolean> {
  return (await getSessionUser()) !== null;
}

/**
 * Returns the current user, falling back to the demo user for anonymous
 * visitors so nothing crashes. Prefer getSessionUser() for gating writes.
 */
export async function getCurrentUser(): Promise<SessionUser> {
  return (await getSessionUser()) ?? DEMO_USER;
}
