# 🚀 Launch Siply (web) — go live in ~30 minutes

The web app is a complete product (create, gallery, community, night planner via
API). Getting it live is the fastest path to a real, shareable, earning URL —
**no App Store review required.**

## 1. Deploy to Vercel (easiest for Next.js)
1. Push this repo to GitHub (already done).
2. Go to **vercel.com** → sign in with GitHub → **Add New… → Project** →
   import this repo.
3. Framework preset auto-detects **Next.js**. Click **Deploy**.
4. You get a live URL like `https://siply.vercel.app` in ~2 minutes. 🎉

> It works immediately in **demo mode** (mock AI + in-memory data) so you can
> share it right away. Add the env vars below to make it real.

## 2. Turn on real AI (OpenAI)
In Vercel → your project → **Settings → Environment Variables**, add:
```
AI_MODE = openai
OPENAI_API_KEY = sk-...your-siply-key...
OPENAI_IMAGE_MODEL = gpt-image-1     # or dall-e-3 if not org-verified
FREE_PLAN_MONTHLY_IMAGES = 5
```
Redeploy. Recipes, images and night plans now run on real AI.

## 3. Persist data (Supabase) — so cocktails/votes survive
Without this, data lives in memory and resets on redeploy. To make it permanent:
1. Create a project at **supabase.com**.
2. SQL editor → run [`supabase/schema.sql`](supabase/schema.sql).
3. Create a public storage bucket `cocktail-images` (snippet is in the SQL file).
4. Add to Vercel env vars:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = ey...
   SUPABASE_SERVICE_ROLE_KEY = ey...
   ```
Redeploy — it switches from in-memory to Supabase automatically.

## 4. Start earning 💰
- **Affiliate:** join **Amazon Associates** (UK), then add your tag:
  ```
  AMAZON_AFFILIATE_TAG = yourtag-21
  ```
  The "Shop the ingredients" links now earn commission. Later: join **Awin** for
  Tesco/Ocado tracked links.
- **Sponsors:** add rows to the `sponsored_brands` table (name, keyword, blurb,
  cta_url, is_active) → they appear as clearly-labelled placements on matching
  cocktails. This is the revenue you sell once you have traffic.

## 5. Grow (the £0 engine)
Siply is a content machine for the exact platforms your audience uses:
- Generate gorgeous cocktails → post the images/cards to **TikTok & Instagram**.
- Each card links back to the app → installs/visits → more content → repeat.
- The night-planner + "tell the barman" moments are naturally shareable.

## Custom domain
Vercel → Settings → Domains → add e.g. `siply.app` (buy it first). Then update
any hardcoded URLs and you're a real brand.

---

**Alternative hosts:** Cloudflare Pages (via `@cloudflare/next-on-pages`) or
Render (Node web service). Vercel is the least-effort for Next.js.

🍸 _Please drink responsibly. 18+._
