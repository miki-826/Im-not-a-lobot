"use client";

import { RANK_TITLE } from "@/lib/score";
import { passportStamps } from "@/lib/passport";
import { formatDateTime } from "@/lib/utils";
import type { GameResult } from "@/types/game";

export function PassportCard({
  result,
  snapshot,
}: {
  result: GameResult;
  snapshot?: string;
}) {
  const approved = result.approved;
  const stampColor = approved ? "var(--stamp-green)" : "var(--stamp-red)";
  const subStamps = passportStamps(result).slice(1);

  return (
    <div className="relative overflow-hidden rounded-md border-2 border-[var(--accent)] bg-gradient-to-br from-[#0b1322] to-[#05070d] p-4 shadow-[0_0_30px_rgba(56,189,248,0.15)]">
      {/* guilloche */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(56,189,248,0.08) 0 1px, transparent 1px 16px)",
        }}
      />
      <div className="relative">
        <div className="flex items-center justify-between border-b border-[var(--accent)]/30 pb-2">
          <div>
            <div className="font-title text-base text-[var(--text)]">BORDER PASSPORT</div>
            <div className="font-mono text-[9px] text-[var(--sub)]">
              境界入国管理局 · HUMAN-AI BORDER
            </div>
          </div>
          <div className="font-mono text-[9px] text-[var(--sub)]">
            SID:{result.sessionId.slice(-8)}
          </div>
        </div>

        <div className="mt-3 flex gap-4">
          {/* photo */}
          <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-sm border-2 border-[var(--accent)] bg-black">
            {snapshot ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={snapshot} alt="顔写真" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center text-3xl text-[var(--border)]">
                ◎
              </div>
            )}
          </div>

          {/* fields */}
          <div className="min-w-0 flex-1 space-y-1.5">
            <Field label="NAME / 氏名" value="GUEST HUMAN" />
            <Field
              label="HUMAN SCORE / 人間度"
              value={`${result.humanScore}%`}
              valueClass={approved ? "text-[var(--success)]" : "text-[var(--warn)]"}
            />
            <Field
              label="RANK / 等級"
              value={`${result.rank} — ${RANK_TITLE[result.rank]}`}
              valueClass="text-[var(--accent)]"
            />
            <Field label="TYPE / 人間タイプ" value={result.humanType} />
          </div>
        </div>

        <div className="mt-3 flex items-end justify-between border-t border-[var(--accent)]/20 pt-2">
          <div className="font-mono text-[9px] text-[var(--sub)]">
            DATE: {formatDateTime(result.createdAt)}
          </div>
          {/* stamp */}
          <div
            className="stamp stamp-in select-none px-3 py-1 text-center"
            style={{ color: stampColor, transform: "rotate(-12deg)" }}
          >
            <div className="text-sm font-bold leading-none">
              {approved ? "APPROVED" : "REJECTED"}
            </div>
            <div className="font-mono text-[9px]">{approved ? "入国許可" : "入国拒否"}</div>
          </div>
        </div>

        {subStamps.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5 border-t border-[var(--accent)]/20 pt-2">
            {subStamps.map((s, i) => (
              <span
                key={i}
                className="stamp select-none px-2 py-0.5 text-center"
                style={{
                  color: s.approve ? "var(--stamp-green)" : "var(--stamp-red)",
                  transform: `rotate(${i % 2 === 0 ? -3 : 3}deg)`,
                }}
              >
                <span className="block text-[10px] font-bold leading-none">{s.text}</span>
                <span className="font-mono text-[8px]">{s.sub}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  valueClass = "text-[var(--text)]",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-wider text-[var(--sub)]">{label}</div>
      <div className={`font-title text-sm ${valueClass}`}>{value}</div>
    </div>
  );
}
