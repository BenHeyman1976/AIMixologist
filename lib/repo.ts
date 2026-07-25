// ─────────────────────────────────────────────────────────────
// Repository / data-access layer.
//
// Every server route and server component reads/writes data through here.
// It transparently uses Supabase when configured, otherwise the in-memory
// mock store. This is what lets the app run with zero config while staying
// one switch away from a real database.
// ─────────────────────────────────────────────────────────────

import { randomUUID } from "crypto";
import { getServiceSupabase, isSupabaseConfigured } from "./supabase";
import { db } from "./mockStore";
import type {
  Cocktail,
  Comment,
  GallerySort,
  GeneratedRecipe,
  ImageUsage,
  RecipeMeta,
  SponsoredBrand,
} from "./types";

// Enriched recipe fields are stored in a single `meta` jsonb column so we can
// add more over time without new migrations. These helpers flatten it in/out.
const META_KEYS: (keyof RecipeMeta)[] = [
  "description",
  "abv",
  "calories",
  "prep_time",
  "food_pairing",
  "substitutions",
  "allergens",
  "remixed_from_id",
  "remixed_from_name",
  "remixed_from_username",
  "remix_twist",
];

function extractMeta(source: RecipeMeta): RecipeMeta {
  const meta: RecipeMeta = {};
  for (const k of META_KEYS) {
    const v = (source as any)[k];
    if (v !== undefined && v !== null) (meta as any)[k] = v;
  }
  return meta;
}

/** Maps a Supabase row (with a `meta` jsonb) to a flat Cocktail. */
function flattenRow(row: any): Cocktail {
  if (!row) return row;
  const { meta, ...rest } = row;
  return { ...(rest as Cocktail), ...((meta as RecipeMeta) ?? {}) };
}

const FREE_PLAN_MONTHLY_IMAGES = Number(
  process.env.FREE_PLAN_MONTHLY_IMAGES ?? 5
);

function currentPeriod(): string {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}

// ── Cocktails ─────────────────────────────────────────────────

export interface SaveCocktailInput {
  userId: string;
  username: string;
  prompt: string;
  recipe: GeneratedRecipe;
  imageUrl?: string | null;
  isPublic?: boolean;
}

export async function saveCocktail(
  input: SaveCocktailInput
): Promise<Cocktail> {
  const meta = extractMeta(input.recipe);
  const row: Cocktail = {
    id: randomUUID(),
    user_id: input.userId,
    name: input.recipe.name,
    prompt: input.prompt,
    ingredients: input.recipe.ingredients,
    method: input.recipe.method,
    garnish: input.recipe.garnish,
    glassware: input.recipe.glassware,
    tasting_notes: input.recipe.tasting_notes,
    occasion: input.recipe.occasion,
    alcohol_level: input.recipe.alcohol_level,
    tags: input.recipe.tags,
    image_url: input.imageUrl ?? null,
    is_public: input.isPublic ?? false,
    is_flagged: false,
    moderation_status: "approved",
    vote_count: 0,
    created_at: new Date().toISOString(),
    creator_username: input.username,
    ...meta, // flat enriched fields (for the in-memory store + return value)
  };

  const supabase = getServiceSupabase();
  if (isSupabaseConfigured && supabase) {
    // Build the DB row explicitly: real columns + the meta jsonb (not the flat
    // enriched fields, which aren't columns).
    const { creator_username, ...flat } = row;
    for (const k of META_KEYS) delete (flat as any)[k];
    const insert = { ...flat, meta };
    const { data, error } = await supabase
      .from("cocktails")
      .insert(insert)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { ...flattenRow(data), creator_username };
  }

  db().cocktails.unshift(row);
  return row;
}

export async function updateCocktail(
  id: string,
  userId: string,
  patch: Partial<Pick<Cocktail, "image_url" | "is_public">>
): Promise<Cocktail | null> {
  const supabase = getServiceSupabase();
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("cocktails")
      .update(patch)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return flattenRow(data);
  }

  const c = db().cocktails.find((x) => x.id === id && x.user_id === userId);
  if (!c) return null;
  Object.assign(c, patch);
  return c;
}

export async function getCocktail(id: string): Promise<Cocktail | null> {
  const supabase = getServiceSupabase();
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("cocktails")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? flattenRow(data) : null;
  }
  return db().cocktails.find((x) => x.id === id) ?? null;
}

export interface GalleryFilters {
  sort?: GallerySort;
  spirit?: string;
  mood?: string;
  occasion?: string;
  alcohol?: string; // alcohol_level
}

export async function listPublicCocktails(
  filters: GalleryFilters = {}
): Promise<Cocktail[]> {
  const supabase = getServiceSupabase();
  if (isSupabaseConfigured && supabase) {
    let q = supabase
      .from("cocktails")
      .select("*")
      .eq("is_public", true)
      .eq("moderation_status", "approved");
    if (filters.alcohol) q = q.eq("alcohol_level", filters.alcohol);
    if (filters.occasion) q = q.ilike("occasion", `%${filters.occasion}%`);
    if (filters.spirit) q = q.contains("tags", [filters.spirit]);
    if (filters.mood) q = q.contains("tags", [filters.mood]);

    if (filters.sort === "most_voted") q = q.order("vote_count", { ascending: false });
    else q = q.order("created_at", { ascending: false });

    const { data, error } = await q.limit(60);
    if (error) throw new Error(error.message);
    let rows = ((data as any[]) ?? []).map(flattenRow);
    if (filters.sort === "trending") rows = sortTrending(rows);
    return rows;
  }

  // Mock path
  let rows = db().cocktails.filter(
    (c) => c.is_public && c.moderation_status === "approved"
  );
  if (filters.alcohol) rows = rows.filter((c) => c.alcohol_level === filters.alcohol);
  if (filters.occasion)
    rows = rows.filter((c) =>
      c.occasion.toLowerCase().includes(filters.occasion!.toLowerCase())
    );
  if (filters.spirit)
    rows = rows.filter((c) => matchKeyword(c, filters.spirit!));
  if (filters.mood) rows = rows.filter((c) => matchKeyword(c, filters.mood!));

  if (filters.sort === "most_voted") {
    rows = [...rows].sort((a, b) => b.vote_count - a.vote_count);
  } else if (filters.sort === "trending") {
    rows = sortTrending(rows);
  } else {
    rows = [...rows].sort(
      (a, b) => +new Date(b.created_at) - +new Date(a.created_at)
    );
  }
  return rows;
}

function matchKeyword(c: Cocktail, kw: string): boolean {
  const k = kw.toLowerCase();
  return (
    c.tags.some((t) => t.toLowerCase().includes(k)) ||
    c.ingredients.some((i) => i.toLowerCase().includes(k))
  );
}

/** Trending = votes weighted by recency (simple gravity score). */
function sortTrending(rows: Cocktail[]): Cocktail[] {
  const now = Date.now();
  const score = (c: Cocktail) => {
    const ageHours = (now - +new Date(c.created_at)) / 36e5;
    return (c.vote_count + 1) / Math.pow(ageHours + 2, 1.5);
  };
  return [...rows].sort((a, b) => score(b) - score(a));
}

export async function listUserCocktails(userId: string): Promise<{
  saved: Cocktail[];
  published: Cocktail[];
}> {
  const supabase = getServiceSupabase();
  let rows: Cocktail[];
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("cocktails")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    rows = ((data as any[]) ?? []).map(flattenRow);
  } else {
    rows = db().cocktails.filter((c) => c.user_id === userId);
  }
  return {
    saved: rows,
    published: rows.filter((c) => c.is_public),
  };
}

// ── Votes ─────────────────────────────────────────────────────

export async function toggleVote(
  cocktailId: string,
  userId: string
): Promise<{ voted: boolean; vote_count: number }> {
  const supabase = getServiceSupabase();
  if (isSupabaseConfigured && supabase) {
    const { data: existing } = await supabase
      .from("votes")
      .select("id")
      .eq("cocktail_id", cocktailId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      await supabase.from("votes").delete().eq("id", (existing as any).id);
    } else {
      await supabase
        .from("votes")
        .insert({ cocktail_id: cocktailId, user_id: userId });
    }
    // Recount (a DB trigger could maintain vote_count in production).
    const { count } = await supabase
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("cocktail_id", cocktailId);
    const vote_count = count ?? 0;
    await supabase
      .from("cocktails")
      .update({ vote_count })
      .eq("id", cocktailId);
    return { voted: !existing, vote_count };
  }

  // Mock path
  const key = `${userId}:${cocktailId}`;
  const store = db();
  const cocktail = store.cocktails.find((c) => c.id === cocktailId);
  if (!cocktail) return { voted: false, vote_count: 0 };
  if (store.votes[key]) {
    delete store.votes[key];
    cocktail.vote_count = Math.max(0, cocktail.vote_count - 1);
    return { voted: false, vote_count: cocktail.vote_count };
  }
  store.votes[key] = true;
  cocktail.vote_count += 1;
  return { voted: true, vote_count: cocktail.vote_count };
}

export async function hasVoted(
  cocktailId: string,
  userId: string
): Promise<boolean> {
  const supabase = getServiceSupabase();
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase
      .from("votes")
      .select("id")
      .eq("cocktail_id", cocktailId)
      .eq("user_id", userId)
      .maybeSingle();
    return Boolean(data);
  }
  return Boolean(db().votes[`${userId}:${cocktailId}`]);
}

// ── Comments ──────────────────────────────────────────────────

export async function listComments(cocktailId: string): Promise<Comment[]> {
  const supabase = getServiceSupabase();
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("cocktail_id", cocktailId)
      .eq("moderation_status", "approved")
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data as Comment[]) ?? [];
  }
  return db()
    .comments.filter(
      (c) => c.cocktail_id === cocktailId && c.moderation_status === "approved"
    )
    .sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
}

export async function addComment(
  cocktailId: string,
  userId: string,
  username: string,
  body: string
): Promise<Comment> {
  const comment: Comment = {
    id: randomUUID(),
    cocktail_id: cocktailId,
    user_id: userId,
    username,
    body,
    is_flagged: false,
    moderation_status: "approved",
    created_at: new Date().toISOString(),
  };
  const supabase = getServiceSupabase();
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("comments")
      .insert(comment)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Comment;
  }
  db().comments.push(comment);
  return comment;
}

// ── Image usage / quota ───────────────────────────────────────

export async function getImageUsage(userId: string): Promise<ImageUsage> {
  const period = currentPeriod();
  const limit = FREE_PLAN_MONTHLY_IMAGES;
  const supabase = getServiceSupabase();
  if (isSupabaseConfigured && supabase) {
    const { count } = await supabase
      .from("image_generation_usage")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", `${period}-01`);
    const used = count ?? 0;
    return { used, limit, remaining: Math.max(0, limit - used), period };
  }
  const used = db().imageUsage[`${userId}:${period}`] ?? 0;
  return { used, limit, remaining: Math.max(0, limit - used), period };
}

/**
 * Records one image generation against the user's monthly quota.
 * Returns false (and records nothing) when the user is over their limit.
 *
 * Free plan: FREE_PLAN_MONTHLY_IMAGES per month.
 * TODO(billing): paid plans get a higher limit — look up the user's plan
 * and adjust the limit here once Stripe/subscription integration lands.
 */
export async function consumeImageQuota(
  userId: string,
  cocktailId?: string
): Promise<{ allowed: boolean; usage: ImageUsage }> {
  const usage = await getImageUsage(userId);
  if (usage.remaining <= 0) {
    return { allowed: false, usage };
  }
  const period = currentPeriod();
  const supabase = getServiceSupabase();
  if (isSupabaseConfigured && supabase) {
    await supabase.from("image_generation_usage").insert({
      user_id: userId,
      cocktail_id: cocktailId ?? null,
      period,
    });
  } else {
    const key = `${userId}:${period}`;
    db().imageUsage[key] = (db().imageUsage[key] ?? 0) + 1;
  }
  return { allowed: true, usage: await getImageUsage(userId) };
}

// ── Sponsored brands (native advertising) ─────────────────────

export async function activeSponsoredBrands(): Promise<SponsoredBrand[]> {
  const supabase = getServiceSupabase();
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase
      .from("sponsored_brands")
      .select("*")
      .eq("is_active", true);
    return (data as SponsoredBrand[]) ?? [];
  }
  return db().sponsoredBrands.filter((b) => b.is_active);
}

/** Finds a sponsored brand whose keyword appears in the cocktail. */
export async function matchSponsoredBrand(
  cocktail: Cocktail
): Promise<SponsoredBrand | null> {
  const brands = await activeSponsoredBrands();
  const haystack = [
    cocktail.name,
    ...cocktail.ingredients,
    ...cocktail.tags,
  ]
    .join(" ")
    .toLowerCase();
  return (
    brands.find((b) => haystack.includes(b.ingredient_keyword.toLowerCase())) ??
    null
  );
}
