import { NextRequest, NextResponse } from "next/server";
import { addMake, getCocktail, getMakeStats } from "@/lib/repo";
import { getCurrentUser } from "@/lib/auth";

// Cap the accepted photo payload (base64) so we don't take huge uploads.
const MAX_PHOTO_BYTES = 8 * 1024 * 1024; // ~8MB decoded-ish

// POST /api/makes  { cocktailId, rating?, note?, photoDataUrl? }
// Records an "I made this" — the real-world validation at the heart of the app.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cocktailId = String(body.cocktailId ?? "");
    if (!cocktailId) {
      return NextResponse.json({ error: "Missing cocktail." }, { status: 400 });
    }

    const cocktail = await getCocktail(cocktailId);
    if (!cocktail) {
      return NextResponse.json({ error: "Cocktail not found." }, { status: 404 });
    }

    const rating = body.rating != null ? Number(body.rating) : null;
    const note = body.note != null ? String(body.note) : null;
    const photoDataUrl = body.photoDataUrl ? String(body.photoDataUrl) : null;

    // Require at least one signal so an empty tap doesn't create noise.
    if (!rating && !note && !photoDataUrl) {
      return NextResponse.json(
        { error: "Add a rating, a photo or a note to log that you made it." },
        { status: 400 }
      );
    }
    if (photoDataUrl && photoDataUrl.length > MAX_PHOTO_BYTES * 1.4) {
      return NextResponse.json(
        { error: "That photo is a bit big — please use one under ~8MB." },
        { status: 413 }
      );
    }

    const user = getCurrentUser();
    const make = await addMake({
      cocktailId,
      userId: user.id,
      username: user.username,
      rating,
      note,
      photoDataUrl,
    });

    const stats = await getMakeStats(cocktailId);
    return NextResponse.json({ make, stats });
  } catch (err: any) {
    console.error("makes error", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to save." },
      { status: 500 }
    );
  }
}
