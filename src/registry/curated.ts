/**
 * Fallback map: when live search fails or returns nothing, try these.
 * Slugs follow skills.sh convention: <owner>/<repo>[/<skill>].
 * These are conservative guesses — the live search is preferred.
 */
export const CURATED: Record<string, string[]> = {
  react: ["vercel-labs/agent-skills"],
  "next.js": ["vercel-labs/agent-skills"],
  nextjs: ["vercel-labs/agent-skills"],
  tailwind: ["vercel-labs/agent-skills"],
  vercel: ["vercel-labs/agent-skills"],
  typescript: ["vercel-labs/agent-skills"],
  supabase: ["supabase/skills"],
  stripe: ["stripe/skills"],
  anthropic: ["anthropics/skills"],
  "claude api": ["anthropics/skills"],
  marketing: ["growth/skills"],
  seo: ["growth/skills"],
  "programmatic seo": ["growth/skills"],
  design: ["design/skills"],
  figma: ["design/skills"],
  "product management": ["product/skills"],
  sales: ["sales/skills"],
  outreach: ["sales/skills"],
  analytics: ["analytics/skills"],
};

export function curatedFor(query: string): string[] {
  return CURATED[query.toLowerCase()] ?? [];
}
