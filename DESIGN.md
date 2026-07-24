# 🎨 Siply Design System — single source of truth

One brand across **web** (Next.js/Tailwind) and **iOS** (SwiftUI). If you change
a token here, change it in **both** `tailwind.config.ts` and
`ios-native/.../Theme/Theme.swift`. Chic, feminine, premium — blush, rose & gold.

---

## Colours

| Token | Hex | Use | Web class | iOS `Theme` |
| ----- | --- | --- | --------- | ----------- |
| Blush (bg) | `#FFF5F8` | Page / light backgrounds | `cocktail-cream` | `Theme.cream` |
| Ink | `#2A1620` | Primary text | `cocktail-ink` | `Theme.ink` |
| Plum (berry) | `#5A1F3D` | Headings, dark UI, brand | `cocktail-plum` | `Theme.plum` |
| Rose (primary) | `#E85D8A` | Buttons, likes, accents, active | `cocktail-coral` | `Theme.coral` |
| Sunset pink | `#FF9EC0` | Gradient top, highlights | `cocktail-sunset` | `Theme.sunset` |
| Soft pink | `#FFC9DD` | Chips, subtle fills | `cocktail-peach` | `Theme.peach` |
| Gold | `#C9A14A` | Premium accents, notices | `cocktail-amber` | `Theme.amber` |

**Hero gradient** (`warm-gradient` / `Theme.warmGradient`):
`linear-gradient(135deg, #FF9EC0 0%, #E85D8A 50%, #5A1F3D 100%)`

> ⚠️ Web class names are historical (`cocktail-coral` etc.) but now hold the
> blush/rose values above. Keep the names; change only the hex if rebranding.

---

## Typography
- **Display / headings:** "Playfair Display" (serif), weights 600–800.
  Web: `font-display`. iOS: system black/heavy weights (Playfair optional later).
- **Body / UI:** system sans-serif. Keep it clean and legible.
- Big, confident headlines; generous line-height on body.

## Shape & depth
- **Radii:** cards `24–28px` (`rounded-3xl`), inputs `16–18px`, buttons/chips **pill** (fully rounded).
- **Card shadow:** `0 10px 40px -12px rgba(90, 31, 61, 0.35)` (`shadow-card`).
- **Spacing:** 8px base grid. Cards padded `18–24px`.

## Components
- **Primary button:** `warm-gradient` background, white bold text, pill, subtle press-scale.
- **Secondary button:** white bg, rose text/border, pill.
- **Chip/tag:** soft-pink bg, plum text, small pill.
- **Card:** white bg, `rounded-3xl`, `shadow-card`, image on top.

---

## Imagery (AI-generated cocktails)
The generated image is the hero of everything. House style:
- Editorial, premium; **soft natural light**, marble/pale surface, blush/rose/gold
  tones, subtle florals & fresh citrus props, condensation, shallow depth of field.
- **Square (1:1)** for consistency across web cards and the app.
- **Never** render logos, brand labels, text, packaging, or people. Generic
  glassware/bottles only. (Legal + quality — see compliance.)

## Voice & tone
- Warm, chic, a little playful — "your cocktail concierge".
- Taglines: **"Your cocktail concierge."** · **"Imagine. Create. Enjoy."** ·
  "At home, and out."
- Short, confident, friendly. British spelling.

## Compliance (never optional)
- "Please drink responsibly. 18+." on alcoholic content and in the footer.
- No medical/health claims for CBD/wellness ingredients.
- No implied brand partnership unless a confirmed `sponsored_brands` row exists.

---

## Where these live
- **Web:** `tailwind.config.ts` (colours + gradient), `app/globals.css` (button/
  card/chip classes), `app/layout.tsx` (header/footer).
- **iOS:** `ios-native/BobMixologist/BobMixologist/Theme/Theme.swift`,
  `Views/Components.swift` (buttons/chips).

Keep this file updated — it's the contract between the two apps.
