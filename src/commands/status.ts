import { readdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import pc from "picocolors";
import { detectAgents } from "../agents.js";
import { searchRegistry } from "../registry/search.js";
import { banner, section, info, ok, warn } from "../ui.js";

/** Maps agent name → relative path(s) under $HOME where skills are stored. */
const AGENT_SKILL_DIRS: Record<string, string[]> = {
  "claude-code":    [".claude/skills"],
  "cursor":         [".cursor/skills"],
  "cline":          [".cline/skills", ".config/cline/skills"],
  "codex":          [".codex/skills"],
  "continue":       [".continue/skills"],
  "gemini-cli":     [".gemini-cli/skills", ".gemini/skills"],
  "warp":           [".warp/skills"],
  "windsurf":       [".codeium/windsurf/skills"],
  "github-copilot": [".github-copilot/skills"],
  "roo":            [".roo/skills"],
  "opencode":       [".opencode/skills"],
  "goose":          [".goose/skills"],
  "aider":          [".aider/skills"],
  "amp":            [".amp/skills"],
  "qwen-code":      [".qwen-code/skills"],
  "kilo":           [".kilo/skills"],
  "zencoder":       [".zencoder/skills"],
  "augment":        [".augment/skills"],
  "replit":         [".replit/skills"],
  "trae":           [".trae/skills"],
};

export type InstalledSkill = {
  name: string;
  agent: string;
};

export type SkillStatus = {
  name: string;
  agents: string[];
  registrySlug: string | null;
  installs: number;
  inRegistry: boolean;
};

async function readSkillsDir(absDir: string, agent: string): Promise<InstalledSkill[]> {
  try {
    const entries = await readdir(absDir, { withFileTypes: true });
    return entries
      .filter((e) => e.isDirectory())
      .map((e) => ({ name: e.name, agent }));
  } catch {
    return [];
  }
}

async function resolveSkillDirs(agent: string): Promise<InstalledSkill[]> {
  const home = homedir();
  const dirs = AGENT_SKILL_DIRS[agent] ?? [`${agent}/skills`];
  for (const rel of dirs) {
    const skills = await readSkillsDir(join(home, rel), agent);
    if (skills.length > 0) return skills;
  }
  return [];
}

/** Read all installed skills across the given agents. */
export async function readInstalledSkills(agents: string[]): Promise<InstalledSkill[]> {
  const results: InstalledSkill[] = [];
  for (const agent of agents) {
    const skills = await resolveSkillDirs(agent);
    results.push(...skills);
  }
  return results;
}

/** Cross-reference a list of skill names against skills.sh, return status per name. */
export async function crossRef(names: string[]): Promise<Map<string, SkillStatus>> {
  const out = new Map<string, SkillStatus>();

  for (const name of names) {
    const results = await searchRegistry(name, 5);
    // Exact match on skillId preferred, then name
    const match =
      results.find((r) => r.skillId === name) ??
      results.find((r) => r.name === name);

    out.set(name, {
      name,
      agents: [], // filled by caller
      registrySlug: match ? match.id : null,
      installs: match ? match.installs : 0,
      inRegistry: !!match,
    });
  }

  return out;
}

export async function runStatus(opts: {
  version: string;
  agents: string[] | null;
  showBanner?: boolean;
}): Promise<{ statusMap: Map<string, SkillStatus>; agentsUsed: string[] } | null> {
  if (opts.showBanner !== false) banner(opts.version);

  // Resolve target agents
  let agentsUsed: string[];
  if (opts.agents && opts.agents.length > 0) {
    agentsUsed = opts.agents;
  } else {
    const detected = await detectAgents();
    agentsUsed = detected.length > 0 ? detected : ["claude-code"];
  }

  const spinner = (await import("@clack/prompts")).spinner();

  spinner.start("Scanning installed skills");
  const installed = await readInstalledSkills(agentsUsed);
  spinner.stop(
    installed.length === 0
      ? "No skills found"
      : `Found ${installed.length} skill${installed.length === 1 ? "" : "s"}`,
  );

  if (installed.length === 0) {
    console.log("");
    warn("No skills installed. Run `npx skillgrab` to install some.");
    return null;
  }

  // Group by skill name → agents[]
  const byName = new Map<string, string[]>();
  for (const s of installed) {
    if (!byName.has(s.name)) byName.set(s.name, []);
    byName.get(s.name)!.push(s.agent);
  }

  spinner.start(`Checking ${byName.size} skills against skills.sh`);
  const regInfo = await crossRef([...byName.keys()]);
  spinner.stop("Registry check done");

  // Merge agents into status map
  for (const [name, agents] of byName.entries()) {
    const entry = regInfo.get(name)!;
    entry.agents = agents;
  }

  // Print table
  console.log("");
  section(`Installed skills (${agentsUsed.join(", ")})`);
  console.log("");

  const maxName = Math.max(10, ...[...byName.keys()].map((n) => n.length));
  const maxAgents = Math.max(5, ...[...byName.values()].map((a) => a.join(", ").length));

  const header =
    "  " +
    "skill".padEnd(maxName + 2) +
    "agents".padEnd(maxAgents + 2) +
    "registry".padEnd(12) +
    "installs";
  console.log(pc.dim(header));
  console.log(pc.dim("  " + "─".repeat(maxName + maxAgents + 28)));

  const sorted = [...regInfo.values()].sort((a, b) => {
    // In-registry first, then by name
    if (a.inRegistry !== b.inRegistry) return a.inRegistry ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  for (const s of sorted) {
    const agentsStr = s.agents.join(", ").padEnd(maxAgents + 2);
    const regStr = s.inRegistry ? pc.green("✔ found  ") : pc.dim("– missing");
    const installsStr = s.inRegistry
      ? pc.dim(
          s.installs >= 1000
            ? `${(s.installs / 1000).toFixed(1)}k`
            : `${s.installs}`,
        )
      : pc.dim("–");

    console.log(
      "  " +
        pc.cyan(s.name.padEnd(maxName + 2)) +
        pc.dim(agentsStr) +
        regStr +
        "   " +
        installsStr,
    );
  }

  console.log("");
  const missing = sorted.filter((s) => !s.inRegistry).length;
  if (missing === 0) {
    ok(`All ${sorted.length} skills are in the registry.`);
  } else {
    warn(`${missing} skill${missing === 1 ? "" : "s"} not found in registry (may be custom or renamed).`);
    ok(`${sorted.length - missing} of ${sorted.length} skills found.`);
  }
  console.log("");
  info('Run `npx skillgrab update` to reinstall / refresh all skills.');

  return { statusMap: regInfo, agentsUsed };
}
