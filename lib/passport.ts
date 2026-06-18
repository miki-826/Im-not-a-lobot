import type { GameResult } from "@/types/game";
import { RANK_TITLE } from "./score";

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

  const link = document.createElement("a");
  link.download = `border-passport-${result.sessionId}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
