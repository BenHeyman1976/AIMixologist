import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCocktail, updateCocktail } from "@/lib/repo";

// PATCH /api/cocktails/:id — publish/unpublish or attach an image.
//   { isPublic?: boolean, imageUrl?: string }
// This powers the "Publish to community" button on the create page.
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    const { isPublic, imageUrl } = await req.json();

    const patch: { is_public?: boolean; image_url?: string } = {};
    if (typeof isPublic === "boolean") patch.is_public = isPublic;
    if (typeof imageUrl === "string") patch.image_url = imageUrl;

    const updated = await updateCocktail(params.id, user.id, patch);
    if (!updated) {
      return NextResponse.json(
        { error: "Cocktail not found or you don't have permission." },
        { status: 404 }
      );
    }
    return NextResponse.json({ cocktail: updated });
  } catch (err: any) {
    console.error("update cocktail error", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to update cocktail." },
      { status: 500 }
    );
  }
}

// GET /api/cocktails/:id
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const cocktail = await getCocktail(params.id);
  if (!cocktail) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ cocktail });
}
