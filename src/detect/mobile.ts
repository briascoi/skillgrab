import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import type { Signal } from "../types.js";

async function exists(p: string) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

export async function detectMobile(root: string): Promise<Signal[]> {
  const signals: Signal[] = [];

  if (await exists(join(root, "pubspec.yaml"))) {
    signals.push({
      key: "flutter",
      reason: "pubspec.yaml present",
      queries: ["flutter", "dart"],
    });
  }

  if (await exists(join(root, "ios")) && await exists(join(root, "android"))) {
    // Could be RN or native cross-platform. RN is caught via package.json elsewhere.
  }

  if (await exists(join(root, "Package.swift"))) {
    signals.push({ key: "swift", reason: "Package.swift present", queries: ["swift"] });
  }

  // Android Gradle
  for (const f of ["build.gradle", "build.gradle.kts", "settings.gradle", "settings.gradle.kts"]) {
    if (await exists(join(root, f))) {
      signals.push({ key: "android", reason: `${f} present`, queries: ["android", "kotlin"] });
      break;
    }
  }

  // iOS Xcode project
  try {
    const { readdir } = await import("node:fs/promises");
    const entries = await readdir(root);
    if (entries.some((e) => e.endsWith(".xcodeproj") || e.endsWith(".xcworkspace"))) {
      signals.push({ key: "ios", reason: "Xcode project present", queries: ["ios", "swift"] });
    }
  } catch {
    // ignore
  }

  return signals;
}
