import { stat } from "node:fs/promises";
import { join } from "node:path";
import type { Signal } from "../types.js";

async function exists(p: string) {
  try { await stat(p); return true; } catch { return false; }
}

const FILE_SIGNALS: Array<[string, { key: string; queries: string[] }]> = [
  ["Dockerfile", { key: "docker", queries: ["docker"] }],
  ["docker-compose.yml", { key: "docker", queries: ["docker compose"] }],
  ["vercel.json", { key: "vercel", queries: ["vercel"] }],
  ["netlify.toml", { key: "netlify", queries: ["netlify"] }],
  ["fly.toml", { key: "fly.io", queries: ["fly.io"] }],
  ["render.yaml", { key: "render", queries: ["render"] }],
  ["wrangler.toml", { key: "cloudflare", queries: ["cloudflare workers"] }],
  ["serverless.yml", { key: "serverless", queries: ["serverless framework", "aws lambda"] }],
  ["terraform", { key: "terraform", queries: ["terraform"] }],
  ["main.tf", { key: "terraform", queries: ["terraform"] }],
  [".github/workflows", { key: "github-actions", queries: ["github actions", "ci/cd"] }],
];

export async function detectInfra(root: string): Promise<Signal[]> {
  const signals: Signal[] = [];
  const seen = new Set<string>();
  for (const [file, info] of FILE_SIGNALS) {
    if (seen.has(info.key)) continue;
    if (await exists(join(root, file))) {
      seen.add(info.key);
      signals.push({ key: info.key, reason: `${file} present`, queries: info.queries });
    }
  }
  return signals;
}
