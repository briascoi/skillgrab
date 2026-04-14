import * as p from "@clack/prompts";
import type { ContextHint } from "./types.js";

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

export async function finalConfirm(count: number): Promise<boolean> {
  const ok = await p.confirm({
    message: `Install ${count} skill${count === 1 ? "" : "s"} now?`,
    initialValue: true,
  });
  return ok === true;
}
