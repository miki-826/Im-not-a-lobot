// gen-howto.mjs — 遊び方スライド用イラストを gpt-image-2 で生成（既存はスキップ）
import { writeFile, mkdir, access } from "node:fs/promises";
import { dirname } from "node:path";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey || !apiKey.startsWith("sk-")) {
  console.error("ERROR: 本物の OPENAI_API_KEY (sk-...) が未設定。");
  process.exit(1);
}

const STYLE =
  "Dark navy sci-fi border-checkpoint UI illustration, cyan (#38bdf8) accents, CRT scanlines and faint electric glitch, worn government terminal texture, cinematic, clean composition, generous empty margins for caption overlay. Flat editorial illustration, NOT photorealistic. No text, no letters, no numbers, no UI labels, no logo, no watermark.";

const JOBS = [
  {
    out: "public/images/howto/slide-1.png",
    prompt: `A traveler standing before a glowing digital immigration gate between the human world and the AI world, three holographic verification rings floating ahead. Sense of beginning a test. ${STYLE}`,
  },
  {
    out: "public/images/howto/slide-2.png",
    prompt: `Close concept of step one: a person facing a surveillance camera window, raising one hand with a slightly tired, imperfect expression, soft cyan scan sweep over the face. Conveys 'show a human, imperfect face gesture'. ${STYLE}`,
  },
  {
    out: "public/images/howto/slide-3.png",
    prompt: `Concept of step two: a person venting frustration into a microphone, jagged audio waveform and small storm-cloud motif around the head suggesting complaints and daily-life anger being analyzed. ${STYLE}`,
  },
  {
    out: "public/images/howto/slide-4.png",
    prompt: `Concept of step three and the verdict: a hand performing an expressive gesture beside a futuristic passport card receiving a glowing approval stamp, gate opening to warm morning light. Conveys 'finish the gesture task and get your result'. ${STYLE}`,
  },
];

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

for (const job of JOBS) {
  if (await exists(job.out)) {
    console.log(`SKIP ${job.out}`);
    continue;
  }
  process.stdout.write(`GEN ${job.out} ... `);
  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-image-2",
        prompt: job.prompt,
        size: "1536x1024",
        quality: "medium",
        n: 1,
      }),
    });
    if (!res.ok) {
      console.log(`FAIL ${res.status}`);
      console.error(await res.text());
      continue;
    }
    const data = await res.json();
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) {
      console.log("FAIL (no image)");
      continue;
    }
    await mkdir(dirname(job.out), { recursive: true });
    await writeFile(job.out, Buffer.from(b64, "base64"));
    console.log("OK");
  } catch (e) {
    console.log("ERROR " + e.message);
  }
}
console.log("DONE");
