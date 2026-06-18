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
