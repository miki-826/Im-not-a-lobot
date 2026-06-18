"use client";

import { useEffect, useState } from "react";
import type { GameResult } from "@/types/game";
import { loadSessions, clearSessions } from "@/lib/storage";
import { RANK_TITLE } from "@/lib/score";
import { formatDateTime } from "@/lib/utils";
import { ActionButton, SectionLabel } from "./ui";

export function HistoryPanel({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState<GameResult[]>([]);

  useEffect(() => {
    setItems(loadSessions());
  }, []);

  const clear = () => {
    clearSessions();
    setItems([]);
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="panel edge-glow mt-10 w-full max-w-lg p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <SectionLabel>審査記録 / LOCAL ARCHIVE</SectionLabel>
            <div className="font-title text-lg text-[var(--text)]">過去の審査記録</div>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-sm border border-[var(--border)] text-[var(--sub)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            ✕
          </button>
        </div>

        <div className="mt-2 font-mono text-[10px] text-[var(--sub)]">
          この端末に保存された記録です（写真・録音は含みません）
        </div>

        {items.length === 0 ? (
          <div className="mt-6 grid place-items-center rounded-sm border border-dashed border-[var(--border)] py-10 text-center">
            <div className="text-2xl text-[var(--border)]">▤</div>
            <div className="mt-2 font-mono text-[12px] text-[var(--sub)]">
              まだ記録がありません
            </div>
          </div>
        ) : (
          <div className="mt-3 max-h-[55vh] space-y-2 overflow-y-auto pr-1">
            {items.map((it) => (
              <div
                key={it.sessionId}
                className="flex items-center justify-between rounded-sm border border-[var(--border)] bg-black/30 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-title text-sm"
                      style={{ color: it.approved ? "var(--success)" : "var(--danger)" }}
                    >
                      {it.approved ? "許可" : "拒否"}
                    </span>
                    <span className="font-mono text-[11px] text-[var(--accent)]">
                      {it.rank}
                    </span>
                    <span className="truncate font-mono text-[11px] text-[var(--sub)]">
                      {RANK_TITLE[it.rank]}
                    </span>
                  </div>
                  <div className="font-mono text-[10px] text-[var(--sub)]">
                    {formatDateTime(it.createdAt)} · {it.humanType}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-title text-lg text-[var(--text)]">{it.humanScore}%</div>
                  <div className="font-mono text-[9px] text-[var(--sub)]">人間度</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex justify-between">
          {items.length > 0 ? (
            <ActionButton variant="ghost" onClick={clear}>
              記録を消去
            </ActionButton>
          ) : (
            <span />
          )}
          <ActionButton onClick={onClose}>閉じる</ActionButton>
        </div>
      </div>
    </div>
  );
}
