import { NextResponse } from "next/server";
import { HAS_SUPABASE, saveResultToSupabase } from "@/lib/supabase";
import { clampNumber, safeString } from "@/lib/utils";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const result = body?.result;

  if (!HAS_SUPABASE || !result) {
    return NextResponse.json({ saved: false, storage: "localOnly" });
  }

  const rank = ["S", "A", "B", "C", "D"].includes(result.rank) ? result.rank : "D";
  const ok = await saveResultToSupabase({
    human_score: Math.round(clampNumber(result.humanScore, 0, 100)),
    ai_suspicion: Math.round(clampNumber(result.aiSuspicion, 0, 100)),
    rank,
    approved: !!result.approved,
    human_type: safeString(result.humanType, 120),
    is_mock: !!result.isMock,
  });

  return NextResponse.json({ saved: ok, storage: ok ? "supabase" : "localOnly" });
}
