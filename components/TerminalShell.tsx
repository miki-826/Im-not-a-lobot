"use client";

import { cn } from "@/lib/utils";
import { MockBadge } from "./ui";

export function TerminalShell({
  sessionId,
  isMock,
  bgUrl,
  children,
  onHistory,
  showStatus = true,
}: {
  sessionId: string | null;
  isMock: boolean;
  bgUrl?: string;
  children: React.ReactNode;
  onHistory?: () => void;
  showStatus?: boolean;
}) {
  return (
    <div className="relative min-h-dvh w-full overflow-hidden">
      {/* background image with fallback gradient */}
      <div
        className="fixed inset-0 -z-10 bg-[var(--bg)]"
        style={
          bgUrl
            ? {
                backgroundImage: `linear-gradient(180deg, rgba(5,7,13,0.55), rgba(5,7,13,0.85)), url(${bgUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {
                backgroundImage:
                  "radial-gradient(circle at 30% 10%, rgba(56,189,248,0.10), transparent 45%), radial-gradient(circle at 80% 90%, rgba(249,115,22,0.07), transparent 40%)",
              }
        }
      />

      <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-4 py-4 sm:px-6">
        {/* header */}
        <header className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-3">
            <div className="hairline grid h-9 w-9 shrink-0 place-items-center rounded-sm text-[var(--accent)]">
              <span className="font-title text-xs">404</span>
            </div>
            <div className="leading-tight">
              <div className="font-title text-[13px] sm:text-sm text-[var(--text)]">
                境界入国管理局
              </div>
              <div className="font-mono text-[10px] text-[var(--sub)]">
                BORDER IMMIGRATION BUREAU · HUMAN×AI
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            {showStatus && <MockBadge isMock={isMock} />}
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-[var(--sub)]">
                SID:{sessionId ? sessionId.slice(-8) : "--------"}
              </span>
              {onHistory && (
                <button
                  onClick={onHistory}
                  className="font-mono text-[10px] uppercase tracking-wider text-[var(--accent)]/80 hover:text-[var(--accent)] underline-offset-2 hover:underline"
                >
                  審査記録
                </button>
              )}
            </div>
          </div>
        </header>

        <main className={cn("flex flex-1 flex-col py-5")}>{children}</main>

        <footer className="border-t border-[var(--border)] pt-2 text-center font-mono text-[10px] text-[var(--sub)]">
          写真・録音はDBに保存されません / I AM NOT A ROBOT
        </footer>
      </div>
    </div>
  );
}
