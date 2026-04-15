import * as p from "@clack/prompts";
import { detectAgents } from "../agents.js";
import { banner, section, info, ok, warn, err } from "../ui.js";
import { installAll } from "../install.js";
import { readInstalledSkills, crossRef } from "./status.js";

const TRUSTED_OWNERS = new Set([
  "anthropics","vercel","vercel-labs","supabase","stripe","clerk","openai",
  "microsoft","github","google","googleworkspace","cloudflare","apify","openclaudia",
]);

export async function runUpdate(opts: {
  version: string;
  agents: string[] | null;
  onlyTrusted: boolean;
  yes: boolean;
}) {
  banner(opts.version);

  // Resolve target agents
  let agentsUsed: string[];
  if (opts.agents && opts.agents.length > 0) {
    agentsUsed = opts.agents;
  } else {
    const detected = await detectAgents();
    agentsUsed = detected.length > 0 ? detected : ["claude-code"];
    if (detected.length > 0) {
      section("Detected agents");
      info(detected.join(", "));
      console.log("");
    }
  }

  const spinner = p.spinner();

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
    return;
  }

  // Dedupe by name
  const byName = new Map<string, string[]>();
  for (const s of installed) {
    if (!byName.has(s.name)) byName.set(s.name, []);
    byName.get(s.name)!.push(s.agent);
  }
  const uniqueNames = [...byName.keys()];

  spinner.start(`Looking up ${uniqueNames.length} skills in registry`);
  const regInfo = await crossRef(uniqueNames);
  spinner.stop("Registry lookup done");

  // Skills that have a registry slug we can reinstall from
  let updatable = [...regInfo.values()].filter((s) => s.inRegistry && s.registrySlug);

  if (opts.onlyTrusted) {
    const before = updatable.length;
    updatable = updatable.filter((s) => {
      const owner = s.registrySlug?.split("/")[0] ?? "";
      return TRUSTED_OWNERS.has(owner);
    });
    info(`--only-trusted: kept ${updatable.length}, dropped ${before - updatable.length}`);
  }

  const notFound = [...regInfo.values()].filter((s) => !s.inRegistry);

  console.log("");
  section("Update plan");

  if (updatable.length === 0) {
    warn("No updatable skills found.");
    if (notFound.length > 0) {
      warn(`${notFound.length} skill${notFound.length === 1 ? "" : "s"} not in registry (skipped): ${notFound.map((s) => s.name).join(", ")}`);
    }
    return;
  }

  for (const s of updatable) {
    info(`${s.name.padEnd(28)} ${s.registrySlug!}`);
  }
  if (notFound.length > 0) {
    console.log("");
    warn(`Skipping ${notFound.length} not found in registry: ${notFound.map((s) => s.name).join(", ")}`);
  }

  console.log("");

  let toUpdate = updatable;
  if (!opts.yes) {
    const confirmed = await p.confirm({
      message: `Reinstall ${updatable.length} skill${updatable.length === 1 ? "" : "s"} for: ${agentsUsed.join(", ")}?`,
      initialValue: true,
    });
    if (p.isCancel(confirmed) || !confirmed) {
      warn("Aborted.");
      return;
    }
  }

  section("Updating");
  info(`target agents: ${agentsUsed.join(", ")}`);
  console.log("");

  const slugs = toUpdate.map((s) => s.registrySlug!);
  const results = await installAll(slugs, agentsUsed);

  console.log("");
  const failed = results.filter((r) => r.code !== 0);
  if (failed.length === 0) {
    ok(`Updated ${results.length} skill${results.length === 1 ? "" : "s"}.`);
  } else {
    err(`${failed.length} failed: ${failed.map((f) => f.slug).join(", ")}`);
    process.exitCode = 1;
  }
}
