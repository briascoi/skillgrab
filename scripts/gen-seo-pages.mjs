#!/usr/bin/env node
/**
 * Generates 15 programmatic SEO landing pages into landing/
 * Run: node scripts/gen-seo-pages.mjs
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LANDING = resolve(__dirname, "../landing");

const stacks = [
  {
    slug: "nextjs",
    name: "Next.js",
    keyword: "Next.js",
    desc: "Auto-install AI skills for Next.js — App Router, RSC, Vercel deployment, and more. One command, zero config.",
    h1: "Install AI Skills for Next.js",
    sub: "skillgrab scans your Next.js project and installs the right skills from skills.sh — App Router patterns, Vercel deployment, Supabase, Stripe, and more.",
    signals: [
      ["next.js", "package.json → next"],
      ["react", "package.json → react"],
      ["typescript", "tsconfig.json present"],
      ["vercel", "vercel.json present"],
    ],
    skills: [
      { slug: "vercel-labs/agent-skills", name: "find-skills", installs: "12.9k", trusted: true },
      { slug: "vercel/vercel-skills", name: "vercel-deployment", installs: "9.1k", trusted: true },
      { slug: "briascoi/skillgrab-essentials", name: "coding-style", installs: "", trusted: false },
    ],
    bullets: [
      ["App Router ready", "Detects RSC, server actions, and route handlers — and finds skills tuned for Next.js 14+."],
      ["Vercel-first", "Trusted Vercel and vercel-labs skills are ranked first and marked ★."],
      ["Full-stack signals", "Picks up Supabase, Prisma, Clerk, Stripe, OpenAI, and Tailwind from your package.json automatically."],
    ],
  },
  {
    slug: "react",
    name: "React",
    keyword: "React",
    desc: "Auto-install AI skills for React — hooks, state management, testing, and component patterns. One command.",
    h1: "Install AI Skills for React",
    sub: "skillgrab detects React in your project and pulls the best skills from skills.sh — component patterns, testing with Vitest, state management, and more.",
    signals: [
      ["react", "package.json → react"],
      ["typescript", "tsconfig.json present"],
      ["vitest", "package.json → vitest"],
    ],
    skills: [
      { slug: "vercel-labs/agent-skills", name: "find-skills", installs: "12.9k", trusted: true },
      { slug: "briascoi/skillgrab-essentials", name: "coding-style", installs: "", trusted: false },
      { slug: "briascoi/skillgrab-essentials", name: "test-patterns", installs: "", trusted: false },
    ],
    bullets: [
      ["Hooks & patterns", "Skills covering custom hooks, context patterns, and performance optimisation."],
      ["Testing included", "Detects Vitest, Jest, React Testing Library, and Playwright — and picks matching test skills."],
      ["State management", "Identifies Redux, Zustand, Jotai, and Recoil from your dependencies."],
    ],
  },
  {
    slug: "vue",
    name: "Vue.js",
    keyword: "Vue.js",
    desc: "Auto-install AI skills for Vue.js and Nuxt — Composition API, Pinia, routing, and server-side rendering.",
    h1: "Install AI Skills for Vue.js",
    sub: "skillgrab detects Vue and installs skills from skills.sh covering Composition API, Pinia, Vue Router, and Nuxt — all matched to your exact dependencies.",
    signals: [
      ["vue", "package.json → vue"],
      ["pinia", "package.json → pinia"],
      ["vue-router", "package.json → vue-router"],
    ],
    skills: [
      { slug: "vercel-labs/agent-skills", name: "find-skills", installs: "12.9k", trusted: true },
      { slug: "briascoi/skillgrab-essentials", name: "coding-style", installs: "", trusted: false },
      { slug: "briascoi/skillgrab-essentials", name: "code-review", installs: "", trusted: false },
    ],
    bullets: [
      ["Composition API first", "Skills written for Vue 3's Composition API and `<script setup>` syntax."],
      ["Pinia & routing", "Detects Pinia, Vuex, and Vue Router — installs matching state + navigation skills."],
      ["Nuxt detection", "If nuxt is in your dependencies, Nuxt-specific SSR skills get added automatically."],
    ],
  },
  {
    slug: "svelte",
    name: "Svelte",
    keyword: "Svelte",
    desc: "Auto-install AI skills for Svelte and SvelteKit — routing, stores, SSR, and Tailwind. One command.",
    h1: "Install AI Skills for Svelte",
    sub: "skillgrab detects Svelte and SvelteKit and installs the right skills from skills.sh — stores, routing, server-side rendering, and form actions.",
    signals: [
      ["svelte", "package.json → svelte"],
      ["sveltekit", "package.json → @sveltejs/kit"],
      ["tailwind", "package.json → tailwindcss"],
    ],
    skills: [
      { slug: "vercel-labs/agent-skills", name: "find-skills", installs: "12.9k", trusted: true },
      { slug: "briascoi/skillgrab-essentials", name: "coding-style", installs: "", trusted: false },
    ],
    bullets: [
      ["SvelteKit routing", "Detects `@sveltejs/kit` and fetches skills for file-based routing and form actions."],
      ["Stores & reactivity", "Skills covering Svelte's reactive stores, derived stores, and component lifecycle."],
      ["Adapter-aware", "Picks up Vercel, Netlify, and Cloudflare adapters from your config."],
    ],
  },
  {
    slug: "astro",
    name: "Astro",
    keyword: "Astro",
    desc: "Auto-install AI skills for Astro — content collections, islands, MDX, and deployment. One command.",
    h1: "Install AI Skills for Astro",
    sub: "skillgrab detects Astro and installs skills from skills.sh covering content collections, component islands, MDX, and Vercel/Netlify deployment.",
    signals: [
      ["astro", "package.json → astro"],
      ["mdx", "package.json → @astrojs/mdx"],
      ["tailwind", "package.json → @astrojs/tailwind"],
    ],
    skills: [
      { slug: "vercel-labs/agent-skills", name: "find-skills", installs: "12.9k", trusted: true },
      { slug: "briascoi/skillgrab-essentials", name: "coding-style", installs: "", trusted: false },
    ],
    bullets: [
      ["Content collections", "Skills for Astro's type-safe content collections and Zod schemas."],
      ["Island architecture", "Detects React, Vue, and Svelte integrations and adds skills for each."],
      ["MDX & deploy", "Picks up MDX, Tailwind, and deployment adapters from your astro.config."],
    ],
  },
  {
    slug: "nuxt",
    name: "Nuxt",
    keyword: "Nuxt",
    desc: "Auto-install AI skills for Nuxt 3 — composables, server routes, Nitro, and Pinia. One command.",
    h1: "Install AI Skills for Nuxt",
    sub: "skillgrab detects Nuxt and installs skills from skills.sh — composables, auto-imports, Nitro server routes, Pinia, and Nuxt UI.",
    signals: [
      ["nuxt", "package.json → nuxt"],
      ["pinia", "package.json → @pinia/nuxt"],
      ["typescript", "tsconfig.json present"],
    ],
    skills: [
      { slug: "vercel-labs/agent-skills", name: "find-skills", installs: "12.9k", trusted: true },
      { slug: "briascoi/skillgrab-essentials", name: "coding-style", installs: "", trusted: false },
    ],
    bullets: [
      ["Auto-imports", "Skills for Nuxt's composables, `useHead`, `useFetch`, and the auto-import system."],
      ["Nitro server", "Detects server routes and installs skills for Nitro API endpoints."],
      ["Nuxt UI & Pinia", "Picks up Nuxt UI, Pinia, and i18n modules from your `nuxt.config.ts`."],
    ],
  },
  {
    slug: "express",
    name: "Express.js",
    keyword: "Express.js",
    desc: "Auto-install AI skills for Express.js — middleware, routing, authentication, and API design. One command.",
    h1: "Install AI Skills for Express.js",
    sub: "skillgrab detects Express and installs the right skills from skills.sh — REST API patterns, middleware design, JWT auth, error handling, and more.",
    signals: [
      ["express", "package.json → express"],
      ["typescript", "tsconfig.json present"],
      ["prisma", "package.json → @prisma/client"],
    ],
    skills: [
      { slug: "vercel-labs/agent-skills", name: "find-skills", installs: "12.9k", trusted: true },
      { slug: "briascoi/skillgrab-essentials", name: "code-review", installs: "", trusted: false },
      { slug: "briascoi/skillgrab-essentials", name: "test-patterns", installs: "", trusted: false },
    ],
    bullets: [
      ["API design patterns", "Skills covering RESTful routing, request validation, and error middleware."],
      ["Auth & security", "Detects Passport, JWT, and session packages — adds auth-specific skills."],
      ["Database layer", "Picks up Prisma, Drizzle, Mongoose, and Sequelize from your dependencies."],
    ],
  },
  {
    slug: "fastapi",
    name: "FastAPI",
    keyword: "FastAPI",
    desc: "Auto-install AI skills for FastAPI — async routes, Pydantic models, SQLAlchemy, and deployment. One command.",
    h1: "Install AI Skills for FastAPI",
    sub: "skillgrab reads your requirements.txt, detects FastAPI, and installs skills from skills.sh covering async routes, Pydantic schemas, dependency injection, and more.",
    signals: [
      ["fastapi", "requirements.txt → fastapi"],
      ["sqlalchemy", "requirements.txt → sqlalchemy"],
      ["pydantic", "requirements.txt → pydantic"],
    ],
    skills: [
      { slug: "vercel-labs/agent-skills", name: "find-skills", installs: "12.9k", trusted: true },
      { slug: "briascoi/skillgrab-essentials", name: "code-review", installs: "", trusted: false },
    ],
    bullets: [
      ["Async-first", "Skills for FastAPI's async route handlers, background tasks, and WebSocket endpoints."],
      ["Pydantic models", "Detects Pydantic v1 and v2 — adds skills for schema design and validation."],
      ["SQLAlchemy & Alembic", "Picks up ORM usage and migration tools from your dependencies."],
    ],
  },
  {
    slug: "django",
    name: "Django",
    keyword: "Django",
    desc: "Auto-install AI skills for Django — ORM, DRF, Celery, authentication, and deployment. One command.",
    h1: "Install AI Skills for Django",
    sub: "skillgrab reads your requirements.txt, detects Django, and installs matching skills from skills.sh — ORM patterns, Django REST Framework, Celery, and deployment.",
    signals: [
      ["django", "requirements.txt → django"],
      ["drf", "requirements.txt → djangorestframework"],
      ["celery", "requirements.txt → celery"],
    ],
    skills: [
      { slug: "vercel-labs/agent-skills", name: "find-skills", installs: "12.9k", trusted: true },
      { slug: "briascoi/skillgrab-essentials", name: "code-review", installs: "", trusted: false },
      { slug: "briascoi/skillgrab-essentials", name: "ship-checklist", installs: "", trusted: false },
    ],
    bullets: [
      ["ORM & migrations", "Skills for Django's ORM query patterns, `select_related`, and migration best practices."],
      ["DRF serializers", "Detects `djangorestframework` and adds skills for serializer design and viewsets."],
      ["Celery & async", "Picks up Celery, Redis, and Channels — adds task queue and async skills."],
    ],
  },
  {
    slug: "flask",
    name: "Flask",
    keyword: "Flask",
    desc: "Auto-install AI skills for Flask — blueprints, SQLAlchemy, authentication, and production setup. One command.",
    h1: "Install AI Skills for Flask",
    sub: "skillgrab reads your requirements.txt, detects Flask, and installs the right skills from skills.sh — blueprints, Flask-SQLAlchemy, Flask-Login, and deployment.",
    signals: [
      ["flask", "requirements.txt → flask"],
      ["sqlalchemy", "requirements.txt → flask-sqlalchemy"],
      ["pytest", "requirements.txt → pytest"],
    ],
    skills: [
      { slug: "vercel-labs/agent-skills", name: "find-skills", installs: "12.9k", trusted: true },
      { slug: "briascoi/skillgrab-essentials", name: "test-patterns", installs: "", trusted: false },
    ],
    bullets: [
      ["Blueprint architecture", "Skills for organising Flask apps with blueprints and application factories."],
      ["SQLAlchemy models", "Detects Flask-SQLAlchemy and Alembic — adds ORM and migration skills."],
      ["Auth & sessions", "Picks up Flask-Login, Flask-JWT-Extended, and adds authentication skills."],
    ],
  },
  {
    slug: "python",
    name: "Python",
    keyword: "Python",
    desc: "Auto-install AI skills for Python projects — pandas, PyTorch, LangChain, FastAPI, Django, and more.",
    h1: "Install AI Skills for Python",
    sub: "skillgrab reads your requirements.txt and detects your Python stack — data science, web, ML, or scripting — then installs the right skills from skills.sh.",
    signals: [
      ["python", "requirements.txt present"],
      ["pandas", "requirements.txt → pandas"],
      ["pytest", "requirements.txt → pytest"],
    ],
    skills: [
      { slug: "vercel-labs/agent-skills", name: "find-skills", installs: "12.9k", trusted: true },
      { slug: "briascoi/skillgrab-essentials", name: "code-review", installs: "", trusted: false },
    ],
    bullets: [
      ["Multi-framework", "Detects Django, Flask, FastAPI, Starlette — installs framework-specific skills for whichever you use."],
      ["ML & data science", "Picks up PyTorch, TensorFlow, pandas, NumPy, LangChain, and OpenAI automatically."],
      ["Toolchain aware", "Reads pyproject.toml, setup.py, and requirements*.txt — handles all package formats."],
    ],
  },
  {
    slug: "typescript",
    name: "TypeScript",
    keyword: "TypeScript",
    desc: "Auto-install AI skills for TypeScript projects — type patterns, ESM, strict config, and testing. One command.",
    h1: "Install AI Skills for TypeScript",
    sub: "skillgrab detects TypeScript and installs skills from skills.sh covering strict typing patterns, ESM modules, tsconfig best practices, and test setup.",
    signals: [
      ["typescript", "tsconfig.json present"],
      ["vitest", "package.json → vitest"],
      ["eslint", "package.json → typescript-eslint"],
    ],
    skills: [
      { slug: "vercel-labs/agent-skills", name: "find-skills", installs: "12.9k", trusted: true },
      { slug: "briascoi/skillgrab-essentials", name: "coding-style", installs: "", trusted: false },
      { slug: "briascoi/skillgrab-essentials", name: "test-patterns", installs: "", trusted: false },
    ],
    bullets: [
      ["Strict mode patterns", "Skills for TypeScript strict config, discriminated unions, and utility types."],
      ["ESM & module systems", "Covers ESM, CJS, and bundler setups — tsconfig paths, extensions, and resolution."],
      ["Testing with Vitest", "Detects Vitest, Jest, and ts-jest — installs matching typed test patterns."],
    ],
  },
  {
    slug: "supabase",
    name: "Supabase",
    keyword: "Supabase",
    desc: "Auto-install AI skills for Supabase — RLS policies, Edge Functions, Auth, Realtime, and Storage. One command.",
    h1: "Install AI Skills for Supabase",
    sub: "skillgrab detects Supabase in your project and installs trusted skills from skills.sh — RLS policies, Edge Functions, Auth helpers, Storage, and the JS client.",
    signals: [
      ["supabase", "package.json → @supabase/supabase-js"],
      ["supabase-auth", "package.json → @supabase/auth-helpers-nextjs"],
      ["typescript", "tsconfig.json present"],
    ],
    skills: [
      { slug: "supabase/agent-skills", name: "supabase-best-practices", installs: "30.2k", trusted: true },
      { slug: "vercel-labs/agent-skills", name: "find-skills", installs: "12.9k", trusted: true },
      { slug: "briascoi/skillgrab-essentials", name: "coding-style", installs: "", trusted: false },
    ],
    bullets: [
      ["Official Supabase skills", "The official `supabase/agent-skills` pack (30k installs) is auto-detected and marked ★ trusted."],
      ["RLS & policies", "Skills covering Row Level Security design, policy patterns, and common gotchas."],
      ["Edge Functions", "Detects Supabase Edge Functions and Deno runtime — adds matching deployment skills."],
    ],
  },
  {
    slug: "go",
    name: "Go",
    keyword: "Go",
    desc: "Auto-install AI skills for Go — error handling, goroutines, HTTP servers, and testing. One command.",
    h1: "Install AI Skills for Go",
    sub: "skillgrab reads your go.mod, detects your Go stack, and installs matching skills from skills.sh — idiomatic patterns, concurrency, HTTP handlers, and testing.",
    signals: [
      ["go", "go.mod present"],
      ["gin", "go.mod → github.com/gin-gonic/gin"],
      ["docker", "Dockerfile present"],
    ],
    skills: [
      { slug: "vercel-labs/agent-skills", name: "find-skills", installs: "12.9k", trusted: true },
      { slug: "briascoi/skillgrab-essentials", name: "code-review", installs: "", trusted: false },
    ],
    bullets: [
      ["Idiomatic Go", "Skills covering error wrapping, defer patterns, interfaces, and Go proverbs."],
      ["Framework detection", "Picks up Gin, Echo, Fiber, Chi, and stdlib net/http — adds router-specific skills."],
      ["Concurrency", "Detects goroutine-heavy codebases and adds skills for channels and sync primitives."],
    ],
  },
  {
    slug: "rust",
    name: "Rust",
    keyword: "Rust",
    desc: "Auto-install AI skills for Rust — ownership, async, Axum, Tokio, and error handling. One command.",
    h1: "Install AI Skills for Rust",
    sub: "skillgrab reads your Cargo.toml, detects your Rust stack, and installs skills from skills.sh — ownership patterns, async Tokio, Axum routes, and `thiserror`.",
    signals: [
      ["rust", "Cargo.toml present"],
      ["tokio", "Cargo.toml → tokio"],
      ["axum", "Cargo.toml → axum"],
    ],
    skills: [
      { slug: "vercel-labs/agent-skills", name: "find-skills", installs: "12.9k", trusted: true },
      { slug: "briascoi/skillgrab-essentials", name: "code-review", installs: "", trusted: false },
    ],
    bullets: [
      ["Ownership & lifetimes", "Skills for borrow checker patterns, lifetime annotations, and common compiler errors."],
      ["Async Tokio", "Detects `tokio` and `async-std` — installs skills for async runtimes and futures."],
      ["Web frameworks", "Picks up Axum, Actix-web, and Warp — adds framework-specific handler skills."],
    ],
  },
];

function terminalLine(signal, reason) {
  const pad = " ".repeat(Math.max(1, 20 - signal.length));
  return `  <span class="text-slate-200">${signal}</span>${pad}<span class="text-slate-500">${reason}</span>`;
}

function skillLine(skill) {
  const star = skill.trusted ? `<span class="text-yellow-400">★</span> ` : "  ";
  const installs = skill.installs ? `<span class="text-slate-500">  ${skill.installs} installs</span>` : "";
  return `  ${star}<span class="text-indigo-300">${skill.slug}</span>/<span class="text-slate-200">${skill.name}</span>${installs}`;
}

function page(s) {
  const signalLines = s.signals.map(([sig, reason]) => terminalLine(sig, reason)).join("\n");
  const skillLines = s.skills.map(skillLine).join("\n");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Install AI Skills for ${s.name} — skillgrab</title>
<meta name="description" content="${s.desc}" />
<meta name="author" content="Ismael Briasco (@briascoi)" />
<link rel="canonical" href="https://briascoi.github.io/skillgrab/install-ai-skills-for-${s.slug}" />
<meta property="og:title" content="Install AI Skills for ${s.name} — skillgrab" />
<meta property="og:description" content="${s.desc}" />
<meta property="og:url" content="https://briascoi.github.io/skillgrab/install-ai-skills-for-${s.slug}" />
<meta property="og:type" content="website" />
<meta property="og:image" content="https://briascoi.github.io/skillgrab/og.png" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Install AI Skills for ${s.name} — skillgrab" />
<meta name="twitter:description" content="${s.desc}" />
<meta name="twitter:image" content="https://briascoi.github.io/skillgrab/og.png" />
<meta name="twitter:creator" content="@briascoi" />
<script src="https://cdn.tailwindcss.com"></script>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
<style>
  html { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
  code, pre, .mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
  .grid-bg {
    background-image:
      radial-gradient(circle at 20% 0%, rgba(99,102,241,0.15), transparent 40%),
      radial-gradient(circle at 80% 10%, rgba(236,72,153,0.12), transparent 40%),
      linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px);
    background-size: auto, auto, 40px 40px, 40px 40px;
  }
  .glow { box-shadow: 0 0 60px -10px rgba(99,102,241,0.6); }
</style>
</head>
<body class="bg-slate-950 text-slate-100 antialiased">

<header class="grid-bg border-b border-white/5">
  <div class="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
    <a href="./" class="flex items-center gap-2 font-bold text-lg">
      <span class="inline-block w-6 h-6 rounded-md bg-gradient-to-br from-indigo-400 to-pink-500"></span>
      skillgrab
    </a>
    <a href="./" class="text-sm text-slate-400 hover:text-white">← Back to home</a>
  </div>

  <section class="max-w-4xl mx-auto px-6 py-20 text-center">
    <div class="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full border border-white/10 bg-white/5 text-slate-300 mb-8">
      <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
      Zero config · Auto-detected from your project files
    </div>
    <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
      ${s.h1}
    </h1>
    <p class="mt-6 text-lg text-slate-300 max-w-2xl mx-auto">
      ${s.sub}
    </p>

    <div class="mt-10 flex justify-center">
      <div class="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/60 glow px-5 py-3 backdrop-blur">
        <span class="text-slate-500 mono">$</span>
        <code class="mono text-base md:text-lg text-slate-100">npx skillgrab</code>
        <button id="copy" onclick="navigator.clipboard.writeText('npx skillgrab').then(()=>{this.textContent='Copied!';setTimeout(()=>this.textContent='Copy',1500)})" class="ml-2 text-xs px-2 py-1 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200">Copy</button>
      </div>
    </div>
    <p class="mt-4 text-sm text-slate-500">Run inside your ${s.name} project directory. No install, no config.</p>
  </section>
</header>

<section class="py-20 border-b border-white/5">
  <div class="max-w-4xl mx-auto px-6">
    <h2 class="text-2xl md:text-3xl font-bold text-center">What skillgrab detects in a ${s.name} project</h2>
    <p class="mt-3 text-center text-slate-400 text-sm">skillgrab reads your project files and maps each dependency to relevant skills.</p>

    <div class="mt-10 rounded-xl border border-white/10 bg-slate-900/70 overflow-hidden">
      <div class="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 bg-slate-900/60">
        <span class="w-2.5 h-2.5 rounded-full bg-red-400/70"></span>
        <span class="w-2.5 h-2.5 rounded-full bg-yellow-400/70"></span>
        <span class="w-2.5 h-2.5 rounded-full bg-green-400/70"></span>
        <span class="ml-3 text-xs text-slate-400 mono">~/my-${s.slug}-project</span>
      </div>
<pre class="mono text-[13px] leading-6 p-5 text-slate-200 overflow-x-auto"><span class="text-slate-500">$</span> npx skillgrab

  skillgrab v0.6.1

<span class="text-slate-400">▸ Tech signals</span>
${signalLines}

<span class="text-slate-400">▸ Install plan</span>
${skillLines}

<span class="text-slate-400">▸ Detected agents:</span> <span class="text-indigo-300">claude-code</span>

  <span class="text-slate-400">Installing to:</span> claude-code
  <span class="text-emerald-400">✔ Installed ${s.skills.length} skills.</span></pre>
    </div>
  </div>
</section>

<section class="py-20 border-b border-white/5">
  <div class="max-w-4xl mx-auto px-6">
    <h2 class="text-2xl md:text-3xl font-bold text-center">Why skillgrab for ${s.name}?</h2>
    <div class="mt-10 grid md:grid-cols-3 gap-6">
${s.bullets.map(([title, body], i) => `      <div class="rounded-xl border border-white/10 bg-slate-900/40 p-6">
        <div class="w-10 h-10 rounded-md bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold mono">0${i + 1}</div>
        <h3 class="mt-4 text-lg font-semibold">${title}</h3>
        <p class="mt-2 text-slate-400 text-sm">${body}</p>
      </div>`).join("\n")}
    </div>
  </div>
</section>

<section class="py-20">
  <div class="max-w-4xl mx-auto px-6 text-center">
    <h2 class="text-2xl md:text-3xl font-bold">Get started in seconds</h2>
    <p class="mt-4 text-slate-400">No installation, no config file, no account. Just run it inside your ${s.name} project.</p>

    <div class="mt-8 flex justify-center">
      <div class="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/60 glow px-5 py-3 backdrop-blur">
        <span class="text-slate-500 mono">$</span>
        <code class="mono text-lg text-slate-100">npx skillgrab</code>
      </div>
    </div>

    <div class="mt-8 flex items-center justify-center gap-3">
      <a href="./" class="px-4 py-2 rounded-md bg-white text-slate-900 font-medium hover:bg-slate-100 text-sm">Back to skillgrab</a>
      <a href="https://github.com/briascoi/skillgrab" target="_blank" rel="noopener" class="px-4 py-2 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-sm">GitHub</a>
      <a href="https://www.npmjs.com/package/skillgrab" target="_blank" rel="noopener" class="px-4 py-2 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-sm">npm</a>
    </div>

    <div class="mt-10 grid md:grid-cols-3 gap-4 text-left">
      <div class="rounded-xl border border-white/10 bg-slate-900/40 p-5">
        <p class="text-xs text-slate-500 font-mono mb-1">Works with</p>
        <p class="text-sm font-medium">Claude Code · Cursor · Cline · Codex</p>
        <p class="text-sm text-slate-400">Continue · Gemini CLI · Warp · Windsurf</p>
      </div>
      <div class="rounded-xl border border-white/10 bg-slate-900/40 p-5">
        <p class="text-xs text-slate-500 font-mono mb-1">Security</p>
        <p class="text-sm font-medium">GitHub validation on every skill</p>
        <p class="text-sm text-slate-400">Trusted-owner ranking · <code class="mono text-xs">--only-trusted</code> flag</p>
      </div>
      <div class="rounded-xl border border-white/10 bg-slate-900/40 p-5">
        <p class="text-xs text-slate-500 font-mono mb-1">Skills registry</p>
        <p class="text-sm font-medium">90,000+ skills on skills.sh</p>
        <p class="text-sm text-slate-400">Ranked by trust score + install count</p>
      </div>
    </div>
  </div>
</section>

<footer class="border-t border-white/5 py-8">
  <div class="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-slate-500">
    <p>MIT · built by <a href="https://github.com/briascoi" target="_blank" rel="noopener" class="text-slate-300 hover:text-white">Ismael Briasco</a></p>
    <div class="flex items-center gap-4">
      <a href="./" class="hover:text-slate-300">Home</a>
      <a href="https://github.com/briascoi/skillgrab" target="_blank" rel="noopener" class="hover:text-slate-300">GitHub</a>
      <a href="https://www.npmjs.com/package/skillgrab" target="_blank" rel="noopener" class="hover:text-slate-300">npm</a>
      <a href="https://skills.sh" target="_blank" rel="noopener" class="hover:text-slate-300">skills.sh</a>
    </div>
  </div>
</footer>

</body>
</html>`;
}

let count = 0;
for (const s of stacks) {
  const filename = `install-ai-skills-for-${s.slug}.html`;
  writeFileSync(resolve(LANDING, filename), page(s), "utf8");
  count++;
  console.log(`  ✔ ${filename}`);
}
console.log(`\nGenerated ${count} pages in landing/`);
