import type { Examiner, Task } from "@/types/game";

export const MOCK_EXAMINER: Examiner = {
  name: "境界審査官 Unit-404",
  openingLine:
    "入国審査を開始します。完璧すぎる回答は減点対象です。人間なら多少は乱れてください。",
};

export const MOCK_TASKS: Task[] = [
  {
    id: "task-1",
    title: "第1認証：不完全な同期運動",
    timeLimitSec: 20,
    instruction:
      "カメラに向かって片手を上げ、なぜか少し疲れた顔で『大丈夫です』と言ってください。完璧な笑顔は禁止です。",
    targetSignals: ["表情のゆらぎ", "疲労感", "不完全さ"],
  },
  {
    id: "task-2",
    title: "第2認証：理不尽報告",
    timeLimitSec: 20,
    instruction:
      "最近あった理不尽な出来事、仕事の愚痴、納得できなかったことを20秒以内で叫ぶか語ってください。個人名や攻撃的表現は避けてください。",
    targetSignals: ["怒り", "生活感", "感情のにじみ"],
  },
  {
    id: "task-3",
    title: "第3認証：ジェスチャー付き生活証明",
    timeLimitSec: 20,
    instruction:
      "『月曜日の朝に鳴るアラーム』を、声とジェスチャーで表現してください。説明が上手すぎるとAI疑惑が上がります。",
    targetSignals: ["ジェスチャー", "矛盾", "生活感", "不完全さ"],
  },
];

export const MOCK_TASK_COMMENTS: Record<string, string> = {
  "task-1":
    "表情に微量の疲労を検出しました。『大丈夫』の信頼度は低いですが、人間らしさは高いです。",
  "task-2":
    "理不尽に対する語彙の荒れを検出しました。感情のノイズが良好です。",
  "task-3": "月曜日への拒否反応を確認しました。かなり人間です。",
};

export const EXAMINER_FLAVOR_COMMENTS = [
  "前向きすぎますね。少しAI疑惑があります。",
  "疲労感の粒度が高いです。人間らしさを検出しました。",
  "怒りの中に生活感があります。かなり人間です。",
  "完璧に説明しすぎています。人間ならもう少し脱線してください。",
];

export const KEYWORDS = {
  humanLike: [
    "疲れ", "眠い", "上司", "会議", "電車", "締切", "理不尽", "残業", "家賃",
    "月曜", "アラーム", "寝坊", "忙しい", "納得", "ムカつく", "つらい", "だるい",
    "なんで", "意味わからん",
  ],
  aiLike: [
    "最適化", "効率的", "問題ありません", "論理的", "結論として", "完全に",
    "体系的", "客観的", "仕様です", "正常です",
  ],
  imperfect: ["えー", "まあ", "なんか", "いや", "でも", "たぶん"],
};

export const HUMAN_TYPES = {
  limitWork: "限界労働型人間",
  broken: "壊れかけの人間",
  tooGenki: "元気すぎて怪しい人間",
  lifeHeavy: "生活感過多型人間",
  tooClean: "説明が整いすぎたAI疑惑人間",
};

export const AFTER_STORY = {
  approved:
    "ゲートが開き、あなたは人間界の空気を吸い込みました。審査官は最後に一言だけ告げます。『入国を許可します。なお休暇は保証されません。』",
  rejected:
    "ゲートは赤く点滅し、あなたはAI世界側の待機ロビーへ戻されました。審査官は静かに言います。『説明が整いすぎています。もう少し生活に敗北してから再申請してください。』",
};
