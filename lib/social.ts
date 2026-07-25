// Social Creator Pack — turns a recipe into ready-to-post copy for
// TikTok / Instagram / Pinterest, WITHOUT watermarking the image.
//
// Brand attribution is carried by the CAPTION + HASHTAGS, not by burning a
// logo into the picture. The user posts a clean image; discovery + credit
// come from `#Siply` and friends, plus a link back to the cocktail page.
//
// Deterministic on purpose: same recipe → same copy, works in mock and
// real-AI mode, no extra API call, no cost.

import type { Cocktail, GeneratedRecipe } from "./types";

export type Platform = "instagram" | "tiktok" | "pinterest";

// The tags that carry OUR brand. Always present on every post — this is how
// we get attributed and discovered instead of a watermark.
export const BRAND_HASHTAGS = ["Siply", "SiplyCocktails", "MadeWithSiply"];

// Broad, high-traffic discovery tags — the ones people actually search/browse.
const CORE_HASHTAGS = [
  "cocktail",
  "cocktails",
  "cocktailrecipe",
  "mixology",
  "cocktailsofinstagram",
  "homebar",
  "drinkstagram",
  "happyhour",
];

// Platform-specific discovery tags layered on top of the core set.
const PLATFORM_HASHTAGS: Record<Platform, string[]> = {
  instagram: ["cocktailgram", "instadrinks", "cocktailhour"],
  tiktok: ["cocktailtiktok", "drinktok", "cocktailsoftiktok", "fyp"],
  pinterest: ["cocktailideas", "drinkrecipes", "partydrinks"],
};

// Occasion / vibe keyword → extra discovery tags.
const OCCASION_HASHTAGS: { match: RegExp; tags: string[] }[] = [
  { match: /christmas|festive|xmas|yule/i, tags: ["christmascocktails", "festivedrinks"] },
  { match: /halloween|spooky/i, tags: ["halloweencocktails", "spookydrinks"] },
  { match: /summer|beach|pool|bbq/i, tags: ["summercocktails", "summerdrinks"] },
  { match: /winter|cosy|cozy/i, tags: ["wintercocktails", "cosynight"] },
  { match: /valentine|romantic|date/i, tags: ["valentinescocktails", "datenight"] },
  { match: /wedding|hen|bridal/i, tags: ["weddingcocktails", "signaturecocktail"] },
  { match: /brunch/i, tags: ["brunchcocktails", "bottomlessbrunch"] },
  { match: /party|birthday|celebrat/i, tags: ["partycocktails", "celebrationdrinks"] },
  { match: /tropical|tiki/i, tags: ["tikicocktails", "tropicaldrinks"] },
];

/** Turn a free-text label into a clean, camel-ish hashtag token. */
function toTag(input: string): string {
  return input
    .replace(/&/g, "and")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .join("");
}

/** De-dupe case-insensitively while keeping first-seen casing + order. */
function dedupe(tags: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of tags) {
    const key = t.toLowerCase();
    if (t && !seen.has(key)) {
      seen.add(key);
      out.push(t);
    }
  }
  return out;
}

/** Build the hashtag list for a recipe on a given platform (brand tags first). */
export function buildHashtags(
  recipe: Pick<GeneratedRecipe, "name" | "occasion" | "tags" | "alcohol_level">,
  platform: Platform = "instagram"
): string[] {
  const contextual: string[] = [];

  // Alcohol-free gets its own big communities.
  if (recipe.alcohol_level === "alcohol-free") {
    contextual.push("mocktail", "mocktails", "alcoholfree", "nolodrinks");
  } else if (recipe.alcohol_level === "low-alcohol") {
    contextual.push("lowabv", "lightcocktail");
  }

  // Occasion-driven tags.
  const occasionText = `${recipe.occasion ?? ""} ${recipe.name}`;
  for (const { match, tags } of OCCASION_HASHTAGS) {
    if (match.test(occasionText)) contextual.push(...tags);
  }

  // The recipe's own tags (e.g. "refreshing", "citrus").
  for (const t of recipe.tags ?? []) {
    const tag = toTag(t);
    if (tag.length >= 3) contextual.push(tag);
  }

  const all = dedupe([
    ...BRAND_HASHTAGS,
    ...contextual,
    ...CORE_HASHTAGS,
    ...PLATFORM_HASHTAGS[platform],
  ]);

  // Instagram caps at 30; keep it sensible everywhere. Brand tags are first so
  // they never get trimmed.
  const cap = platform === "tiktok" ? 12 : platform === "pinterest" ? 15 : 24;
  return all.slice(0, cap);
}

/** The one-line hook used to open a caption. */
function hook(recipe: Pick<GeneratedRecipe, "name" | "description" | "tasting_notes">): string {
  return (
    recipe.description?.trim() ||
    recipe.tasting_notes?.trim() ||
    `Say hello to the ${recipe.name}.`
  );
}

export interface CreatorCopy {
  caption: string; // caption body (no hashtags)
  hashtags: string[]; // hashtag tokens, no leading #
  hashtagLine: string; // "#Siply #cocktail ..." ready to paste
  full: string; // caption + link + hashtags — the whole post
}

/**
 * Generate ready-to-post copy for a platform. `link` (optional) is appended as
 * a call-to-action so credit/traffic survives even when hashtags don't.
 */
export function buildCreatorCopy(
  recipe: Pick<
    GeneratedRecipe,
    "name" | "description" | "tasting_notes" | "occasion" | "tags" | "alcohol_level" | "ingredients" | "garnish"
  >,
  platform: Platform = "instagram",
  link?: string,
  isRealPhoto = false
): CreatorCopy {
  const hashtags = buildHashtags(recipe, platform);
  const hashtagLine = hashtags.map((t) => `#${t}`).join(" ");

  const lines: string[] = [];
  lines.push(`🍸 ${recipe.name}`);
  lines.push("");
  // When sharing a real photo, lead with the proud "I made this" energy.
  if (isRealPhoto) lines.push(`Made this myself 🙌 ${hook(recipe)}`);
  else lines.push(hook(recipe));

  // TikTok/short-form captions stay punchy; IG/Pinterest can carry the recipe.
  if (platform !== "tiktok" && recipe.ingredients?.length) {
    lines.push("");
    lines.push("You'll need:");
    for (const ing of recipe.ingredients.slice(0, 6)) lines.push(`• ${ing}`);
    if (recipe.ingredients.length > 6) lines.push("• …full recipe below 👇");
    if (recipe.garnish) lines.push(`✨ Garnish: ${recipe.garnish}`);
  }

  lines.push("");
  lines.push("Made with Siply — your AI cocktail concierge. Imagine. Create. Enjoy.");
  if (link) lines.push(`👉 ${link}`);

  const caption = lines.join("\n");
  const full = `${caption}\n\n${hashtagLine}`;

  return { caption, hashtags, hashtagLine, full };
}

/** Convenience for a stored cocktail. */
export function creatorCopyForCocktail(
  cocktail: Cocktail,
  platform: Platform = "instagram",
  link?: string
): CreatorCopy {
  return buildCreatorCopy(cocktail, platform, link);
}
