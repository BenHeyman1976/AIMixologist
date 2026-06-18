# 🍹 Bob the AI Mixologist

A community-driven AI cocktail creator. Describe any idea, mood, brand, flavour
or occasion and Bob generates a full cocktail recipe, an optional
marketing-style image, and lets you publish it to a community gallery where
others can browse, like, vote and comment.

> **It runs out of the box with zero configuration.** With no API keys set, the
> app uses built-in **mock AI responses** and an **in-memory data store**, so you
> can explore the entire flow immediately. Add Supabase + OpenAI keys to go live.

> 📱 **iOS app:** there's now a native **Expo / React Native** app in [`mobile/`](mobile/)
> with a TikTok-style vertical swipe feed. It runs on your iPhone via **Expo Go**
> in ~2 minutes (`cd mobile && npm install && npx expo start`, then scan the QR).
> This web app serves as the backend + landing page. See [`mobile/README.md`](mobile/README.md).

---

## ✨ Features

- **Unlimited free recipe generation** from a natural-language prompt.
- **Structured recipes**: name, ingredients, method, garnish, glassware,
  tasting notes, occasion, alcohol level and hashtags.
- **AI marketing images** (quota-limited by plan — free plan = 3 images/month).
- **Community gallery** with sort (trending / newest / most voted) and filters
  (spirit, mood, occasion, low-alcohol, alcohol-free).
- **Detail pages** with likes/votes, comments and social sharing
  (Facebook, X, WhatsApp, Instagram via native share, copy link).
- **Profile page** with saved + published cocktails and a monthly image meter.
- **Native, labelled sponsorship** via the `sponsored_brands` table.
- **Compliance built in**: responsible-drinking notices, no medical claims for
  CBD/wellness ingredients, and no implied brand partnerships unless confirmed.

## 🧱 Tech stack

- **Next.js 14 (App Router) + React + TypeScript** — frontend and the
  Node/TypeScript backend (API routes under `app/api/*`).
- **Supabase** — auth, Postgres database and storage.
- **OpenAI** — recipe generation (chat completions, JSON mode) and image
  generation.
- **Tailwind CSS** — warm, mobile-first, image-led design.
- Deployable to **Cloudflare** (Pages/Workers via `@cloudflare/next-on-pages`)
  or **Render** (Node web service). See _Deployment_ below.

## 📁 Project structure

```
app/
  layout.tsx              # Shell: header, footer, responsible-drinking notice
  page.tsx                # Home (hero + prompt box + examples + trending)
  create/page.tsx         # Create studio (prompt → recipe → image → publish)
  gallery/page.tsx        # Community gallery (sort + filters)
  cocktail/[id]/page.tsx  # Detail page (image, recipe, vote, share, comments)
  profile/page.tsx        # Saved + published cocktails, image allowance
  api/
    generate-recipe/      # POST – unlimited recipe generation
    generate-image/       # POST – quota-limited image generation
    cocktails/            # POST save · [id] PATCH publish / GET
    vote/                 # POST toggle vote (one per user/cocktail)
    comment/              # GET list · POST add
components/               # CocktailCard, RecipeDetails, VoteButton, Comments, …
lib/
  ai.ts                   # Mock ⇄ OpenAI switch for recipes + images
  repo.ts                 # Data access (Supabase ⇄ in-memory mock)
  supabase.ts             # Supabase clients (browser + service role)
  mockStore.ts            # In-memory store + seed data
  auth.ts                 # Placeholder auth (demo user)
  compliance.ts           # Responsible-drinking / CBD guardrails
  types.ts                # Shared domain types
supabase/schema.sql       # Full database schema + RLS + seed data
```

## 🚀 Getting started

```bash
# 1. Install dependencies
npm install

# 2. (Optional) configure environment
cp .env.example .env.local
#    Leave AI_MODE=mock and skip the keys to run fully offline.

# 3. Run the dev server
npm run dev
# → http://localhost:3000
```

That's it — create a cocktail, generate a (placeholder) image, publish it and
watch it appear in the gallery.

## 🔌 Going live (real AI + database)

### 1. OpenAI

Set in `.env.local`:

```
AI_MODE=openai
OPENAI_API_KEY=sk-...
OPENAI_TEXT_MODEL=gpt-4o-mini      # any chat model with JSON mode
OPENAI_IMAGE_MODEL=gpt-image-1     # or dall-e-3
```

Recipe generation uses JSON-mode chat completions; image generation uses the
Images API. The code handles both `url` and `b64_json` image responses.

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL editor** and run [`supabase/schema.sql`](supabase/schema.sql).
   This creates every table (`users`, `cocktails`, `cocktail_images`, `votes`,
   `comments`, `image_generation_usage`, `sponsored_brands`), indexes, RLS
   policies and seed data.
3. Create a public storage bucket for images (the SQL file has the snippet):
   ```sql
   insert into storage.buckets (id, name, public)
   values ('cocktail-images', 'cocktail-images', true);
   ```
4. Add keys to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
   SUPABASE_SERVICE_ROLE_KEY=ey...     # server-only, never exposed
   ```

When these are present the repository layer automatically switches from the
in-memory store to Supabase. No code changes needed.

> **Storing generated images:** OpenAI image URLs expire. For production,
> download the generated image and upload it to the `cocktail-images` bucket,
> then store that permanent public URL on the cocktail.

### 3. Real authentication

The MVP ships with **placeholder auth** (`lib/auth.ts`) — a single demo user so
every flow works end-to-end. To go to production:

- Replace `getCurrentUser()` with Supabase Auth (read the session from cookies).
- Add a trigger to copy new `auth.users` into `public.users`.
- The RLS policies in `schema.sql` are already written against `auth.uid()`.

Search the codebase for `TODO(auth)`.

## 💸 Business model & monetisation hooks

- **Recipes:** always unlimited and free.
- **Images:** limited by plan. Free plan = `FREE_PLAN_MONTHLY_IMAGES`
  (default **3/month**), tracked in `image_generation_usage`.
- **Paid plans:** stubbed out. Search for `TODO(billing)` — that's where Stripe
  checkout and a per-plan image limit go. The quota check in `lib/repo.ts`
  (`consumeImageQuota`) is the single place to raise the limit per plan.
- **Sponsorship:** `sponsored_brands` drives native, clearly-labelled placements
  on detail pages. An "official partnership" is only ever shown when a matching
  active sponsor row exists — never inferred from a prompt.
- **Affiliate links:** `sponsored_brands.cta_url` is affiliate-link-ready.

## ⚖️ Compliance

Implemented in `lib/compliance.ts` and surfaced throughout the UI:

- Responsible-drinking notice on every alcoholic recipe and in the footer.
- No medical/health claims for CBD/wellness ingredients (a disclaimer is shown
  when such ingredients are detected).
- No implied brand partnerships unless confirmed via `sponsored_brands`.
- Moderation fields (`is_flagged`, `moderation_status`) on cocktails and
  comments; only `approved` content is shown publicly. Search for
  `TODO(moderation)` for where to plug in an automated moderation check.

## ☁️ Deployment

- **Cloudflare Pages:** build with
  [`@cloudflare/next-on-pages`](https://github.com/cloudflare/next-on-pages).
  Set the env vars in the Pages dashboard.
- **Render:** deploy as a Node web service — build `npm run build`, start
  `npm run start`. Add the same env vars.
- **Vercel:** zero-config (`next build`).

## 📜 Scripts

| Script              | Description                |
| ------------------- | -------------------------- |
| `npm run dev`       | Start the dev server       |
| `npm run build`     | Production build           |
| `npm run start`     | Run the production build   |
| `npm run lint`      | Lint                       |
| `npm run typecheck` | TypeScript type-check only |

---

🍹 _Please drink responsibly. 18+ only where alcohol is served. Wellness & CBD
ingredients are for flavour and lifestyle only and are not medical advice._
