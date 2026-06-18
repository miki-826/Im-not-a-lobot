"use client";

import { useState } from "react";
import { Typewriter } from "./Typewriter";

export function ExaminerPanel({
  name,
  line,
  compact,
}: {
  name: string;
  line: string;
  compact?: boolean;
}) {
  const [imgOk, setImgOk] = useState(true);

  return (
    <div className="flex items-start gap-3">
      <div className="relative shrink-0">
        <div className="brackets relative h-14 w-14 overflow-hidden rounded-sm border border-[var(--accent)]/40 bg-[#0a0f1c]">
          {imgOk ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/images/examiner.png"
              alt="AI審査官"
              className="h-full w-full object-cover"
              onError={() => setImgOk(false)}
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-xl text-[var(--accent)]">
              ⌬
            </div>
          )}
        </div>
        <span
          className="lamp lamp-blink absolute -right-1 -top-1 text-[var(--success)]"
          style={{ background: "currentColor" }}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--accent)]/70">
          AI EXAMINER
        </div>
        <div className="font-title text-sm text-[var(--text)]">{name}</div>
        {!compact && (
          <p className="mt-1.5 font-mono text-[13px] leading-relaxed text-[var(--text)]/90">
            「<Typewriter text={line} />」
          </p>
        )}
      </div>
    </div>
  );
}
