const BASE = process.env.AUTOSKILLS_REGISTRY ?? "https://skills.sh";
const TIMEOUT_MS = 6000;

const TRUSTED = new Set([
  "anthropics",
  "vercel",
  "vercel-labs",
  "supabase",
  "stripe",
  "clerk",
  "openai",
  "microsoft",
  "github",
  "google",
  "googleworkspace",
  "cloudflare",
  "apify",
  "openclaudia",
]);

export type ApiSkill = {
  id: string;
  skillId: string;
  name: string;
  source: string;
  installs: number;
};

const cache = new Map<string, ApiSkill[]>();

async function fetchJson(url: string): Promise<any> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: "application/json", "User-Agent": "skillgrab-cli" },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

/**
 * Score a skill: trusted owners get a big boost, then log(installs).
 * Higher = better.
 */
export function scoreSkill(s: ApiSkill): number {
  const owner = s.source?.split("/")[0] ?? "";
  const trustedBoost = TRUSTED.has(owner) ? 100 : 0;
  const popularity = Math.log10(Math.max(1, s.installs ?? 0));
  return trustedBoost + popularity;
}

/**
 * Query skills.sh. Returns ranked, source-deduped skills for this query.
 * Callers are responsible for cross-query dedupe by skill name.
 */
export async function searchRegistry(query: string, limit = 3): Promise<ApiSkill[]> {
  const key = query.toLowerCase();
  if (cache.has(key)) return cache.get(key)!.slice(0, limit);

  const q = encodeURIComponent(query);
  const data = await fetchJson(`${BASE}/api/search?q=${q}`);

  let skills: ApiSkill[] = [];
  if (data && Array.isArray(data.skills)) {
    skills = (data.skills as any[])
      .filter((s) => s && typeof s.id === "string" && typeof s.source === "string")
      .map((s) => ({
        id: String(s.id),
        skillId: String(s.skillId ?? s.name ?? s.id.split("/").pop()),
        name: String(s.name ?? s.skillId ?? ""),
        source: String(s.source),
        installs: Number(s.installs ?? 0),
      }));
  }

  // Sort by score desc, then keep first skill per source repo (variety).
  skills.sort((a, b) => scoreSkill(b) - scoreSkill(a));
  const seenSource = new Set<string>();
  const out: ApiSkill[] = [];
  for (const s of skills) {
    if (seenSource.has(s.source)) continue;
    seenSource.add(s.source);
    out.push(s);
  }

  cache.set(key, out);
  return out.slice(0, limit);
}
