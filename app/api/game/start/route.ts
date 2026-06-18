import { NextResponse } from "next/server";
import { MOCK_EXAMINER, MOCK_TASKS } from "@/lib/mockData";
import { HAS_OPENAI, chatJSON } from "@/lib/openai";
import { makeSessionId } from "@/lib/utils";
import type { Examiner, Task } from "@/types/game";

const SYSTEM = `あなたは「人間界とAI世界の境界にある入国審査場」のAI審査官です。
ユーザーが人間らしさを証明するための3つの認証タスクを生成してください。
条件:
- テーマは「人間とAIの境界」
- 各タスクは20秒以内で実行できる
- カメラとマイクを使う前提
- 表情、声、疲労感、怒り、生活感、矛盾、感情のにじみ、不完全さを引き出す
- ユーザー本人を傷つける表現は禁止、ギャグ寄りだが安全
- 個人情報や他人への誹謗中傷を求めない
出力は必ずJSONのみ。Markdown禁止。
形式: {"examiner":{"name":string,"opening_line":string},"tasks":[{"id":"task-1","title":string,"timeLimitSec":20,"instruction":string,"targetSignals":[string]}]}`;

export async function POST() {
  const sessionId = makeSessionId();

  if (HAS_OPENAI) {
    const r = await chatJSON(SYSTEM, "3つの認証タスクを生成してください。");
    if (r.ok) {
      const d = r.data as {
        examiner?: { name?: string; opening_line?: string };
        tasks?: { id?: string; title?: string; timeLimitSec?: number; instruction?: string; targetSignals?: string[] }[];
      };
      if (d?.tasks && Array.isArray(d.tasks) && d.tasks.length >= 3) {
        const examiner: Examiner = {
          name: d.examiner?.name || MOCK_EXAMINER.name,
          openingLine: d.examiner?.opening_line || MOCK_EXAMINER.openingLine,
        };
        const tasks: Task[] = d.tasks.slice(0, 3).map((t, i) => ({
          id: t.id || `task-${i + 1}`,
          title: t.title || MOCK_TASKS[i].title,
          timeLimitSec: 20,
          instruction: t.instruction || MOCK_TASKS[i].instruction,
          targetSignals: t.targetSignals || MOCK_TASKS[i].targetSignals,
        }));
        return NextResponse.json({ sessionId, tasks, examiner, isMock: false });
      }
    }
  }

  return NextResponse.json({
    sessionId,
    tasks: MOCK_TASKS,
    examiner: MOCK_EXAMINER,
    isMock: true,
  });
}
