import { NextResponse } from "next/server";
import { HAS_OPENAI, chatJSON } from "@/lib/openai";
import { judgeMock, applyEffortFloor } from "@/lib/mockJudge";
import { RANK_TITLE, clampScore, rankFromScore } from "@/lib/score";
import { clip } from "@/lib/utils";
import type { Rank, VoiceMetrics } from "@/types/game";

const SYSTEM = `あなたは「人間界とAI世界の境界にある入国審査場」の最終審査AIです。
ユーザーの3つの認証結果と音声特徴量をもとに、人間度・AI疑惑・入国可否・人間タイプ診断を判定してください。
重要:
- ユーザー本人を侮辱しない、ギャグ寄りだが安全な表現
- 個人情報を推測しない、医療・心理診断のような断定をしない
- 人間度70%以上で入国許可
- 「不完全さ」「生活感」「感情のにじみ」を高く評価
- 文章が整いすぎている場合はAI疑惑を少し上げる
- 音声特徴量(volumeVariation=声の揺れ, shout=叫び, silenceRatio=沈黙率, firstSpeechDelayMs=話し始めの遅延)も加味し、抑揚や叫び・話し始めの迷いは人間らしさとして評価する
- approved=false のときは rejectionReasons に、皮肉でクスッと笑える入国拒否理由を2〜3個入れる(例:「句読点が完璧すぎます」「月曜朝の人間にしては理性的すぎます」)。approved=true のときは空配列でよい
出力は必ずJSONのみ。Markdown禁止。
形式: {"humanScore":number,"aiSuspicion":number,"rank":"S|A|B|C|D","approved":boolean,"humanType":string,"goodPoints":[string],"aiLikePoints":[string],"examinerComment":string,"afterStory":string,"rejectionReasons":[string]}`;

function parseMetrics(v: unknown): VoiceMetrics | undefined {
  if (!v || typeof v !== "object") return undefined;
  const m = v as Record<string, unknown>;
  const num = (x: unknown) => (typeof x === "number" && isFinite(x) ? x : 0);
  return {
    avgVolume: num(m.avgVolume),
    peakVolume: num(m.peakVolume),
    silenceRatio: num(m.silenceRatio),
    firstSpeechDelayMs: typeof m.firstSpeechDelayMs === "number" ? m.firstSpeechDelayMs : -1,
    volumeVariation: num(m.volumeVariation),
    shout: !!m.shout,
    spoke: !!m.spoke,
  };
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const texts: string[] = Array.isArray(body?.texts)
    ? body.texts.map((t: unknown) => clip(String(t ?? ""), 500))
    : [];
  const voiceMetrics = parseMetrics(body?.voiceMetrics);
  const input = {
    texts,
    hasCamera: !!body?.hasCamera,
    hasSnapshot: !!body?.hasSnapshot,
    hasMic: !!body?.hasMic,
    completedTaskCount: Number(body?.completedTaskCount) || 0,
    voiceMetrics,
  };

  if (HAS_OPENAI) {
    const r = await chatJSON(
      SYSTEM,
      `texts: ${JSON.stringify(input.texts)}\nhasCamera: ${input.hasCamera}\nhasSnapshot: ${input.hasSnapshot}\nhasMic: ${input.hasMic}\ncompletedTaskCount: ${input.completedTaskCount}\nvoiceMetrics: ${JSON.stringify(voiceMetrics ?? "なし")}`
    );
    if (r.ok) {
      const d = r.data as Record<string, unknown>;
      if (typeof d?.humanScore === "number") {
        const humanScore = clampScore(d.humanScore as number);
        const rank = (["S", "A", "B", "C", "D"].includes(d.rank as string)
          ? d.rank
          : rankFromScore(humanScore)) as Rank;
        const approved = humanScore >= 70;
        const liveReasons = Array.isArray(d.rejectionReasons)
          ? (d.rejectionReasons as string[]).filter((x) => typeof x === "string").slice(0, 3)
          : [];
        const live = applyEffortFloor(
          {
            humanScore,
            aiSuspicion:
              typeof d.aiSuspicion === "number" ? clampScore(d.aiSuspicion as number) : 100 - humanScore,
            rank,
            approved,
            humanType: (d.humanType as string) || RANK_TITLE[rank],
            goodPoints: Array.isArray(d.goodPoints) ? (d.goodPoints as string[]) : [],
            aiLikePoints: Array.isArray(d.aiLikePoints) ? (d.aiLikePoints as string[]) : [],
            examinerComment: (d.examinerComment as string) || "",
            afterStory: (d.afterStory as string) || "",
            rejectionReasons: approved
              ? undefined
              : liveReasons.length
              ? liveReasons
              : judgeMock(input).rejectionReasons,
            voiceMetrics,
          },
          input.texts
        );
        return NextResponse.json({ ...live, isMock: false });
      }
    }
  }

  const result = applyEffortFloor({ ...judgeMock(input), voiceMetrics }, input.texts);
  return NextResponse.json({ ...result, isMock: true });
}
