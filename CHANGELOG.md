# Changelog

All notable changes to this project will be documented in this file. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.4.0] — 2026-04-15

### Added
- **Multi-agent support with auto-detection.** skillgrab now probes `~/.claude`, `~/.cursor`, `~/.cline`, `~/.codex`, `~/.continue`, `~/.gemini-cli`, `~/.warp`, `~/.codeium/windsurf`, and ~15 other agent config dirs, then installs each matched skill to every detected agent.
- **`--agent` / `-a` flag** — explicit override, comma-separated: `--agent cursor` or `--agent claude-code,cursor,cline`.
- `SKILLGRAB_AGENT` env var now accepts comma-separated list.
- CLI shows "Detected agents: …" before building the plan when auto-detection kicks in.

### Changed
- Default behavior: if no `--agent` flag and no env var, skillgrab **auto-detects** installed agents. Falls back to `claude-code` only if none found. Previous behavior was always `claude-code`.

### Why
Multiple users asked whether skillgrab was Claude Code-only. Under the hood it was always multi-agent (via `npx skills add --agent`), but the default was `claude-code` and the flag wasn't exposed. Now it JFW.

## [0.3.0] — 2026-04-15

### Added
- **`--only-trusted` / `-t` flag** — restricts the install plan to skills from an allowlist of trusted owners: anthropics, vercel, vercel-labs, supabase, stripe, clerk, openai, microsoft, github, google, googleworkspace, cloudflare, apify, openclaudia. Drops everything else before presenting the plan.
- **README "Security" section** — documents the threat model (SKILL.md files run with full agent permissions), what skillgrab does to reduce surface area, and what it doesn't do yet.
- Help text now explicitly mentions the security note and points to `--only-trusted`.

### Why
After community feedback on Reddit raising (fairly) that blind install from a community registry is a risk vector, added an explicit lever to lock down to known-good sources. Content-level scanning is deferred — it's an unsolved problem ecosystem-wide.

## [0.2.3] — 2026-04-15

### Added
- **GitHub validation step** before install. skills.sh sometimes returns `skillId` values that don't exist in the actual repo (stale / fuzzy matches). skillgrab now fetches the repo tree via GitHub API and drops candidates whose `<skillId>/SKILL.md` is missing. Detects plugin-nested structures like `<plugin>/skills/<id>/SKILL.md` (e.g. `anthropics/knowledge-work-plugins`).
- Honors `GITHUB_TOKEN` env var to bypass 60/hr unauth limit.

### Changed
- Install step now shows "Verifying skills exist on GitHub" progress and reports dropped stale entries.

## [0.2.2] — 2026-04-15

### Fixed
- The `skills` CLI does not accept `--skill a,b,c` (comma-separated) — it treats it as one literal name. Now passes repeated `--skill` flags per skill, so multiple skills from one repo install correctly with a single clone.

## [0.2.1] — 2026-04-15

### Fixed
- Pass `owner/repo` as the source and `--skill <skillId>` as a flag, instead of the full `owner/repo/skillId` slug as source. Previous version caused "No skills found" because the installer cloned the repo and looked for `SKILL.md` at root.
- Added `--agent claude-code` default (configurable via `SKILLGRAB_AGENT`) so the installer doesn't flood stdout with EACCES errors from ~40 unrelated agent directories.

## [0.2.0] — 2026-04-14

### Added
- **Ranking** — trusted-owner boost + `log10(installs)` score. Trusted owners marked with ★ in the plan: anthropics, vercel, vercel-labs, supabase, stripe, clerk, openai, microsoft, github, google, googleworkspace, cloudflare, apify, openclaudia.
- **Dedupe by final skill name** across queries (keeps highest-scored) — prevents two `copywriting` skills from different repos overwriting each other.
- **Interactive multi-select picker** at the final step — all skills pre-selected; user can uncheck before installing.
- Plan table shows ★ trusted badge and install count.

### Changed
- 1 skill per query (was 2) to reduce noise.

## [0.1.1] — 2026-04-14

### Fixed
- skills.sh is a Next.js SPA; the rendered HTML doesn't contain skill slugs. Switched from HTML scraping to the live `/api/search` JSON endpoint.
- Removed the guessed/curated slug fallback — returning non-existent `owner/repo` slugs caused `npx skills add` to fail with git clone errors. Now we return `[]` on API failure instead of fabricated slugs.
- Pass `--yes --global` to the `skills` installer so it doesn't block on sub-prompts.

## [0.1.0] — 2026-04-14

### Added
- Initial release.
- Zero-config CLI `npx skillgrab` (alias `npx autoskills`) that scans any project and installs matching skills from skills.sh.
- Detectors for JS/TS, Python, mobile (Flutter/iOS/Android), backend (Go/Rust/Ruby/PHP/Java/Elixir), and infra (Docker/Vercel/Netlify/Fly/Cloudflare/Terraform/GH Actions).
- README-based context hints for non-code needs: marketing, SEO, design, product, sales, ops, analytics, content.
- Flags: `--dry-run`, `--yes`, `--json`, `--help`, `--version`.
- Bilingual (EN/ES) static landing page at [briascoi.github.io/skillgrab](https://briascoi.github.io/skillgrab/).
