"use client";

import { useState } from "react";
import { ActionButton, Panel, SectionLabel } from "./ui";
import type { PermissionState } from "@/types/game";

export function PermissionScreen({
  onReady,
}: {
  onReady: (perm: PermissionState, stream: MediaStream | null) => void;
}) {
  const [status, setStatus] = useState<"idle" | "requesting">("idle");
  const [camState, setCamState] = useState<"unknown" | "granted" | "denied">("unknown");
  const [micState, setMicState] = useState<"unknown" | "granted" | "denied">("unknown");

  const requestMedia = async () => {
    setStatus("requesting");
    let stream: MediaStream | null = null;
    let camera: PermissionState["camera"] = "denied";
    let mic: PermissionState["mic"] = "denied";

    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      camera = "granted";
      mic = "granted";
    } catch {
      // try video only
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        camera = "granted";
        mic = "denied";
      } catch {
        camera = "denied";
        mic = "denied";
      }
    }

    setCamState(camera);
    setMicState(mic);
    onReady({ camera, mic, hasSnapshot: false }, stream);
  };

  const skip = () => {
    onReady({ camera: "denied", mic: "denied", hasSnapshot: false }, null);
  };

  return (
    <div className="mx-auto w-full max-w-lg fade-up">
      <SectionLabel>権限確認 / DEVICE CLEARANCE</SectionLabel>
      <h2 className="mt-1 font-title text-2xl text-[var(--text)]">入力デバイスの許可</h2>

      <Panel className="mt-4">
        <p className="font-mono text-[13px] leading-relaxed text-[var(--text)]/85">
          審査にはカメラとマイクを使用します。許可しなくても、
          <span className="text-[var(--accent)]">テキスト入力のMock審査</span>で最後まで進めます。
        </p>

        <div className="mt-4 grid gap-2">
          <DeviceRow label="カメラ" sub="表情・ジェスチャーの審査" state={camState} />
          <DeviceRow label="マイク" sub="声・愚痴の審査（音声認識）" state={micState} />
        </div>
      </Panel>

      <div className="mt-6 flex flex-col gap-3">
        <ActionButton size="lg" onClick={requestMedia} disabled={status === "requesting"}>
          {status === "requesting" ? "デバイスを確認中…" : "カメラとマイクを起動する"}
        </ActionButton>
        <ActionButton variant="ghost" onClick={skip}>
          カメラなしでMock審査を受ける
        </ActionButton>
      </div>
    </div>
  );
}

function DeviceRow({
  label,
  sub,
  state,
}: {
  label: string;
  sub: string;
  state: "unknown" | "granted" | "denied";
}) {
  const tone =
    state === "granted"
      ? "text-[var(--success)]"
      : state === "denied"
      ? "text-[var(--warn)]"
      : "text-[var(--sub)]";
  const txt = state === "granted" ? "GRANTED" : state === "denied" ? "SKIP / DENIED" : "STANDBY";
  return (
    <div className="flex items-center justify-between rounded-sm border border-[var(--border)] bg-black/30 px-3 py-2.5">
      <div>
        <div className="font-title text-sm text-[var(--text)]">{label}</div>
        <div className="font-mono text-[10px] text-[var(--sub)]">{sub}</div>
      </div>
      <span className={`font-mono text-[10px] uppercase tracking-wider ${tone}`}>{txt}</span>
    </div>
  );
}
