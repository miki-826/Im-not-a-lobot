import type { Rank } from "@/types/game";
import { HUMAN_TYPES, KEYWORDS } from "./mockData";

export function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function countAny(text: string, words: string[]) {
  return words.filter((word) => text.includes(word)).length;
}

/** 有効な回答（音声/テキスト）が十分にあるか。無回答の素通りを弾く */
export function hasRealEffort(texts: string[]) {
  return texts.join("").replace(/\s+/g, "").length >= 10;
}

export function rankFromScore(score: number): Rank {
  if (score >= 90) return "S";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  return "D";
}

export const RANK_TITLE: Record<Rank, string> = {
  S: "国境を越えし純正人間",
  A: "生活感の化身",
  B: "だいたい人間",
  C: "AI疑惑つき人間",
  D: "説明が整いすぎた存在",
};

export function pickHumanType(text: string, score: number): string {
  const human = countAny(text, KEYWORDS.humanLike);
  const ai = countAny(text, KEYWORDS.aiLike);
  const imperfect = countAny(text, KEYWORDS.imperfect);
  const anger = countAny(text, ["ムカつく", "理不尽", "なんで", "意味わからん", "つらい"]);
  const life = countAny(text, ["上司", "会議", "電車", "締切", "残業", "家賃", "月曜", "アラーム", "家事"]);

  if (ai >= 2 && imperfect === 0) return HUMAN_TYPES.tooClean;
  if (anger >= 2) return HUMAN_TYPES.broken;
  if (life >= 3) return HUMAN_TYPES.lifeHeavy;
  if (human >= 3) return HUMAN_TYPES.limitWork;
  if (score >= 80 && human <= 1) return HUMAN_TYPES.tooGenki;
  return HUMAN_TYPES.limitWork;
}
