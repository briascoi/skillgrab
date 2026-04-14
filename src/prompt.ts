import * as p from "@clack/prompts";
import type { ContextHint, SkillCandidate } from "./types.js";

export async function confirmAreas(hints: ContextHint[]): Promise<ContextHint[]> {
  if (hints.length === 0) return [];
  const selected = await p.multiselect({
    message: "We also noticed these non-code areas in your README. Include skills for them?",
    options: hints.map((h) => ({
      value: h.area,
      label: `${h.area}  ${formatMatches(h.matches)}`,
      hint: h.queries.slice(0, 3).join(", "),
    })),
    required: false,
    initialValues: hints.map((h) => h.area),
  });
  if (p.isCancel(selected)) return [];
  const set = new Set(selected as string[]);
  return hints.filter((h) => set.has(h.area));
}

function formatMatches(m: string[]): string {
  if (!m.length) return "";
  return `(${m.slice(0, 3).join(", ")})`;
}

export async function pickSkills(candidates: SkillCandidate[]): Promise<SkillCandidate[]> {
  if (candidates.length === 0) return [];
  const selected = await p.multiselect({
    message: `Select skills to install (${candidates.length} suggested, all pre-selected):`,
    options: candidates.map((c) => ({
      value: c.slug,
      label: `${c.trusted ? "★ " : "  "}${c.slug}`,
      hint: `${c.reason} · ${formatInstalls(c.installs)}`,
    })),
    required: false,
    initialValues: candidates.map((c) => c.slug),
  });
  if (p.isCancel(selected)) return [];
  const set = new Set(selected as string[]);
  return candidates.filter((c) => set.has(c.slug));
}

function formatInstalls(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k installs`;
  return `${n} installs`;
}
