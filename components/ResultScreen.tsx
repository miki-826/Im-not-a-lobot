"use client";

import { useEffect, useState } from "react";
import type { GameResult, TaskAnswer } from "@/types/game";
import { RANK_TITLE } from "@/lib/score";
import { downloadPassport } from "@/lib/passport";
import { ActionButton, HumanMeter, Panel, SectionLabel } from "./ui";
import { PassportCard } from "./PassportCard";

export function ResultScreen({
  result,
  answers,
  tasks,
  snapshot,
  onRetry,
  onHistory,
}: {
  result: GameResult;
  answers: TaskAnswer[];
  tasks: { id: string; title: string }[];
  snapshot?: string;
  onRetry: () => void;
  onHistory: () => void;
}) {
  const approved = result.approved;
  const [dlError, setDlError] = useState(false);

  // SE on mount
  useEffect(() => {
    const src = approved ? "/audio/approved.mp3" : "/audio/rejected.mp3";
    const a = new Audio(src);
    a.volume = 0.5;
    a.play().catch(() => {});
  }, [approved]);

  const handleDownload = async () => {
    try {
      setDlError(false);
      await downloadPassport(result, snapshot);
    } catch {
      setDlError(true);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl fade-up">
      {/* verdict banner */}
      <div
        className="relative overflow-hidden rounded-md border-2 p-5 text-center"
        style={{
          borderColor: approved ? "var(--success)" : "var(--danger)",
          background: approved
            ? "linear-gradient(180deg, rgba(34,197,94,0.12), transparent)"
            : "linear-gradient(180deg, rgba(239,68,68,0.12), transparent)",
        }}
      >
        <div
          className="font-mono text-[11px] uppercase tracking-[0.3em]"
          style={{ color: approved ? "var(--success)" : "var(--danger)" }}
        >
          {approved ? "GATE OPEN" : "GATE LOCKED"}
        </div>
        <div
          className="glitch mt-1 font-title text-4xl font-extrabold sm:text-5xl"
          data-text={approved ? "入国許可" : "入国拒否"}
          style={{ color: approved ? "var(--success)" : "var(--danger)" }}
        >
          {approved ? "入国許可" : "入国拒否"}
        </div>
        <div className="mt-1 font-mono text-[12px] text-[var(--text)]/80">
          {result.rank} ランク — {RANK_TITLE[result.rank]}
        </div>
      </div>

      {/* rejection reasons */}
      {!approved && result.rejectionReasons && result.rejectionReasons.length > 0 && (
        <div className="mt-4 rounded-md border border-[var(--danger)]/50 bg-[var(--danger)]/5 p-4">
          <div className="flex items-center gap-2">
            <span className="text-[var(--danger)]">⛔</span>
            <span className="font-title text-sm uppercase tracking-wider text-[var(--danger)]">
              入国拒否理由
            </span>
          </div>
          <ul className="mt-2 space-y-1.5">
            {result.rejectionReasons.map((r, i) => (
              <li
                key={i}
                className="flex gap-2 font-mono text-[13px] leading-relaxed text-[var(--text)]/90"
              >
                <span className="text-[var(--danger)]">{String(i + 1).padStart(2, "0")}</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* scores */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Panel>
          <HumanMeter value={result.humanScore} label="人間度 / HUMAN" tone={approved ? "success" : "accent"} />
          <div className="mt-3">
            <HumanMeter value={result.aiSuspicion} label="AI疑惑 / SUSPICION" tone="danger" />
          </div>
        </Panel>
        <Panel>
          <SectionLabel>人間タイプ診断</SectionLabel>
          <div className="mt-1 font-title text-xl text-[var(--accent)]">{result.humanType}</div>
          {result.examinerComment && (
            <p className="mt-2 font-mono text-[12px] leading-relaxed text-[var(--text)]/85">
              <span className="text-[var(--success)]">審査官 ▸ </span>
              {result.examinerComment}
            </p>
          )}
        </Panel>
      </div>

      {/* breakdown */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Panel>
          <SectionLabel>人間っぽかった点</SectionLabel>
          <ul className="mt-2 space-y-1">
            {result.goodPoints.map((p, i) => (
              <li key={i} className="font-mono text-[12px] leading-relaxed text-[var(--text)]/85">
                <span className="text-[var(--success)]">＋</span> {p}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel>
          <SectionLabel>AIっぽかった点</SectionLabel>
          <ul className="mt-2 space-y-1">
            {result.aiLikePoints.map((p, i) => (
              <li key={i} className="font-mono text-[12px] leading-relaxed text-[var(--text)]/85">
                <span className="text-[var(--warn)]">−</span> {p}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* per-task */}
      <Panel className="mt-4">
        <SectionLabel>3認証の内訳</SectionLabel>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {tasks.map((t, i) => {
            const a = answers.find((x) => x.taskId === t.id);
            return (
              <div key={t.id} className="rounded-sm border border-[var(--border)] bg-black/30 p-2.5">
                <div className="font-mono text-[10px] text-[var(--sub)]">第{i + 1}認証</div>
                <div className="font-title text-lg text-[var(--accent)]">
                  +{a?.partialScore ?? 0}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* human noise analysis */}
      {result.voiceMetrics && result.voiceMetrics.spoke && (
        <Panel className="mt-4" bracketed>
          <div className="flex items-center justify-between">
            <SectionLabel>人間ノイズ解析 / HUMAN NOISE ANALYSIS</SectionLabel>
            <span className="flex items-center gap-1 font-mono text-[9px] text-[var(--accent)]/70">
              <span className="lamp text-[var(--accent)]" style={{ background: "currentColor" }} />
              VOICE
            </span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <VoiceStat label="声の揺れ" value={`${result.voiceMetrics.volumeVariation}%`} />
            <VoiceStat label="最大感情音量" value={`${result.voiceMetrics.peakVolume}%`} />
            <VoiceStat label="平均音量" value={`${result.voiceMetrics.avgVolume}%`} />
            <VoiceStat label="沈黙率" value={`${result.voiceMetrics.silenceRatio}%`} />
            <VoiceStat
              label="話し始めの迷い"
              value={
                result.voiceMetrics.firstSpeechDelayMs >= 0
                  ? `${(result.voiceMetrics.firstSpeechDelayMs / 1000).toFixed(1)}s`
                  : "—"
              }
            />
            <VoiceStat
              label="叫び判定"
              value={result.voiceMetrics.shout ? "検出" : "なし"}
              tone={result.voiceMetrics.shout ? "warn" : "default"}
            />
          </div>
          <p className="mt-2 font-mono text-[11px] text-[var(--sub)]">
            ※ マイク音声はブラウザ内で特徴量だけ計測し、録音・音声データは保存していません。
          </p>
        </Panel>
      )}

      {/* after story */}
      <Panel className="mt-4" bracketed>
        <SectionLabel>{approved ? "AFTER — 人間界帰還" : "AFTER — AI世界送還"}</SectionLabel>
        <p className="mt-2 font-mono text-[13px] leading-relaxed text-[var(--text)]/90">
          {result.afterStory}
        </p>
      </Panel>

      {/* passport */}
      <div className="mt-5">
        <SectionLabel>パスポートカード</SectionLabel>
        <div className="mt-2">
          <PassportCard result={result} snapshot={snapshot} />
        </div>
      </div>

      {dlError && (
        <div className="mt-2 font-mono text-[11px] text-[var(--warn)]">
          ダウンロードに失敗しました。もう一度お試しください。
        </div>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <ActionButton variant="secondary" onClick={handleDownload}>
          パスポートをダウンロード
        </ActionButton>
        <div className="flex gap-2">
          <ActionButton variant="ghost" onClick={onHistory}>
            審査記録
          </ActionButton>
          <ActionButton onClick={onRetry}>もう一度認証を受ける</ActionButton>
        </div>
      </div>
    </div>
  );
}

function VoiceStat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "warn";
}) {
  return (
    <div className="rounded-sm border border-[var(--border)] bg-black/30 p-2.5 text-center">
      <div className="font-mono text-[10px] text-[var(--sub)]">{label}</div>
      <div
        className="font-title text-base"
        style={{ color: tone === "warn" ? "var(--warn)" : "var(--accent)" }}
      >
        {value}
      </div>
    </div>
  );
}
