import { NextRequest, NextResponse } from "next/server";
import { generateRecipe, aiMode } from "@/lib/ai";
import { complianceNotesFor } from "@/lib/compliance";

// POST /api/generate-recipe  { prompt: string }
// Recipe generation is UNLIMITED and free for every user.
export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 3) {
      return NextResponse.json(
        { error: "Please describe your cocktail idea (at least a few words)." },
        { status: 400 }
      );
    }

    // Always generate in ml; the UI converts to oz at display time (reversible).
    const recipe = await generateRecipe(prompt.trim(), "ml");
    const compliance = complianceNotesFor(recipe);

    return NextResponse.json({ recipe, compliance, mode: aiMode() });
  } catch (err: any) {
    console.error("generate-recipe error", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to generate recipe." },
      { status: 500 }
    );
  }
}
