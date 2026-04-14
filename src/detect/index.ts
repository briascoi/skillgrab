import type { DetectResult, Signal } from "../types.js";
import { detectNode } from "./node.js";
import { detectPython } from "./python.js";
import { detectMobile } from "./mobile.js";
import { detectBackend } from "./backend.js";
import { detectInfra } from "./infra.js";
import { detectContext } from "./context.js";

export async function detect(root: string): Promise<DetectResult> {
  const [node, python, mobile, backend, infra, hints] = await Promise.all([
    detectNode(root),
    detectPython(root),
    detectMobile(root),
    detectBackend(root),
    detectInfra(root),
    detectContext(root),
  ]);

  const all: Signal[] = [...node, ...python, ...mobile, ...backend, ...infra];
  // De-dupe by key.
  const byKey = new Map<string, Signal>();
  for (const s of all) {
    if (!byKey.has(s.key)) byKey.set(s.key, s);
  }
  return { signals: [...byKey.values()], hints };
}
