import { NextResponse } from "next/server";
import { HAS_SUPABASE, saveResultToSupabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const result = body?.result;

  if (!HAS_SUPABASE || !result) {
    return NextResponse.json({ saved: false, storage: "localOnly" });
  }

  const ok = await saveResultToSupabase({
    human_score: Number(result.humanScore) || 0,
    ai_suspicion: Number(result.aiSuspicion) || 0,
    rank: String(result.rank || "D"),
    approved: !!result.approved,
    human_type: String(result.humanType || ""),
    is_mock: !!result.isMock,
  });

  return NextResponse.json({ saved: ok, storage: ok ? "supabase" : "localOnly" });
}
