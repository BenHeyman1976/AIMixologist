# 🍹 Bob the AI Mixologist — native iOS app (SwiftUI)

A fully native **SwiftUI** rebuild of the app: a TikTok-style vertical swipe feed
of AI-generated cocktails, plus create, like, comment, share, profile, and
"shop the ingredients" affiliate links.

It runs **standalone with bundled mock data** (no backend needed) so you can
build and feel it immediately. One flag switches it to the real backend later.

- **Target:** iOS 17.0+ (uses SwiftUI paging `ScrollView`, `ShareLink`, etc.)
- **No third-party packages** — pure SwiftUI + Foundation.

---

## 🛠️ Open & run — no setup needed

The Xcode project is already generated and committed. There's nothing to drag
or add — it uses Xcode's modern **synchronized folder** format, so every `.swift`
file in the `BobMixologist/` folder is picked up automatically (and any files we
add later just appear after a `git pull`).

1. **Open** `ios-native/BobMixologist/BobMixologist.xcodeproj` (double-click it
   in Finder, or `open ios-native/BobMixologist/BobMixologist.xcodeproj`).
2. Pick an iPhone simulator (top bar) and press **⌘R**.

That's it — you should land on the login screen → tap any sign-in → swipe the
feed. 🍹

> Building to your **physical iPhone**: select your device, then set
> **Signing & Capabilities → Team** to your Apple Developer account and Xcode
> will provision it. (You already have the account.)

## 📲 What's in the app

| File | Screen / role |
| ---- | ------------- |
| `BobApp.swift` | App entry, dark tab-bar styling |
| `Views/RootView.swift` | Login gate + tab navigation (Feed / Create / Profile) |
| `Views/LoginView.swift` | Apple / Google / email (mocked for the PoC) |
| `Views/FeedView.swift` + `FeedItemView.swift` | Full-screen vertical swipe feed with like / comment / share / recipe rail |
| `Views/RecipeSheetView.swift` | Full recipe + 🛒 shop-the-ingredients affiliate links |
| `Views/CommentsView.swift` | Per-cocktail comments + composer |
| `Views/CreateView.swift` | Prompt → recipe (first) → image → publish |
| `Views/ProfileView.swift` | Published cocktails + monthly image allowance |
| `Data/AppStore.swift` | Single source of truth (state + mock/real API) |
| `Data/MockData.swift` | Seed cocktails + comments |
| `Data/Affiliates.swift` | Amazon / Tesco / Ocado link builder |
| `Data/Compliance.swift` | Responsible-drinking / CBD guardrails |

## 🔌 Switching to the real backend

Everything funnels through `Data/AppStore.swift`. To use the live backend
(the Next.js app in the repo root) instead of mock data, just flip two values:

```swift
let useRemote = true
let apiBaseURL = "http://192.168.1.42:3000"  // your Mac's LAN IP, or deployed URL
```

The networking is **already implemented** in `Data/BackendAPI.swift` (feed,
recipe generation, image generation) and decodes the backend's JSON into the
Swift models. If any call fails, the store falls back to local mock behaviour
so the app never gets stuck. The view layer doesn't change.

> Run the backend first (`npm run dev` in the repo root). For a physical
> device, use your Mac's LAN IP (not `localhost`), and note iOS requires HTTPS
> unless you allow the local HTTP exception in Info.plist (App Transport
> Security) during development.

## 🧭 Roadmap markers (search the code)

- `TODO(auth)` — swap mock login for **Supabase** Google/Apple/email auth.
- `TODO(billing)` — paid plan raises the monthly image allowance.
- `TODO(affiliate)` — drop in your Amazon Associates tag / network deep links
  (`Affiliates.amazonTag`).

## 🚢 App Store

Archive in Xcode (**Product → Archive**) and upload via the Organizer, or use
`xcodebuild` in CI — the same workflow as your other Swift app.

---

🍹 _Please drink responsibly. 18+ only where alcohol is served. Wellness & CBD
ingredients are for flavour and lifestyle only and are not medical advice._
