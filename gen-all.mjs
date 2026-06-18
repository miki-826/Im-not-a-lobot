// gen-all.mjs — gpt-image-2 で必要画像をまとめて生成（既存はスキップ）
import { writeFile, mkdir, access } from "node:fs/promises";
import { dirname } from "node:path";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey || !apiKey.startsWith("sk-")) {
  console.error("ERROR: 本物の OPENAI_API_KEY (sk-...) が未設定。プレースホルダで進行してください。");
  process.exit(1);
}

const JOBS = [
  {
    out: "public/images/title-bg.png",
    size: "1536x1024",
    prompt:
      "A dark digital border immigration checkpoint between the human world and the AI world. Old worn government inspection terminal aesthetic mixed with subtle cyber glitch. Deep near-black navy (#05070D) atmosphere, faint cyan (#38BDF8) scanning lines, CRT noise, distant glowing gate, surveillance camera silhouettes. Cinematic wide composition with a large clean empty dark area in the center for UI title text. Moody, serious, not cute. No text, no letters, no logo, no watermark.",
  },
  {
    out: "public/images/game-bg.png",
    size: "1536x1024",
    prompt:
      "Interior of a futuristic immigration inspection booth at the boundary of the human and AI worlds. Dark navy control room, holographic inspection panels, a camera monitor frame, thin cyan electric noise and scanlines, dim orange warning lamp glow on the side. Calm centered readable dark area for overlaid UI. Realistic worn sci-fi terminal texture, not glossy SaaS. No text, no letters, no logo, no watermark.",
  },
  {
    out: "public/images/result-approved-bg.png",
    size: "1536x1024",
    prompt:
      "An opening gate leading from a dark AI checkpoint out into warm soft morning light of a human city. Hopeful calm atmosphere, faint cyan terminal glow on the gate frame, gentle green safety light. Clean empty center space for a result card. Cinematic, slightly grainy film texture. No text, no letters, no logo, no watermark.",
  },
  {
    out: "public/images/result-rejected-bg.png",
    size: "1536x1024",
    prompt:
      "A closed digital border gate with pulsing red warning lights, dark AI waiting lobby, subtle glitch noise and scanlines, cold blue shadows with red emergency glow. Dramatic and tense but not horror. Clean empty center space for a result card. Cinematic worn terminal texture. No text, no letters, no logo, no watermark.",
  },
  {
    out: "public/images/examiner.png",
    size: "1024x1024",
    prompt:
      "Portrait of a humanoid AI immigration officer for a sci-fi web game. Sleek synthetic face with faint glowing cyan circuit lines under translucent skin, neat official dark uniform with a thin cyan collar light, calm bureaucratic but slightly suspicious and subtly humorous expression. Front-facing bust shot, centered, on a solid very dark navy background (#0a0f1c) so it blends into a dark panel. Stylized realism, painterly, not a generic robot icon. No text, no letters, no logo, no watermark.",
  },
  {
    out: "public/images/emblem.png",
    size: "1024x1024",
    prompt:
      "A single official emblem for a fictional 'Border Immigration Bureau' between the human world and the AI world. Circular metallic seal combining a human profile and a circuit-node motif, engraved cyan and steel tones, scanline texture, centered on a solid pure black background, symmetrical, crisp, like an embossed badge. Minimal, iconic. No text, no letters, no readable words, no watermark.",
  },
  {
    out: "public/images/passport-frame.png",
    size: "1536x1024",
    prompt:
      "A futuristic immigration passport card frame for a sci-fi game, horizontal layout. Dark navy document with engraved cyber guilloché security pattern, a blank empty photo window on the left, blank empty information lines on the right, an empty circular stamp area in the corner, thin cyan border. Official border document design, flat top-down view, clean blank fields. No readable text, no letters, no logo, no watermark.",
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
    console.log(`SKIP (exists): ${job.out}`);
    continue;
  }
  process.stdout.write(`GEN ${job.out} (${job.size}) ... `);
  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-2",
        prompt: job.prompt,
        size: job.size,
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
