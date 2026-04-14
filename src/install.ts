import { spawn } from "node:child_process";

/**
 * Split a skills.sh slug into (repo, skillId).
 * skills.sh returns `owner/repo/skillId` but `npx skills add` expects
 * `owner/repo` as the source and takes the specific skill via --skill.
 */
export function parseSlug(slug: string): { source: string; skillId: string | null } {
  const parts = slug.split("/").filter(Boolean);
  if (parts.length >= 3) {
    return { source: `${parts[0]}/${parts[1]}`, skillId: parts.slice(2).join("/") };
  }
  return { source: slug, skillId: null };
}

const AGENT = process.env.SKILLGRAB_AGENT ?? "claude-code";

export function installOne(slug: string): Promise<number> {
  const { source, skillId } = parseSlug(slug);
  const args = ["skills", "add", source, "--yes", "--global", "--agent", AGENT];
  if (skillId) args.push("--skill", skillId);

  return new Promise((resolve) => {
    const proc = spawn("npx", args, { stdio: "inherit", env: process.env });
    proc.on("close", (code) => resolve(code ?? 1));
    proc.on("error", () => resolve(1));
  });
}

export async function installAll(slugs: string[]): Promise<{ slug: string; code: number }[]> {
  // Group by source repo → install each repo once with --skill a,b,c
  // (skills.sh clones the repo once per call; grouping avoids re-cloning).
  const bySource = new Map<string, string[]>();
  const nonGrouped: string[] = [];
  for (const slug of slugs) {
    const { source, skillId } = parseSlug(slug);
    if (!skillId) {
      nonGrouped.push(slug);
      continue;
    }
    if (!bySource.has(source)) bySource.set(source, []);
    bySource.get(source)!.push(skillId);
  }

  const results: { slug: string; code: number }[] = [];

  for (const [source, skillIds] of bySource.entries()) {
    const code = await runGroup(source, skillIds);
    for (const id of skillIds) {
      results.push({ slug: `${source}/${id}`, code });
    }
  }

  for (const slug of nonGrouped) {
    const code = await installOne(slug);
    results.push({ slug, code });
  }

  return results;
}

function runGroup(source: string, skillIds: string[]): Promise<number> {
  const args = [
    "skills", "add", source,
    "--yes", "--global",
    "--agent", AGENT,
    "--skill", skillIds.join(","),
  ];
  return new Promise((resolve) => {
    const proc = spawn("npx", args, { stdio: "inherit", env: process.env });
    proc.on("close", (code) => resolve(code ?? 1));
    proc.on("error", () => resolve(1));
  });
}
