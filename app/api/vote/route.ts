import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { toggleVote } from "@/lib/repo";

// POST /api/vote  { cocktailId: string }
// Toggles the current user's vote. Each user can vote once per cocktail
// (enforced by a unique constraint in Supabase / a keyed map in mock mode).
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { cocktailId } = await req.json();
    if (!cocktailId) {
      return NextResponse.json(
        { error: "cocktailId is required." },
        { status: 400 }
      );
    }
    const result = await toggleVote(cocktailId, user.id);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("vote error", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to register vote." },
      { status: 500 }
    );
  }
}
