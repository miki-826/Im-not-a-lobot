const apiKey = process.env.OPENAI_API_KEY;

export const HAS_OPENAI = !!(apiKey && apiKey.startsWith("sk-"));

const MODEL = "gpt-4o-mini";

type ChatResult = { ok: true; data: unknown } | { ok: false };

export async function chatJSON(system: string, user: string): Promise<ChatResult> {
  if (!HAS_OPENAI) return { ok: false };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.9,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      signal: controller.signal,
    });
    if (!res.ok) return { ok: false };
    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content;
    if (!content) return { ok: false };
    return { ok: true, data: JSON.parse(content) };
  } catch {
    return { ok: false };
  } finally {
    clearTimeout(timeout);
  }
}
