#!/usr/bin/env node
/**
 * skillgrab MCP server — exposes skillgrab as tools for Claude Desktop, Cursor, and Cline.
 *
 * Run via: npx skillgrab-mcp
 * Transport: stdio (local)
 *
 * Tools:
 *   skillgrab_recommend  Detect stack + search registry, return plan (no install)
 *   skillgrab_install    Install skills by slug into target agent(s)
 *   skillgrab_status     List installed skills for target agent(s)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { spawn } from "node:child_process";
import { detect } from "../detect/index.js";
import { searchRegistry, scoreSkill } from "../registry/search.js";
import type { ApiSkill } from "../registry/search.js";
import { filterValid } from "../registry/validate.js";
import { curatedFor } from "../registry/curated.js";
import { detectAgents } from "../agents.js";
import { readInstalledSkills, crossRef } from "../commands/status.js";
import type { SkillCandidate, Signal, ContextHint } from "../types.js";

// ── Trusted owners (mirrors cli.ts) ─────────────────────────────────────────

const TRUSTED_OWNERS = new Set([
  "anthropics","vercel","vercel-labs","supabase","stripe","clerk","openai",
  "microsoft","github","google","googleworkspace","cloudflare","apify","openclaudia",
]);

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Build a skill plan from detected signals (no UI output). */
async function buildPlan(
  signals: Signal[],
  hints: ContextHint[],
): Promise<SkillCandidate[]> {
  const byName = new Map<string, { skill: ApiSkill; reason: string; score: number }>();

  const collect = async (queries: string[], reason: string) => {
    for (const q of queries) {
      const skills = await searchRegistry(q, 1);
      for (const s of skills) {
        const score = scoreSkill(s);
        const prev = byName.get(s.skillId);
        if (!prev || score > prev.score) {
          byName.set(s.skillId, { skill: s, reason, score });
        }
      }
    }
  };

  for (const s of signals) await collect(s.queries, s.key);
  for (const h of hints) await collect(h.queries, h.area);

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

  // Inject curated packs
  const seenSlugs = new Set(out.map((c) => c.slug));
  const seenNames = new Set(out.map((c) => c.skillName));
  const curatedSlugs = new Set<string>();
  for (const s of signals) {
    for (const slug of curatedFor(s.key)) curatedSlugs.add(slug);
  }
  for (const slug of curatedSlugs) {
    const parts = slug.split("/");
    const skillName = parts.slice(2).join("/");
    if (!seenSlugs.has(slug) && !seenNames.has(skillName)) {
      out.push({ slug, skillName, installs: 0, trusted: false, reason: "essentials" });
    }
  }

  out.sort((a, b) => {
    if (a.trusted !== b.trusted) return a.trusted ? -1 : 1;
    return b.installs - a.installs;
  });

  return out;
}

/** Run `npx skills add ...`, capturing stdout+stderr. */
function runCapture(args: string[]): Promise<{ code: number; output: string }> {
  return new Promise((resolve) => {
    let output = "";
    const proc = spawn("npx", args, { stdio: ["ignore", "pipe", "pipe"], env: process.env });
    proc.stdout.on("data", (d: Buffer) => { output += d.toString(); });
    proc.stderr.on("data", (d: Buffer) => { output += d.toString(); });
    proc.on("close", (code) => resolve({ code: code ?? 1, output }));
    proc.on("error", (e) => resolve({ code: 1, output: e.message }));
  });
}

/** Install a batch of slugs into target agents, capturing output. */
async function installCaptured(
  slugs: string[],
  agents: string[],
): Promise<{ slug: string; code: number; output: string }[]> {
  // Group by source repo
  const bySource = new Map<string, string[]>();
  for (const slug of slugs) {
    const parts = slug.split("/").filter(Boolean);
    const source = parts.length >= 2 ? `${parts[0]}/${parts[1]}` : slug;
    const skillId = parts.length >= 3 ? parts.slice(2).join("/") : null;
    if (!bySource.has(source)) bySource.set(source, []);
    if (skillId) bySource.get(source)!.push(skillId);
  }

  const results: { slug: string; code: number; output: string }[] = [];
  for (const [source, skillIds] of bySource.entries()) {
    const args = ["skills", "add", source, "--yes", "--global"];
    for (const agent of agents) args.push("--agent", agent);
    for (const id of skillIds) args.push("--skill", id);
    const { code, output } = await runCapture(args);
    const affected = skillIds.length === 0 ? [source] : skillIds.map((id) => `${source}/${id}`);
    for (const slug of affected) results.push({ slug, code, output });
  }

  return results;
}

// ── MCP Server ───────────────────────────────────────────────────────────────

const server = new McpServer({
  name: "skillgrab-mcp-server",
  version: "0.6.0",
});

// Tool 1: Recommend ──────────────────────────────────────────────────────────

server.registerTool(
  "skillgrab_recommend",
  {
    title: "Recommend Skills",
    description: `Scan a project directory, detect its tech stack, and return a recommended list of skills to install from skills.sh.

Does NOT install anything — returns a plan for the user to review and approve.
Use skillgrab_install to act on the plan.

Args:
  - cwd (string): Absolute path to the project directory to scan. Defaults to current working directory.
  - only_trusted (boolean): If true, restrict recommendations to skills from known-trusted owners. Default: false.

Returns JSON with:
  {
    "signals": [{ "key": string, "reason": string }],       // Detected tech stack signals
    "plan": [{
      "slug": string,       // Full skill slug (owner/repo/skillId)
      "skillName": string,  // Short skill name
      "installs": number,   // Registry install count
      "trusted": boolean,   // From a trusted owner?
      "reason": string      // Why this skill was suggested
    }]
  }

Examples:
  - "What skills should I install for this project?" → skillgrab_recommend({ cwd: "/path/to/project" })
  - "Suggest skills for my Next.js app" → skillgrab_recommend({ cwd: process.cwd() })`,
    inputSchema: z.object({
      cwd: z.string()
        .optional()
        .describe("Absolute path to project directory. Defaults to current working directory."),
      only_trusted: z.boolean()
        .optional()
        .default(false)
        .describe("Restrict to trusted owners only (anthropics, vercel, supabase, etc.)"),
    }),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  async ({ cwd, only_trusted }) => {
    try {
      const dir = cwd ?? process.cwd();
      const result = await detect(dir);
      const rawCandidates = await buildPlan(result.signals, result.hints);
      const { valid } = await filterValid(rawCandidates);

      const plan = only_trusted ? valid.filter((c) => c.trusted) : valid;

      const output = {
        signals: result.signals.map((s) => ({ key: s.key, reason: s.reason })),
        plan: plan.map((c) => ({
          slug: c.slug,
          skillName: c.skillName,
          installs: c.installs,
          trusted: c.trusted,
          reason: c.reason,
        })),
      };

      return {
        content: [{ type: "text" as const, text: JSON.stringify(output, null, 2) }],
        structuredContent: output,
      };
    } catch (error) {
      return {
        content: [{ type: "text" as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      };
    }
  },
);

// Tool 2: Install ────────────────────────────────────────────────────────────

server.registerTool(
  "skillgrab_install",
  {
    title: "Install Skills",
    description: `Install one or more skills from skills.sh into the specified AI agent(s).

Use skillgrab_recommend first to get the list of slugs to install, then call this with the user-approved subset.

Args:
  - slugs (string[]): Full skill slugs to install (e.g. ["vercel/vercel-skills/nextjs", "briascoi/skillgrab-essentials/coding-style"])
  - agents (string[]): Target agent(s). If omitted, auto-detects installed agents.
    Supported: claude-code, cursor, cline, codex, continue, gemini-cli, warp, windsurf, github-copilot, roo, opencode, goose, aider, amp, and more.

Returns JSON with per-slug results:
  {
    "results": [{
      "slug": string,     // Skill slug
      "code": number,     // Exit code (0 = success)
      "success": boolean,
      "output": string    // Install command output
    }],
    "summary": { "total": number, "succeeded": number, "failed": number }
  }`,
    inputSchema: z.object({
      slugs: z.array(z.string().min(1))
        .min(1)
        .describe("Full skill slugs to install (e.g. [\"vercel/vercel-skills/nextjs\"])"),
      agents: z.array(z.string())
        .optional()
        .describe("Target agent(s). Auto-detected if omitted."),
    }),
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  async ({ slugs, agents }) => {
    try {
      let targetAgents: string[];
      if (agents && agents.length > 0) {
        targetAgents = agents;
      } else {
        const detected = await detectAgents();
        targetAgents = detected.length > 0 ? detected : ["claude-code"];
      }

      const results = await installCaptured(slugs, targetAgents);
      const succeeded = results.filter((r) => r.code === 0).length;

      const output = {
        results: results.map((r) => ({
          slug: r.slug,
          code: r.code,
          success: r.code === 0,
          output: r.output.trim(),
        })),
        summary: {
          total: results.length,
          succeeded,
          failed: results.length - succeeded,
        },
      };

      return {
        content: [{ type: "text" as const, text: JSON.stringify(output, null, 2) }],
        structuredContent: output,
      };
    } catch (error) {
      return {
        content: [{ type: "text" as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      };
    }
  },
);

// Tool 3: Status ─────────────────────────────────────────────────────────────

server.registerTool(
  "skillgrab_status",
  {
    title: "List Installed Skills",
    description: `List all skills currently installed for the specified AI agent(s), with registry cross-reference.

Args:
  - agents (string[]): Agent(s) to check. Auto-detected if omitted.

Returns JSON:
  {
    "agents": string[],    // Agents that were checked
    "skills": [{
      "name": string,       // Skill directory name
      "agents": string[],   // Which agents have this skill installed
      "inRegistry": boolean,
      "registrySlug": string | null,
      "installs": number
    }],
    "summary": { "total": number, "inRegistry": number, "custom": number }
  }`,
    inputSchema: z.object({
      agents: z.array(z.string())
        .optional()
        .describe("Agent(s) to check. Auto-detects if omitted."),
    }),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async ({ agents }) => {
    try {
      let targetAgents: string[];
      if (agents && agents.length > 0) {
        targetAgents = agents;
      } else {
        const detected = await detectAgents();
        targetAgents = detected.length > 0 ? detected : ["claude-code"];
      }

      const installed = await readInstalledSkills(targetAgents);

      if (installed.length === 0) {
        const output = { agents: targetAgents, skills: [], summary: { total: 0, inRegistry: 0, custom: 0 } };
        return {
          content: [{ type: "text" as const, text: JSON.stringify(output, null, 2) }],
          structuredContent: output,
        };
      }

      const byName = new Map<string, string[]>();
      for (const s of installed) {
        if (!byName.has(s.name)) byName.set(s.name, []);
        byName.get(s.name)!.push(s.agent);
      }

      const regInfo = await crossRef([...byName.keys()]);
      for (const [name, agentList] of byName.entries()) {
        regInfo.get(name)!.agents = agentList;
      }

      const skills = [...regInfo.values()].sort((a, b) => a.name.localeCompare(b.name));
      const inRegistry = skills.filter((s) => s.inRegistry).length;

      const output = {
        agents: targetAgents,
        skills: skills.map((s) => ({
          name: s.name,
          agents: s.agents,
          inRegistry: s.inRegistry,
          registrySlug: s.registrySlug,
          installs: s.installs,
        })),
        summary: {
          total: skills.length,
          inRegistry,
          custom: skills.length - inRegistry,
        },
      };

      return {
        content: [{ type: "text" as const, text: JSON.stringify(output, null, 2) }],
        structuredContent: output,
      };
    } catch (error) {
      return {
        content: [{ type: "text" as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      };
    }
  },
);

// ── Start ────────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
