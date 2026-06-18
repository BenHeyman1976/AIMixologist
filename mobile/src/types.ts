// Domain types — mirror the web backend (lib/types.ts) so the API client can
// later switch from local mock data to the real backend with no UI changes.

export type AlcoholLevel = "alcohol-free" | "low-alcohol" | "full-strength";

export interface GeneratedRecipe {
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

export interface Cocktail extends GeneratedRecipe {
  id: string;
  user_id: string;
  prompt: string;
  image_url: string | null;
  is_public: boolean;
  vote_count: number;
  created_at: string;
  creator_username: string;
  // Client-side: has the current user voted?
  voted?: boolean;
}

export interface Comment {
  id: string;
  cocktail_id: string;
  username: string;
  body: string;
  created_at: string;
}

export interface SessionUser {
  id: string;
  username: string;
  plan: "free" | "paid";
}

export interface ImageUsage {
  used: number;
  limit: number;
  remaining: number;
}
