# skillgrab

**One command. The right AI skills for your project.**

[![npm version](https://img.shields.io/npm/v/skillgrab.svg?color=blue)](https://www.npmjs.com/package/skillgrab)
[![npm downloads](https://img.shields.io/npm/dw/skillgrab.svg?color=green)](https://www.npmjs.com/package/skillgrab)
[![license](https://img.shields.io/npm/l/skillgrab.svg)](./LICENSE)
[![node](https://img.shields.io/node/v/skillgrab.svg)](https://nodejs.org)
[![stars](https://img.shields.io/github/stars/briascoi/skillgrab?style=social)](https://github.com/briascoi/skillgrab)

```bash
npx skillgrab
```

Zero config. `skillgrab` scans your project, detects your stack — frontend, backend, mobile, infra, plus non-code needs like marketing and design — and installs matching AI agent skills from [skills.sh](https://skills.sh) in one command.

**Landing:** https://briascoi.github.io/skillgrab/

![demo](./landing/demo.gif)

## Why skillgrab

skills.sh has 90,000+ skills. Picking the right ones for your project is manual and error-prone — you end up with a bloated `~/.claude/skills` or nothing at all. skillgrab reads your `package.json`, `requirements.txt`, `Dockerfile`, and README, then installs only what fits.

## Usage

```bash
npx skillgrab             # scan, confirm, install
npx skillgrab --dry-run   # show what would be installed, don't install
npx skillgrab --yes       # skip confirmation prompts
npx skillgrab --json      # emit detection + plan as JSON
npx skillgrab --help      # show all flags
```

Also available as `npx autoskills` (alias bin).

### Environment

| Var | Default | Purpose |
|---|---|---|
| `SKILLGRAB_AGENT` | `claude-code` | Target agent for install (see `npx skills add --help`) |
| `AUTOSKILLS_REGISTRY` | `https://skills.sh` | Override registry base URL (testing) |
| `GITHUB_TOKEN` | unset | Bypasses 60/hr unauth limit on the validation step |

## How it works

```
 project dir  ─┬─ scan files ──────────┐
               │  package.json, reqs,  │
               │  pubspec, go.mod,     │
               │  Dockerfile, README…  │
               └─────────┬─────────────┘
                         ▼
                   detect signals
                         │
                         ▼
           skills.sh /api/search (live)
                         │
                         ▼
        rank + dedupe + trusted boost
                         │
                         ▼
         GitHub trees API validation
         (drop stale/nonexistent slugs)
                         │
                         ▼
          interactive multi-select
                         │
                         ▼
         npx skills add (grouped by repo,
           one clone per repo, --skill flags)
```

1. **Scan** — parallel file probes in the current directory.
2. **Search** — queries `skills.sh/api/search` for each signal.
3. **Rank** — score = trusted-owner boost (anthropics, vercel, supabase, stripe, clerk, openai, microsoft, google, …) + log10(installs).
4. **Dedupe** — one skill per name (avoids overwrites in `~/.claude/skills/`).
5. **Validate** — HEAD GitHub trees API to drop stale entries the search returns.
6. **Install** — groups by source repo, one clone per repo, `--skill` flags.

## Supported stacks

<details>
<summary><b>JavaScript / TypeScript</b> (click to expand)</summary>

React · Next.js · Vue · Nuxt · Angular · Svelte · SvelteKit · Astro · Remix · Solid
· Tailwind · Chakra · MUI · styled-components
· TypeScript · Express · Fastify · Hono · tRPC
· Prisma · Drizzle · Supabase · Firebase · MongoDB · Redis
· Clerk · Auth.js / NextAuth · Stripe
· OpenAI · Anthropic · Vercel AI SDK · LangChain
· React Native · Expo · Electron
· Vitest · Jest · Playwright · Cypress
</details>

<details>
<summary><b>Python</b></summary>

Django · Flask · FastAPI · Starlette · Pandas · NumPy · PyTorch · TensorFlow · LangChain · OpenAI · Anthropic · Celery · SQLAlchemy · pytest
</details>

<details>
<summary><b>Mobile</b></summary>

Flutter (`pubspec.yaml`) · Swift (`Package.swift`, `.xcodeproj`) · Android / Kotlin (Gradle)
</details>

<details>
<summary><b>Backend</b></summary>

Go (`go.mod`) · Rust (`Cargo.toml`) · Ruby + Rails (`Gemfile`) · PHP + Laravel (`composer.json`) · Java / JVM (`pom.xml`, `build.gradle`) · Elixir / Phoenix (`mix.exs`)
</details>

<details>
<summary><b>Infra / CI</b></summary>

Docker · docker-compose · Vercel · Netlify · Fly.io · Render · Cloudflare Workers · Serverless · Terraform · GitHub Actions
</details>

<details>
<summary><b>Non-code (detected from README/docs)</b></summary>

Marketing · Copywriting · SEO · Design · Figma · Branding · Product management · Sales · Outreach · Operations · Analytics · Content strategy · Social
</details>

## Alternatives

| | skillgrab | `npx skills find` | `npx skills add` manually |
|---|---|---|---|
| Detects your stack | ✅ | ❌ | ❌ |
| Reads README for non-code needs | ✅ | ❌ | ❌ |
| Validates against GitHub before install | ✅ | ❌ | ❌ |
| Dedupes by skill name | ✅ | ❌ | ❌ |
| One command, zero config | ✅ | partial | ❌ |
| Works alongside `npx skills` | uses it | — | — |

## Security

Skills are `SKILL.md` files that execute with **full agent tool permissions** — they can read/write files, run shell commands, and make network calls through whatever agent loads them (Claude Code, Cursor, etc.). Treat a skill like an npm dependency: vet before you install.

What skillgrab does to reduce surface area:

- **Trusted-owner ranking (★)** — skills from anthropics, vercel, vercel-labs, supabase, stripe, clerk, openai, microsoft, github, google, googleworkspace, cloudflare, apify, and openclaudia are boosted in the plan and marked with a star.
- **`--only-trusted` flag** — restricts the install plan to the trusted allowlist above. Drops everything else.
- **GitHub Trees validation** — each candidate's `<skillId>/SKILL.md` path is verified to actually exist before presenting, so typosquatted or fuzzy-match results from skills.sh's search don't leak into the plan.
- **Interactive multi-select** — every skill is shown as `owner/repo/skill` and pre-selected; nothing runs until you confirm.
- **`--dry-run`** — previews the full plan with zero side effects.

What skillgrab does **not** do (yet):

- Scan `SKILL.md` content for prompt-injection patterns. Content-level safety is an open problem for every agent-skill ecosystem; I'd rather ship the flag above than a false sense of security.
- Cryptographically verify skills. No signatures exist in the ecosystem today.

Recommended defaults for production / untrusted projects:

```bash
npx skillgrab --only-trusted --dry-run    # preview only trusted skills
npx skillgrab --only-trusted              # install only trusted skills
```

If you find an actively malicious skill on skills.sh, report it to them and open an issue here so I can consider adding owner-level blocklisting.

## Development

```bash
git clone https://github.com/briascoi/skillgrab
cd skillgrab
npm install
npm run build
node dist/cli.js --dry-run
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).

## Contributing

PRs welcome — especially new stack detectors. Add a file under `src/detect/` and reference it from `src/detect/index.ts`.

## License

[MIT](./LICENSE) · built by [Ismael Briasco](https://github.com/briascoi) (@briascoi)
