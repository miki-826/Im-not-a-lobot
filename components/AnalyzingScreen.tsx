"use client";

import { useEffect, useState } from "react";

const LOGS = [
  "ACCESSING BIOMETRIC FEED ...",
  "疲労感の粒度を測定中 ...",
  "怒りスペクトルを解析中 ...",
  "生活感ワードを抽出中 ...",
  "矛盾・言い淀みを検出中 ...",
  "感情のにじみを再構成中 ...",
  "AI疑惑スコアを照合中 ...",
  "最終人間度を算出中 ...",
];

export function AnalyzingScreen({ onDone }: { onDone: () => void }) {
  const [shown, setShown] = useState<string[]>([]);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      setShown((prev) => [...prev, LOGS[i]]);
      i += 1;
      if (i >= LOGS.length) {
        clearInterval(id);
        setTimeout(onDone, 700);
      }
    }, 360);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pct = Math.min(100, Math.round((shown.length / LOGS.length) * 100));

  return (
    <div className="flex flex-1 flex-col items-center justify-center fade-up">
      <div className="relative mb-8 grid h-28 w-28 place-items-center">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-[var(--accent)]/20 border-t-[var(--accent)]" />
        <div
          className="absolute inset-3 animate-spin rounded-full border border-[var(--warn)]/30 border-b-[var(--warn)]"
          style={{ animationDirection: "reverse", animationDuration: "1.6s" }}
        />
        <span className="font-title text-xl text-[var(--accent)]">{pct}%</span>
      </div>

      <div className="font-title text-lg uppercase tracking-[0.2em] text-[var(--text)]">
        SCANNING HUMANITY
      </div>
      <div className="mt-1 font-mono text-[11px] text-[var(--sub)]">
        審査中 — 個体の人間性を解析しています
      </div>

      <div className="mt-6 h-40 w-full max-w-md overflow-hidden rounded-sm border border-[var(--border)] bg-black/50 p-3">
        {shown.map((l, i) => (
          <div
            key={i}
            className="fade-up font-mono text-[12px] leading-relaxed text-[var(--accent)]/90"
          >
            <span className="text-[var(--sub)]">›</span> {l}{" "}
            {i === shown.length - 1 ? (
              <span className="cursor-blink" />
            ) : (
              <span className="text-[var(--success)]">OK</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
