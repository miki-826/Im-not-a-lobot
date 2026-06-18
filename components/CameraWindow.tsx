"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Props = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  active: boolean;
  snapshot?: string;
  scanning?: boolean;
  className?: string;
};

export const CameraWindow = forwardRef<HTMLDivElement, Props>(function CameraWindow(
  { videoRef, active, snapshot, scanning, className },
  ref
) {
  return (
    <div ref={ref} className={cn("relative brackets", className)}>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm border border-[var(--border)] bg-black">
        {/* live video */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={cn(
            "h-full w-full object-cover -scale-x-100 transition-opacity duration-300",
            active && !snapshot ? "opacity-100" : "opacity-0"
          )}
        />

        {/* snapshot freeze */}
        {snapshot && (
          <img
            src={snapshot}
            alt="撮影プレビュー"
            className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
          />
        )}

        {/* placeholder when no camera */}
        {!active && !snapshot && (
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-full border border-[var(--border)] text-2xl text-[var(--sub)]">
                ◎
              </div>
              <div className="font-mono text-[11px] text-[var(--sub)]">
                NO SIGNAL — カメラ未接続
              </div>
              <div className="font-mono text-[10px] text-[var(--sub)]/70">
                プレースホルダで審査続行可能
              </div>
            </div>
          </div>
        )}

        {/* HUD overlay */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-2 top-2 flex items-center gap-1.5">
            <span
              className="lamp lamp-blink text-[var(--danger)]"
              style={{ background: "currentColor" }}
            />
            <span className="font-mono text-[10px] text-[var(--danger)]">REC</span>
          </div>
          <div className="absolute right-2 top-2 font-mono text-[10px] text-[var(--accent)]/80">
            CAM-404
          </div>
          <div className="absolute bottom-2 left-2 font-mono text-[10px] text-[var(--sub)]">
            {active ? "LIVE FEED" : "STANDBY"}
          </div>
          {scanning && <div className="scan-sweep" />}
        </div>
      </div>
    </div>
  );
});
