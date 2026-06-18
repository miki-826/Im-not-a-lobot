import { NextResponse } from "next/server";
import { HAS_OPENAI, chatJSON } from "@/lib/openai";
import { mockTaskComment } from "@/lib/mockJudge";
import { clip } from "@/lib/utils";

const SYSTEM = `あなたは境界入国管理局のAI審査官です。ユーザーが認証タスクに回答しました。
短い審査コメントと部分スコアを返してください。
方針:
- コメントは40〜80文字程度、事務的だが少し皮肉で面白い
- ユーザー本人への悪口は禁止、状況や回答内容へのツッコミに留める
- 人間らしさの観点: 疲労感、怒り、生活感、矛盾、感情のにじみ、不完全さ
- 完璧すぎる回答はAI疑惑として扱ってよい
出力は必ずJSONのみ。Markdown禁止。
形式: {"comment":string,"partialScore":number,"detectedSignals":[string]}`;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const taskId: string = body?.taskId || "task-1";
  const taskTitle: string = body?.taskTitle || "";
  const instruction: string = body?.instruction || "";
  const userText: string = clip(String(body?.userText || ""), 500);

  if (HAS_OPENAI) {
    const r = await chatJSON(
      SYSTEM,
      `taskTitle: ${taskTitle}\ninstruction: ${instruction}\nuserText: ${userText}`
    );
    if (r.ok) {
      const d = r.data as { comment?: string; partialScore?: number; detectedSignals?: string[] };
      if (d?.comment) {
        return NextResponse.json({
          comment: d.comment,
          partialScore: typeof d.partialScore === "number" ? d.partialScore : 12,
          detectedSignals: Array.isArray(d.detectedSignals) ? d.detectedSignals : [],
          isMock: false,
        });
      }
    }
  }

  const m = mockTaskComment(taskId, userText);
  return NextResponse.json({ ...m, isMock: true });
}
