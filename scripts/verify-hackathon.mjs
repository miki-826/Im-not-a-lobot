import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
const checks = [];

function check(name, condition, detail = "") {
  checks.push({ name, ok: Boolean(condition), detail });
  if (!condition) failures.push(`${name}${detail ? `: ${detail}` : ""}`);
}

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

const requiredFiles = [
  "app/page.tsx",
  "app/api/game/start/route.ts",
  "app/api/game/answer/route.ts",
  "app/api/game/task-comment/route.ts",
  "app/api/result/save/route.ts",
  "lib/mockData.ts",
  "lib/mockJudge.ts",
  "lib/storage.ts",
  "public/images/title-bg.png",
  "public/images/game-bg.png",
  "public/images/result-approved-bg.png",
  "public/images/result-rejected-bg.png",
];

for (const file of requiredFiles) check(`required file: ${file}`, existsSync(join(root, file)));

const pkg = JSON.parse(read("package.json"));
check("build script", pkg.scripts?.build === "next build");
check("verification script", pkg.scripts?.["verify:hackathon"] === "node scripts/verify-hackathon.mjs");

const envExample = read(".env.example");
check("OpenAI key is server-only", envExample.includes("OPENAI_API_KEY=") && !envExample.includes("NEXT_PUBLIC_OPENAI"));
check("Supabase is optional", envExample.includes("NEXT_PUBLIC_SUPABASE_URL=") && envExample.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY="));

const sourceRoots = ["app", "components", "lib", "types"];
const sourceFiles = [];
for (const sourceRoot of sourceRoots) {
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (/\.(?:ts|tsx|js|mjs)$/.test(entry.name)) sourceFiles.push(path);
    }
  };
  walk(join(root, sourceRoot));
}
const allSource = sourceFiles.map((file) => readFileSync(file, "utf8")).join("\n");
check("no public OpenAI secret", !/NEXT_PUBLIC_OPENAI_API_KEY/.test(allSource));
check("no service-role key", !/service[_-]?role/i.test(allSource));
check("Mock task fallback", /MOCK_TASKS/.test(read("app/api/game/start/route.ts")));
check("Mock judgment fallback", /judgeMock/.test(read("app/api/game/answer/route.ts")));
check("LocalStorage fallback", /localStorage\.setItem/.test(read("lib/storage.ts")));
check("Supabase local-only fallback", /storage:\s*["']localOnly["']/.test(read("app/api/result/save/route.ts")));
check("answer input is bounded", /texts\.slice\(0, 3\)/.test(read("app/api/game/answer/route.ts")));
check("task comment input is bounded", /safeString\(body\?\.userText, 500\)/.test(read("app/api/game/task-comment/route.ts")));

for (const item of checks) console.log(`${item.ok ? "PASS" : "FAIL"}  ${item.name}`);

if (failures.length) {
  console.error(`\nHackathon verification failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`\nHackathon verification passed (${checks.length} checks).`);
