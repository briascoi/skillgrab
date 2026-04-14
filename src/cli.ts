#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import * as p from "@clack/prompts";
import { detect } from "./detect/index.js";
import { searchRegistry } from "./registry/search.js";
import { banner, info, ok, planTable, section, warn, err } from "./ui.js";
import { confirmAreas, finalConfirm } from "./prompt.js";
import { installAll } from "./install.js";
import type { ContextHint, SkillCandidate, Signal } from "./types.js";

type Args = {
  dryRun: boolean;
  yes: boolean;
  json: boolean;
  help: boolean;
  version: boolean;
  cwd: string;
};

function parseArgs(argv: string[]): Args {
  const a: Args = {
    dryRun: false,
    yes: false,
    json: false,
    help: false,
    version: false,
    cwd: process.cwd(),
  };
  for (const arg of argv) {
    if (arg === "--dry-run" || arg === "-n") a.dryRun = true;
    else if (arg === "--yes" || arg === "-y") a.yes = true;
    else if (arg === "--json") a.json = true;
    else if (arg === "--help" || arg === "-h") a.help = true;
    else if (arg === "--version" || arg === "-v") a.version = true;
  }
  return a;
}

const HELP = `
skillgrab — detect your stack, install matching skills from skills.sh

Usage:
  npx skillgrab [options]

Options:
  -n, --dry-run    Show what would be installed, don't run installers
  -y, --yes        Skip confirmation prompts
      --json       Output the detection+plan as JSON and exit
  -h, --help       Show this help
  -v, --version    Show version

Env:
  AUTOSKILLS_REGISTRY  Override skills.sh base URL (for testing)
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
  const seen = new Map<string, SkillCandidate>();

  const addFromQueries = async (queries: string[], reason: string) => {
    for (const q of queries) {
      const slugs = await searchRegistry(q, 2);
      for (const slug of slugs) {
        if (!seen.has(slug)) seen.set(slug, { slug, reason });
      }
    }
  };

  for (const s of signals) {
    await addFromQueries(s.queries, s.key);
  }
  for (const h of acceptedHints) {
    await addFromQueries(h.queries, h.area);
  }
  return [...seen.values()];
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
  const candidates = await buildPlan(result.signals, acceptedHints);
  planSpinner?.stop(`Found ${candidates.length} matching skill${candidates.length === 1 ? "" : "s"}`);

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

  const go = args.yes ? true : await finalConfirm(candidates.length);
  if (!go) {
    warn("Aborted.");
    return;
  }

  section("Installing");
  const results = await installAll(candidates.map((c) => c.slug));
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
