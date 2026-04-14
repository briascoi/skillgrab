export type Signal = {
  /** Short key, e.g. "react", "next.js", "tailwind". */
  key: string;
  /** Why this was detected, e.g. "package.json deps: react". */
  reason: string;
  /** Search query(ies) to run against the registry. */
  queries: string[];
};

export type ContextHint = {
  /** Broad non-code category, e.g. "marketing", "design", "product". */
  area: string;
  /** Keywords that triggered this hint (from README, etc.). */
  matches: string[];
  /** Search queries for the registry if the user accepts. */
  queries: string[];
};

export type DetectResult = {
  signals: Signal[];
  hints: ContextHint[];
};

export type SkillCandidate = {
  /** skills.sh slug, e.g. "vercel-labs/agent-skills/find-skills". */
  slug: string;
  /** Final skill name (last path segment). Used for dedupe. */
  skillName: string;
  /** Install count from skills.sh. */
  installs: number;
  /** Whether the source owner is in our trusted list. */
  trusted: boolean;
  /** Why we picked it: originating signal or hint key. */
  reason: string;
};
