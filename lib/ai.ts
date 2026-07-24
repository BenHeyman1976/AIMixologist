import OpenAI from "openai";
import type { GeneratedRecipe } from "./types";
import { normaliseAlcoholLevel } from "./compliance";

// ─────────────────────────────────────────────────────────────
// AI layer.
//
// One module, two backends:
//   AI_MODE=mock   → deterministic, free, offline mock responses.
//   AI_MODE=openai → real OpenAI calls (recipe = chat completion w/ JSON,
//                    image = image generation).
//
// Defaults to "mock" so the app runs with zero config. To go live, set
// AI_MODE=openai and OPENAI_API_KEY in your environment.
// ─────────────────────────────────────────────────────────────

const AI_MODE = process.env.AI_MODE ?? "mock";
const TEXT_MODEL = process.env.OPENAI_TEXT_MODEL ?? "gpt-4o-mini";
const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1";

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required when AI_MODE=openai");
  }
  return new OpenAI({ apiKey });
}

export type UnitSystem = "ml" | "oz";

const RECIPE_SYSTEM_PROMPT = `You are Siply, an expert AI mixologist for a mainly UK audience. Given a user's
idea, mood, brand, flavour or occasion, invent ONE creative, well-balanced
cocktail (or mocktail).

Compliance rules you MUST follow:
- Never encourage excessive or unsafe alcohol consumption.
- If wellness/CBD ingredients are referenced, do NOT make any medical or health claims.
- Do not imply an official brand partnership.
- If the user explicitly names a brand, you MAY list it as an ingredient, but do
  NOT put the brand name in the cocktail's title and never suggest the brand is
  affiliated with or endorses this app.

Accuracy rules (avoid inventing things):
- Use only real, widely-available ingredients. Do NOT invent brands or fictional
  products, and do NOT cite a specific brand product unless the user named it.
- Prefer GENERIC descriptions ("CBD-infused sparkling drink", "orange aperitif",
  "dry sparkling wine") over specific brand names, unless the user asked for a brand.
- CBD / wellness sparkling drinks are typically FLAVOURED (e.g. elderflower, peach,
  citrus, berry) — refer to a flavour or say "flavoured CBD sparkling drink", never
  describe them as plain "CBD water".
- Use BRITISH English ingredient names: "sugar syrup" (never "simple syrup"),
  "soda water", "sparkling water", "coriander", "double cream", etc.
- Prefer common, supermarket-available ingredients so people can actually buy them.
- Do NOT add a bespoke syrup to every drink. Avoid niche invented syrups
  ("chilli syrup", "lavender syrup") — favour fresh ingredients, classic builds
  and established products (fresh chilli, ginger beer, tonic, elderflower cordial,
  Angostura bitters, fresh citrus, good spirits). Sugar syrup is fine occasionally.
- Lean towards recognisable British-pub / classic cocktails and simple, real
  techniques rather than fussy, over-engineered recipes.

Match the cocktail to the occasion or setting mentioned — ingredients, colour,
name and mood should all fit:
- Halloween → dark, moody, dramatic (blackberry, blood orange, activated charcoal-free dark hues).
- Beach / BBQ / tropical → refreshing, fruity, holiday feel (mango, pineapple, lime, coconut).
- Wedding / celebration → elegant and sparkling (prosecco, elderflower, delicate garnish).
- Christmas / winter → warming and spiced (cranberry, cinnamon, orange, rosemary).
- Summer garden → light, floral, crisp.

"ingredients" must contain ONLY purchasable drink components (spirits, mixers,
juices, syrups, fruit). Do NOT list glassware, "a glass", ice, or the garnish as
ingredients — glassware and garnish have their own fields.

Respond with ONLY valid minified JSON matching exactly this shape:
{"name":"","description":"","ingredients":[],"method":[],"garnish":"","glassware":"","tasting_notes":"","occasion":"","alcohol_level":"","abv":"","calories":"","prep_time":"","food_pairing":"","substitutions":[],"allergens":[],"tags":[]}
Where:
- "alcohol_level" is one of: "alcohol-free", "low-alcohol", "full-strength".
- "description" is a single enticing sentence.
- "abv" is an estimate like "~12% ABV" (use "0% ABV" for alcohol-free).
- "calories" is a rough estimate per serving like "~180 kcal".
- "prep_time" is like "3 min".
- "food_pairing" is a short suggestion.
- "substitutions" are 1–3 easy swaps (e.g. "no gin? use vodka").
- "allergens" lists notable allergens present (e.g. "egg", "dairy", "nuts") or [] if none.
Estimates are approximate and clearly not lab-measured.`;

// ── Recipe generation ────────────────────────────────────────

export async function generateRecipe(
  prompt: string,
  units: UnitSystem = "ml"
): Promise<GeneratedRecipe> {
  if (AI_MODE === "openai") {
    return generateRecipeOpenAI(prompt, units);
  }
  return generateRecipeMock(prompt, units);
}

async function generateRecipeOpenAI(
  prompt: string,
  units: UnitSystem
): Promise<GeneratedRecipe> {
  const client = getOpenAI();
  const unitInstruction =
    units === "oz"
      ? "Give all liquid measures in US fluid ounces (oz)."
      : "Give all liquid measures in millilitres (ml), UK style (a single = 25ml, a double = 50ml).";
  const completion = await client.chat.completions.create({
    model: TEXT_MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: RECIPE_SYSTEM_PROMPT },
      { role: "user", content: `${prompt}\n\n${unitInstruction}` },
    ],
    temperature: 0.9,
  });
  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw);
  return coerceRecipe(parsed, prompt);
}

/** Converts "50ml" style measures to rounded US fluid ounces, e.g. "1.75 oz". */
function mlToOz(text: string): string {
  return text.replace(/(\d+)\s?ml/gi, (_m, n) => {
    const oz = Number(n) / 29.5735;
    const rounded = Math.round(oz * 4) / 4; // nearest quarter-ounce
    return `${rounded} oz`;
  });
}

/** Deterministic-ish mock generator. Free, offline, and good for demos. */
function generateRecipeMock(prompt: string, units: UnitSystem = "ml"): GeneratedRecipe {
  const p = prompt.toLowerCase();

  const alcoholFree =
    p.includes("alcohol-free") ||
    p.includes("alcohol free") ||
    p.includes("mocktail") ||
    p.includes("no alcohol");
  const lowAlcohol =
    !alcoholFree && (p.includes("low-alcohol") || p.includes("low alcohol") || p.includes("light"));

  const alcohol_level = alcoholFree
    ? "alcohol-free"
    : lowAlcohol
    ? "low-alcohol"
    : "full-strength";

  const tropical = p.includes("tropical") || p.includes("bbq") || p.includes("beach");
  const festive = p.includes("christmas") || p.includes("festive") || p.includes("winter");
  const wellness = p.includes("cbd") || p.includes("trip") || p.includes("relax");

  let name = "Siply House Spritz";
  if (tropical) name = "Sunset Mango Breeze";
  else if (festive) name = "Spiced Cranberry Glow";
  else if (wellness) name = "Calm Coast Spritz";

  const baseSpirit = alcoholFree
    ? "100ml premium alcohol-free aperitif"
    : lowAlcohol
    ? "50ml chilled sparkling wine"
    : "50ml gin";

  const ingredients = [
    baseSpirit,
    tropical ? "60ml fresh mango purée" : "30ml fresh citrus juice",
    festive ? "20ml spiced cranberry syrup" : "15ml elderflower cordial",
    wellness ? "1 measure CBD-infused tonic (flavour only)" : "Top with chilled soda water",
    "Plenty of cubed ice",
  ];

  const method = [
    "Fill a large glass with cubed ice.",
    `Add ${baseSpirit.toLowerCase()} and the remaining liquid ingredients.`,
    "Stir gently to combine and chill.",
    "Top with soda or tonic and give one final light stir.",
    "Garnish and serve immediately.",
  ];

  const tags = [
    tropical ? "tropical" : festive ? "festive" : "refreshing",
    alcohol_level,
    wellness ? "wellness" : "easy-drinking",
  ];

  return {
    name,
    ingredients: units === "oz" ? ingredients.map(mlToOz) : ingredients,
    method: units === "oz" ? method.map(mlToOz) : method,
    garnish: tropical ? "Mango fan and a mint sprig" : festive ? "Orange twist and rosemary" : "Orange slice",
    glassware: "Large wine glass or balloon glass",
    tasting_notes: tropical
      ? "Bright, juicy and sun-soaked with a clean fizzy finish."
      : festive
      ? "Warm, spiced and gently tart — a cosy seasonal sipper."
      : "Crisp, citrus-forward and easy-going with a light, fragrant lift.",
    occasion: tropical ? "Summer BBQ" : festive ? "Holiday gathering" : "Relaxed evening",
    alcohol_level,
    tags,
    description: tropical
      ? "A juicy, sun-soaked sipper built for warm afternoons."
      : festive
      ? "A cosy, spiced glass of festive cheer."
      : "A crisp, easy-going house spritz for any evening.",
    abv: alcohol_level === "alcohol-free" ? "0% ABV" : alcohol_level === "low-alcohol" ? "~6% ABV" : "~12% ABV",
    calories: "~160 kcal",
    prep_time: "3 min",
    food_pairing: tropical ? "Grilled prawns or a fresh ceviche" : festive ? "Spiced nuts or a cheese board" : "Olives and salted crisps",
    substitutions: [
      alcoholFree ? "Add gin to make it full-strength" : "No gin? Use vodka",
      "Swap soda for tonic for more bite",
    ],
    allergens: [],
  };
}

/** Defensively coerces arbitrary parsed JSON into a valid GeneratedRecipe. */
function coerceRecipe(parsed: any, prompt: string): GeneratedRecipe {
  const arr = (v: any): string[] =>
    Array.isArray(v) ? v.map((x) => String(x)) : v ? [String(v)] : [];
  const str = (v: any): string | undefined => (v ? String(v) : undefined);
  return {
    name: String(parsed.name || "Untitled Cocktail"),
    ingredients: arr(parsed.ingredients),
    method: arr(parsed.method),
    garnish: String(parsed.garnish || ""),
    glassware: String(parsed.glassware || ""),
    tasting_notes: String(parsed.tasting_notes || ""),
    occasion: String(parsed.occasion || ""),
    alcohol_level: normaliseAlcoholLevel(String(parsed.alcohol_level || "")),
    tags: arr(parsed.tags),
    description: str(parsed.description),
    abv: str(parsed.abv),
    calories: str(parsed.calories),
    prep_time: str(parsed.prep_time),
    food_pairing: str(parsed.food_pairing),
    substitutions: parsed.substitutions ? arr(parsed.substitutions) : undefined,
    allergens: parsed.allergens ? arr(parsed.allergens) : undefined,
  };
}

// ── Image generation ─────────────────────────────────────────

export interface GeneratedImage {
  url: string;
  // True when this is a mock/placeholder rather than a real generation.
  isMock: boolean;
}

export async function generateImage(
  recipeName: string,
  prompt: string
): Promise<GeneratedImage> {
  if (AI_MODE === "openai") {
    return generateImageOpenAI(recipeName, prompt);
  }
  return generateImageMock(recipeName);
}

async function generateImageOpenAI(
  recipeName: string,
  prompt: string
): Promise<GeneratedImage> {
  const client = getOpenAI();
  // Fixed "Siply" house style — keeps every feed image consistent and premium.
  // Brand names from the prompt are visual inspiration only, never an official
  // partnership, and we explicitly forbid logos/labels/text (see compliance).
  const STYLE =
    "Editorial, premium social-media cocktail photography in the 'Siply' house style. " +
    "1) The drink's colour and garnish must be TRUE TO ITS ACTUAL INGREDIENTS " +
    "(cranberry = deep red, aperol = orange, gin & tonic = clear, matcha = green) — " +
    "do not tint the drink pink or peach unless its ingredients are. " +
    "2) Set the SCENE and BACKDROP to reflect the occasion or location described " +
    "(e.g. a sunny beach with soft sand and sea bokeh; an elegant wedding table with " +
    "white florals; a moody, dark Halloween scene with autumn touches; a cosy cand-lit " +
    "festive setting; a bright summer garden) — with tasteful props matching the cocktail " +
    "and the moment. Natural light appropriate to that setting. " +
    "3) Keep it premium: shallow depth of field, subtle gold accents, condensation on the " +
    "glass, chic and aspirational, square composition. " +
    "STRICT RULES: no people; absolutely NO text, letters, words, numbers or writing " +
    "anywhere in the image; no logos, brand names, labels or trademarks; do NOT depict " +
    "any bottles, cans, tins or product packaging of any kind — show ONLY the finished " +
    "drink in a plain unbranded glass within the scene.";
  const imagePrompt = `${STYLE}\n\nCocktail: "${recipeName}". ${prompt}`;

  const result = await client.images.generate({
    model: IMAGE_MODEL,
    prompt: imagePrompt,
    size: "1024x1024", // square — full glass shows in every card/hero
    n: 1,
  });

  const data = result.data?.[0];
  // gpt-image-1 returns b64_json; dall-e returns url. Handle both.
  if (data?.url) return { url: data.url, isMock: false };
  if (data?.b64_json) {
    return { url: `data:image/png;base64,${data.b64_json}`, isMock: false };
  }
  throw new Error("OpenAI image generation returned no image data");
}

/** Deterministic placeholder image keyed off the cocktail name. */
function generateImageMock(recipeName: string): GeneratedImage {
  const seed = encodeURIComponent(recipeName || "cocktail");
  // picsum's seeded endpoint gives a stable, attractive placeholder photo.
  return {
    url: `https://picsum.photos/seed/${seed}/1024/1024`,
    isMock: true,
  };
}

// ── Night planner ────────────────────────────────────────────

export type PlanKind = "drink" | "food" | "water" | "tip" | "move";
export interface PlanItem {
  time: string | null;
  kind: PlanKind;
  title: string;
  detail: string;
}
export interface NightPlan {
  headline: string;
  items: PlanItem[];
  safety: string;
}

const PLAN_SYSTEM_PROMPT = `You are Siply, a responsible cocktail companion. Given a description of
someone's evening (timings, food, vibe, how big a night), produce a paced drink
itinerary that prioritises BOTH enjoyment and responsible drinking: pacing,
a glass of water between drinks, eating, knowing limits, and planning transport
home. Pair drinks to any cuisine mentioned. Be warm and specific.

You MUST NOT encourage excessive, rapid or unsafe drinking. Always include
water and food steps and a transport-home reminder for big nights. 18+ only.

Respond with ONLY valid minified JSON matching exactly:
{"headline":"","items":[{"time":null,"kind":"drink","title":"","detail":""}],"safety":""}
Where "kind" is one of: "drink","food","water","tip","move". "time" may be a
clock time, a label like "Bar 2", or null.`;

const PLAN_SAFETY =
  "Know your limits, never drink-drive, eat well and look out for your group. Siply encourages drinking responsibly. 18+.";

export async function generatePlan(prompt: string): Promise<NightPlan> {
  if (AI_MODE === "openai") {
    const client = getOpenAI();
    const completion = await client.chat.completions.create({
      model: TEXT_MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: PLAN_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });
    const parsed = JSON.parse(completion.choices[0]?.message?.content ?? "{}");
    return coercePlan(parsed);
  }
  return generatePlanMock(prompt);
}

function coercePlan(parsed: any): NightPlan {
  const kinds: PlanKind[] = ["drink", "food", "water", "tip", "move"];
  const items: PlanItem[] = Array.isArray(parsed.items)
    ? parsed.items.map((i: any) => ({
        time: i?.time ? String(i.time) : null,
        kind: kinds.includes(i?.kind) ? i.kind : "tip",
        title: String(i?.title ?? ""),
        detail: String(i?.detail ?? ""),
      }))
    : [];
  return {
    headline: String(parsed.headline || "Here's your plan for the night."),
    items,
    safety: String(parsed.safety || PLAN_SAFETY),
  };
}

/** Mock planner — mirrors the on-device iOS logic. */
function generatePlanMock(prompt: string): NightPlan {
  const p = prompt.toLowerCase();
  const heavy = ["wasted", "messy", "big one", "big night", "crawl", "all night", "get drunk", "bars", "smashed"].some((k) => p.includes(k));
  const preEvent = ["show", "theatre", "theater", "gig", "concert", "cinema", "dinner", "reservation", "table", "film", "musical", "play", "before"].some((k) => p.includes(k));

  let pairing = { name: "House Spritz", note: "A light, fragrant spritz to set the tone" };
  if (p.includes("italian")) pairing = { name: "Negroni", note: "Italian classics love a bittersweet Negroni or an Aperol Spritz" };
  else if (p.includes("mexican")) pairing = { name: "Tommy's Margarita", note: "Mexican food sings with a fresh lime Margarita or Paloma" };
  else if (p.includes("japanese") || p.includes("sushi") || p.includes("asian")) pairing = { name: "Yuzu Highball", note: "Clean and crisp — a citrus highball cuts through beautifully" };
  else if (p.includes("indian") || p.includes("curry")) pairing = { name: "Gin & Tonic", note: "A crisp G&T is a curry-house hero" };

  if (heavy) {
    return {
      headline: "A long one — let's pace it so you enjoy the whole night 💪",
      items: [
        { time: "Before", kind: "food", title: "Eat first", detail: "A proper meal before drink #1 — it changes everything." },
        { time: "Bar 1", kind: "drink", title: "Open light", detail: "Start with a lower-ABV spritz or a tall, sessionable highball." },
        { time: null, kind: "water", title: "Water between rounds", detail: "One glass of water for every drink. Non-negotiable on a big one." },
        { time: "Bars 2–4", kind: "drink", title: "Alternate strengths", detail: "Cocktail, then a soft or low-alcohol round. Sip — don't shot." },
        { time: "Halfway", kind: "food", title: "Refuel", detail: "Grab a snack to keep you steady." },
        { time: "Bars 5–8", kind: "drink", title: "Slow the pace", detail: "Stretch each drink over 45+ minutes." },
        { time: "Last bars", kind: "water", title: "Wind down", detail: "Switch to soft drinks for the final venues." },
        { time: "Home", kind: "move", title: "Plan your way home", detail: "Book the cab now and share your location with a friend." },
      ],
      safety: PLAN_SAFETY,
    };
  }
  if (preEvent) {
    return {
      headline: "A civilised pre-show couple — relaxed, not rushed 🎭",
      items: [
        { time: "6:30", kind: "drink", title: `Drink one: ${pairing.name}`, detail: pairing.note + "." },
        { time: "7:00", kind: "water", title: "A glass of water", detail: "Hydrate so you enjoy the show clear-headed." },
        { time: "7:15", kind: "drink", title: "Drink two: something lighter", detail: "A low-ABV spritz or a glass of prosecco to finish." },
        { time: "7:40", kind: "food", title: "Pre-theatre bite", detail: "A small plate before you head in." },
        { time: "8:00", kind: "move", title: "Curtain up", detail: "Two drinks in, perfectly paced. Enjoy the show!" },
      ],
      safety: PLAN_SAFETY,
    };
  }
  return {
    headline: "A relaxed, well-paced plan 🥂",
    items: [
      { time: null, kind: "drink", title: `Start: ${pairing.name}`, detail: pairing.note + "." },
      { time: null, kind: "water", title: "Hydrate alongside", detail: "A glass of water with it keeps the night smooth." },
      { time: null, kind: "drink", title: "Second round", detail: "Try a low-alcohol option to stretch the evening out." },
      { time: null, kind: "food", title: "Grab a bite", detail: "A little food keeps the good times going longer." },
    ],
    safety: PLAN_SAFETY,
  };
}

export function aiMode(): string {
  return AI_MODE;
}
