"use client";

import { useEffect, useRef, useState } from "react";
import type { Examiner, Task, TaskAnswer, VoiceMetrics } from "@/types/game";
import { clip } from "@/lib/utils";
import { KEYWORDS } from "@/lib/mockData";
import { countAny } from "@/lib/score";
import { EMPTY_METRICS, VoiceMeter, mergeMetrics } from "@/lib/voice";
import { ActionButton, Panel, SectionLabel } from "./ui";
import { CameraWindow } from "./CameraWindow";
import { TimerBar } from "./TimerBar";
import { ExaminerPanel } from "./ExaminerPanel";
import { HumannessLog, type LiveLogState } from "./HumannessLog";

type SpeechRec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

export function GameScreen({
  examiner,
  tasks,
  stream,
  hasCamera,
  hasMic,
  onSnapshot,
  onComplete,
}: {
  examiner: Examiner;
  tasks: Task[];
  stream: MediaStream | null;
  hasCamera: boolean;
  hasMic: boolean;
  onSnapshot: (dataUrl: string) => void;
  onComplete: (answers: TaskAnswer[], voiceMetrics: VoiceMetrics) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const recRef = useRef<SpeechRec | null>(null);
  const autoRanRef = useRef(false);
  const meterRef = useRef<VoiceMeter | null>(null);
  const taskMetricsRef = useRef<VoiceMetrics[]>([]);
  const textRef = useRef("");
  const submittingRef = useRef(false);

  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [answers, setAnswers] = useState<TaskAnswer[]>([]);
  const [running, setRunning] = useState(true);
  const [snapshot, setSnapshot] = useState<string | undefined>(undefined);
  const [listening, setListening] = useState(false);
  const [comment, setComment] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const task = tasks[index];
  const isLast = index === tasks.length - 1;

  // attach camera stream
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  // 音声メーター（マイク使用時）
  useEffect(() => {
    if (!hasMic || !stream) return;
    const meter = new VoiceMeter(stream);
    meter.start();
    meterRef.current = meter;
    return () => {
      meter.dispose();
      meterRef.current = null;
    };
  }, [hasMic, stream]);

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  // reset per task
  useEffect(() => {
    setText("");
    textRef.current = "";
    setComment(null);
    setRunning(true);
    meterRef.current?.reset();
  }, [index]);

  const getLiveState = (): LiveLogState => {
    const t = textRef.current;
    const live = meterRef.current?.liveState();
    return {
      textLen: t.length,
      micActive: hasMic && !!meterRef.current,
      cameraActive: hasCamera && !!stream,
      cameraSubmitted: !!snapshot,
      volume: live?.volume ?? 0,
      speaking: live?.speaking ?? false,
      humanHits: countAny(t, KEYWORDS.humanLike),
      aiHits: countAny(t, KEYWORDS.aiLike),
      imperfectHits: countAny(t, KEYWORDS.imperfect),
    };
  };

  const takeSnapshot = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0);
    const url = canvas.toDataURL("image/jpeg", 0.85);
    setSnapshot(url);
    onSnapshot(url);
  };

  const startSpeech = () => {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRec;
      webkitSpeechRecognition?: new () => SpeechRec;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor || listening) return;
    const rec = new Ctor();
    rec.lang = "ja-JP";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let t = "";
      for (let i = 0; i < e.results.length; i++) {
        t += e.results[i][0].transcript;
      }
      setText(t);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      /* already started */
    }
  };

  const toggleSpeech = () => {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    startSpeech();
  };

  // 第1認証では音声入力と撮影を自動で開始する
  useEffect(() => {
    if (index !== 0 || autoRanRef.current) return;
    autoRanRef.current = true;

    if (hasCamera && stream) {
      let tries = 0;
      const id = setInterval(() => {
        tries += 1;
        const v = videoRef.current;
        if (v && v.videoWidth) {
          takeSnapshot();
          clearInterval(id);
        } else if (tries > 25) {
          clearInterval(id);
        }
      }, 200);
    }

    if (hasMic) {
      const t = setTimeout(() => startSpeech(), 700);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, hasCamera, hasMic, stream]);

  const goNext = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setRunning(false);
    recRef.current?.stop();

    // この認証の音声メトリクスを確定
    taskMetricsRef.current.push(
      meterRef.current ? meterRef.current.snapshot() : { ...EMPTY_METRICS }
    );

    // textRefを使う（タイマー時間切れ等のstaleクロージャでも最新入力を拾う）
    const userText = clip(textRef.current.trim(), 500);
    let partialScore = 12;
    let cmt = "回答を受理しました。";
    try {
      const res = await fetch("/api/game/task-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          taskTitle: task.title,
          instruction: task.instruction,
          userText,
        }),
      });
      const data = await res.json();
      cmt = data.comment ?? cmt;
      partialScore = data.partialScore ?? partialScore;
    } catch {
      /* keep defaults */
    }

    const answer: TaskAnswer = {
      taskId: task.id,
      userText,
      partialScore,
      comment: cmt,
    };
    const nextAnswers = [...answers, answer];
    setAnswers(nextAnswers);
    setComment(cmt);
    setSubmitting(false);
    submittingRef.current = false;

    if (isLast) {
      const metrics = mergeMetrics(taskMetricsRef.current);
      setTimeout(() => onComplete(nextAnswers, metrics), 1100);
    }
  };

  const advance = () => {
    setIndex((i) => i + 1);
  };

  const speechSupported =
    typeof window !== "undefined" &&
    !!(
      (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
    );

  return (
    <div className="fade-up">
      <div className="mb-3 flex items-center justify-between">
        <SectionLabel>
          認証 {index + 1} / {tasks.length}
        </SectionLabel>
        <div className="flex gap-1">
          {tasks.map((t, i) => (
            <span
              key={t.id}
              className="h-1.5 w-8 rounded-sm"
              style={{
                background:
                  i < index ? "var(--success)" : i === index ? "var(--accent)" : "var(--border)",
                boxShadow: i === index ? "0 0 8px var(--accent)" : "none",
              }}
            />
          ))}
        </div>
      </div>

      {index === 0 && (hasCamera || hasMic) && (
        <div className="mb-3 flex items-center gap-2 rounded-sm border border-[var(--accent)]/30 bg-[var(--accent)]/5 px-3 py-2 font-mono text-[11px] text-[var(--accent)]">
          <span className="lamp lamp-blink text-[var(--accent)]" style={{ background: "currentColor" }} />
          第1認証は{hasCamera ? "自動で撮影" : ""}
          {hasCamera && hasMic ? "・" : ""}
          {hasMic ? "音声入力を自動開始" : ""}しました。話すと入力欄に反映されます。
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* left: camera */}
        <div className="flex flex-col gap-3">
          <CameraWindow
            videoRef={videoRef}
            active={hasCamera && !!stream}
            snapshot={snapshot}
            scanning={running}
          />
          {hasCamera && stream && (
            <ActionButton variant="secondary" onClick={takeSnapshot} className="w-full">
              {snapshot ? "撮り直す" : "顔を撮影する"}
            </ActionButton>
          )}
        </div>

        {/* right: examiner + task */}
        <Panel className="flex flex-col gap-4" bracketed>
          <ExaminerPanel name={examiner.name} line={examiner.openingLine} compact />

          <div className="rounded-sm border border-[var(--accent)]/30 bg-black/30 p-3">
            <div className="font-title text-sm text-[var(--accent)]">{task.title}</div>
            <p className="mt-1.5 font-mono text-[13px] leading-relaxed text-[var(--text)]/90">
              {task.instruction}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {task.targetSignals.map((s) => (
                <span
                  key={s}
                  className="rounded-sm border border-[var(--border)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--sub)]"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <TimerBar
            seconds={task.timeLimitSec}
            running={running}
            resetKey={task.id}
            onExpire={() => {
              // 時間切れ → 入力途中でも自動で確定（入国審査らしさ）
              if (!submittingRef.current && !comment) goNext();
            }}
          />

          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--sub)]">
                INPUT CONSOLE
              </span>
              {hasMic && speechSupported && (
                <button
                  onClick={toggleSpeech}
                  className={`font-mono text-[10px] uppercase tracking-wider ${
                    listening ? "text-[var(--danger)]" : "text-[var(--accent)]"
                  }`}
                >
                  {listening ? "● 認識停止" : "🎙 音声入力"}
                </button>
              )}
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(clip(e.target.value, 500))}
              maxLength={500}
              rows={3}
              placeholder="喋った内容を入力 / 音声認識結果がここに表示されます…"
              className="w-full resize-none rounded-sm border border-[var(--border)] bg-black/50 p-2.5 font-mono text-[13px] text-[var(--text)] placeholder:text-[var(--sub)]/60 focus:border-[var(--accent)] focus:outline-none"
            />
            <div className="mt-0.5 text-right font-mono text-[10px] text-[var(--sub)]">
              {text.length}/500
            </div>
          </div>

          {comment && (
            <div className="fade-up rounded-sm border border-[var(--success)]/30 bg-[var(--success)]/5 p-2.5 font-mono text-[12px] leading-relaxed text-[var(--text)]/90">
              <span className="text-[var(--success)]">審査官 ▸ </span>
              {comment}
            </div>
          )}

          <div className="mt-auto flex gap-2">
            {!comment ? (
              <ActionButton onClick={goNext} disabled={submitting} className="flex-1">
                {submitting ? "解析中…" : isLast ? "入国判定へ進む" : "この認証を確定"}
              </ActionButton>
            ) : !isLast ? (
              <ActionButton onClick={advance} className="flex-1">
                次の認証へ
              </ActionButton>
            ) : (
              <ActionButton disabled className="flex-1">
                最終判定へ移行中…
              </ActionButton>
            )}
          </div>
        </Panel>
      </div>

      <div className="mt-4">
        <HumannessLog active={running} resetKey={task.id} getState={getLiveState} />
      </div>
    </div>
  );
}
