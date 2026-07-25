"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

// Login screen. Uses real Supabase Auth (Google OAuth + email magic link) when
// configured; otherwise falls back to the mock preview login so local demos and
// unconfigured deploys still work.
export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const authError = params.get("error");

  const supabase = getSupabaseBrowser();
  const realAuth = Boolean(supabase);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    authError ? "Sign-in didn't complete — please try again." : null
  );
  const [sent, setSent] = useState(false);

  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
      : undefined;

  async function google() {
    if (!supabase) return mockLogin("google");
    setLoading("google");
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) {
      setError(
        "Google sign-in isn't enabled yet. Use email below, or enable Google in Supabase."
      );
      setLoading(null);
    }
  }

  async function emailLink() {
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!supabase) return mockLogin("email");
    setLoading("email");
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    if (error) {
      setError(error.message);
      setLoading(null);
    } else {
      setSent(true);
      setLoading(null);
    }
  }

  // Mock fallback (Supabase not configured): one click signs you in.
  async function mockLogin(method: "google" | "apple" | "email") {
    setLoading(method);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, email }),
      });
      if (!res.ok) throw new Error("Login failed");
      router.push(next);
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Login failed");
      setLoading(null);
    }
  }

  if (sent) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-warm-gradient flex items-center justify-center px-4 py-12">
        <div className="card w-full max-w-md p-8 text-center">
          <div className="text-5xl">📬</div>
          <h1 className="mt-3 font-display text-2xl font-bold text-cocktail-plum">
            Check your email
          </h1>
          <p className="mt-2 text-cocktail-ink/70">
            We've sent a magic link to <b>{email}</b>. Tap it to sign in — you can
            close this tab.
          </p>
          <button
            onClick={() => setSent(false)}
            className="btn-ghost mt-6 text-sm"
          >
            ← Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-warm-gradient flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md p-8">
        <div className="text-center">
          <div className="text-5xl">🍹</div>
          <h1 className="mt-3 font-display text-3xl font-bold text-cocktail-plum">
            Welcome to Siply
          </h1>
          <p className="mt-1 text-cocktail-ink/70">
            Sign in to create, save and share your cocktails.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <button
            onClick={google}
            disabled={loading !== null}
            className="btn-secondary w-full"
          >
            <span aria-hidden>🔵</span> Continue with Google
          </button>

          <div className="flex items-center gap-3 py-1 text-xs text-cocktail-ink/40">
            <span className="h-px flex-1 bg-cocktail-peach/40" />
            or
            <span className="h-px flex-1 bg-cocktail-peach/40" />
          </div>

          <input
            type="email"
            className="input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && emailLink()}
          />
          <button
            onClick={emailLink}
            disabled={loading !== null}
            className="btn-primary w-full"
          >
            {loading === "email"
              ? "Sending…"
              : realAuth
              ? "Email me a magic link"
              : "Continue with email"}
          </button>
        </div>

        {error && (
          <p className="mt-4 text-center text-sm text-cocktail-coral">{error}</p>
        )}

        <p className="mt-6 text-center text-xs text-cocktail-ink/50">
          {realAuth
            ? "By continuing you confirm you are 18 or over. Please drink responsibly."
            : "Demo sign-in for the preview — no real account is created yet. By continuing you confirm you are 18 or over."}
        </p>
      </div>
    </div>
  );
}
