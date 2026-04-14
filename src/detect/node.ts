import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Signal } from "../types.js";

const DEP_MAP: Record<string, { key: string; queries: string[] }> = {
  react: { key: "react", queries: ["react"] },
  next: { key: "next.js", queries: ["next.js", "nextjs"] },
  vue: { key: "vue", queries: ["vue"] },
  nuxt: { key: "nuxt", queries: ["nuxt"] },
  "@angular/core": { key: "angular", queries: ["angular"] },
  svelte: { key: "svelte", queries: ["svelte"] },
  "@sveltejs/kit": { key: "sveltekit", queries: ["sveltekit", "svelte"] },
  astro: { key: "astro", queries: ["astro"] },
  remix: { key: "remix", queries: ["remix"] },
  solid: { key: "solid", queries: ["solidjs"] },
  "solid-js": { key: "solid", queries: ["solidjs"] },
  tailwindcss: { key: "tailwind", queries: ["tailwind"] },
  "@chakra-ui/react": { key: "chakra", queries: ["chakra"] },
  "@mui/material": { key: "mui", queries: ["mui", "material ui"] },
  "styled-components": { key: "styled-components", queries: ["styled components"] },
  typescript: { key: "typescript", queries: ["typescript"] },
  express: { key: "express", queries: ["express"] },
  fastify: { key: "fastify", queries: ["fastify"] },
  hono: { key: "hono", queries: ["hono"] },
  "@trpc/server": { key: "trpc", queries: ["trpc"] },
  prisma: { key: "prisma", queries: ["prisma"] },
  "@prisma/client": { key: "prisma", queries: ["prisma"] },
  "drizzle-orm": { key: "drizzle", queries: ["drizzle"] },
  "@supabase/supabase-js": { key: "supabase", queries: ["supabase"] },
  firebase: { key: "firebase", queries: ["firebase"] },
  "firebase-admin": { key: "firebase", queries: ["firebase"] },
  mongoose: { key: "mongodb", queries: ["mongodb"] },
  redis: { key: "redis", queries: ["redis"] },
  ioredis: { key: "redis", queries: ["redis"] },
  "@clerk/nextjs": { key: "clerk", queries: ["clerk"] },
  "next-auth": { key: "nextauth", queries: ["next-auth", "auth.js"] },
  stripe: { key: "stripe", queries: ["stripe"] },
  "@stripe/stripe-js": { key: "stripe", queries: ["stripe"] },
  openai: { key: "openai", queries: ["openai"] },
  "@anthropic-ai/sdk": { key: "anthropic", queries: ["anthropic", "claude api"] },
  "ai": { key: "vercel-ai-sdk", queries: ["vercel ai sdk", "ai sdk"] },
  langchain: { key: "langchain", queries: ["langchain"] },
  "react-native": { key: "react-native", queries: ["react native"] },
  expo: { key: "expo", queries: ["expo"] },
  electron: { key: "electron", queries: ["electron"] },
  vitest: { key: "vitest", queries: ["vitest"] },
  jest: { key: "jest", queries: ["jest"] },
  playwright: { key: "playwright", queries: ["playwright"] },
  "@playwright/test": { key: "playwright", queries: ["playwright"] },
  cypress: { key: "cypress", queries: ["cypress"] },
};

export async function detectNode(root: string): Promise<Signal[]> {
  const pkgPath = join(root, "package.json");
  let raw: string;
  try {
    raw = await readFile(pkgPath, "utf8");
  } catch {
    return [];
  }
  let pkg: any;
  try {
    pkg = JSON.parse(raw);
  } catch {
    return [];
  }
  const deps = {
    ...(pkg.dependencies ?? {}),
    ...(pkg.devDependencies ?? {}),
    ...(pkg.peerDependencies ?? {}),
  };
  const signals: Signal[] = [];
  const seen = new Set<string>();
  for (const name of Object.keys(deps)) {
    const match = DEP_MAP[name];
    if (!match || seen.has(match.key)) continue;
    seen.add(match.key);
    signals.push({
      key: match.key,
      reason: `package.json → ${name}`,
      queries: match.queries,
    });
  }
  return signals;
}
