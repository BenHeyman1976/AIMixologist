// Cocktail DNA — a six-axis flavour fingerprint.
//
// The AI can return a `flavour_profile` directly; when it doesn't (mock mode,
// older recipes), we estimate one deterministically from the ingredients, tags
// and strength. Either way the scores are normalised to a clean 0–5 scale so
// the chart and any "find similar" comparisons stay consistent.

import type { FlavourProfile, GeneratedRecipe } from "./types";

export const DNA_AXES: { key: keyof FlavourProfile; label: string; emoji: string }[] = [
  { key: "sweet", label: "Sweet", emoji: "🍯" },
  { key: "sour", label: "Sour", emoji: "🍋" },
  { key: "bitter", label: "Bitter", emoji: "🌿" },
  { key: "boozy", label: "Boozy", emoji: "🥃" },
  { key: "fruity", label: "Fruity", emoji: "🍓" },
  { key: "herbal", label: "Herbal", emoji: "🌱" },
];

// Keyword → axis contributions. Deliberately broad and supermarket-real.
const SIGNALS: { axis: keyof FlavourProfile; words: string[]; weight?: number }[] = [
  { axis: "sweet", words: ["syrup", "sugar", "honey", "cordial", "liqueur", "grenadine", "cola", "lemonade", "tonic", "ginger beer", "triple sec", "amaretto", "sweet"] },
  { axis: "sour", words: ["lemon", "lime", "citrus", "grapefruit", "sour", "vinegar", "shrub", "yuzu", "cranberry", "passionfruit"] },
  { axis: "bitter", words: ["bitters", "angostura", "campari", "aperol", "negroni", "vermouth", "tonic", "grapefruit", "amaro", "coffee", "espresso"] },
  { axis: "boozy", words: ["gin", "vodka", "rum", "whisky", "whiskey", "bourbon", "tequila", "mezcal", "brandy", "cognac", "absinthe", "overproof"], weight: 1.5 },
  { axis: "fruity", words: ["mango", "pineapple", "strawberry", "raspberry", "peach", "apple", "orange", "berry", "passionfruit", "cranberry", "cherry", "watermelon", "coconut", "banana"] },
  { axis: "herbal", words: ["mint", "basil", "rosemary", "thyme", "sage", "elderflower", "cucumber", "coriander", "lavender", "chamomile", "ginger", "green tea", "matcha", "cbd"] },
];

function clamp05(n: number): number {
  return Math.max(0, Math.min(5, Math.round(n)));
}

/** Estimates a flavour fingerprint from recipe text. */
export function estimateFlavourProfile(
  recipe: Pick<GeneratedRecipe, "ingredients" | "tags" | "tasting_notes" | "alcohol_level" | "name">
): FlavourProfile {
  const haystack = [
    recipe.name,
    recipe.tasting_notes,
    ...(recipe.ingredients ?? []),
    ...(recipe.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();

  const score: FlavourProfile = { sweet: 0, sour: 0, bitter: 0, boozy: 0, fruity: 0, herbal: 0 };
  for (const { axis, words, weight = 1 } of SIGNALS) {
    for (const w of words) {
      if (haystack.includes(w)) score[axis] += weight;
    }
  }

  // Strength baseline for the boozy axis.
  if (recipe.alcohol_level === "alcohol-free") score.boozy = 0;
  else if (recipe.alcohol_level === "low-alcohol") score.boozy = Math.min(score.boozy, 2);
  else score.boozy = Math.max(score.boozy, 2);

  // Scale raw hit counts into 0–5. A couple of hits on an axis = a strong note.
  return {
    sweet: clamp05(score.sweet * 1.6),
    sour: clamp05(score.sour * 1.8),
    bitter: clamp05(score.bitter * 1.8),
    boozy: clamp05(score.boozy * 1.6),
    fruity: clamp05(score.fruity * 1.5),
    herbal: clamp05(score.herbal * 1.8),
  };
}

/** Normalises an AI-provided (or estimated) profile into clean 0–5 integers. */
export function coerceFlavourProfile(v: any): FlavourProfile | undefined {
  if (!v || typeof v !== "object") return undefined;
  const axis = (n: any) => {
    const num = Number(n);
    return Number.isFinite(num) ? clamp05(num) : 0;
  };
  return {
    sweet: axis(v.sweet),
    sour: axis(v.sour),
    bitter: axis(v.bitter),
    boozy: axis(v.boozy),
    fruity: axis(v.fruity),
    herbal: axis(v.herbal),
  };
}

/** Returns the recipe's profile, estimating one if none is stored. */
export function flavourProfileFor(
  recipe: Pick<GeneratedRecipe, "ingredients" | "tags" | "tasting_notes" | "alcohol_level" | "name" | "flavour_profile">
): FlavourProfile {
  return recipe.flavour_profile ?? estimateFlavourProfile(recipe);
}

/** A short human tagline for the dominant notes, e.g. "Boozy · Bitter". */
export function dnaHeadline(profile: FlavourProfile): string {
  const top = DNA_AXES.map((a) => ({ label: a.label, value: profile[a.key] }))
    .sort((a, b) => b.value - a.value)
    .filter((x) => x.value > 0)
    .slice(0, 2)
    .map((x) => x.label);
  return top.length ? top.join(" · ") : "Balanced";
}
