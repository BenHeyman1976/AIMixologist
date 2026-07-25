import { NextRequest, NextResponse } from "next/server";
import { generateRecipe, aiMode } from "@/lib/ai";
import { complianceNotesFor } from "@/lib/compliance";
import { buildRemixPrompt, findPreset, type RemixBase } from "@/lib/remix";
import { getCocktail } from "@/lib/repo";
import type { GeneratedRecipe } from "@/lib/types";

// POST /api/remix
//   { baseId: string, preset?: string, instruction?: string }
// Generates a NEW cocktail derived from an existing one, tagged with lineage
// back to the parent. Recipe generation is unlimited + free (same as create).
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { baseId, preset: presetKey, instruction: freeInstruction } = body;

    const base = await getCocktail(String(baseId ?? ""));
    if (!base) {
      return NextResponse.json({ error: "Original cocktail not found." }, { status: 404 });
    }

    // Resolve the twist: a preset button, or the user's own free-text remix.
    const preset = presetKey ? findPreset(String(presetKey)) : undefined;
    const instruction = (preset?.instruction ?? freeInstruction ?? "").toString().trim();
    if (!instruction) {
      return NextResponse.json(
        { error: "Tell us how to remix it (pick a twist or describe your own)." },
        { status: 400 }
      );
    }
    const twist = preset?.twist ?? `Remixed: ${instruction}`;

    const remixBase: RemixBase = {
      name: base.name,
      ingredients: base.ingredients,
      method: base.method,
      garnish: base.garnish,
      glassware: base.glassware,
      tasting_notes: base.tasting_notes,
      occasion: base.occasion,
      alcohol_level: base.alcohol_level,
    };

    const prompt = buildRemixPrompt(remixBase, instruction);
    const generated = await generateRecipe(prompt, "ml");

    // Attach lineage so the child knows its parent.
    const recipe: GeneratedRecipe = {
      ...generated,
      remixed_from_id: base.id,
      remixed_from_name: base.name,
      remixed_from_username: base.creator_username,
      remix_twist: twist,
    };

    const compliance = complianceNotesFor(recipe);
    return NextResponse.json({ recipe, compliance, mode: aiMode() });
  } catch (err: any) {
    console.error("remix error", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to remix cocktail." },
      { status: 500 }
    );
  }
}
