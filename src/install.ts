import { spawn } from "node:child_process";

/**
 * Split `owner/repo/skillId` into (repo, skillId).
 * skills.sh returns full slugs but `npx skills add` expects
 * owner/repo as source + skillId via --skill.
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

function buildArgs(source: string, skillIds: string[], agents: string[]): string[] {
  const args = ["skills", "add", source, "--yes", "--global"];
  for (const agent of agents) args.push("--agent", agent);
  for (const id of skillIds) args.push("--skill", id);
  return args;
}

export async function installOne(slug: string, agents: string[] = ["claude-code"]): Promise<number> {
  const { source, skillId } = parseSlug(slug);
  const skillIds = skillId ? [skillId] : [];
  return run(buildArgs(source, skillIds, agents));
}

export async function installAll(
  slugs: string[],
  agents: string[] = ["claude-code"],
): Promise<{ slug: string; code: number }[]> {
  const bySource = new Map<string, string[]>();
  for (const slug of slugs) {
    const { source, skillId } = parseSlug(slug);
    if (!bySource.has(source)) bySource.set(source, []);
    if (skillId) bySource.get(source)!.push(skillId);
  }

  const results: { slug: string; code: number }[] = [];
  for (const [source, skillIds] of bySource.entries()) {
    const code = await run(buildArgs(source, skillIds, agents));
    if (skillIds.length === 0) {
      results.push({ slug: source, code });
    } else {
      for (const id of skillIds) results.push({ slug: `${source}/${id}`, code });
    }
  }
  return results;
}
