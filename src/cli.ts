#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import * as p from "@clack/prompts";
import { detect } from "./detect/index.js";
import { searchRegistry, scoreSkill } from "./registry/search.js";
import type { ApiSkill } from "./registry/search.js";
import { filterValid } from "./registry/validate.js";
import { detectAgents } from "./agents.js";
import { banner, info, ok, planTable, section, warn, err } from "./ui.js";
import { confirmAreas, pickSkills } from "./prompt.js";
import { installAll } from "./install.js";
import { runStatus } from "./commands/status.js";
import { runUpdate } from "./commands/update.js";
import type { ContextHint, SkillCandidate, Signal } from "./types.js";

const TRUSTED_OWNERS = new Set([
  "anthropics","vercel","vercel-labs","supabase","stripe","clerk","openai",
  "microsoft","github","google","googleworkspace","cloudflare","apify","openclaudia",
]);

const SUBCOMMANDS = new Set(["status", "update", "add"]);

type Args = {
  subcommand: "add" | "status" | "update";
  dryRun: boolean;
  yes: boolean;
  json: boolean;
  help: boolean;
  version: boolean;
  onlyTrusted: boolean;
  agents: string[] | null; // null = auto-detect
  cwd: string;
};

function parseArgs(argv: string[]): Args {
  const a: Args = {
    subcommand: "add",
    dryRun: false,
    yes: false,
    json: false,
    help: false,
    version: false,
    onlyTrusted: false,
    agents: null,
    cwd: process.cwd(),
  };

  let i = 0;
  // First positional arg may be a subcommand
  if (argv[0] && !argv[0].startsWith("-") && SUBCOMMANDS.has(argv[0])) {
    a.subcommand = argv[0] as Args["subcommand"];
    i = 1;
  }

  for (; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dry-run" || arg === "-n") a.dryRun = true;
    else if (arg === "--yes" || arg === "-y") a.yes = true;
    else if (arg === "--json") a.json = true;
    else if (arg === "--help" || arg === "-h") a.help = true;
    else if (arg === "--version" || arg === "-v") a.version = true;
    else if (arg === "--only-trusted" || arg === "-t") a.onlyTrusted = true;
    else if (arg === "--agent" || arg === "-a") {
      const val = argv[++i];
      if (val) a.agents = val.split(",").map((s) => s.trim()).filter(Boolean);
    } else if (arg.startsWith("--agent=")) {
      a.agents = arg.slice("--agent=".length).split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  return a;
}

const HELP = `
skillgrab — detect your stack, install matching skills from skills.sh

Usage:
  npx skillgrab [add] [options]   Scan project + install skills (default)
  npx skillgrab status  [options] List installed skills + registry status
  npx skillgrab update  [options] Reinstall/refresh all installed skills

Options:
  -n, --dry-run         Show what would be installed, don't run installers
  -y, --yes             Skip confirmation prompts
  -t, --only-trusted    Restrict plan to skills from trusted owners only
  -a, --agent <list>    Target agent(s), comma-separated
                        (e.g. -a cursor  or  -a claude-code,cursor,cline)
                        If omitted, skillgrab auto-detects installed agents.
                        Supports: claude-code, cursor, cline, codex, continue,
                        gemini-cli, warp, windsurf, github-copilot, roo,
                        opencode, goose, aider, amp, qwen-code, kilo, …
      --json            Output detection+plan as JSON and exit (add only)
  -h, --help            Show this help
  -v, --version         Show version

Security note: skills contain SKILL.md files that run with full agent
permissions. Review candidates before installing. Use --only-trusted
to restrict to a hardcoded allowlist of known-good owners.

Env:
  SKILLGRAB_AGENT      Default agent(s), comma-separated. Overridden by --agent.
  AUTOSKILLS_REGISTRY  Override skills.sh base URL (for testing)
  GITHUB_TOKEN         Bypass 60/hr unauth GitHub API rate limit
`;

async function readPkgVersion(): Promise<string> {
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    const raw = await readFile(join(here, "..", "package.json"), "utf8");
    return JSON.parse(raw).version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

async function buildPlan(
  signals: Signal[],
  acceptedHints: ContextHint[],
): Promise<SkillCandidate[]> {
  // Collect one candidate per (skill-name). If the same skill-name appears
  // from multiple queries/sources, keep the highest-scored one.
  const byName = new Map<string, { skill: ApiSkill; reason: string; score: number }>();

  const collect = async (queries: string[], reason: string) => {
    for (const q of queries) {
      const skills = await searchRegistry(q, 1); // 1 per query is plenty
      for (const s of skills) {
        const score = scoreSkill(s);
        const prev = byName.get(s.skillId);
        if (!prev || score > prev.score) {
          byName.set(s.skillId, { skill: s, reason, score });
        }
      }
    }
  };

  for (const s of signals) {
    await collect(s.queries, s.key);
  }
  for (const h of acceptedHints) {
    await collect(h.queries, h.area);
  }

  const out: SkillCandidate[] = [];
  for (const { skill, reason } of byName.values()) {
    const owner = skill.source.split("/")[0] ?? "";
    out.push({
      slug: skill.id,
      skillName: skill.skillId,
      installs: skill.installs,
      trusted: TRUSTED_OWNERS.has(owner),
      reason,
    });
  }
  // Show trusted first, then by installs desc.
  out.sort((a, b) => {
    if (a.trusted !== b.trusted) return a.trusted ? -1 : 1;
    return b.installs - a.installs;
  });
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const version = await readPkgVersion();

  if (args.help) {
    console.log(HELP);
    return;
  }
  if (args.version) {
    console.log(version);
    return;
  }

  // Dispatch to subcommands
  if (args.subcommand === "status") {
    await runStatus({ version, agents: args.agents });
    return;
  }
  if (args.subcommand === "update") {
    await runUpdate({
      version,
      agents: args.agents,
      onlyTrusted: args.onlyTrusted,
      yes: args.yes,
    });
    return;
  }

  // Default: add flow
  if (!args.json) banner(version);

  const spinner = args.json ? null : p.spinner();
  spinner?.start("Scanning project");
  const result = await detect(args.cwd);
  spinner?.stop(`Detected ${result.signals.length} tech signal${result.signals.length === 1 ? "" : "s"}`);

  if (!args.json) {
    section("Tech signals");
    if (result.signals.length === 0) {
      info("none detected (no manifest files found)");
    } else {
      for (const s of result.signals) {
        info(`${s.key.padEnd(18)} ${s.reason}`);
      }
    }
    console.log("");
  }

  // Non-code hints: interactive unless --yes or --json.
  let acceptedHints: ContextHint[] = [];
  if (result.hints.length > 0) {
    if (args.yes || args.json) {
      acceptedHints = result.hints;
    } else {
      section("Context hints (from README/docs)");
      for (const h of result.hints) {
        info(`${h.area.padEnd(10)} matches: ${h.matches.join(", ")}`);
      }
      console.log("");
      acceptedHints = await confirmAreas(result.hints);
    }
  }

  const planSpinner = args.json ? null : p.spinner();
  planSpinner?.start("Querying skills.sh");
  const rawCandidates = await buildPlan(result.signals, acceptedHints);
  planSpinner?.stop(`Found ${rawCandidates.length} matching skill${rawCandidates.length === 1 ? "" : "s"}`);

  const verifySpinner = args.json ? null : p.spinner();
  verifySpinner?.start("Verifying skills exist on GitHub");
  const { valid: verified, invalid } = await filterValid(rawCandidates);
  verifySpinner?.stop(
    invalid.length > 0
      ? `Verified ${verified.length} · dropped ${invalid.length} stale entries`
      : `Verified ${verified.length} skills`,
  );

  // --only-trusted: filter to allowlisted owners only
  let candidates = verified;
  if (args.onlyTrusted) {
    const untrusted = verified.filter((c) => !c.trusted).length;
    candidates = verified.filter((c) => c.trusted);
    if (!args.json) {
      info(`--only-trusted: kept ${candidates.length} trusted, dropped ${untrusted} untrusted`);
    }
  }

  // Resolve target agents: --agent flag > SKILLGRAB_AGENT env > auto-detect > claude-code fallback
  let targetAgents: string[];
  if (args.agents && args.agents.length > 0) {
    targetAgents = args.agents;
  } else if (process.env.SKILLGRAB_AGENT) {
    targetAgents = process.env.SKILLGRAB_AGENT.split(",").map((s) => s.trim()).filter(Boolean);
  } else {
    const detected = await detectAgents();
    targetAgents = detected.length > 0 ? detected : ["claude-code"];
    if (!args.json && detected.length > 0) {
      section("Detected agents");
      info(detected.join(", "));
      console.log("");
    }
  }

  if (args.json) {
    console.log(JSON.stringify({ detect: result, acceptedHints, plan: candidates }, null, 2));
    return;
  }

  section("Install plan");
  planTable(candidates);
  console.log("");

  if (candidates.length === 0) {
    warn("Nothing to install.");
    return;
  }

  if (args.dryRun) {
    info("--dry-run: not installing.");
    return;
  }

  const selected = args.yes ? candidates : await pickSkills(candidates);
  if (selected.length === 0) {
    warn("Aborted.");
    return;
  }

  section("Installing");
  info(`target agents: ${targetAgents.join(", ")}`);
  const results = await installAll(selected.map((c) => c.slug), targetAgents);
  console.log("");
  const failed = results.filter((r) => r.code !== 0);
  if (failed.length === 0) {
    ok(`Installed ${results.length} skill${results.length === 1 ? "" : "s"}.`);
  } else {
    err(`${failed.length} failed: ${failed.map((f) => f.slug).join(", ")}`);
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
