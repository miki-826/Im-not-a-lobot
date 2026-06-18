"use client";

import { useCallback, useRef, useState } from "react";
import type {
  Examiner,
  GamePhase,
  GameResult,
  PermissionState,
  Task,
  TaskAnswer,
} from "@/types/game";
import { makeSessionId } from "@/lib/utils";
import { MOCK_EXAMINER, MOCK_TASKS } from "@/lib/mockData";
import { saveSession } from "@/lib/storage";
import { TerminalShell } from "@/components/TerminalShell";
import { Bgm } from "@/components/Bgm";
import { TitleScreen } from "@/components/TitleScreen";
import { HowToSlides } from "@/components/HowToSlides";
import { PermissionScreen } from "@/components/PermissionScreen";
import { GameScreen } from "@/components/GameScreen";
import { AnalyzingScreen } from "@/components/AnalyzingScreen";
import { ResultScreen } from "@/components/ResultScreen";
import { HistoryPanel } from "@/components/HistoryPanel";

const BG: Record<string, string | undefined> = {
  title: "/images/title-bg.png",
  howto: "/images/title-bg.png",
  permission: "/images/game-bg.png",
  playing: "/images/game-bg.png",
  analyzing: "/images/game-bg.png",
};

export default function Page() {
  const [phase, setPhase] = useState<GamePhase>("title");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(true);
  const [examiner, setExaminer] = useState<Examiner>(MOCK_EXAMINER);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [permission, setPermission] = useState<PermissionState>({
    camera: "unknown",
    mic: "unknown",
    hasSnapshot: false,
  });
  const [answers, setAnswers] = useState<TaskAnswer[]>([]);
  const [snapshot, setSnapshot] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<GameResult | null>(null);
  const [loadingStart, setLoadingStart] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSlides, setShowSlides] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const savedRef = useRef(false);

  const resultBg = result?.approved
    ? "/images/result-approved-bg.png"
    : "/images/result-rejected-bg.png";
  const bgUrl = phase === "result" ? resultBg : BG[phase];

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const fetchStart = useCallback(async () => {
    setLoadingStart(true);
    try {
      const res = await fetch("/api/game/start", { method: "POST" });
      const data = await res.json();
      setSessionId(data.sessionId ?? makeSessionId());
      setTasks(Array.isArray(data.tasks) && data.tasks.length ? data.tasks : MOCK_TASKS);
      setExaminer(data.examiner ?? MOCK_EXAMINER);
      setIsMock(!!data.isMock);
    } catch {
      setSessionId(makeSessionId());
      setTasks(MOCK_TASKS);
      setExaminer(MOCK_EXAMINER);
      setIsMock(true);
    } finally {
      setLoadingStart(false);
    }
  }, []);

  const beginInspection = useCallback(async () => {
    await fetchStart();
    setPhase("permission");
  }, [fetchStart]);

  const handlePermission = useCallback(
    (perm: PermissionState, stream: MediaStream | null) => {
      setPermission(perm);
      streamRef.current = stream;
      setPhase("playing");
    },
    []
  );

  const handleComplete = useCallback(
    async (finalAnswers: TaskAnswer[]) => {
      setAnswers(finalAnswers);
      stopStream();
      setPhase("analyzing");

      const texts = finalAnswers.map((a) => a.userText);
      let payload: Omit<GameResult, "sessionId" | "createdAt"> | null = null;
      try {
        const res = await fetch("/api/game/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            texts,
            hasCamera: permission.camera === "granted",
            hasSnapshot: !!snapshot,
            hasMic: permission.mic === "granted",
            completedTaskCount: finalAnswers.length,
          }),
        });
        const data = await res.json();
        payload = data;
      } catch {
        payload = null;
      }

      const fallback: Omit<GameResult, "sessionId" | "createdAt"> = {
        humanScore: 75,
        aiSuspicion: 25,
        rank: "B",
        approved: true,
        humanType: "だいたい人間",
        goodPoints: ["最後まで認証を完了しました"],
        aiLikePoints: ["通信が不安定でした"],
        examinerComment: "通信ノイズの中でも人間性を確認しました。",
        afterStory: "ゲートは静かに開きました。",
        isMock: true,
      };

      const base = payload ?? fallback;
      const built: GameResult = {
        ...base,
        sessionId: sessionId ?? makeSessionId(),
        createdAt: new Date().toISOString(),
        taskSummaries: finalAnswers.map((a, i) => ({
          taskId: a.taskId,
          title: tasks[i]?.title ?? a.taskId,
          partialScore: a.partialScore ?? 0,
        })),
      };
      setResult(built);

      if (!savedRef.current) {
        savedRef.current = true;
        saveSession(built);
        fetch("/api/result/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ result: built }),
        }).catch(() => {});
      }
    },
    [sessionId, permission, snapshot, tasks, stopStream]
  );

  const handleAnalyzeDone = useCallback(() => {
    setPhase("result");
  }, []);

  const reset = useCallback(() => {
    stopStream();
    setAnswers([]);
    setSnapshot(undefined);
    setResult(null);
    savedRef.current = false;
    setPermission({ camera: "unknown", mic: "unknown", hasSnapshot: false });
    setPhase("title");
  }, [stopStream]);

  return (
    <TerminalShell
      sessionId={sessionId}
      isMock={isMock}
      bgUrl={bgUrl}
      onHistory={() => setShowHistory(true)}
      showStatus={phase !== "title" && phase !== "howto"}
    >
      <Bgm />

      {phase === "title" && (
        <TitleScreen
          loading={loadingStart}
          onStart={beginInspection}
          onHowTo={() => setShowSlides(true)}
        />
      )}

      {phase === "permission" && <PermissionScreen onReady={handlePermission} />}

      {phase === "playing" && (
        <GameScreen
          examiner={examiner}
          tasks={tasks}
          stream={streamRef.current}
          hasCamera={permission.camera === "granted"}
          hasMic={permission.mic === "granted"}
          onSnapshot={(url) => {
            setSnapshot(url);
            setPermission((p) => ({ ...p, hasSnapshot: true }));
          }}
          onComplete={handleComplete}
        />
      )}

      {phase === "analyzing" && <AnalyzingScreen onDone={handleAnalyzeDone} />}

      {phase === "result" && result && (
        <ResultScreen
          result={result}
          answers={answers}
          tasks={tasks}
          snapshot={snapshot}
          onRetry={reset}
          onHistory={() => setShowHistory(true)}
        />
      )}

      {showSlides && (
        <HowToSlides
          onClose={() => setShowSlides(false)}
          onStart={
            phase === "title"
              ? () => {
                  setShowSlides(false);
                  beginInspection();
                }
              : undefined
          }
        />
      )}

      {showHistory && <HistoryPanel onClose={() => setShowHistory(false)} />}
    </TerminalShell>
  );
}
