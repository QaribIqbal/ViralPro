import fs from "node:fs";
import path from "node:path";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.resolve(process.cwd(), ".env"));
loadEnvFile(path.resolve(process.cwd(), ".env.local"));

const required = [
  "N8N_IMAGE_GENERATE_WEBHOOK_URL",
  "N8N_BLOG_GENERATE_WEBHOOK_URL",
  "N8N_KEYWORD_RESEARCH_WEBHOOK_URL",
  "N8N_WEBHOOK_SECRET",
];

let hasError = false;

for (const key of required) {
  const value = process.env[key];
  if (value && value.trim()) {
    console.log(`✅ ${key} found`);
  } else {
    console.error(`❌ Missing ${key}`);
    hasError = true;
  }
}

if (hasError) {
  process.exit(1);
}
