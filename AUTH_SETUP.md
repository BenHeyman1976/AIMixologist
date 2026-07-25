# 🔐 Real accounts — Supabase Auth setup

The app now uses **real Supabase Auth**: email **magic links** (work immediately)
plus **Continue with Google** (lights up once you enable Google). Until you do the
steps below, magic-link email works out of the box; anonymous visitors keep
browsing as before (nothing breaks).

Do these once in the **Supabase dashboard** and **Vercel**.

## 1. Auth URL configuration (required — 2 minutes)

Supabase → **Authentication → URL Configuration**:

- **Site URL:** your live URL, e.g. `https://siply.app` (or your `*.vercel.app`).
- **Redirect URLs** — add both:
  - `https://YOUR-DOMAIN/auth/callback`
  - `http://localhost:3000/auth/callback` (for local dev)

That's all magic-link email needs. Try it: go to `/login`, enter your email,
click the link.

> Free tier sends a limited number of auth emails/hour and they can look plain.
> Fine for launch; add a custom SMTP sender later under Auth → Emails.

## 2. Google sign-in (optional — do when ready)

1. **Google Cloud Console** → create an **OAuth 2.0 Client ID** (type: Web).
   - Authorised redirect URI:
     `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
     (copy the exact value from Supabase → Auth → Providers → Google).
2. Copy the **Client ID** + **Client secret**.
3. Supabase → **Authentication → Providers → Google** → enable, paste both, save.

The "Continue with Google" button then just works — no code change.

## 3. Vercel env (optional but recommended)

- `NEXT_PUBLIC_SITE_URL = https://YOUR-DOMAIN` — makes shared cocktail links use
  your real domain instead of the Vercel preview URL.

The Supabase env vars you already set (`NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are all that auth
needs otherwise.

## How it behaves

- **Configured (your prod):** real accounts. First sign-in auto-creates a
  `public.users` row (username from the email). Their cocktails, makes, votes and
  saves attribute to their real ID.
- **Not configured (local, zero env):** the old one-click mock login, so demos
  still run.
- **Anonymous visitors:** browse freely; writes fall back to the demo user (same
  as today) — so nothing is gated until you decide to require login.
