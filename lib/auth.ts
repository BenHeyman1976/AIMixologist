// ─────────────────────────────────────────────────────────────
// Placeholder auth.
//
// For the MVP we use a single demo user identified by a cookie. This keeps
// every flow (save / publish / vote / comment) working end-to-end without a
// real login. Swap getCurrentUser() for Supabase Auth (getUser from the
// auth-helpers) when you wire up real authentication.
//
// TODO(auth): replace with Supabase Auth — read the session from cookies and
// resolve the real user id + profile. See README "Going to production".
// ─────────────────────────────────────────────────────────────

import { cookies } from "next/headers";

export interface SessionUser {
  id: string;
  username: string;
  plan: "free" | "paid";
}

export const DEMO_USER: SessionUser = {
  id: "00000000-0000-0000-0000-000000000001",
  username: "demo_mixologist",
  plan: "free",
};

const COOKIE_NAME = "bob_uid";

/**
 * Returns the current user. In this placeholder implementation everyone is
 * the demo user, but we still read a cookie so the shape matches a real
 * session and so per-browser ids could be introduced later.
 */
export function getCurrentUser(): SessionUser {
  try {
    const cookieStore = cookies();
    const uid = cookieStore.get(COOKIE_NAME)?.value;
    if (uid) {
      return { ...DEMO_USER, id: uid };
    }
  } catch {
    // cookies() throws outside a request scope — fall back to demo user.
  }
  return DEMO_USER;
}
