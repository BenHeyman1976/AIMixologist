// In-memory mock data store.
//
// Used whenever Supabase is NOT configured, so the whole app — gallery,
// detail pages, voting, comments, image usage — works out of the box for
// local demos. Data lives for the lifetime of the server process only.
//
// The shape mirrors the Supabase schema in supabase/schema.sql so the
// repository layer (lib/repo.ts) can switch between the two transparently.

import type { Cocktail, Comment, SponsoredBrand } from "./types";
import { DEMO_USER } from "./auth";

interface MockDB {
  cocktails: Cocktail[];
  comments: Comment[];
  // key: `${userId}:${cocktailId}` → true when that user has voted.
  votes: Record<string, boolean>;
  // key: `${userId}:${YYYY-MM}` → count of images generated that month.
  imageUsage: Record<string, number>;
  sponsoredBrands: SponsoredBrand[];
}

// Persist across Next.js hot-reloads in dev via globalThis.
const g = globalThis as unknown as { __bobDB?: MockDB };

function seed(): MockDB {
  const now = Date.now();
  const sample: Cocktail[] = [
    {
      id: "seed-1",
      user_id: DEMO_USER.id,
      name: "Sunset Mango Breeze",
      prompt: "Something tropical for a BBQ",
      ingredients: [
        "50ml gold rum",
        "60ml fresh mango purée",
        "20ml lime juice",
        "Top with soda water",
        "Cubed ice",
      ],
      method: [
        "Fill a glass with ice.",
        "Add rum, mango purée and lime juice.",
        "Stir and top with soda.",
        "Garnish and serve.",
      ],
      garnish: "Mango fan and mint sprig",
      glassware: "Highball glass",
      tasting_notes: "Bright, juicy and sun-soaked with a clean fizzy finish.",
      occasion: "Summer BBQ",
      alcohol_level: "full-strength",
      tags: ["tropical", "full-strength", "summer"],
      image_url: "https://picsum.photos/seed/Sunset%20Mango%20Breeze/1024/1024",
      is_public: true,
      is_flagged: false,
      moderation_status: "approved",
      vote_count: 12,
      created_at: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
      creator_username: DEMO_USER.username,
    },
    {
      id: "seed-2",
      user_id: DEMO_USER.id,
      name: "Calm Coast Spritz",
      prompt: "Relaxing Aperol and Trip CBD spritz for summer",
      ingredients: [
        "50ml chilled sparkling wine",
        "30ml bitter orange aperitif",
        "1 measure CBD-infused tonic (flavour only)",
        "Cubed ice",
      ],
      method: [
        "Fill a wine glass with ice.",
        "Add aperitif and sparkling wine.",
        "Top with CBD tonic and stir gently.",
      ],
      garnish: "Orange slice",
      glassware: "Large wine glass",
      tasting_notes: "Light, bittersweet and gently fragrant.",
      occasion: "Relaxed evening",
      alcohol_level: "low-alcohol",
      tags: ["wellness", "low-alcohol", "spritz"],
      image_url: "https://picsum.photos/seed/Calm%20Coast%20Spritz/1024/1024",
      is_public: true,
      is_flagged: false,
      moderation_status: "approved",
      vote_count: 7,
      created_at: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
      creator_username: DEMO_USER.username,
    },
  ];

  return {
    cocktails: sample,
    comments: [
      {
        id: "c1",
        cocktail_id: "seed-1",
        user_id: DEMO_USER.id,
        username: "tiki_tom",
        body: "Made this for the weekend — huge hit!",
        is_flagged: false,
        moderation_status: "approved",
        created_at: new Date(now - 1000 * 60 * 60 * 3).toISOString(),
      },
    ],
    votes: {},
    imageUsage: {},
    sponsoredBrands: [
      {
        id: "sb-1",
        name: "Trip",
        ingredient_keyword: "cbd",
        blurb: "Trip's CBD-infused drinks — a calming, refreshing mixer.",
        cta_url: "https://example.com/trip",
        is_active: true,
      },
      {
        id: "sb-2",
        name: "Aperol",
        ingredient_keyword: "aperol",
        blurb: "The iconic bittersweet orange aperitif.",
        cta_url: "https://example.com/aperol",
        is_active: true,
      },
    ],
  };
}

export function db(): MockDB {
  if (!g.__bobDB) {
    g.__bobDB = seed();
  }
  return g.__bobDB;
}
