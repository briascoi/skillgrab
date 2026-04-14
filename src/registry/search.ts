import { curatedFor } from "./curated.js";

const BASE = process.env.AUTOSKILLS_REGISTRY ?? "https://skills.sh";
const TIMEOUT_MS = 5000;

const cache = new Map<string, string[]>();

async function fetchText(url: string, accept = "text/html"): Promise<string | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: accept, "User-Agent": "autoskills-cli" },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function parseJsonSlugs(text: string): string[] {
  try {
    const data = JSON.parse(text);
    const items = Array.isArray(data) ? data : (data?.results ?? data?.skills ?? []);
    const slugs: string[] = [];
    for (const item of items) {
      if (typeof item === "string") slugs.push(item);
      else if (item?.slug) slugs.push(String(item.slug));
      else if (item?.owner && item?.repo) {
        slugs.push(item.skill ? `${item.owner}/${item.repo}/${item.skill}` : `${item.owner}/${item.repo}`);
      }
    }
    return slugs;
  } catch {
    return [];
  }
}

function parseHtmlSlugs(html: string): string[] {
  // Match href="/owner/repo" and href="/owner/repo/skill" patterns.
  // Ignore known non-skill paths.
  const SKIP = new Set(["trending", "hot", "search", "login", "about", "api", "docs"]);
  const slugs = new Set<string>();
  const re = /href=["']\/([a-zA-Z0-9][\w.-]*)\/([a-zA-Z0-9][\w.-]*)(?:\/([a-zA-Z0-9][\w.-]*))?["']/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const [, owner, repo, skill] = m;
    if (SKIP.has(owner)) continue;
    const slug = skill ? `${owner}/${repo}/${skill}` : `${owner}/${repo}`;
    slugs.add(slug);
    if (slugs.size >= 12) break;
  }
  return [...slugs];
}

export async function searchRegistry(query: string, limit = 3): Promise<string[]> {
  const key = query.toLowerCase();
  if (cache.has(key)) return cache.get(key)!.slice(0, limit);

  const q = encodeURIComponent(query);

  // 1) Try JSON endpoint.
  const jsonText = await fetchText(`${BASE}/search?q=${q}&format=json`, "application/json");
  let slugs: string[] = [];
  if (jsonText) slugs = parseJsonSlugs(jsonText);

  // 2) HTML fallback.
  if (slugs.length === 0) {
    const html = await fetchText(`${BASE}/search?q=${q}`, "text/html");
    if (html) slugs = parseHtmlSlugs(html);
  }

  // 3) Curated fallback.
  if (slugs.length === 0) {
    slugs = curatedFor(query);
  }

  cache.set(key, slugs);
  return slugs.slice(0, limit);
}
