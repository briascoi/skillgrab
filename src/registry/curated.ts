// Intentionally empty. We no longer use hardcoded/guessed slugs because
// skills.sh installs by cloning github.com/<slug>, so a wrong slug fails.
// The live API (`/api/search`) is the source of truth.
export const CURATED: Record<string, string[]> = {};
export function curatedFor(_query: string): string[] {
  return [];
}
