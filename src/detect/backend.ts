import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import type { Signal } from "../types.js";

async function exists(p: string) {
  try { await stat(p); return true; } catch { return false; }
}
async function read(p: string): Promise<string | null> {
  try { return await readFile(p, "utf8"); } catch { return null; }
}

export async function detectBackend(root: string): Promise<Signal[]> {
  const signals: Signal[] = [];

  if (await exists(join(root, "go.mod"))) {
    signals.push({ key: "go", reason: "go.mod present", queries: ["go", "golang"] });
  }

  if (await exists(join(root, "Cargo.toml"))) {
    signals.push({ key: "rust", reason: "Cargo.toml present", queries: ["rust"] });
  }

  if (await exists(join(root, "Gemfile"))) {
    const gem = (await read(join(root, "Gemfile"))) ?? "";
    signals.push({ key: "ruby", reason: "Gemfile present", queries: ["ruby"] });
    if (/['"]rails['"]/.test(gem)) {
      signals.push({ key: "rails", reason: "Gemfile → rails", queries: ["rails", "ruby on rails"] });
    }
  }

  if (await exists(join(root, "composer.json"))) {
    const comp = (await read(join(root, "composer.json"))) ?? "";
    signals.push({ key: "php", reason: "composer.json present", queries: ["php"] });
    if (/laravel\//.test(comp)) {
      signals.push({ key: "laravel", reason: "composer.json → laravel", queries: ["laravel"] });
    }
  }

  if (await exists(join(root, "pom.xml")) || await exists(join(root, "build.gradle"))) {
    signals.push({ key: "java", reason: "JVM build file present", queries: ["java", "jvm"] });
  }

  if (await exists(join(root, ".elixir_ls")) || await exists(join(root, "mix.exs"))) {
    signals.push({ key: "elixir", reason: "mix.exs present", queries: ["elixir", "phoenix"] });
  }

  return signals;
}
