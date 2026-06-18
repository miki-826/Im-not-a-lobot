const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const HAS_SUPABASE = !!(url && key);

type ResultRow = {
  human_score: number;
  ai_suspicion: number;
  rank: string;
  approved: boolean;
  human_type: string;
  is_mock: boolean;
};

export async function saveResultToSupabase(row: ResultRow): Promise<boolean> {
  if (!HAS_SUPABASE) return false;
  try {
    const res = await fetch(`${url}/rest/v1/game_results`, {
      method: "POST",
      headers: {
        apikey: key!,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ ...row, storage_note: "No photo/audio stored" }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
