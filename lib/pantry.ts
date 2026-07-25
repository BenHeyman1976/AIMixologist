// "Use what I own" — the pantry flow (JTBD #3).
//
// The user tells us what they already have; we generate a cocktail built around
// it and work out what (if anything) they still need to buy — which feeds
// straight into shopping/affiliate revenue.

// Store-cupboard staples we assume everyone has, so we don't nag people to
// "buy water".
const STAPLES = ["water", "ice", "sugar", "salt", "pepper"];

/** Builds the generation prompt from a list of owned ingredients. */
export function buildPantryPrompt(have: string[]): string {
  const list = have.map((h) => h.trim()).filter(Boolean).join(", ");
  return [
    `I want to make a cocktail using what I already have at home.`,
    `My ingredients: ${list}.`,
    ``,
    `Create ONE cocktail built mainly around these ingredients. You may assume`,
    `basic staples (water, ice, a little sugar). Prefer using only what I listed;`,
    `if one or two easily-bought extras would genuinely elevate it, you may add`,
    `them but keep additions minimal and common. Do not invent obscure products.`,
  ].join("\n");
}

/** Strips quantities/measures so "50ml fresh lemon juice" → "fresh lemon juice". */
function coreText(ingredient: string): string {
  return ingredient
    .toLowerCase()
    .replace(/\d+(\.\d+)?\s?(ml|oz|cl|l|g|kg|dash|dashes|shot|shots|measures?|parts?|tsp|tbsp|cups?|slices?|sprigs?|leaves?)\b/g, "")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\b(fresh|chilled|good|quality|premium|a|the|of|to|top|with|plenty|cubed|large)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function overlaps(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a.includes(b) || b.includes(a)) return true;
  const aw = new Set(a.split(" ").filter((w) => w.length >= 3));
  return b.split(" ").some((w) => w.length >= 3 && aw.has(w));
}

export interface PantryMatch {
  have: string[]; // recipe ingredients the user already has
  missing: string[]; // recipe ingredients they still need to buy
}

/** Splits a recipe's ingredients into owned vs still-needed, given the pantry. */
export function computeMissing(
  recipeIngredients: string[],
  pantry: string[]
): PantryMatch {
  const owned = pantry.map(coreText).filter(Boolean);
  const have: string[] = [];
  const missing: string[] = [];

  for (const ing of recipeIngredients) {
    const core = coreText(ing);
    const isStaple = STAPLES.some((s) => core.includes(s));
    const isOwned = owned.some((o) => overlaps(core, o));
    if (isStaple || isOwned) have.push(ing);
    else missing.push(ing);
  }
  return { have, missing };
}

/** Parses a free-text or comma/newline list into clean pantry items. */
export function parsePantry(input: string): string[] {
  return input
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}
