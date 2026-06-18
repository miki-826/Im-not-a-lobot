"use client";

import { useEffect, useState } from "react";

export function Typewriter({
  text,
  speed = 26,
  className,
  onDone,
}: {
  text: string;
  speed?: number;
  className?: string;
  onDone?: () => void;
}) {
  const [n, setN] = useState(0);

  useEffect(() => {
    setN(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) {
        clearInterval(id);
        onDone?.();
      }
    }, speed);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed]);

  const done = n >= text.length;
  return (
    <span className={className}>
      {text.slice(0, n)}
      {!done && <span className="animate-pulse text-[var(--accent)]">▌</span>}
    </span>
  );
}
