// Compliance helpers — responsible-drinking + wellness/CBD guardrails.
//
// These are intentionally simple, deterministic checks so the same rules
// apply whether we are in mock mode or calling the real OpenAI API.

import type { AlcoholLevel, GeneratedRecipe } from "./types";

export const RESPONSIBLE_DRINKING_NOTE =
  "Please drink responsibly. 18+ only where alcohol is served.";

export const CBD_WELLNESS_DISCLAIMER =
  "Wellness and CBD ingredients are included for flavour and lifestyle only — this is not medical advice and makes no health claims.";

const CBD_WELLNESS_KEYWORDS = [
  "cbd",
  "trip",
  "adaptogen",
  "nootropic",
  "wellness",
  "ashwagandha",
  "kombucha",
];

/** Detects whether a recipe references CBD / wellness ingredients. */
export function mentionsWellness(recipe: GeneratedRecipe): boolean {
  const haystack = [
    recipe.name,
    recipe.tasting_notes,
    ...recipe.ingredients,
    ...recipe.tags,
  ]
    .join(" ")
    .toLowerCase();
  return CBD_WELLNESS_KEYWORDS.some((k) => haystack.includes(k));
}

/** Returns the compliance notices that should accompany a given recipe. */
export function complianceNotesFor(recipe: GeneratedRecipe): string[] {
  const notes: string[] = [];
  if (recipe.alcohol_level !== "alcohol-free") {
    notes.push(RESPONSIBLE_DRINKING_NOTE);
  }
  if (mentionsWellness(recipe)) {
    notes.push(CBD_WELLNESS_DISCLAIMER);
  }
  return notes;
}

/** Normalises a free-text alcohol level into our enum. */
export function normaliseAlcoholLevel(value: string): AlcoholLevel {
  const v = (value || "").toLowerCase();
  if (v.includes("free") || v.includes("zero") || v.includes("mocktail")) {
    return "alcohol-free";
  }
  if (v.includes("low") || v.includes("light")) return "low-alcohol";
  return "full-strength";
}
