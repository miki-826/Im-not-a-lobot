"use client";

import { useEffect, useState } from "react";
import { ActionButton } from "./ui";

type Slide = {
  img: string;
  step: string;
  title: string;
  body: string;
  tips: string[];
};

const SLIDES: Slide[] = [
  {
    img: "/images/howto/slide-1.png",
    step: "INTRO",
    title: "ようこそ、境界入国管理局へ",
    body: "ここは人間界とAI世界の境界にある入国審査場。AIが顔・声・文章を真似できる時代、あなたは3つの認証で『人間らしさ』を証明します。",
    tips: ["所要 2〜3分", "各認証 20秒", "カメラ/マイクは任意・保存なし"],
  },
  {
    img: "/images/howto/slide-2.png",
    step: "認証 01",
    title: "表情と手の動きの認証",
    body: "カメラに向かって片手を上げ、少し疲れた顔で話します。完璧な笑顔は禁止。撮影ボタンで顔を記録すると人間度が上がります。",
    tips: ["カメラ許可で表情加点", "撮り直しOK", "拒否してもプレースホルダで続行"],
  },
  {
    img: "/images/howto/slide-3.png",
    step: "認証 02",
    title: "理不尽・愚痴の認証",
    body: "最近の理不尽な出来事や仕事の愚痴を20秒で語る/叫ぶ。怒り・生活感・感情のにじみが多いほど『人間』と判定されます。",
    tips: ["🎙ボタンで音声入力", "テキスト入力もOK", "整いすぎるとAI疑惑↑"],
  },
  {
    img: "/images/howto/slide-4.png",
    step: "認証 03 → 判定",
    title: "ジェスチャー証明と入国判定",
    body: "日常の一場面を声と動きで表現。3認証が終わるとAIが人間度を解析し、入国許可/拒否・人間タイプ・顔写真入りパスポートを発行します。",
    tips: ["人間度70%以上で許可", "ランクS〜D", "パスポートはDL可能"],
  },
];

export function HowToSlides({
  onClose,
  onStart,
}: {
  onClose: () => void;
  onStart?: () => void;
}) {
  const [i, setI] = useState(0);
  const [imgOk, setImgOk] = useState<Record<number, boolean>>({});
  const slide = SLIDES[i];
  const isLast = i === SLIDES.length - 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setI((v) => Math.min(SLIDES.length - 1, v + 1));
      if (e.key === "ArrowLeft") setI((v) => Math.max(0, v - 1));
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm">
      <div className="panel edge-glow relative w-full max-w-3xl overflow-hidden">
        {/* close */}
        <button
          onClick={onClose}
          aria-label="閉じる"
          className="absolute right-3 top-3 z-20 grid h-8 w-8 place-items-center rounded-sm border border-[var(--border)] bg-black/50 text-[var(--sub)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          ✕
        </button>

        {/* slide visual */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--bg)]">
          {imgOk[i] !== false ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={slide.img}
              src={slide.img}
              alt={slide.title}
              className="fade-up h-full w-full object-cover"
              onError={() => setImgOk((m) => ({ ...m, [i]: false }))}
            />
          ) : (
            <div
              className="h-full w-full"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 30% 20%, rgba(56,189,248,0.18), transparent 50%), radial-gradient(circle at 80% 90%, rgba(249,115,22,0.12), transparent 45%)",
              }}
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/40 to-transparent" />

          {/* caption */}
          <div className="absolute inset-x-0 bottom-0 p-5">
            <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--accent)]">
              {slide.step}
            </div>
            <h3 className="mt-1 font-title text-xl text-[var(--text)] sm:text-2xl">
              {slide.title}
            </h3>
            <p className="mt-2 max-w-2xl font-mono text-[12px] leading-relaxed text-[var(--text)]/85 sm:text-[13px]">
              {slide.body}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {slide.tips.map((t) => (
                <span
                  key={t}
                  className="rounded-sm border border-[var(--accent)]/30 bg-black/40 px-2 py-0.5 font-mono text-[10px] text-[var(--accent)]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* controls */}
        <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] p-3">
          <ActionButton
            variant="ghost"
            onClick={() => setI((v) => Math.max(0, v - 1))}
            disabled={i === 0}
          >
            ‹ 前へ
          </ActionButton>

          <div className="flex items-center gap-1.5">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                aria-label={`スライド${idx + 1}`}
                className="h-2 rounded-sm transition-all"
                style={{
                  width: idx === i ? "22px" : "8px",
                  background: idx === i ? "var(--accent)" : "var(--border)",
                  boxShadow: idx === i ? "0 0 8px var(--accent)" : "none",
                }}
              />
            ))}
          </div>

          {!isLast ? (
            <ActionButton onClick={() => setI((v) => Math.min(SLIDES.length - 1, v + 1))}>
              次へ ›
            </ActionButton>
          ) : onStart ? (
            <ActionButton onClick={onStart}>審査を始める</ActionButton>
          ) : (
            <ActionButton onClick={onClose}>閉じる</ActionButton>
          )}
        </div>
      </div>
    </div>
  );
}
