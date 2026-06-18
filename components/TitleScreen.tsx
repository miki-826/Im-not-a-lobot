"use client";

import { ActionButton } from "./ui";

export function TitleScreen({
  onStart,
  onHowTo,
  loading,
}: {
  onStart: () => void;
  onHowTo: () => void;
  loading?: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center fade-up">
      <div className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--accent)]/70">
        <span className="lamp lamp-blink text-[var(--accent)]" style={{ background: "currentColor" }} />
        境界入国管理局 · 第404審査室
      </div>

      <h1
        className="glitch font-title text-4xl font-extrabold leading-none text-[var(--text)] sm:text-6xl"
        data-text="I AM NOT A ROBOT"
      >
        I AM NOT A ROBOT
      </h1>

      <p className="mt-5 max-w-md font-mono text-[13px] leading-relaxed text-[var(--text)]/80">
        人間界入国審査を開始します。
        <br />
        表情、声、愚痴、不完全さを提示してください。
      </p>

      <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
        <ActionButton size="lg" onClick={onStart} disabled={loading}>
          {loading ? "審査室を準備中…" : "入国審査を受ける"}
        </ActionButton>
        <ActionButton size="lg" variant="secondary" onClick={onHowTo} disabled={loading}>
          遊び方スライドを見る
        </ActionButton>
      </div>

      <div className="mt-10 max-w-sm border-t border-[var(--border)] pt-4 font-mono text-[10px] leading-relaxed text-[var(--sub)]">
        AIが人間の顔・声・文章を真似できる時代。
        <br />
        普通のCAPTCHAでは、もう人間を見分けられない。
      </div>
    </div>
  );
}
