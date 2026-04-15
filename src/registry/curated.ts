/**
 * Curated skill packs injected into the plan alongside registry results.
 * These are validated via the GitHub Trees API like any other candidate,
 * so stale slugs are dropped before the user sees them.
 */

// Skills that apply to any TypeScript / JavaScript project.
const TS_ESSENTIALS = [
  "briascoi/skillgrab-essentials/coding-style",
  "briascoi/skillgrab-essentials/code-review",
  "briascoi/skillgrab-essentials/test-patterns",
  "briascoi/skillgrab-essentials/ship-checklist",
];

const TS_SIGNALS = new Set([
  "typescript", "javascript", "react", "next.js", "vue", "nuxt", "angular",
  "svelte", "astro", "remix", "solid", "express", "fastify", "hono", "trpc",
  "prisma", "drizzle", "node",
]);

/**
 * Return curated slugs for a detected signal key.
 * Returns [] when no curated pack applies.
 */
export function curatedFor(signalKey: string): string[] {
  if (TS_SIGNALS.has(signalKey.toLowerCase())) return TS_ESSENTIALS;
  return [];
}
