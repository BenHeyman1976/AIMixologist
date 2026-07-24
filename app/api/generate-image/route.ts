import { NextRequest, NextResponse } from "next/server";
import { generateImage, aiMode } from "@/lib/ai";
import { getCurrentUser } from "@/lib/auth";
import { consumeImageQuota, getCocktail, updateCocktail } from "@/lib/repo";

// POST /api/generate-image
//   { name: string, prompt: string, cocktailId?: string }
//
// Image generation is QUOTA-LIMITED by plan (free = 3/month by default).
// If a cocktailId is supplied, the new image is attached to that cocktail.
export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUser();
    const {
      name,
      prompt,
      ingredients,
      garnish,
      glassware,
      tasting_notes,
      cocktailId,
    } = await req.json();

    if (!name || !prompt) {
      return NextResponse.json(
        { error: "A cocktail name and prompt are required." },
        { status: 400 }
      );
    }

    // Build a rich description so the image matches the ACTUAL drink
    // (colour, garnish, glass) — not just the name.
    const ingList = Array.isArray(ingredients)
      ? ingredients.slice(0, 5).join(", ")
      : "";
    const description = [
      glassware ? `Served in a ${glassware}.` : "",
      ingList ? `Made with: ${ingList}.` : "",
      garnish ? `Garnish: ${garnish}.` : "",
      tasting_notes ? String(tasting_notes) : "",
      `Original idea: ${prompt}.`,
    ]
      .filter(Boolean)
      .join(" ");

    // Enforce the monthly allowance BEFORE spending money on a generation.
    const quota = await consumeImageQuota(user.id, cocktailId);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error:
            "You've used all your image generations for this month. Upgrade for more.",
          usage: quota.usage,
          // TODO(billing): surface upgrade CTA / Stripe checkout link here.
          upgrade: true,
        },
        { status: 402 }
      );
    }

    const image = await generateImage(name, description);

    // Persist onto the cocktail if we have one.
    if (cocktailId) {
      const existing = await getCocktail(cocktailId);
      if (existing && existing.user_id === user.id) {
        await updateCocktail(cocktailId, user.id, { image_url: image.url });
      }
    }

    return NextResponse.json({
      image_url: image.url,
      is_mock: image.isMock,
      usage: quota.usage,
      mode: aiMode(),
    });
  } catch (err: any) {
    console.error("generate-image error", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to generate image." },
      { status: 500 }
    );
  }
}
