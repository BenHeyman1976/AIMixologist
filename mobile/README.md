# 🍹 Bob the AI Mixologist — iOS app (Expo / React Native)

The native mobile app: a **vertical, full-screen, swipe-up feed** of AI-generated
cocktails (TikTok-style) with create, like, comment, share, and "shop the
ingredients" affiliate links.

It runs **instantly in Expo Go with zero backend setup** — it ships with bundled
sample data and on-device mock AI generation. When you're ready, flip one flag to
point it at the real backend (the Next.js app in the parent folder).

---

## ▶️ See it on your iPhone in ~2 minutes

1. On your iPhone, install **Expo Go** from the App Store.
2. On your Mac, from this `mobile/` folder:
   ```bash
   npm install      # first time only
   npx expo start
   ```
3. A **QR code** appears in the terminal. Open the iPhone **Camera** app and point
   it at the QR code → tap the banner to open in **Expo Go**.
   - Your iPhone and Mac must be on the **same Wi-Fi**.
   - If it won't connect (e.g. corporate/locked-down Wi-Fi), run
     `npx expo start --tunnel` instead.

That's it — the app loads live on your phone, and edits hot-reload instantly.

> Prefer the simulator? With Xcode installed, press `i` in the Expo terminal to
> open the iOS Simulator.

## 📲 What's in the app

| Screen | What it does |
| ------ | ------------ |
| **Login** | First-run sign-in — Apple / Google / email (mocked for the PoC). |
| **Feed** | Full-screen vertical swipe feed. Right rail: ❤️ like, 💬 comment, 🔗 share, 📖 recipe. Sort by Trending / Newest / Top. |
| **Create** | Prompt → recipe (shows first) → generate image → publish to the feed. |
| **Recipe sheet** | Full ingredients/method + 🛒 **Shop the ingredients** (Amazon/Tesco/Ocado affiliate links). |
| **Comments** | Per-cocktail comments with a composer. |
| **Profile** | Your published cocktails + monthly image allowance meter. |

## 🔌 Switching to the real backend

Everything goes through `src/api/client.ts`. To use the live backend instead of
mock data:

```ts
export const USE_REMOTE = true;
export const API_BASE_URL = "http://192.168.1.42:3000"; // your Mac's LAN IP, or deployed URL
```

The function signatures are identical, so no screen code changes. The matching
endpoints live in the web app under `../app/api/*`. (A couple of read endpoints,
e.g. a public `GET /api/feed`, are noted as TODO on the backend.)

## 🗂️ Structure

```
App.tsx                      # Root: session gate + tab navigator + tab bar
src/
  api/client.ts              # Data layer (mock ⇄ real backend switch)
  data/mock.ts               # Seed cocktails + comments
  lib/affiliates.ts          # "Shop the ingredients" link builder
  lib/session.tsx            # In-memory auth session (TODO: Supabase)
  theme.ts  types.ts
  components/                # FeedItem, RecipeSheet, CommentsSheet, Chip, PrimaryButton
  screens/                   # Login, Feed, Create, Profile
```

## 🚢 Shipping to the App Store (later)

Built with Expo, so production builds go through **EAS Build**:

```bash
npm install -g eas-cli
eas build --platform ios     # uses your Apple Developer account
eas submit --platform ios
```

## 🛠️ Built with core React Native only

To stay dependency-light and rock-solid, the app uses only core React Native
primitives (`FlatList` paging for the feed, `Modal` for sheets, `Share`,
`Linking`) plus Expo's status bar — no extra navigation/UI libraries. Easy to
extend with `expo-router`, `expo-linear-gradient`, etc. when you want them.

---

🍹 _Please drink responsibly. 18+ only where alcohol is served. Wellness & CBD
ingredients are for flavour and lifestyle only and are not medical advice._
