// Shared domain types for Siply — Your Cocktail Concierge.

export type AlcoholLevel = "alcohol-free" | "low-alcohol" | "full-strength";

/** A cocktail's flavour fingerprint — each axis scored 0–5. */
export interface FlavourProfile {
  sweet: number;
  sour: number;
  bitter: number;
  boozy: number;
  fruity: number;
  herbal: number;
}

export type ModerationStatus = "pending" | "approved" | "rejected";

/** Enriched, optional recipe detail (added incrementally; safe if absent). */
export interface RecipeMeta {
  description?: string; // one-line hook
  abv?: string; // e.g. "~12% ABV"
  calories?: string; // e.g. "~180 kcal"
  prep_time?: string; // e.g. "3 min"
  food_pairing?: string;
  substitutions?: string[];
  allergens?: string[];
  // Remix lineage — set when this cocktail was created by remixing another.
  remixed_from_id?: string;
  remixed_from_name?: string;
  remixed_from_username?: string;
  remix_twist?: string; // the twist applied, e.g. "Made it a mocktail"
  flavour_profile?: FlavourProfile; // Cocktail DNA
}

/** The structured recipe shape returned by the AI recipe generator. */
export interface GeneratedRecipe extends RecipeMeta {
  name: string;
  ingredients: string[];
  method: string[];
  garnish: string;
  glassware: string;
  tasting_notes: string;
  occasion: string;
  alcohol_level: AlcoholLevel;
  tags: string[];
}

/** A cocktail row as stored / returned by the API. */
export interface Cocktail extends RecipeMeta {
  id: string;
  user_id: string;
  name: string;
  prompt: string;
  ingredients: string[];
  method: string[];
  garnish: string;
  glassware: string;
  tasting_notes: string;
  occasion: string;
  alcohol_level: AlcoholLevel;
  tags: string[];
  image_url: string | null;
  is_public: boolean;
  is_flagged: boolean;
  moderation_status: ModerationStatus;
  vote_count: number;
  created_at: string;
  // Joined / convenience fields
  creator_username?: string;
}

export interface Comment {
  id: string;
  cocktail_id: string;
  user_id: string;
  username: string;
  body: string;
  is_flagged: boolean;
  moderation_status: ModerationStatus;
  created_at: string;
}

export interface ImageUsage {
  used: number;
  limit: number;
  remaining: number;
  period: string; // e.g. "2026-06"
}

export interface SponsoredBrand {
  id: string;
  name: string;
  ingredient_keyword: string;
  blurb: string;
  cta_url: string | null;
  is_active: boolean;
}

export type GallerySort = "trending" | "newest" | "most_voted";
