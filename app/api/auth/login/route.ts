import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, type AuthMethod } from "@/lib/auth";

// POST /api/auth/login  { method: "google" | "apple" | "email", email?: string }
//
// MOCK login — sets a session cookie so the app behaves as if signed in.
// TODO(auth): swap for Supabase OAuth (Google/Apple) + email magic links.
export async function POST(req: NextRequest) {
  const { method, email } = (await req.json()) as {
    method: AuthMethod;
    email?: string;
  };

  // Derive a friendly username from the chosen method.
  let username = "demo_mixologist";
  if (method === "email" && email) {
    username = email.split("@")[0].replace(/[^a-z0-9_]/gi, "").toLowerCase() ||
      "mixologist";
  } else if (method === "google") {
    username = "google_user";
  } else if (method === "apple") {
    username = "apple_user";
  }

  const payload = encodeURIComponent(JSON.stringify({ username, method }));
  const res = NextResponse.json({ ok: true, username });
  res.cookies.set(SESSION_COOKIE, payload, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
