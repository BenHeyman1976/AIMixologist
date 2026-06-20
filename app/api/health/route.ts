import { NextResponse } from "next/server";
import { aiMode } from "@/lib/ai";

export const dynamic = "force-dynamic";

// GET /api/health — lightweight check used by the app's "Test connection"
// button. Reports whether the backend is reachable and whether real AI is on.
export function GET() {
  return NextResponse.json({
    ok: true,
    mode: aiMode(),
    aiReady: aiMode() === "openai" && Boolean(process.env.OPENAI_API_KEY),
  });
}
