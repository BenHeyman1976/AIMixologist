"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// First-run login screen. The provider buttons are MOCK logins for the PoC —
// one click signs you in. Real Google / Apple / email auth is wired through
// Supabase later (see TODO(auth) in lib/auth.ts).
export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function login(method: "google" | "apple" | "email") {
    if (method === "email" && !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(method);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, email }),
      });
      if (!res.ok) throw new Error("Login failed");
      // Full navigation so the middleware sees the new session cookie.
      router.push(next);
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Login failed");
      setLoading(null);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-warm-gradient flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md p-8">
        <div className="text-center">
          <div className="text-5xl">🍹</div>
          <h1 className="mt-3 font-display text-3xl font-bold text-cocktail-plum">
            Welcome to Bob
          </h1>
          <p className="mt-1 text-cocktail-ink/70">
            Sign in to create, save and share your cocktails.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <button
            onClick={() => login("google")}
            disabled={loading !== null}
            className="btn-secondary w-full"
          >
            <span aria-hidden>🔵</span> Continue with Google
          </button>
          <button
            onClick={() => login("apple")}
            disabled={loading !== null}
            className="btn w-full bg-black text-white"
          >
            <span aria-hidden></span> Continue with Apple
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
          />
          <button
            onClick={() => login("email")}
            disabled={loading !== null}
            className="btn-primary w-full"
          >
            {loading === "email" ? "Signing in…" : "Continue with email"}
          </button>
        </div>

        {error && (
          <p className="mt-4 text-center text-sm text-cocktail-coral">{error}</p>
        )}

        <p className="mt-6 text-center text-xs text-cocktail-ink/50">
          Demo sign-in for the preview — no real account is created yet. By
          continuing you confirm you are 18 or over. Please drink responsibly.
        </p>
      </div>
    </div>
  );
}
