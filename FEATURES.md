# 🍸 Siply — Feature Log & Roadmap

Working tracker built from the **Cocktail Creator Platform Feature Specification**,
cross-checked against what's already built. This is the single list we work
through. Update the status as features land.

**Legend:** ✅ done · 🟡 partial · ⬜ not started · ⚠️ needs a decision

> Scope note: the live product is the **web app** (Next.js on Vercel + Supabase +
> OpenAI). There is also a **native iOS app** (`ios-native/`) that already has a
> few of these (Bartender Mode, Night Planner, Tips). The spec targets the web
> app, so the roadmap below is **web-first**; iOS features get ported afterwards.

---

## ✅ Decisions (resolved with Ben)

1. **Subscriptions:** **on hold** — revisit depending on which other features we
   build. Not removed permanently, not building now. (Revenue focus stays
   sponsors + affiliates + tips.)
2. **Positioning:** consumer face **gravitates toward women**, but with **broader
   appeal** — deliberately serve **event planners and creators** too. Keep the
   blush brand as the face; design features so planners/creators are welcome.
3. **Tagline:** **keep ours** — "Imagine. Create. Enjoy." / "Your cocktail concierge."
4. **Front-ends:** **web-first**, port to iOS later.
5. **Bartender Mode is APP-ONLY** — people don't carry laptops on a night out.
   Keep the iOS "Tell the Barman"; do **not** build it on web.

## Decisions already locked (kept unless you say otherwise)
- Measures **ml by default** (British), with an oz toggle. ✅ matches spec.
- **No brands/bottles/packaging/text in AI images, ever** — brands only via their
  own official photos when a paid sponsor. (Affects spec §2, §14.)
- Responsible-drinking + no medical claims + no implied endorsement. ✅ matches spec §18.
- Tips jar (our addition; not in spec) — currently a stub.

---

## Feature status by area

### 1. AI Cocktail Creation
| Feature | Status | Notes |
|---|---|---|
| Prompt-based generator | ✅ | free-text → recipe |
| Name, ingredients, quantities, method, glassware, garnish | ✅ | quantities inline in ingredients |
| Short description | 🟡 | we have tasting notes, not a separate 1-line description |
| Ice (dedicated) | 🟡 | mentioned in method, no field |
| Estimated ABV | ⬜ | |
| Estimated calories | ⬜ | |
| Estimated prep time | ⬜ | |
| Flavour profile | ⬜ | see Cocktail DNA (§4) |
| Food pairing | ⬜ | |
| Substitutions | ⬜ | |
| Allergen / safety notes | ⬜ | see §18 |
| Creation modes (home/bar/party/wedding/etc.) | 🟡 | works via prompt; no mode picker |
| Bar-friendly generation | 🟡 | prompt guidance exists; no explicit toggle |

### 2. Cocktail Image Generation
| Feature | Status | Notes |
|---|---|---|
| Hero image (ingredient/colour/occasion aware) | ✅ | recently fixed |
| Image style picker (photorealistic/tiki/neon/etc.) | ⬜ | |
| Change background / garnish / glassware / style | ⬜ | only full regenerate today |
| Regenerate · Save · Share | ✅ | |
| Use in social templates / Canva | ⬜ | see §6, §7 |

### 3. Remix Engine  🔑 (viral loop)
| Feature | Status | Notes |
|---|---|---|
| One-tap taste/format/theme/ingredient remixes | ✅ | 6 presets (stronger/mocktail/tropical/fancy/lighter/surprise) + free-text twist |
| Remix attribution + lineage ("Remixed from X by Y") | ✅ | stored in meta, shown on create result + cocktail page, links to parent |
| Remix comparison (side-by-side diff) | ⬜ | next |

### 4. Cocktail DNA
| Flavour fingerprint + scales/chart | ✅ | 6-axis bar chart (sweet/sour/bitter/boozy/fruity/herbal); AI-scored w/ deterministic fallback |
| DNA-based actions (find similar, same DNA other spirit) | ✅ | "More like this" on every cocktail page, ranked by DNA distance |

### 5. Bartender Mode — **APP-ONLY** (not on web, by decision)
| Full-screen bartender view | ✅ (iOS) | "Tell the Barman"; **web: not planned** |
| Big text, high contrast, metric, exit | ✅ (iOS) | |
| Actions (translate/simplify/substitute/edit) | ⬜ (iOS) | future iOS work |
| Bar etiquette message | ⬜ (iOS) | |
| QR handoff | ⬜ (iOS) | |
| Bartender-approved badge (future) | ⬜ | |

### 6. Social Creator Pack
| Generated social assets (IG/TikTok/Pinterest/etc.) | ✅ | clean image download (no watermark) + per-platform caption/hashtag mix |
| Generated copy (captions/hashtags/SEO/backstory) | ✅ | auto caption + platform hashtag sets; brand credit via `#Siply` not watermark |
| Sharing (page/link/remix) | ✅ | share buttons ✅; image download ✅; native share sheet ✅ |

### 7. Canva Integration
| "Edit in Canva" export (pre-populated) | ⬜ | Canva MCP available for our tooling; no user export |
| Canva templates | ⬜ | |

### 8. Shopping
| Shop the ingredients (retailer links) | ✅ | Amazon/Tesco/Ocado search links |
| Affiliate tag ready | ✅ | needs your Amazon tag + domain |
| Shopping list (quantities/pack size/servings) | 🟡 | list exists; no pack sizes/servings |
| Basket options (cheap/standard/premium) | ⬜ | |
| More retailers (Waitrose/MoM/Whisky Exchange) | ⬜ | |
| Affiliate click tracking | ⬜ | |
| Multi-cocktail / party basket | ⬜ | |

### 9. Event Mode
| Event inputs + menu/quantities/cost/shopping/plan | ⬜ | Night Planner (iOS) is adjacent, not this |

### 10. Collections
| Save / favourite | 🟡 | save-via-publish exists; no favourite/library |
| Collections (create/rename/notes/reorder/share) | ⬜ | |

### 11. Community
| Public cocktail pages | ✅ | detail page |
| Like / comment / share | ✅ | |
| Save | 🟡 | |
| Remix | ⬜ | see §3 |
| Follow creators | ⬜ | |
| Report content | ⬜ | |
| Creator profiles (public, followers, featured) | 🟡 | profile shows own cocktails only |
| Discovery (trending/new/most-voted) | ✅ | most-remixed/saved/seasonal ⬜ |

### 12. Gamification
| Achievements · Leaderboards | ⬜ | |

### 13. Subscription ⚠️
| Free/premium tiers, paid plans, usage limits | 🟡 | image quota (5/mo) ✅; **paywall removed by decision** |

### 14. Sponsored & Brand
| Sponsored ingredients (labelled) | 🟡 | `sponsored_brands` table + web placement ✅ |
| Brand campaigns / competitions | ⬜ | |

### 15. Bartender Pro / Venue (B2B, future) | ⬜ |
### 16. Marketplace (future) | ⬜ |
### 17. Print & Keepsakes (future) | ⬜ |

### 18. Safety & Quality
| Responsible drinking / no medical claims / no endorsement | ✅ | |
| Allergen / high-ABV / raw-egg / flame warnings | ⬜ | |
| AI transparency labels ("AI-generated / not verified") | ⬜ | |
| User reporting | ⬜ | |

### 19. Analytics
| Product event tracking + funnel | ⬜ | Vercel Analytics available, not wired to events |

---

## Prioritised roadmap (web-first)

Ordered by **impact on the core loop** (Create → View → Remix → Share → Return)
and effort. We confirm/descope before each.

**Now — finish core creation (quick wins, high polish)**
1. ✅ Enrich recipe output (description, ABV, calories, prep, pairing, subs, allergens).
2. ✅ AI transparency + safety notes (raw egg, flame, high-ABV, allergens).

**Next — the viral loop (biggest growth lever)**
3. ✅ **Remix Engine**: one-tap remixes + attribution/lineage (§3.1–3.2).
4. ✅ **Cocktail DNA**: flavour fingerprint + simple chart (§4).
5. **Remix comparison** (§3.3).
6. **Creator profiles + follow** (§11.4, §11.2). ← NEXT

(Web Bartender Mode removed — app-only.)

**Then — utility & creator tools**
8. **Collections** (save/favourite/organise) (§10).
9. ✅ **Social Creator Pack**: clean image download + auto captions + per-platform
   hashtags (§6). **Brand attribution via hashtags, not watermarks** (Ben's call).
10. **Canva "Edit in Canva" export** (§7).
11. **Event Mode** (menu + quantities + combined basket) (§9) — merge with Night Planner.

**Later — commerce & scale**
12. Affiliate click tracking + more retailers + multi-cocktail basket (§8).
13. Gamification (achievements/leaderboards) (§12).
14. Sponsored campaigns (§14).
15. Analytics events + funnel (§19).
16. B2B Venue / Marketplace / Print (§15–17) — future.

**Parked pending your decision:** Subscription/premium (§13).

---

## Working method
- One feature (or coherent group) at a time.
- Reuse existing components, API wrappers, Supabase schema, deploy flow.
- Add loading/empty/success/error states; keep mobile usability.
- Update this log's status as each lands.
