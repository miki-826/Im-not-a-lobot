export type GamePhase =
  | "title"
  | "howto"
  | "permission"
  | "loading"
  | "playing"
  | "analyzing"
  | "result"
  | "history";

export type Task = {
  id: string;
  title: string;
  timeLimitSec: number;
  instruction: string;
  targetSignals: string[];
};

export type Examiner = {
  name: string;
  openingLine: string;
};

export type TaskAnswer = {
  taskId: string;
  userText: string;
  startedAt?: string;
  endedAt?: string;
  partialScore?: number;
  comment?: string;
  detectedSignals?: string[];
};

export type Rank = "S" | "A" | "B" | "C" | "D";

export type VoiceMetrics = {
  avgVolume: number; // 0-100
  peakVolume: number; // 0-100
  silenceRatio: number; // 0-100（無音だった割合）
  firstSpeechDelayMs: number; // 話し始めまでの遅延（-1=発話なし）
  volumeVariation: number; // 0-100（声の揺れ）
  shout: boolean; // 叫び判定
  spoke: boolean; // 実際に声が検出されたか
};

export type GameResult = {
  sessionId: string;
  humanScore: number;
  aiSuspicion: number;
  rank: Rank;
  approved: boolean;
  humanType: string;
  goodPoints: string[];
  aiLikePoints: string[];
  examinerComment: string;
  afterStory: string;
  rejectionReasons?: string[];
  voiceMetrics?: VoiceMetrics;
  isMock: boolean;
  createdAt: string;
  taskSummaries?: { taskId: string; title: string; partialScore: number }[];
};

export type PermissionState = {
  camera: "unknown" | "granted" | "denied";
  mic: "unknown" | "granted" | "denied";
  hasSnapshot: boolean;
};

export type StoredSession = GameResult;
