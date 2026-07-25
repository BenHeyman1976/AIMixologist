import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { addComment, listComments } from "@/lib/repo";

// GET /api/comment?cocktailId=...  — list approved comments.
export async function GET(req: NextRequest) {
  const cocktailId = req.nextUrl.searchParams.get("cocktailId");
  if (!cocktailId) {
    return NextResponse.json({ error: "cocktailId required" }, { status: 400 });
  }
  const comments = await listComments(cocktailId);
  return NextResponse.json({ comments });
}

// POST /api/comment  { cocktailId: string, body: string }
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { cocktailId, body } = await req.json();
    if (!cocktailId || !body || !String(body).trim()) {
      return NextResponse.json(
        { error: "cocktailId and a comment body are required." },
        { status: 400 }
      );
    }
    // TODO(moderation): run text through a moderation check and set
    // moderation_status / is_flagged accordingly before publishing.
    const comment = await addComment(
      cocktailId,
      user.id,
      user.username,
      String(body).trim().slice(0, 1000)
    );
    return NextResponse.json({ comment });
  } catch (err: any) {
    console.error("comment error", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to add comment." },
      { status: 500 }
    );
  }
}
