<div align="center">

<br />

<img width="60" src="https://raw.githubusercontent.com/briascoi/skillgrab/main/landing/icon.svg" alt="skillgrab" />

# skillgrab

**One command. The right AI skills for your project.**

[![npm version](https://img.shields.io/npm/v/skillgrab.svg?color=6366f1&labelColor=0f172a&label=npm)](https://www.npmjs.com/package/skillgrab)
[![npm downloads](https://img.shields.io/npm/dw/skillgrab.svg?color=10b981&labelColor=0f172a&label=weekly)](https://www.npmjs.com/package/skillgrab)
[![license](https://img.shields.io/npm/l/skillgrab.svg?color=64748b&labelColor=0f172a)](./LICENSE)
[![node](https://img.shields.io/node/v/skillgrab.svg?color=64748b&labelColor=0f172a)](https://nodejs.org)

<br />

```bash
npx skillgrab
```

skillgrab scans your project, detects your stack — frontend, backend, mobile, infra, marketing — and installs the right AI agent skills from [skills.sh](https://skills.sh) in one command. Works with Claude Code, Cursor, Cline, Codex, and 40+ other agents.

<br />

<a href="https://briascoi.github.io/skillgrab/">🌐 Landing page</a>
&nbsp;·&nbsp;
<a href="https://www.npmjs.com/package/skillgrab">📦 npm</a>
&nbsp;·&nbsp;
<a href="./CHANGELOG.md">📋 Changelog</a>

<br />

</div>

---

## What it does

```
$ npx skillgrab

  skillgrab v0.5.0

▸ Tech signals
  next.js            package.json → next
  tailwind           package.json → tailwindcss
  supabase           package.json → @supabase/supabase-js
  stripe             package.json → stripe
  clerk              package.json → @clerk/nextjs

▸ Install plan
  ★ vercel-labs/agent-skills/find-skills          ← next.js    12.9k installs
  ★ supabase/agent-skills/supabase-best-practices ← supabase   30.2k installs
  ★ stripe/ai/stripe-best-practices               ← stripe      5.1k installs
  ★ clerk/skills/clerk-nextjs-patterns            ← clerk       8.4k installs

▸ Detected agents: claude-code, cursor

  Installing to: claude-code, cursor
  ✔ Installed 4 skills.
```

skills.sh has 90,000+ skills. Picking the right ones manually is tedious. skillgrab reads your `package.json`, `requirements.txt`, `Dockerfile`, and README, ranks by trust + popularity, validates against GitHub, and installs — all without any setup.

---

## Commands

### `npx skillgrab` — install skills for your project

```bash
npx skillgrab                        # scan, confirm, install
npx skillgrab --dry-run              # preview, don't install
npx skillgrab --only-trusted         # trusted owners only (anthropics, vercel, supabase…)
npx skillgrab --agent cursor         # target a specific agent
npx skillgrab --agent claude-code,cursor,cline   # multi-agent
npx skillgrab --yes                  # skip prompts
npx skillgrab --json                 # output plan as JSON
```

### `npx skillgrab status` — see what you have installed

```
$ npx skillgrab status

▸ Installed skills (claude-code, cursor)

  skill                          agents        registry    installs
  ─────────────────────────────────────────────────────────────────
  find-skills                    claude-code   ✔ found     12.9k
  supabase-best-practices        claude-code   ✔ found     30.2k
  stripe-best-practices          claude-code   ✔ found      5.1k
  my-custom-workflow             claude-code   – missing   –

  ✔ 3 of 4 skills found in registry.
  Run `npx skillgrab update` to reinstall / refresh all skills.
```

Cross-references every installed skill against the live registry. Shows which are outdated or custom-only.

### `npx skillgrab update` — refresh installed skills

```bash
npx skillgrab update                 # reinstall all registry-tracked skills
npx skillgrab update --only-trusted  # restrict to trusted owners
npx skillgrab update --agent cursor  # update for a specific agent
npx skillgrab update --yes           # skip confirmation
```

Pulls the latest version of every skill from GitHub. Supports all the same flags as install.

---

## How it works

```
  project dir
       │
       ▼
  scan files ──── package.json, requirements.txt,
                  pubspec.yaml, go.mod, Dockerfile,
                  Gemfile, composer.json, README…
       │
       ▼
  detect signals (35+ stack detectors)
       │
       ▼
  query skills.sh /api/search (live)
       │
       ▼
  rank: trusted-owner boost + log₁₀(installs)
       │
       ▼
  validate: GitHub Trees API (drop stale slugs)
       │
       ▼
  interactive multi-select
       │
       ▼
  npx skills add — grouped by repo, --skill flags,
  one clone per repo, installs to all detected agents
```

---

## Multi-agent

skillgrab auto-detects installed agents by probing their config dirs (`~/.claude`, `~/.cursor`, `~/.cline`, etc.) and installs skills to **all of them at once**.

<table>
<tr>
<td><b>Claude Code</b></td><td>Cursor</td><td>Cline</td><td>Codex</td>
</tr>
<tr>
<td>Continue</td><td>Gemini CLI</td><td>Warp</td><td>Windsurf</td>
</tr>
<tr>
<td>GitHub Copilot</td><td>Roo</td><td>OpenCode</td><td>Goose</td>
</tr>
<tr>
<td>Aider</td><td>Amp</td><td>Qwen Code</td><td>Kilo · Replit · Trae · …</td>
</tr>
</table>

Override with `--agent <list>` or `SKILLGRAB_AGENT` env var.

---

## Supported stacks

<details>
<summary><b>JavaScript / TypeScript</b></summary>

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

Flutter (pubspec.yaml) · Swift (Package.swift, .xcodeproj) · Android / Kotlin (Gradle)
</details>

<details>
<summary><b>Backend</b></summary>

Go (go.mod) · Rust (Cargo.toml) · Ruby + Rails (Gemfile) · PHP + Laravel (composer.json) · Java / JVM (pom.xml, build.gradle) · Elixir / Phoenix (mix.exs)
</details>

<details>
<summary><b>Infra / CI</b></summary>

Docker · docker-compose · Vercel · Netlify · Fly.io · Render · Cloudflare Workers · Serverless · Terraform · GitHub Actions
</details>

<details>
<summary><b>Non-code (detected from README)</b></summary>

Marketing · Copywriting · SEO · Design · Figma · Branding · Product management · Sales · Outreach · Operations · Analytics · Content strategy · Social
</details>

---

## Security

Skills are `SKILL.md` files that execute with **full agent tool permissions** — they can read/write files, run shell commands, and make network calls. Treat a skill like an npm dependency: vet before you install.

| What skillgrab does | |
|---|---|
| **Trusted-owner ranking (★)** | Skills from anthropics, vercel, vercel-labs, supabase, stripe, clerk, openai, microsoft, github, google, cloudflare, apify, openclaudia are boosted and marked ★ |
| **`--only-trusted` flag** | Restricts the plan to the allowlist above, drops everything else |
| **GitHub validation** | Every candidate's `skillId/SKILL.md` verified to exist before presenting — no stale or typosquatted entries |
| **Interactive multi-select** | Nothing installs until you confirm each skill |
| **`--dry-run`** | Full plan preview, zero side effects |

```bash
# Recommended for production / untrusted projects
npx skillgrab --only-trusted --dry-run   # preview trusted skills only
npx skillgrab --only-trusted             # install trusted skills only
```

---

## vs. the alternatives

| | skillgrab | `npx skills find` | `npx skills add` manually |
|---|:---:|:---:|:---:|
| Auto-detects your stack | ✅ | ❌ | ❌ |
| Reads README for non-code needs | ✅ | ❌ | ❌ |
| Validates against GitHub | ✅ | ❌ | ❌ |
| Dedupes by skill name | ✅ | ❌ | ❌ |
| Installs to all agents at once | ✅ | ❌ | ❌ |
| `status` + `update` subcommands | ✅ | ❌ | ❌ |
| Zero config | ✅ | partial | ❌ |

---

## MCP server

skillgrab exposes itself as an [MCP](https://modelcontextprotocol.io) server so Claude Desktop, Cursor, Cline, and other MCP-compatible agents can invoke it directly from chat — no terminal needed.

**Tools exposed:**
- `skillgrab_recommend` — scan a project and return a skill plan (read-only)
- `skillgrab_install` — install a list of skills into target agent(s)
- `skillgrab_status` — list installed skills with registry cross-reference

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "skillgrab": {
      "command": "npx",
      "args": ["skillgrab-mcp"]
    }
  }
}
```

**Cursor** (`.cursor/mcp.json` or Settings → MCP):
```json
{
  "mcpServers": {
    "skillgrab": {
      "command": "npx",
      "args": ["skillgrab-mcp"]
    }
  }
}
```

Once configured, ask your agent: *"What skills should I install for this project?"* — it will call `skillgrab_recommend`, show you the plan, and install on confirmation.

---

## Environment

| Var | Purpose |
|---|---|
| `SKILLGRAB_AGENT` | Default agent(s), comma-separated. Overridden by `--agent`. |
| `AUTOSKILLS_REGISTRY` | Override skills.sh base URL (for testing) |
| `GITHUB_TOKEN` | Bypass the 60/hr unauth GitHub API rate limit on validation |

---

## Development

```bash
git clone https://github.com/briascoi/skillgrab
cd skillgrab
npm install
npm run build
node dist/cli.js --dry-run
```

Stack detectors live in `src/detect/`. Add a file there and wire it into `src/detect/index.ts` to add a new stack.

---

## Contributing

PRs welcome — especially new stack detectors. Open an issue first for anything substantial.

---

<div align="center">

[MIT](./LICENSE) · built by [Ismael Briasco](https://github.com/briascoi) · [@briascoi](https://github.com/briascoi)

</div>
