const BASE = process.env.AUTOSKILLS_REGISTRY ?? "https://skills.sh";
const TIMEOUT_MS = 6000;

const cache = new Map<string, string[]>();

type ApiSkill = {
  id?: string;
  skillId?: string;
  name?: string;
  source?: string;
  installs?: number;
};

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
 * Query the live skills.sh API. Slugs come back as `owner/repo/skill`.
 * If the API is unreachable or returns nothing, we return [] — we do NOT
 * fall back to guessed slugs, because passing a non-existent slug to
 * `npx skills add` tries to clone github.com/<slug>.git and fails.
 */
export async function searchRegistry(query: string, limit = 3): Promise<string[]> {
  const key = query.toLowerCase();
  if (cache.has(key)) return cache.get(key)!.slice(0, limit);

  const q = encodeURIComponent(query);
  const data = await fetchJson(`${BASE}/api/search?q=${q}`);

  const slugs: string[] = [];
  if (data && Array.isArray(data.skills)) {
    const seenSources = new Set<string>();
    for (const s of data.skills as ApiSkill[]) {
      const id = s.id || (s.source && s.skillId ? `${s.source}/${s.skillId}` : null);
      if (!id) continue;
      // Prefer one skill per source repo so we don't install 5 variants of the same repo.
      const source = s.source ?? id.split("/").slice(0, 2).join("/");
      if (seenSources.has(source)) continue;
      seenSources.add(source);
      slugs.push(id);
      if (slugs.length >= limit) break;
    }
  }

  cache.set(key, slugs);
  return slugs;
}
