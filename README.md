# skillgrab

One command. The right AI skills for your project.

```bash
npx skillgrab
```

`skillgrab` scans your project, detects your stack (frontend, backend, mobile, infra, plus non-code needs like marketing and design), and installs matching skills from [skills.sh](https://skills.sh).

## Usage

```bash
npx skillgrab             # scan, confirm, install
npx skillgrab --dry-run   # show what would be installed, don't install
npx skillgrab --yes       # skip confirmation prompts
npx skillgrab --json      # emit detection + plan as JSON
```

Also available as `npx autoskills` (alias bin).

## What it detects

- **JS/TS** — `package.json` deps: React, Next.js, Vue, Nuxt, Svelte, Astro, Remix, Solid, Tailwind, Express, Fastify, Hono, tRPC, Prisma, Drizzle, Supabase, Firebase, Stripe, Clerk, OpenAI, Anthropic, Vercel AI SDK, LangChain, React Native, Expo, Electron, Vitest, Jest, Playwright, Cypress…
- **Python** — `requirements.txt` / `pyproject.toml` / `Pipfile`: Django, Flask, FastAPI, Pandas, NumPy, PyTorch, TensorFlow, LangChain, Celery, SQLAlchemy…
- **Mobile** — `pubspec.yaml` (Flutter), `Package.swift`, Gradle, Xcode project.
- **Backend** — `go.mod`, `Cargo.toml`, `Gemfile` (+ Rails), `composer.json` (+ Laravel), `pom.xml`, `mix.exs`.
- **Infra** — `Dockerfile`, `vercel.json`, `netlify.toml`, `fly.toml`, `wrangler.toml`, `serverless.yml`, Terraform, GitHub Actions.
- **Context hints** — scans README + `docs/` for keywords to suggest non-code skills: marketing, SEO, design, product, sales, ops, analytics, content. Confirms with you before including them.

## How it works

1. **Scan** — parallel file probes in the current directory.
2. **Suggest** — for each detected signal, queries `skills.sh/search` live (JSON probe → HTML fallback → small curated fallback).
3. **Install** — runs `npx skills add <owner/repo>` per matching package.

## Development

```bash
npm install
npm run build
node dist/cli.js --dry-run
```

## Environment

- `AUTOSKILLS_REGISTRY` — override the skills.sh base URL (for testing).

## License

MIT
