"use client";

import { cn } from "@/lib/utils";

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "md" | "lg";
};

export function ActionButton({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: BtnProps) {
  const base =
    "relative inline-flex items-center justify-center gap-2 font-title uppercase tracking-wider select-none transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-40 disabled:cursor-not-allowed active:translate-y-px";
  const sizes = size === "lg" ? "px-8 py-4 text-base" : "px-5 py-2.5 text-sm";
  const variants: Record<string, string> = {
    primary:
      "text-[#04121f] bg-[var(--accent)] hover:bg-[#7dd3fc] shadow-[0_0_18px_rgba(56,189,248,0.35)] clip-corner",
    secondary:
      "text-[var(--accent)] bg-transparent border border-[var(--accent)] hover:bg-[rgba(56,189,248,0.12)]",
    ghost:
      "text-[var(--sub)] bg-transparent border border-[var(--border)] hover:text-[var(--text)] hover:border-[var(--accent)]",
    danger:
      "text-white bg-[var(--danger)] hover:brightness-110 shadow-[0_0_18px_rgba(239,68,68,0.4)]",
  };
  return (
    <button className={cn(base, sizes, variants[variant], className)} {...rest}>
      {children}
    </button>
  );
}

export function Panel({
  className,
  children,
  bracketed,
}: {
  className?: string;
  children: React.ReactNode;
  bracketed?: boolean;
}) {
  return (
    <div className={cn("panel edge-glow p-5", bracketed && "brackets", className)}>
      {children}
    </div>
  );
}

export function MockBadge({ isMock }: { isMock: boolean }) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-mono">
      <span
        className={cn(
          "lamp lamp-blink",
          isMock ? "text-[var(--warn)]" : "text-[var(--success)]"
        )}
        style={{ background: "currentColor" }}
      />
      <span className={isMock ? "text-[var(--warn)]" : "text-[var(--success)]"}>
        {isMock ? "MOCK MODE — API未接続でも審査可能" : "LIVE — AI審査官 稼働中"}
      </span>
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-[var(--accent)]/70">
      {children}
    </div>
  );
}

export function HumanMeter({
  value,
  label = "HUMAN METER",
  tone = "accent",
}: {
  value: number;
  label?: string;
  tone?: "accent" | "success" | "danger";
}) {
  const color =
    tone === "success"
      ? "var(--success)"
      : tone === "danger"
      ? "var(--danger)"
      : "var(--accent)";
  return (
    <div className="w-full">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--sub)]">
          {label}
        </span>
        <span className="font-mono text-sm" style={{ color }}>
          {Math.round(value)}%
        </span>
      </div>
      <div className="h-2.5 w-full bg-black/60 border border-[var(--border)] rounded-sm overflow-hidden relative">
        <div
          className="meter-fill h-full rounded-sm"
          style={{
            width: `${Math.max(0, Math.min(100, value))}%`,
            background: `linear-gradient(90deg, ${color}55, ${color})`,
            boxShadow: `0 0 12px ${color}`,
          }}
        />
      </div>
    </div>
  );
}
