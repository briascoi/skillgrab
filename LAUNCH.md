# skillgrab — launch kit

Todo lo que necesitás para difundir el lanzamiento. Copy listo, links directos.

**URLs oficiales:**
- Landing: https://briascoi.github.io/skillgrab/
- npm: https://www.npmjs.com/package/skillgrab
- GitHub: https://github.com/briascoi/skillgrab
- Autor: Ismael Briasco (@briascoi)

---

## 1. Show HN (Hacker News) — **máxima prioridad**

**Mejor momento**: martes/miércoles/jueves, 8-10 AM ET (13-15 UTC).

**Submit:** https://news.ycombinator.com/submit

**Title** (máx 80 chars, sin emojis, sin "awesome/introducing"):
```
Show HN: Skillgrab – scan any project, auto-install matching AI skills
```

**URL:** `https://briascoi.github.io/skillgrab/`

**First comment** (postealo vos mismo 2 min después de submit):
```
Hi HN — I built this because every time I start a new project I end up manually hunting skills from skills.sh that match my stack. Skillgrab just scans your project (package.json, requirements.txt, pubspec.yaml, Dockerfile, etc.) and runs `npx skills add` for the matching ones. It also scans the README for non-code hints like "landing page", "pricing", "SEO" and suggests marketing/design/sales skills.

Key tradeoffs:
- Live query to skills.sh API (not a bundled list) so results stay fresh
- Validates each candidate against GitHub trees API before installing, to drop stale entries the search API sometimes returns
- Dedupes by skill name (avoids two copywriting skills overwriting each other in ~/.claude/skills/)
- Prefers trusted owners (anthropics, vercel, supabase, stripe, …) when ranking

Feedback welcome, especially on detection heuristics for non-JS stacks.
```

---

## 2. Product Hunt

**Submit:** https://www.producthunt.com/posts/new

- **Scheduling**: planificá el launch un martes o miércoles, 12:01 AM PT (horario de mayor tráfico).
- **Tagline** (60 chars): `One command to install AI skills that match your project`
- **Topics/tags**: Developer Tools, Artificial Intelligence, Open Source, CLI
- **Galería**: 3-5 screenshots del CLI en acción (toma del demo terminal de la landing).

**Description**:
```
Skillgrab scans your codebase — package.json, requirements.txt, pubspec.yaml, Dockerfile, even your README — detects your stack, and auto-installs the matching skills from skills.sh with one command:

  npx skillgrab

No config. Works with React, Next.js, Vue, Svelte, Tailwind, Python, Django, FastAPI, Go, Rails, Laravel, React Native, Flutter, Supabase, Stripe, and dozens more. Detects non-code needs too — marketing, design, SEO, sales — so your AI agent comes loaded with the right context for any project.

Built by @briascoi · MIT licensed.
```

**Maker comment** (primer comment):
Same as HN first comment, slightly adapted.

---

## 3. Reddit

Posteá en 3-4 subs a lo largo de 2-3 días (no todos el mismo día, Reddit lo detecta como spam):

| Subreddit | Título |
|---|---|
| r/ClaudeAI | `I built a CLI that scans your project and auto-installs matching skills for Claude Code` |
| r/LocalLLaMA | `skillgrab: detect your stack, auto-install matching AI agent skills (open source)` |
| r/javascript | `Made a tool that scans package.json and auto-installs AI skills for Claude/Cursor` |
| r/webdev | `Stop configuring AI tools manually — skillgrab detects your stack in one command` |
| r/SideProject | `Launched skillgrab — one npx command to install AI skills that match your project` |
| r/opensource | `skillgrab (MIT) — zero-config AI skill installer` |

**Body template** (adaptá por sub):
```
Hey, I built this small open-source tool over the weekend.

The problem: skills.sh has 90k+ AI agent skills but picking the right ones per project is manual and slow. You end up with a bloated ~/.claude/skills or nothing at all.

What skillgrab does:
1. Scans your project files (package.json, requirements.txt, pubspec.yaml, Gemfile, go.mod, Dockerfile, vercel.json…) to detect your stack
2. Scans your README for non-code hints (landing page, pricing, SEO, waitlist) and asks you if you want marketing/design/sales skills
3. Queries skills.sh live, ranks by trusted owners + installs, dedupes by skill name
4. Validates each candidate against GitHub before installing (the skills.sh search API sometimes returns stale slugs)
5. Runs `npx skills add` for each matched skill

Single command, zero config:

  npx skillgrab

Landing: https://briascoi.github.io/skillgrab/
Code: https://github.com/briascoi/skillgrab
npm: https://www.npmjs.com/package/skillgrab

Would love feedback — especially on detection heuristics for stacks I don't have fixtures for yet.
```

---

## 4. Twitter/X

**Tweet principal** (tu cuenta @briascoi):
```
I built skillgrab — scans any project and auto-installs matching AI skills from skills.sh with one command.

  npx skillgrab

Works with React, Next.js, Python, Django, Flutter, Go, Rails, Supabase, Stripe + marketing/design/SEO skills too.

Demo + free → briascoi.github.io/skillgrab
```

**Thread follow-ups** (3-4 tweets):
```
2/ The problem: skills.sh has 90k+ skills for AI agents. Picking the right ones for your project is slow. You end up with ~/.claude/skills full of noise — or empty.

3/ skillgrab scans your package.json, requirements.txt, pubspec.yaml, go.mod, Dockerfile, vercel.json → detects your stack → queries skills.sh → validates each candidate against GitHub → installs.

4/ It also reads your README for non-code hints ("landing page", "pricing", "waitlist") and asks if you want marketing/design/sales skills. One step, zero config.

5/ Open source, MIT. PRs welcome for more stack detectors.

github.com/briascoi/skillgrab
```

**Quote-tweet targets** — busca tweets recientes de estas cuentas para responder con skillgrab:
- @AnthropicAI (cuando postean sobre Claude Code)
- @skills_sh / quien lleve skills.sh
- @vercel (en hilos sobre dev tooling)
- @simonw (dev influencer que cubre CLI tools)

---

## 5. LinkedIn

**Post** (en tu perfil):
```
Fin de semana: construí skillgrab 🛠️

Un CLI open-source que escanea cualquier proyecto (JS, Python, Go, mobile, etc.) y auto-instala las skills de IA que matchean con tu stack desde skills.sh. Sin configuración.

  npx skillgrab

Detecta también necesidades no técnicas (marketing, diseño, SEO, ventas) desde tu README.

Landing + demo: briascoi.github.io/skillgrab
Código (MIT): github.com/briascoi/skillgrab

Hecho con TypeScript, clack/prompts y una pizca de scraping a la API de skills.sh. Feedback bienvenido.

#AI #DevTools #OpenSource #ClaudeAI
```

Publicá también en **LinkedIn groups**: Developer Community, AI Builders, Node.js Developers.

---

## 6. Dev.to / Hashnode / Medium

Escribí 1 post técnico que capitalice para SEO de larga cola. Título sugerido:

> **"How I built skillgrab: auto-detecting stacks across JS, Python, Go, mobile and infra to install AI agent skills in one command"**

Cubre en 600-900 palabras: el problema, la arquitectura (detectors → live search → GitHub validation → install), 2-3 gotchas reales (ej. `--skill` no acepta coma-separado, skills.sh devuelve slugs que no existen). Termina con llamado a PRs y link a npm.

**Submit a:**
- https://dev.to/new
- https://hashnode.com/create/story
- https://medium.com/new-story

---

## 7. Newsletters / aggregators (envío único)

Los más efectivos para CLIs dev:

| Newsletter | URL para enviar | Audiencia |
|---|---|---|
| **Node Weekly** | https://cooperpress.com/publications/node-weekly/ → form de submit al final | Node devs |
| **JavaScript Weekly** | https://cooperpress.com/publications/javascript-weekly/ | JS devs, ~120k subs |
| **TLDR Newsletter** | https://tldr.tech/tips | Tech news, ~500k |
| **Hacker Newsletter** | https://www.hackernewsletter.com/ | Post HN-style |
| **Changelog News** | https://changelog.com/news/submit | OSS devs |
| **Console.dev** | https://console.dev/submit/ | Dev tools, curated |
| **Pointer.io** | https://www.pointer.io/submit/ | Eng leadership |
| **Awesome Claude Code** | PR a https://github.com/hesreallyhim/awesome-claude-code agregando skillgrab | Claude Code users |

**Template corto para newsletters:**
```
Subject: skillgrab — one command to install AI agent skills for any project

Hi — I built skillgrab, a zero-config CLI that scans any project's stack (JS, Python, Go, mobile, infra) and auto-installs matching skills from skills.sh for AI coding agents like Claude Code.

  npx skillgrab

Open source, MIT. Happy to share if it fits.

Landing: https://briascoi.github.io/skillgrab/
GitHub: https://github.com/briascoi/skillgrab

— Ismael Briasco (@briascoi)
```

---

## 8. Discord / Slack / comunidades

- **Anthropic Discord** (canal #showcase o #projects)
- **Cursor Discord** (canal #community-projects)
- **r/ClaudeAI Discord**
- **Vercel Discord** (canal #showcase)
- **Indie Hackers** — post en https://www.indiehackers.com/post/new

Copy: versión corta del tweet principal.

---

## 9. Awesome lists (PR para backlink + descubrimiento pasivo)

Abrí PRs agregando skillgrab a:

- https://github.com/hesreallyhim/awesome-claude-code
- https://github.com/anthropics/anthropic-cookbook (issue pidiendo incluir)
- https://github.com/sindresorhus/awesome-cli-apps
- https://github.com/steven2358/awesome-generative-ai

Template PR:
```md
- [skillgrab](https://github.com/briascoi/skillgrab) — Scan any project and auto-install matching AI skills from skills.sh.
```

---

## 10. SEO rápido (long tail)

Añadí al README del repo:
- Sección "Alternatives" comparando con instalación manual de skills.sh
- Sección "Supported stacks" con lista exhaustiva (para ranking de "install AI skills for next.js", "install AI skills for django", etc.)
- Badge de npm downloads, license, CI

GitHub Pages ya está indexable — Google lo crawlea en 1-3 días.

---

## Checklist de lanzamiento (día D)

- [ ] Post en Show HN (8 AM ET)
- [ ] Tweet principal + thread
- [ ] LinkedIn post
- [ ] Reddit r/ClaudeAI + r/SideProject
- [ ] Producthunt scheduled para la siguiente semana (martes 00:01 PT)
- [ ] 3 DMs a dev influencers (simonw, @shadcn, vercel DX team)
- [ ] PR a awesome-claude-code
- [ ] Submit a Node Weekly + Console.dev
- [ ] Post dev.to

## Métricas que mover

- **npm downloads** (mirar en 72h) — objetivo: >500 en primera semana
- **GitHub stars** — objetivo: 100 en 7 días
- **Landing visitas** — mirar GitHub Pages analytics (o añadí Plausible/Umami si querés trackear)
