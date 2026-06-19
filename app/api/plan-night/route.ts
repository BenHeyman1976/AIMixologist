import { NextRequest, NextResponse } from "next/server";
import { generatePlan, aiMode } from "@/lib/ai";

// POST /api/plan-night  { prompt: string }
// Returns a paced, responsible night-out drink plan. Free + unlimited.
export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 5) {
      return NextResponse.json(
        { error: "Tell Siply a little about your evening (timings, food, vibe)." },
        { status: 400 }
      );
    }
    const plan = await generatePlan(prompt.trim());
    return NextResponse.json({ plan, mode: aiMode() });
  } catch (err: any) {
    console.error("plan-night error", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to plan your night." },
      { status: 500 }
    );
  }
}
