"use client";

import { useEffect, useRef, useState } from "react";

export function Bgm({ src = "/audio/bgm.mp3" }: { src?: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [on, setOn] = useState(false);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.volume = 0.35;
    const start = () => {
      el.play()
        .then(() => setOn(true))
        .catch(() => {});
      window.removeEventListener("pointerdown", start);
    };
    window.addEventListener("pointerdown", start);
    return () => window.removeEventListener("pointerdown", start);
  }, []);

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (on) {
      el.pause();
      setOn(false);
    } else {
      el.play()
        .then(() => setOn(true))
        .catch(() => {});
    }
  };

  if (!available) return null;

  return (
    <>
      <audio
        ref={ref}
        src={src}
        loop
        preload="auto"
        onError={() => setAvailable(false)}
      />
      <button
        onClick={toggle}
        aria-label={on ? "BGMを停止" : "BGMを再生"}
        className="fixed bottom-3 right-3 z-50 grid h-10 w-10 place-items-center rounded-sm border border-[var(--border)] bg-black/60 text-[var(--accent)] backdrop-blur hover:border-[var(--accent)] transition-colors"
      >
        {on ? "♪" : "›"}
      </button>
    </>
  );
}
