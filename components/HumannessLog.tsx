"use client";

import { useEffect, useRef, useState } from "react";

export type LiveLogState = {
  textLen: number;
  micActive: boolean; // マイク計測が動作中か（音声認識の有無とは別）
  volume: number; // 0-100 live
  speaking: boolean;
  humanHits: number;
  aiHits: number;
  imperfectHits: number;
};

function bar(v: number, width = 6) {
  const filled = Math.round((Math.max(0, Math.min(100, v)) / 100) * width);
  return "█".repeat(filled) + "░".repeat(width - filled);
}

export function HumannessLog({
  active,
  resetKey,
  getState,
}: {
  active: boolean;
  resetKey: string | number;
  getState: () => LiveLogState;
}) {
  const [lines, setLines] = useState<string[]>([]);
  const stateRef = useRef(getState);
  stateRef.current = getState;
  const silenceRef = useRef(0);
  const tickRef = useRef(0);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLines(["▸ 審査セッション開始。生体シグナルを傍受します..."]);
    silenceRef.current = 0;
    tickRef.current = 0;
  }, [resetKey]);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      const s = stateRef.current();
      const k = tickRef.current++;

      // 沈黙の蓄積（マイク計測中のみ意味を持つ）
      if (s.micActive && !s.speaking) silenceRef.current += 0.9;
      const silenceHit = s.micActive && s.speaking && silenceRef.current >= 1.4;
      const silenceSec = silenceRef.current.toFixed(1);
      if (s.speaking) silenceRef.current = 0;

      let line: string;
      if (silenceHit) {
        line = `沈黙 ${silenceSec}秒：人間らしい迷いを検出`;
      } else {
        const density = Math.min(99, s.humanHits * 22 + (s.textLen > 40 ? 18 : s.textLen > 10 ? 8 : 0));
        const cleanliness =
          s.imperfectHits >= 2 ? "低" : s.imperfectHits === 1 ? "中" : s.textLen > 30 ? "高" : "—";
        const cat = k % 5;
        if (cat === 0) line = `表情ノイズ検出中... [${bar(38 + ((k * 17) % 50))}]`;
        else if (cat === 1)
          line = s.micActive
            ? `音声レベル ${String(s.volume).padStart(2, " ")}%  [${bar(s.volume)}] ${s.speaking ? "発話検出" : "無音"}`
            : `音声入力：未使用（テキスト解析モード）`;
        else if (cat === 2) line = `愚痴密度：${density}%  ${density > 50 ? "良好" : "探索中"}`;
        else if (cat === 3)
          line = `文章の整いすぎ度：${cleanliness}${cleanliness === "高" ? "（AI疑惑）" : ""}`;
        else line = `生活感シグナル：${s.humanHits > 0 ? "検出" : "探索中"} / AI最適化語：${s.aiHits}`;
      }

      setLines((p) => [...p.slice(-7), line]);
    }, 900);
    return () => clearInterval(id);
  }, [active, resetKey]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [lines]);

  return (
    <div className="panel edge-glow p-3">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--accent)]/70">
          リアルタイム審査ログ
        </span>
        <span className="flex items-center gap-1 font-mono text-[9px] text-[var(--danger)]">
          <span className="lamp lamp-blink" style={{ background: "currentColor" }} />
          ANALYZING
        </span>
      </div>
      <div
        ref={bodyRef}
        className="h-24 overflow-hidden rounded-sm border border-[var(--border)] bg-black/50 p-2"
      >
        {lines.map((l, i) => (
          <div
            key={i}
            className="font-mono text-[11px] leading-relaxed text-[var(--accent)]/85"
            style={{ opacity: 0.4 + (i / Math.max(1, lines.length)) * 0.6 }}
          >
            <span className="text-[var(--sub)]">›</span> {l}
          </div>
        ))}
      </div>
    </div>
  );
}
