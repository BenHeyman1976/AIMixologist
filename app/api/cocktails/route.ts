import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { saveCocktail } from "@/lib/repo";
import { normaliseAlcoholLevel } from "@/lib/compliance";
import type { GeneratedRecipe } from "@/lib/types";

// POST /api/cocktails  — save a generated cocktail to the user's collection.
//   { prompt: string, recipe: GeneratedRecipe, imageUrl?: string, isPublic?: boolean }
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const { prompt, recipe, imageUrl, isPublic } = body as {
      prompt: string;
      recipe: GeneratedRecipe;
      imageUrl?: string;
      isPublic?: boolean;
    };

    if (!prompt || !recipe?.name) {
      return NextResponse.json(
        { error: "A prompt and a generated recipe are required." },
        { status: 400 }
      );
    }

    const safeRecipe: GeneratedRecipe = {
      ...recipe,
      alcohol_level: normaliseAlcoholLevel(String(recipe.alcohol_level)),
      ingredients: recipe.ingredients ?? [],
      method: recipe.method ?? [],
      tags: recipe.tags ?? [],
    };

    const cocktail = await saveCocktail({
      userId: user.id,
      username: user.username,
      prompt,
      recipe: safeRecipe,
      imageUrl: imageUrl ?? null,
      isPublic: Boolean(isPublic),
    });

    return NextResponse.json({ cocktail });
  } catch (err: any) {
    console.error("save cocktail error", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to save cocktail." },
      { status: 500 }
    );
  }
}
