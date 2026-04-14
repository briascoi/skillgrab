import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Signal } from "../types.js";

const PY_MAP: Record<string, { key: string; queries: string[] }> = {
  django: { key: "django", queries: ["django"] },
  flask: { key: "flask", queries: ["flask"] },
  fastapi: { key: "fastapi", queries: ["fastapi"] },
  starlette: { key: "starlette", queries: ["starlette"] },
  pandas: { key: "pandas", queries: ["pandas"] },
  numpy: { key: "numpy", queries: ["numpy"] },
  pytorch: { key: "pytorch", queries: ["pytorch"] },
  torch: { key: "pytorch", queries: ["pytorch"] },
  tensorflow: { key: "tensorflow", queries: ["tensorflow"] },
  langchain: { key: "langchain", queries: ["langchain"] },
  openai: { key: "openai", queries: ["openai"] },
  anthropic: { key: "anthropic", queries: ["anthropic", "claude api"] },
  pytest: { key: "pytest", queries: ["pytest"] },
  celery: { key: "celery", queries: ["celery"] },
  sqlalchemy: { key: "sqlalchemy", queries: ["sqlalchemy"] },
};

async function read(path: string): Promise<string | null> {
  try {
    return await readFile(path, "utf8");
  } catch {
    return null;
  }
}

export async function detectPython(root: string): Promise<Signal[]> {
  const files = await Promise.all([
    read(join(root, "requirements.txt")),
    read(join(root, "pyproject.toml")),
    read(join(root, "Pipfile")),
  ]);
  const blob = files.filter(Boolean).join("\n").toLowerCase();
  if (!blob) return [];

  const signals: Signal[] = [];
  const seen = new Set<string>();
  // Always tag python generically when any manifest present.
  signals.push({ key: "python", reason: "python manifest present", queries: ["python"] });
  seen.add("python");

  for (const [token, info] of Object.entries(PY_MAP)) {
    const re = new RegExp(`(^|[\\s"'=<>])${token}(\\b|[<>=~!])`, "m");
    if (re.test(blob) && !seen.has(info.key)) {
      seen.add(info.key);
      signals.push({ key: info.key, reason: `python deps → ${token}`, queries: info.queries });
    }
  }
  return signals;
}
