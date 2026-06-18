import type { GameResult } from "@/types/game";

const SESSIONS_KEY = "iam_not_a_robot_sessions";
const LATEST_KEY = "iam_not_a_robot_latest_result";

export function loadSessions(): GameResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSession(result: GameResult): GameResult[] {
  if (typeof window === "undefined") return [];
  try {
    const all = loadSessions();
    const next = [result, ...all].slice(0, 30);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(next));
    localStorage.setItem(LATEST_KEY, result.sessionId);
    return next;
  } catch {
    return loadSessions();
  }
}

export function clearSessions() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SESSIONS_KEY);
    localStorage.removeItem(LATEST_KEY);
  } catch {
    /* noop */
  }
}
