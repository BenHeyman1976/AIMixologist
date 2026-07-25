// Remix Engine — the viral loop.
//
// A remix takes an existing cocktail and applies a one-tap "twist" (or a
// free-text one) to spin up a new, related cocktail. New creations keep a
// lineage pointer back to their parent ("Remixed from X by @Y"), which is what
// turns one good drink into a branching tree people keep building on.

export interface RemixPreset {
  key: string;
  label: string; // button text (with emoji)
  twist: string; // human-readable label stored on the child
  instruction: string; // the directive handed to the AI
}

// The one-tap remixes. Deliberately cover the axes people actually want to
// change: strength, format, theme, health, and pure surprise.
export const REMIX_PRESETS: RemixPreset[] = [
  {
    key: "stronger",
    label: "Make it stronger 💪",
    twist: "Made it stronger",
    instruction:
      "Make a bolder, stronger version — a touch more spirit and backbone — while keeping it balanced and drinkable. Do not make it harsh.",
  },
  {
    key: "mocktail",
    label: "Make it a mocktail 🚫🍸",
    twist: "Turned it alcohol-free",
    instruction:
      "Create an alcohol-free mocktail version that keeps the same character and flavour, using quality non-alcoholic swaps. alcohol_level must be alcohol-free.",
  },
  {
    key: "tropical",
    label: "Tropical twist 🌴",
    twist: "Gave it a tropical twist",
    instruction:
      "Reimagine it with a tropical, holiday feel — think mango, pineapple, passionfruit, coconut or lime — while staying true to the original spirit base where sensible.",
  },
  {
    key: "fancy",
    label: "Make it fancy ✨",
    twist: "Made it fancy",
    instruction:
      "Elevate it into an elegant, dinner-party-worthy version with a refined garnish and a more sophisticated flavour balance. Keep it achievable at home.",
  },
  {
    key: "lighter",
    label: "Lighter & lower-cal 🥗",
    twist: "Made it lighter",
    instruction:
      "Create a lighter, lower-calorie version — less sugar, longer and more refreshing, lower ABV — without losing flavour.",
  },
  {
    key: "surprise",
    label: "Surprise me 🎲",
    twist: "Gave it a surprising remix",
    instruction:
      "Surprise me with a creative, unexpected but delicious remix — a bold flavour pairing or a clever format change — that still clearly relates to the original.",
  },
];

export function findPreset(key: string): RemixPreset | undefined {
  return REMIX_PRESETS.find((p) => p.key === key);
}

/** Fields of the parent cocktail we hand to the AI for context. */
export interface RemixBase {
  name: string;
  ingredients: string[];
  method: string[];
  garnish?: string;
  glassware?: string;
  tasting_notes?: string;
  occasion?: string;
  alcohol_level?: string;
}

/** Builds the user prompt for a remix generation. */
export function buildRemixPrompt(base: RemixBase, instruction: string): string {
  return [
    `Remix an existing cocktail called "${base.name}".`,
    ``,
    `Original recipe for reference:`,
    `- Ingredients: ${base.ingredients.join("; ")}`,
    base.garnish ? `- Garnish: ${base.garnish}` : "",
    base.glassware ? `- Glassware: ${base.glassware}` : "",
    base.occasion ? `- Occasion: ${base.occasion}` : "",
    base.tasting_notes ? `- Tasting notes: ${base.tasting_notes}` : "",
    ``,
    `Your task: ${instruction}`,
    ``,
    `Keep a clear family resemblance to the original, but give the remix its own`,
    `name (do not reuse the original name verbatim). Return a complete new recipe.`,
  ]
    .filter(Boolean)
    .join("\n");
}
