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

const RECIPE_SYSTEM_PROMPT = `You are Bob, an expert AI mixologist. Given a user's idea, mood, brand,
flavour or occasion, invent ONE creative, well-balanced cocktail (or mocktail).

Compliance rules you MUST follow:
- Never encourage excessive or unsafe alcohol consumption.
- If wellness/CBD ingredients are referenced, do NOT make any medical or health claims.
- Do not imply an official brand partnership.

Respond with ONLY valid minified JSON matching exactly this shape:
{"name":"","ingredients":[],"method":[],"garnish":"","glassware":"","tasting_notes":"","occasion":"","alcohol_level":"","tags":[]}
Where "alcohol_level" is one of: "alcohol-free", "low-alcohol", "full-strength".`;

// ── Recipe generation ────────────────────────────────────────

export async function generateRecipe(prompt: string): Promise<GeneratedRecipe> {
  if (AI_MODE === "openai") {
    return generateRecipeOpenAI(prompt);
  }
  return generateRecipeMock(prompt);
}

async function generateRecipeOpenAI(prompt: string): Promise<GeneratedRecipe> {
  const client = getOpenAI();
  const completion = await client.chat.completions.create({
    model: TEXT_MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: RECIPE_SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    temperature: 0.9,
  });
  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw);
  return coerceRecipe(parsed, prompt);
}

/** Deterministic-ish mock generator. Free, offline, and good for demos. */
function generateRecipeMock(prompt: string): GeneratedRecipe {
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

  let name = "Bob's House Spritz";
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
    ingredients,
    method,
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
  };
}

/** Defensively coerces arbitrary parsed JSON into a valid GeneratedRecipe. */
function coerceRecipe(parsed: any, prompt: string): GeneratedRecipe {
  const arr = (v: any): string[] =>
    Array.isArray(v) ? v.map((x) => String(x)) : v ? [String(v)] : [];
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
  // Premium lifestyle marketing brief. Brand names are treated as visual
  // inspiration only — never as an official partnership (see compliance).
  const imagePrompt = `Premium lifestyle marketing photograph of a cocktail named "${recipeName}".
Concept: ${prompt}.
Styling: beautifully garnished cocktail in elegant glassware, warm golden-hour light,
shallow depth of field, tasteful bar or summer setting, condensation on the glass,
editorial food-photography quality, vibrant warm colours. No text, no logos,
no brand trademarks, no claim of brand partnership.`;

  const result = await client.images.generate({
    model: IMAGE_MODEL,
    prompt: imagePrompt,
    size: "1024x1024",
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

export function aiMode(): string {
  return AI_MODE;
}
