import type { GameResult } from "@/types/game";
import { RANK_TITLE } from "./score";

export type Stamp = { text: string; sub: string; approve: boolean };

/** 結果のシグナルから審査スタンプ群を組み立てる（メイン＋サブ） */
export function passportStamps(result: GameResult): Stamp[] {
  const stamps: Stamp[] = [
    result.approved
      ? { text: "HUMAN APPROVED", sub: "入国許可", approve: true }
      : { text: "AI SUSPECT", sub: "入国拒否", approve: false },
  ];
  const blob = [...result.goodPoints, result.examinerComment].join(" ");
  if (result.approved) stamps.push({ text: "BORDER PASSED", sub: "通過", approve: true });
  if (result.aiSuspicion >= 50)
    stamps.push({ text: "AI SUSPECT", sub: "AI疑惑あり", approve: false });
  if (/疲労|生活|残業|眠/.test(blob))
    stamps.push({ text: "FATIGUE OK", sub: "疲労感確認済", approve: true });
  if (result.voiceMetrics?.shout)
    stamps.push({ text: "SHOUT", sub: "叫び検出", approve: true });
  // 重複排除して最大3個
  const seen = new Set<string>();
  return stamps.filter((s) => (seen.has(s.text) ? false : (seen.add(s.text), true))).slice(0, 3);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function downloadPassport(result: GameResult, snapshot?: string) {
  const W = 1200;
  const H = 760;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // background
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#0b1322");
  grad.addColorStop(1, "#05070d");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // guilloché-ish lines
  ctx.strokeStyle = "rgba(56,189,248,0.06)";
  ctx.lineWidth = 1;
  for (let i = -H; i < W; i += 22) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + H, H);
    ctx.stroke();
  }

  // outer frame
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 3;
  roundRect(ctx, 24, 24, W - 48, H - 48, 18);
  ctx.stroke();
  ctx.strokeStyle = "rgba(30,58,95,0.9)";
  ctx.lineWidth = 1;
  roundRect(ctx, 40, 40, W - 80, H - 80, 12);
  ctx.stroke();

  // header
  ctx.fillStyle = "#e5f2ff";
  ctx.font = "700 38px Orbitron, sans-serif";
  ctx.fillText("BORDER PASSPORT", 70, 105);
  ctx.fillStyle = "#94a3b8";
  ctx.font = "16px 'JetBrains Mono', monospace";
  ctx.fillText("境界入国管理局 · BUREAU OF HUMAN-AI BORDER", 70, 132);

  ctx.strokeStyle = "rgba(56,189,248,0.4)";
  ctx.beginPath();
  ctx.moveTo(70, 150);
  ctx.lineTo(W - 70, 150);
  ctx.stroke();

  // photo
  const px = 70;
  const py = 185;
  const pw = 320;
  const ph = 400;
  ctx.fillStyle = "#000";
  roundRect(ctx, px, py, pw, ph, 8);
  ctx.fill();
  const snap = snapshot ? await loadImage(snapshot) : null;
  if (snap) {
    ctx.save();
    roundRect(ctx, px, py, pw, ph, 8);
    ctx.clip();
    // cover fit
    const ratio = Math.max(pw / snap.width, ph / snap.height);
    const dw = snap.width * ratio;
    const dh = snap.height * ratio;
    ctx.drawImage(snap, px + (pw - dw) / 2, py + (ph - dh) / 2, dw, dh);
    ctx.restore();
  } else {
    ctx.fillStyle = "#1e3a5f";
    ctx.font = "120px serif";
    ctx.textAlign = "center";
    ctx.fillText("◎", px + pw / 2, py + ph / 2 + 40);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "16px 'JetBrains Mono', monospace";
    ctx.fillText("NO PHOTO", px + pw / 2, py + ph - 30);
    ctx.textAlign = "left";
  }
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 2;
  roundRect(ctx, px, py, pw, ph, 8);
  ctx.stroke();

  // info column
  const ix = 440;
  let iy = 210;
  const field = (label: string, value: string, color = "#e5f2ff", size = 30) => {
    ctx.fillStyle = "#94a3b8";
    ctx.font = "13px 'JetBrains Mono', monospace";
    ctx.fillText(label, ix, iy);
    ctx.fillStyle = color;
    ctx.font = `700 ${size}px Orbitron, sans-serif`;
    ctx.fillText(value, ix, iy + size + 4);
    iy += size + 40;
  };

  field("NAME / 氏名", "GUEST HUMAN");
  field("HUMAN SCORE / 人間度", `${result.humanScore}%`, result.approved ? "#22c55e" : "#f97316");
  field("RANK / 等級", `${result.rank} — ${RANK_TITLE[result.rank]}`, "#38bdf8", 24);
  field("TYPE / 人間タイプ", result.humanType, "#e5f2ff", 22);
  ctx.fillStyle = "#94a3b8";
  ctx.font = "13px 'JetBrains Mono', monospace";
  ctx.fillText(
    `DATE: ${new Date(result.createdAt).toLocaleString("ja-JP")}   SID:${result.sessionId.slice(-8)}`,
    ix,
    iy
  );

  // stamp
  const sx = W - 230;
  const sy = H - 230;
  const r = 95;
  const stampColor = result.approved ? "#16a34a" : "#ef4444";
  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate((-14 * Math.PI) / 180);
  ctx.strokeStyle = stampColor;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r - 12, 0, Math.PI * 2);
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = stampColor;
  ctx.textAlign = "center";
  ctx.font = "700 36px Orbitron, sans-serif";
  ctx.fillText(result.approved ? "APPROVED" : "REJECTED", 0, 10);
  ctx.font = "12px 'JetBrains Mono', monospace";
  ctx.fillText(result.approved ? "入国許可" : "入国拒否", 0, 36);
  ctx.restore();

  // secondary stamps（メイン以外を小さく押す）
  const subs = passportStamps(result).slice(1);
  subs.forEach((s, idx) => {
    const bx = 460 + idx * 240;
    const by = H - 70;
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(((idx % 2 === 0 ? -6 : 5) * Math.PI) / 180);
    const c = s.approve ? "#16a34a" : "#ef4444";
    ctx.strokeStyle = c;
    ctx.fillStyle = c;
    ctx.lineWidth = 3;
    const w = 210;
    const h = 46;
    ctx.strokeRect(-w / 2, -h / 2, w, h);
    ctx.strokeRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8);
    ctx.textAlign = "center";
    ctx.font = "700 20px Orbitron, sans-serif";
    ctx.fillText(s.text, 0, -1);
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.fillText(s.sub, 0, 16);
    ctx.restore();
  });

  const link = document.createElement("a");
  link.download = `border-passport-${result.sessionId}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
