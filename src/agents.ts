import { stat } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

/**
 * Known agents + the config directories we use to detect their presence.
 * Names match what `npx skills add --agent <name>` accepts.
 */
const AGENT_PROBES: Array<{ name: string; paths: string[] }> = [
  { name: "claude-code", paths: [".claude"] },
  { name: "cursor", paths: [".cursor"] },
  { name: "cline", paths: [".cline", ".config/cline"] },
  { name: "codex", paths: [".codex"] },
  { name: "continue", paths: [".continue"] },
  { name: "gemini-cli", paths: [".gemini-cli", ".gemini"] },
  { name: "warp", paths: [".warp"] },
  { name: "windsurf", paths: [".codeium/windsurf"] },
  { name: "github-copilot", paths: [".github-copilot"] },
  { name: "roo", paths: [".roo"] },
  { name: "opencode", paths: [".opencode"] },
  { name: "goose", paths: [".goose"] },
  { name: "aider", paths: [".aider"] },
  { name: "amp", paths: [".amp"] },
  { name: "qwen-code", paths: [".qwen-code"] },
  { name: "kilo", paths: [".kilo"] },
  { name: "zencoder", paths: [".zencoder"] },
  { name: "augment", paths: [".augment"] },
  { name: "replit", paths: [".replit"] },
  { name: "trae", paths: [".trae"] },
];

async function exists(p: string): Promise<boolean> {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

export async function detectAgents(): Promise<string[]> {
  const home = homedir();
  const found: string[] = [];
  await Promise.all(
    AGENT_PROBES.map(async ({ name, paths }) => {
      for (const p of paths) {
        if (await exists(join(home, p))) {
          found.push(name);
          return;
        }
      }
    }),
  );
  return found;
}

export const KNOWN_AGENT_NAMES = AGENT_PROBES.map((a) => a.name);
