#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import * as p from "@clack/prompts";
import { detect } from "./detect/index.js";
import { searchRegistry, scoreSkill } from "./registry/search.js";
import type { ApiSkill } from "./registry/search.js";
import { filterValid } from "./registry/validate.js";
import { banner, info, ok, planTable, section, warn, err } from "./ui.js";
import { confirmAreas, pickSkills } from "./prompt.js";
import { installAll } from "./install.js";
import type { ContextHint, SkillCandidate, Signal } from "./types.js";

const TRUSTED_OWNERS = new Set([
  "anthropics","vercel","vercel-labs","supabase","stripe","clerk","openai",
  "microsoft","github","google","googleworkspace","cloudflare","apify","openclaudia",
]);

type Args = {
  dryRun: boolean;
  yes: boolean;
  json: boolean;
  help: boolean;
  version: boolean;
  onlyTrusted: boolean;
  cwd: string;
};

function parseArgs(argv: string[]): Args {
  const a: Args = {
    dryRun: false,
    yes: false,
    json: false,
    help: false,
    version: false,
    onlyTrusted: false,
    cwd: process.cwd(),
  };
  for (const arg of argv) {
    if (arg === "--dry-run" || arg === "-n") a.dryRun = true;
    else if (arg === "--yes" || arg === "-y") a.yes = true;
    else if (arg === "--json") a.json = true;
    else if (arg === "--help" || arg === "-h") a.help = true;
    else if (arg === "--version" || arg === "-v") a.version = true;
    else if (arg === "--only-trusted" || arg === "-t") a.onlyTrusted = true;
  }
  return a;
}

const HELP = `
skillgrab — detect your stack, install matching skills from skills.sh

Usage:
  npx skillgrab [options]

Options:
  -n, --dry-run       Show what would be installed, don't run installers
  -y, --yes           Skip confirmation prompts
  -t, --only-trusted  Restrict plan to skills from trusted owners only
                      (anthropics, vercel, supabase, stripe, clerk, openai,
                       microsoft, github, google, cloudflare, apify, …)
      --json          Output the detection+plan as JSON and exit
  -h, --help          Show this help
  -v, --version       Show version

Security note: skills contain SKILL.md files that run with full agent
permissions. Review candidates before installing. Use --only-trusted
to restrict to a hardcoded allowlist of known-good owners.

Env:
  SKILLGRAB_AGENT      Target agent for install (default: claude-code)
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
  const results = await installAll(selected.map((c) => c.slug));
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
