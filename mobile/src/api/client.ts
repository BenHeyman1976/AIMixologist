// ─────────────────────────────────────────────────────────────
// API client.
//
// Defaults to LOCAL mode: bundled mock data + on-device mock generation, so
// the app runs instantly in Expo Go with zero backend setup.
//
// To point at the real web backend (the Next.js app in this repo), set
// API_BASE_URL below to your server (e.g. your Mac's LAN IP during dev, or
// your deployed URL) and flip USE_REMOTE to true. The function signatures
// stay identical, so no screen code changes.
// ─────────────────────────────────────────────────────────────

import type {
  Cocktail,
  Comment,
  GeneratedRecipe,
  ImageUsage,
  SessionUser,
} from "../types";
import { SEED_COCKTAILS, SEED_COMMENTS } from "../data/mock";

export const USE_REMOTE = false;
// e.g. "http://192.168.1.42:3000" (your Mac on the LAN) or a deployed URL.
export const API_BASE_URL = "";

// ── In-memory local store (resets on app reload) ──────────────
let cocktails: Cocktail[] = SEED_COCKTAILS.map((c) => ({ ...c }));
let comments: Comment[] = [...SEED_COMMENTS];
let imageUsage: ImageUsage = { used: 0, limit: 3, remaining: 3 };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── Compliance helpers (mirror the web backend) ───────────────
const WELLNESS = ["cbd", "trip", "adaptogen", "wellness", "kombucha"];

export function complianceNotes(recipe: GeneratedRecipe): string[] {
  const notes: string[] = [];
  if (recipe.alcohol_level !== "alcohol-free") {
    notes.push("Please drink responsibly. 18+ where alcohol is served.");
  }
  const hay = [recipe.name, ...recipe.ingredients, ...recipe.tags]
    .join(" ")
    .toLowerCase();
  if (WELLNESS.some((w) => hay.includes(w))) {
    notes.push(
      "Wellness/CBD ingredients are for flavour and lifestyle only — not medical advice."
    );
  }
  return notes;
}

// ── Auth (mock) ───────────────────────────────────────────────
export async function login(
  method: "google" | "apple" | "email",
  email?: string
): Promise<SessionUser> {
  await sleep(400);
  const username =
    method === "email" && email
      ? email.split("@")[0].toLowerCase()
      : method === "google"
      ? "google_user"
      : "apple_user";
  return { id: "me", username, plan: "free" };
}

// ── Feed ──────────────────────────────────────────────────────
export type FeedSort = "trending" | "newest" | "most_voted";

export async function getFeed(sort: FeedSort = "trending"): Promise<Cocktail[]> {
  if (USE_REMOTE) {
    const res = await fetch(`${API_BASE_URL}/api/feed?sort=${sort}`);
    const data = await res.json();
    return data.cocktails as Cocktail[];
  }
  await sleep(200);
  const rows = [...cocktails];
  if (sort === "most_voted") rows.sort((a, b) => b.vote_count - a.vote_count);
  else if (sort === "newest")
    rows.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  else {
    // trending = votes weighted by recency
    const score = (c: Cocktail) => {
      const ageH = (Date.now() - +new Date(c.created_at)) / 36e5;
      return (c.vote_count + 1) / Math.pow(ageH + 2, 1.5);
    };
    rows.sort((a, b) => score(b) - score(a));
  }
  return rows;
}

export function getUserCocktails(userId: string): Cocktail[] {
  return cocktails.filter((c) => c.user_id === userId || c.user_id === "me");
}

// ── Recipe generation (mock — mirrors web lib/ai.ts) ───────────
export async function generateRecipe(prompt: string): Promise<GeneratedRecipe> {
  if (USE_REMOTE) {
    const res = await fetch(`${API_BASE_URL}/api/generate-recipe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    return data.recipe as GeneratedRecipe;
  }

  await sleep(900); // feel like it's "thinking"
  const p = prompt.toLowerCase();
  const alcoholFree =
    p.includes("alcohol-free") ||
    p.includes("alcohol free") ||
    p.includes("mocktail") ||
    p.includes("no alcohol");
  const lowAlcohol =
    !alcoholFree &&
    (p.includes("low-alcohol") || p.includes("low alcohol") || p.includes("light"));
  const alcohol_level = alcoholFree
    ? "alcohol-free"
    : lowAlcohol
    ? "low-alcohol"
    : "full-strength";

  const tropical = p.includes("tropical") || p.includes("bbq") || p.includes("beach");
  const festive = p.includes("christmas") || p.includes("festive") || p.includes("winter");
  const wellness = p.includes("cbd") || p.includes("trip") || p.includes("relax");

  const name = tropical
    ? "Sunset Mango Breeze"
    : festive
    ? "Spiced Cranberry Glow"
    : wellness
    ? "Calm Coast Spritz"
    : "Bob's House Spritz";

  const baseSpirit = alcoholFree
    ? "100ml premium alcohol-free aperitif"
    : lowAlcohol
    ? "50ml chilled sparkling wine"
    : "50ml gin";

  return {
    name,
    ingredients: [
      baseSpirit,
      tropical ? "60ml fresh mango purée" : "30ml fresh citrus juice",
      festive ? "20ml spiced cranberry syrup" : "15ml elderflower cordial",
      wellness ? "1 measure CBD-infused tonic (flavour only)" : "Top with chilled soda water",
      "Plenty of cubed ice",
    ],
    method: [
      "Fill a large glass with cubed ice.",
      "Add the base and remaining liquid ingredients.",
      "Stir gently to combine and chill.",
      "Top up, give one final light stir, garnish and serve.",
    ],
    garnish: tropical
      ? "Mango fan and a mint sprig"
      : festive
      ? "Orange twist and rosemary"
      : "Orange slice",
    glassware: "Large wine glass or balloon glass",
    tasting_notes: tropical
      ? "Bright, juicy and sun-soaked with a clean fizzy finish."
      : festive
      ? "Warm, spiced and gently tart — a cosy seasonal sipper."
      : "Crisp, citrus-forward and easy-going with a light, fragrant lift.",
    occasion: tropical ? "Summer BBQ" : festive ? "Holiday gathering" : "Relaxed evening",
    alcohol_level,
    tags: [
      tropical ? "tropical" : festive ? "festive" : "refreshing",
      alcohol_level,
      wellness ? "wellness" : "easy-drinking",
    ],
  };
}

// ── Image generation (mock, quota-limited) ────────────────────
export async function generateImage(
  name: string
): Promise<{ image_url: string; usage: ImageUsage; error?: string }> {
  if (imageUsage.remaining <= 0) {
    return { image_url: "", usage: imageUsage, error: "limit" };
  }
  await sleep(1200);
  imageUsage = {
    ...imageUsage,
    used: imageUsage.used + 1,
    remaining: imageUsage.remaining - 1,
  };
  return {
    image_url: `https://picsum.photos/seed/${encodeURIComponent(name)}/1080/1920`,
    usage: imageUsage,
  };
}

export function getImageUsage(): ImageUsage {
  return imageUsage;
}

// ── Save / publish ────────────────────────────────────────────
export function saveCocktail(
  prompt: string,
  recipe: GeneratedRecipe,
  imageUrl: string | null,
  isPublic: boolean,
  user: SessionUser
): Cocktail {
  const cocktail: Cocktail = {
    ...recipe,
    id: `local-${Date.now()}`,
    user_id: "me",
    prompt,
    image_url: imageUrl,
    is_public: isPublic,
    vote_count: 0,
    created_at: new Date().toISOString(),
    creator_username: user.username,
    voted: false,
  };
  cocktails = [cocktail, ...cocktails];
  return cocktail;
}

// ── Votes ─────────────────────────────────────────────────────
export function toggleVote(cocktailId: string): {
  voted: boolean;
  vote_count: number;
} {
  const c = cocktails.find((x) => x.id === cocktailId);
  if (!c) return { voted: false, vote_count: 0 };
  c.voted = !c.voted;
  c.vote_count += c.voted ? 1 : -1;
  return { voted: !!c.voted, vote_count: c.vote_count };
}

// ── Comments ──────────────────────────────────────────────────
export function getComments(cocktailId: string): Comment[] {
  return comments
    .filter((c) => c.cocktail_id === cocktailId)
    .sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
}

export function addComment(
  cocktailId: string,
  username: string,
  body: string
): Comment {
  const comment: Comment = {
    id: `cm-${Date.now()}`,
    cocktail_id: cocktailId,
    username,
    body,
    created_at: new Date().toISOString(),
  };
  comments = [...comments, comment];
  return comment;
}
