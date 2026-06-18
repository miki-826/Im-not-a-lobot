import type { GameResult, VoiceMetrics } from "@/types/game";
import { AFTER_STORY, EXAMINER_FLAVOR_COMMENTS, KEYWORDS, MOCK_TASK_COMMENTS } from "./mockData";
import { clampScore, countAny, hasRealEffort, pickHumanType, rankFromScore } from "./score";

export type JudgeInput = {
  texts: string[];
  hasCamera: boolean;
  hasSnapshot: boolean;
  hasMic: boolean;
  completedTaskCount: number;
  voiceMetrics?: VoiceMetrics;
};

type JudgeResult = Omit<GameResult, "sessionId" | "isMock" | "createdAt">;

const REJECTION_POOL = [
  "回答が丁寧すぎます。人間はもっと雑です。",
  "句読点の位置が完璧です。整いすぎです。",
  "あなたは月曜朝の人間にしては理性的すぎます。",
  "言い淀みが一切ありません。脱線してください。",
  "生活の疲れが検出できませんでした。",
  "結論が綺麗に出すぎています。人間は結論を出しません。",
  "感情のノイズが規格内に収まっています。",
];

/** スコアと検出シグナルから、入国拒否のギャグ理由を組み立てる */
function buildRejectionReasons(opts: {
  aiHits: number;
  imperfectHits: number;
  humanHits: number;
  textLen: number;
  metrics?: VoiceMetrics;
}): string[] {
  const reasons: string[] = [];
  if (opts.aiHits > 0) reasons.push("回答が最適化されすぎています。");
  if (opts.imperfectHits === 0 && opts.textLen > 0) reasons.push(REJECTION_POOL[3]);
  if (opts.humanHits === 0) reasons.push(REJECTION_POOL[4]);
  if (opts.metrics && opts.metrics.spoke && opts.metrics.volumeVariation < 12) {
    reasons.push("声に抑揚がなく、感情の起伏が平坦すぎます。");
  }
  if (opts.metrics && opts.metrics.spoke && opts.metrics.silenceRatio > 85) {
    reasons.push("ほとんど沈黙していました。人間はもっと喋りすぎます。");
  }
  for (const r of REJECTION_POOL) {
    if (reasons.length >= 3) break;
    if (!reasons.includes(r)) reasons.push(r);
  }
  return reasons.slice(0, 3);
}

/**
 * 無回答（音声もテキストも実質ゼロ）のまま素通りした場合は入国許可させない。
 * Mock/LIVE 双方の結果に最後に適用する共通フロア。
 */
export function applyEffortFloor(result: JudgeResult, texts: string[]): JudgeResult {
  if (hasRealEffort(texts)) return result;
  const capped = Math.min(result.humanScore, 38);
  return {
    ...result,
    humanScore: capped,
    aiSuspicion: 100 - capped,
    rank: rankFromScore(capped),
    approved: false,
    aiLikePoints: ["有効な回答がほとんど検出されませんでした", ...result.aiLikePoints].slice(0, 3),
    examinerComment: "回答がほとんどありません。人間なら、何か一言は言い残すはずです。再申請してください。",
    afterStory: AFTER_STORY.rejected,
    rejectionReasons: [
      "そもそも回答がありません。",
      "沈黙は金ですが、入国には言葉が要ります。",
      "AIは黙りません。あなたは黙りすぎました。",
    ],
  };
}

export function judgeMock(input: JudgeInput): JudgeResult {
  const perTask = input.texts.map((t) => (t ?? "").trim());
  const allText = perTask.join(" ");
  const tasksWithText = perTask.filter((t) => t.length >= 5).length;
  let score = 0;

  // 基礎点は「実際に回答したタスク数」に紐づける（素通りでは加点しない）
  score += tasksWithText * 14;
  if (input.hasCamera) score += 8;
  if (input.hasSnapshot) score += 6;
  if (input.hasMic) score += 4;

  const humanHits = countAny(allText, KEYWORDS.humanLike);
  const aiHits = countAny(allText, KEYWORDS.aiLike);
  const imperfectHits = countAny(allText, KEYWORDS.imperfect);

  score += Math.min(25, humanHits * 3);
  score -= Math.min(20, aiHits * 4);
  score += Math.min(10, imperfectHits * 2);

  if (allText.length < 20) score -= 10;
  if (allText.length >= 50) score += 5;
  if (allText.length >= 120) score += 10;

  // 音声特徴量（マイクで実際に話した場合のみ加点。マイクを使う意味を持たせる）
  const vm = input.voiceMetrics;
  const voiceGood: string[] = [];
  if (vm && vm.spoke) {
    if (vm.shout) {
      score += 6;
      voiceGood.push("叫びに近い感情の高ぶりを検出しました");
    }
    if (vm.volumeVariation >= 25) {
      score += 4;
      voiceGood.push("声の抑揚が大きく、感情がにじんでいます");
    }
    if (vm.firstSpeechDelayMs > 1500) {
      score += 3;
      voiceGood.push("話し始めの迷い（沈黙）は人間らしさの証拠です");
    }
    if (vm.silenceRatio > 88) score -= 4;
  }

  score = clampScore(score);

  const approved = score >= 70;
  const rank = rankFromScore(score);
  const humanType = pickHumanType(allText, score);

  const goodPoints: string[] = [];
  if (humanHits > 0) goodPoints.push("生活感のある語彙が検出されました");
  if (imperfectHits > 0) goodPoints.push("言い淀みや脱線など、人間特有のノイズがあります");
  if (input.hasSnapshot) goodPoints.push("表情の証拠（撮影）が提出されました");
  goodPoints.push(...voiceGood);
  if (goodPoints.length === 0) goodPoints.push("最後まで認証を完了した粘り強さは人間的です");

  const aiLikePoints: string[] = [];
  if (aiHits > 0) aiLikePoints.push("最適化された言い回しがやや多めです");
  if (allText.length < 20) aiLikePoints.push("情報量が少なく、感情のにじみが不足しています");
  if (imperfectHits === 0) aiLikePoints.push("説明が整いすぎており、脱線が見られません");
  if (vm && vm.spoke && vm.volumeVariation < 12)
    aiLikePoints.push("声が平坦で、感情の起伏が検出できません");
  if (aiLikePoints.length === 0) aiLikePoints.push("特になし。十分に人間的でした");

  const examinerComment = approved
    ? EXAMINER_FLAVOR_COMMENTS[1]
    : EXAMINER_FLAVOR_COMMENTS[3];

  const afterStory = approved ? AFTER_STORY.approved : AFTER_STORY.rejected;

  const rejectionReasons = approved
    ? undefined
    : buildRejectionReasons({
        aiHits,
        imperfectHits,
        humanHits,
        textLen: allText.length,
        metrics: vm,
      });

  return {
    humanScore: score,
    aiSuspicion: 100 - score,
    rank,
    approved,
    humanType,
    goodPoints: goodPoints.slice(0, 4),
    aiLikePoints: aiLikePoints.slice(0, 4),
    examinerComment,
    afterStory,
    rejectionReasons,
  };
}

export function mockTaskComment(taskId: string, userText: string): { comment: string; partialScore: number; detectedSignals: string[] } {
  const base = MOCK_TASK_COMMENTS[taskId] ?? "回答を受理しました。人間らしさを記録しています。";
  const humanHits = countAny(userText, KEYWORDS.humanLike);
  const imperfectHits = countAny(userText, KEYWORDS.imperfect);
  let partial = 8 + humanHits * 3 + imperfectHits * 2;
  if (userText.length >= 30) partial += 4;
  partial = Math.max(0, Math.min(33, partial));

  const detected: string[] = [];
  if (humanHits > 0) detected.push("生活感");
  if (imperfectHits > 0) detected.push("不完全さ");
  if (userText.length > 0) detected.push("感情のにじみ");

  return { comment: base, partialScore: partial, detectedSignals: detected };
}
