import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import type { ContextHint } from "../types.js";

const AREAS: Array<{
  area: string;
  keywords: RegExp[];
  queries: string[];
}> = [
  {
    area: "marketing",
    keywords: [/\blanding page\b/i, /\bmarketing\b/i, /\blaunch\b/i, /\bwaitlist\b/i, /\bgrowth\b/i, /\bcold email\b/i, /\bnewsletter\b/i],
    queries: ["marketing", "copywriting", "landing page"],
  },
  {
    area: "seo",
    keywords: [/\bseo\b/i, /\bsearch engine\b/i, /\bkeyword\b/i],
    queries: ["seo", "programmatic seo"],
  },
  {
    area: "design",
    keywords: [/\bdesign system\b/i, /\bfigma\b/i, /\bmockup\b/i, /\bui\/ux\b/i, /\bbrand(ing)?\b/i, /\blogo\b/i],
    queries: ["design", "figma", "ui ux", "brand"],
  },
  {
    area: "product",
    keywords: [/\broadmap\b/i, /\bPRD\b/, /\bsprint\b/i, /\buser stor(y|ies)\b/i, /\bokrs?\b/i],
    queries: ["product management", "roadmap", "prd"],
  },
  {
    area: "sales",
    keywords: [/\bsales\b/i, /\boutreach\b/i, /\bproposal\b/i, /\bpricing\b/i, /\bB2B\b/],
    queries: ["sales", "outreach", "pricing"],
  },
  {
    area: "ops",
    keywords: [/\boperations\b/i, /\bworkflow\b/i, /\bsop\b/i, /\bautomation\b/i],
    queries: ["operations", "automation"],
  },
  {
    area: "analytics",
    keywords: [/\banalytics\b/i, /\btracking\b/i, /\bmetrics\b/i, /\bdashboard\b/i],
    queries: ["analytics", "tracking"],
  },
  {
    area: "content",
    keywords: [/\bblog\b/i, /\bcontent\b/i, /\bsocial media\b/i, /\btwitter\b/i, /\blinkedin\b/i],
    queries: ["social content", "content strategy"],
  },
];

async function readTextSafe(p: string): Promise<string> {
  try { return await readFile(p, "utf8"); } catch { return ""; }
}

export async function detectContext(root: string): Promise<ContextHint[]> {
  const parts: string[] = [];

  // README variants
  try {
    const entries = await readdir(root);
    for (const e of entries) {
      if (/^readme(\.\w+)?$/i.test(e)) {
        parts.push(await readTextSafe(join(root, e)));
      }
    }
  } catch { /* ignore */ }

  // package.json description/keywords
  const pkgRaw = await readTextSafe(join(root, "package.json"));
  if (pkgRaw) {
    try {
      const pkg = JSON.parse(pkgRaw);
      if (pkg.description) parts.push(String(pkg.description));
      if (Array.isArray(pkg.keywords)) parts.push(pkg.keywords.join(" "));
    } catch { /* ignore */ }
  }

  // docs/ top-level filenames (don't read, just names)
  try {
    const docs = await readdir(join(root, "docs"));
    parts.push(docs.join(" "));
  } catch { /* ignore */ }

  const blob = parts.join("\n");
  if (!blob.trim()) return [];

  const hints: ContextHint[] = [];
  for (const def of AREAS) {
    const matches = def.keywords
      .map((re) => blob.match(re)?.[0])
      .filter((m): m is string => !!m);
    if (matches.length) {
      hints.push({
        area: def.area,
        matches: Array.from(new Set(matches.map((m) => m.toLowerCase()))).slice(0, 4),
        queries: def.queries,
      });
    }
  }
  return hints;
}
