import { spawn } from "node:child_process";

export function installOne(slug: string): Promise<number> {
  return new Promise((resolve) => {
    const proc = spawn("npx", ["skills", "add", slug], {
      stdio: "inherit",
      env: process.env,
    });
    proc.on("close", (code) => resolve(code ?? 1));
    proc.on("error", () => resolve(1));
  });
}

export async function installAll(slugs: string[]): Promise<{ slug: string; code: number }[]> {
  const results: { slug: string; code: number }[] = [];
  for (const slug of slugs) {
    const code = await installOne(slug);
    results.push({ slug, code });
  }
  return results;
}
