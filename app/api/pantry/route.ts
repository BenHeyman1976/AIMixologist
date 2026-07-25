import { NextRequest, NextResponse } from "next/server";
import { generateRecipe, aiMode } from "@/lib/ai";
import { complianceNotesFor } from "@/lib/compliance";
import { buildPantryPrompt, computeMissing } from "@/lib/pantry";

// POST /api/pantry  { have: string[] }
// Generates a cocktail built around what the user already owns, and works out
// what they still need to buy. Unlimited + free like the other generators.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const have: string[] = Array.isArray(body.have)
      ? body.have.map((x: any) => String(x)).filter((s: string) => s.trim())
      : [];

    if (have.length === 0) {
      return NextResponse.json(
        { error: "Add a few things you've got in — spirits, mixers, fruit…" },
        { status: 400 }
      );
    }

    const recipe = await generateRecipe(buildPantryPrompt(have), "ml");
    const compliance = complianceNotesFor(recipe);
    const match = computeMissing(recipe.ingredients, have);

    return NextResponse.json({ recipe, compliance, match, mode: aiMode() });
  } catch (err: any) {
    console.error("pantry error", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to build a cocktail." },
      { status: 500 }
    );
  }
}
