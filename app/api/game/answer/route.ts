import { NextResponse } from "next/server";
import { HAS_OPENAI, chatJSON } from "@/lib/openai";
import { judgeMock, applyEffortFloor } from "@/lib/mockJudge";
import { RANK_TITLE, clampScore, rankFromScore } from "@/lib/score";
import { clip } from "@/lib/utils";
import type { Rank } from "@/types/game";

const SYSTEM = `あなたは「人間界とAI世界の境界にある入国審査場」の最終審査AIです。
ユーザーの3つの認証結果をもとに、人間度・AI疑惑・入国可否・人間タイプ診断を判定してください。
重要:
- ユーザー本人を侮辱しない、ギャグ寄りだが安全な表現
- 個人情報を推測しない、医療・心理診断のような断定をしない
- 人間度70%以上で入国許可
- 「不完全さ」「生活感」「感情のにじみ」を高く評価
- 文章が整いすぎている場合はAI疑惑を少し上げる
出力は必ずJSONのみ。Markdown禁止。
形式: {"humanScore":number,"aiSuspicion":number,"rank":"S|A|B|C|D","approved":boolean,"humanType":string,"goodPoints":[string],"aiLikePoints":[string],"examinerComment":string,"afterStory":string}`;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const texts: string[] = Array.isArray(body?.texts)
    ? body.texts.map((t: unknown) => clip(String(t ?? ""), 500))
    : [];
  const input = {
    texts,
    hasCamera: !!body?.hasCamera,
    hasSnapshot: !!body?.hasSnapshot,
    hasMic: !!body?.hasMic,
    completedTaskCount: Number(body?.completedTaskCount) || 0,
  };

  if (HAS_OPENAI) {
    const r = await chatJSON(
      SYSTEM,
      `texts: ${JSON.stringify(input.texts)}\nhasCamera: ${input.hasCamera}\nhasSnapshot: ${input.hasSnapshot}\nhasMic: ${input.hasMic}\ncompletedTaskCount: ${input.completedTaskCount}`
    );
    if (r.ok) {
      const d = r.data as Record<string, unknown>;
      if (typeof d?.humanScore === "number") {
        const humanScore = clampScore(d.humanScore as number);
        const rank = (["S", "A", "B", "C", "D"].includes(d.rank as string)
          ? d.rank
          : rankFromScore(humanScore)) as Rank;
        const live = applyEffortFloor(
          {
            humanScore,
            aiSuspicion:
              typeof d.aiSuspicion === "number" ? clampScore(d.aiSuspicion as number) : 100 - humanScore,
            rank,
            approved: humanScore >= 70,
            humanType: (d.humanType as string) || RANK_TITLE[rank],
            goodPoints: Array.isArray(d.goodPoints) ? (d.goodPoints as string[]) : [],
            aiLikePoints: Array.isArray(d.aiLikePoints) ? (d.aiLikePoints as string[]) : [],
            examinerComment: (d.examinerComment as string) || "",
            afterStory: (d.afterStory as string) || "",
          },
          input.texts
        );
        return NextResponse.json({ ...live, isMock: false });
      }
    }
  }

  const result = applyEffortFloor(judgeMock(input), input.texts);
  return NextResponse.json({ ...result, isMock: true });
}
