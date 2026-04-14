import { spawn } from "node:child_process";

const AGENT = process.env.SKILLGRAB_AGENT ?? "claude-code";

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

function run(args: string[]): Promise<number> {
  return new Promise((resolve) => {
    const proc = spawn("npx", args, { stdio: "inherit", env: process.env });
    proc.on("close", (code) => resolve(code ?? 1));
    proc.on("error", () => resolve(1));
  });
}

async function installGroup(source: string, skillIds: string[]): Promise<number> {
  const args = ["skills", "add", source, "--yes", "--global", "--agent", AGENT];
  for (const id of skillIds) args.push("--skill", id);
  return run(args);
}

export async function installOne(slug: string): Promise<number> {
  const { source, skillId } = parseSlug(slug);
  if (!skillId) return run(["skills", "add", source, "--yes", "--global", "--agent", AGENT]);
  return installGroup(source, [skillId]);
}

export async function installAll(slugs: string[]): Promise<{ slug: string; code: number }[]> {
  // Group by source repo → one clone per repo, multiple --skill flags.
  const bySource = new Map<string, string[]>();
  for (const slug of slugs) {
    const { source, skillId } = parseSlug(slug);
    if (!skillId) {
      if (!bySource.has(source)) bySource.set(source, []);
      continue;
    }
    if (!bySource.has(source)) bySource.set(source, []);
    bySource.get(source)!.push(skillId);
  }

  const results: { slug: string; code: number }[] = [];
  for (const [source, skillIds] of bySource.entries()) {
    const code = skillIds.length === 0
      ? await run(["skills", "add", source, "--yes", "--global", "--agent", AGENT])
      : await installGroup(source, skillIds);
    if (skillIds.length === 0) {
      results.push({ slug: source, code });
    } else {
      for (const id of skillIds) results.push({ slug: `${source}/${id}`, code });
    }
  }
  return results;
}
