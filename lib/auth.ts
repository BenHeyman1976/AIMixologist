// ─────────────────────────────────────────────────────────────
// Placeholder auth.
//
// For the MVP we use a lightweight cookie-based "session" so the login flow
// (Google / Apple / Email buttons on /login) behaves like a real app, while
// every downstream flow (save / publish / vote / comment) keeps working.
//
// The logins are MOCKED — clicking a provider just sets the session cookie.
// We deliberately keep the user id fixed to the demo user so saved cocktails
// and seed data line up in the in-memory store.
//
// TODO(auth): replace with real Supabase Auth — wire up Google + Apple OAuth
// providers and email magic links in the Supabase dashboard, then read the
// authenticated session here instead of the mock cookie. The RLS policies in
// supabase/schema.sql are already written against auth.uid().
// ─────────────────────────────────────────────────────────────

import { cookies } from "next/headers";

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
function readSession(): SessionPayload | null {
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

/** True when a user has "logged in" (mock session cookie present). */
export function isLoggedIn(): boolean {
  return readSession() !== null;
}

/**
 * Returns the current user. Uses the username/method from the session cookie
 * when logged in, otherwise falls back to the demo user so server rendering
 * never crashes.
 */
export function getCurrentUser(): SessionUser {
  const session = readSession();
  if (session) {
    return {
      ...DEMO_USER,
      username: session.username,
      method: session.method,
    };
  }
  return DEMO_USER;
}
