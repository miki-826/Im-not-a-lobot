import type { GameResult } from "@/types/game";
import { AFTER_STORY, EXAMINER_FLAVOR_COMMENTS, KEYWORDS, MOCK_TASK_COMMENTS } from "./mockData";
import { clampScore, countAny, hasRealEffort, pickHumanType, rankFromScore } from "./score";

export type JudgeInput = {
  texts: string[];
  hasCamera: boolean;
  hasSnapshot: boolean;
  hasMic: boolean;
  completedTaskCount: number;
};

type JudgeResult = Omit<GameResult, "sessionId" | "isMock" | "createdAt">;

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

  score = clampScore(score);

  const approved = score >= 70;
  const rank = rankFromScore(score);
  const humanType = pickHumanType(allText, score);

  const goodPoints: string[] = [];
  if (humanHits > 0) goodPoints.push("生活感のある語彙が検出されました");
  if (imperfectHits > 0) goodPoints.push("言い淀みや脱線など、人間特有のノイズがあります");
  if (input.hasSnapshot) goodPoints.push("表情の証拠（撮影）が提出されました");
  if (goodPoints.length === 0) goodPoints.push("最後まで認証を完了した粘り強さは人間的です");

  const aiLikePoints: string[] = [];
  if (aiHits > 0) aiLikePoints.push("最適化された言い回しがやや多めです");
  if (allText.length < 20) aiLikePoints.push("情報量が少なく、感情のにじみが不足しています");
  if (imperfectHits === 0) aiLikePoints.push("説明が整いすぎており、脱線が見られません");
  if (aiLikePoints.length === 0) aiLikePoints.push("特になし。十分に人間的でした");

  const examinerComment = approved
    ? EXAMINER_FLAVOR_COMMENTS[1]
    : EXAMINER_FLAVOR_COMMENTS[3];

  const afterStory = approved ? AFTER_STORY.approved : AFTER_STORY.rejected;

  return {
    humanScore: score,
    aiSuspicion: 100 - score,
    rank,
    approved,
    humanType,
    goodPoints,
    aiLikePoints,
    examinerComment,
    afterStory,
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
