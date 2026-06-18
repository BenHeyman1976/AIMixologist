# 🍹 Bob the AI Mixologist — native iOS app (SwiftUI)

A fully native **SwiftUI** rebuild of the app: a TikTok-style vertical swipe feed
of AI-generated cocktails, plus create, like, comment, share, profile, and
"shop the ingredients" affiliate links.

It runs **standalone with bundled mock data** (no backend needed) so you can
build and feel it immediately. One flag switches it to the real backend later.

- **Target:** iOS 17.0+ (uses SwiftUI paging `ScrollView`, `ShareLink`, etc.)
- **No third-party packages** — pure SwiftUI + Foundation.

---

## 🛠️ Create the Xcode project (one-time, ~3 minutes)

These `.swift` files aren't an Xcode project yet (Xcode generates that). Do this:

1. **Xcode → File → New → Project… → iOS → App**, then:
   - Product Name: **BobMixologist**
   - Interface: **SwiftUI**, Language: **Swift**
   - (Storage: None. Uncheck tests if you like.)
   - Save it somewhere, e.g. inside this `ios-native/` folder.
2. In the new project, **delete the two files Xcode auto-created**:
   `BobMixologistApp.swift` and `ContentView.swift`
   (right-click → Delete → *Move to Trash*). Our `BobApp.swift` replaces them.
3. **Add the source files**: drag the **`Theme`, `Models`, `Data`, `Views`**
   folders **and `BobApp.swift`** from `ios-native/BobMixologist/` into the
   Xcode project navigator.
   - In the dialog: tick **"Copy items if needed"** and
     **"Create groups"**, and make sure your app target is checked.
4. Set the **deployment target to iOS 17.0**:
   project → your target → **General → Minimum Deployments → iOS 17.0**.
5. Pick an iPhone simulator (or your device) and press **⌘R**.

You should land on the login screen → tap any sign-in → swipe the feed. 🍹

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
(the Next.js app in the repo root) instead of mock data:

```swift
let useRemote = true
let apiBaseURL = "http://192.168.1.42:3000"  // your Mac's LAN IP, or deployed URL
```

Then fill in the branches marked `TODO(remote)` (recipe + image generation) to
`URLSession`-call the matching endpoints under `../app/api/*`. The view layer
doesn't change.

## 🧭 Roadmap markers (search the code)

- `TODO(auth)` — swap mock login for **Supabase** Google/Apple/email auth.
- `TODO(remote)` — call the real generation endpoints.
- `TODO(billing)` — paid plan raises the monthly image allowance.
- `TODO(affiliate)` — drop in your Amazon Associates tag / network deep links
  (`Affiliates.amazonTag`).

## 🚢 App Store

Archive in Xcode (**Product → Archive**) and upload via the Organizer, or use
`xcodebuild` in CI — the same workflow as your other Swift app.

---

🍹 _Please drink responsibly. 18+ only where alcohol is served. Wellness & CBD
ingredients are for flavour and lifestyle only and are not medical advice._
