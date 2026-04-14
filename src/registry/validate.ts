/**
 * skills.sh sometimes returns skillIds that don't exist in the actual repo
 * (stale / fuzzy search artifacts). Validate via GitHub trees API: one fetch
 * per repo, cached, then check if any path ends with `<skillId>/SKILL.md`.
 */

const TIMEOUT_MS = 5000;

type Tree = { path: string }[];
const treeCache = new Map<string, Tree | null>();

async function fetchTree(owner: string, repo: string): Promise<Tree | null> {
  const key = `${owner}/${repo}`.toLowerCase();
  if (treeCache.has(key)) return treeCache.get(key)!;

  const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    const res = await fetch(url, { signal: ctrl.signal, headers });
    if (!res.ok) {
      treeCache.set(key, null);
      return null;
    }
    const data = (await res.json()) as { tree?: Tree };
    const tree = Array.isArray(data.tree) ? data.tree : null;
    treeCache.set(key, tree);
    return tree;
  } catch {
    treeCache.set(key, null);
    return null;
  } finally {
    clearTimeout(t);
  }
}

export async function slugExists(slug: string): Promise<boolean> {
  const parts = slug.split("/");
  if (parts.length < 3) return true;
  const [owner, repo, ...rest] = parts;
  const skill = rest.join("/");

  const tree = await fetchTree(owner, repo);
  if (!tree) return true; // API failed / rate-limited: don't drop, let install try.

  const suffix = `${skill}/SKILL.md`;
  for (const node of tree) {
    const p = node.path;
    if (p === suffix || p.endsWith(`/${suffix}`)) return true;
  }
  return false;
}

export async function filterValid<T extends { slug: string }>(
  candidates: T[],
  concurrency = 6,
): Promise<{ valid: T[]; invalid: T[] }> {
  const valid: T[] = [];
  const invalid: T[] = [];
  let i = 0;
  async function worker() {
    while (i < candidates.length) {
      const c = candidates[i++];
      (await slugExists(c.slug) ? valid : invalid).push(c);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, candidates.length) }, worker));
  return { valid, invalid };
}
