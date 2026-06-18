"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function TimerBar({
  seconds,
  running,
  onExpire,
  resetKey,
}: {
  seconds: number;
  running: boolean;
  onExpire?: () => void;
  resetKey: string | number;
}) {
  const [remain, setRemain] = useState(seconds);
  const firedRef = useRef(false);

  useEffect(() => {
    setRemain(seconds);
    firedRef.current = false;
  }, [resetKey, seconds]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemain((r) => {
        if (r <= 0.1) {
          clearInterval(id);
          if (!firedRef.current) {
            firedRef.current = true;
            onExpire?.();
          }
          return 0;
        }
        return Math.max(0, r - 0.1);
      });
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, resetKey]);

  const pct = (remain / seconds) * 100;
  const danger = remain <= 5;
  const color = danger ? "var(--warn)" : "var(--accent)";

  return (
    <div className="w-full">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--sub)]">
          TIME LIMIT
        </span>
        <span
          className={cn("font-title text-lg tabular-nums", danger && "animate-pulse")}
          style={{ color }}
        >
          00:{String(Math.ceil(remain)).padStart(2, "0")}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-sm border border-[var(--border)] bg-black/60">
        <div
          className="h-full rounded-sm transition-[width] duration-100 ease-linear"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 10px ${color}` }}
        />
      </div>
    </div>
  );
}
