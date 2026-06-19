import { NextRequest, NextResponse } from "next/server";
import { listPublicCocktails, type GalleryFilters } from "@/lib/repo";
import type { GallerySort } from "@/lib/types";

// This route reads query params, so it must render per-request.
export const dynamic = "force-dynamic";

// GET /api/feed?sort=trending|newest|most_voted&alcohol=&spirit=&mood=&occasion=
//
// Public JSON feed of community cocktails — consumed by the mobile apps
// (ios-native/ and mobile/). No auth required; only public + approved
// cocktails are returned by the repository layer.
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const filters: GalleryFilters = {
      sort: (sp.get("sort") as GallerySort) ?? "trending",
      alcohol: sp.get("alcohol") || undefined,
      spirit: sp.get("spirit") || undefined,
      mood: sp.get("mood") || undefined,
      occasion: sp.get("occasion") || undefined,
    };
    const cocktails = await listPublicCocktails(filters);
    return NextResponse.json({ cocktails });
  } catch (err: any) {
    console.error("feed error", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to load feed." },
      { status: 500 }
    );
  }
}
