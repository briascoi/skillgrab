import pc from "picocolors";
import type { SkillCandidate } from "./types.js";

export function banner(version: string) {
  console.log("");
  console.log(pc.bold(pc.cyan("  skillgrab ")) + pc.dim(`v${version}`));
  console.log(pc.dim("  scan your project → install matching skills from skills.sh"));
  console.log("");
}

export function section(title: string) {
  console.log(pc.bold(pc.white("▸ " + title)));
}

export function info(msg: string) {
  console.log("  " + pc.dim(msg));
}

export function warn(msg: string) {
  console.log("  " + pc.yellow("! ") + msg);
}

export function err(msg: string) {
  console.log("  " + pc.red("✖ ") + msg);
}

export function ok(msg: string) {
  console.log("  " + pc.green("✔ ") + msg);
}

export function planTable(candidates: SkillCandidate[]) {
  if (candidates.length === 0) {
    info("(no skills matched)");
    return;
  }
  const maxSlug = Math.max(...candidates.map((c) => c.slug.length));
  for (const c of candidates) {
    const star = c.trusted ? pc.yellow("★") : " ";
    const installs = c.installs >= 1000
      ? `${(c.installs / 1000).toFixed(1)}k`
      : `${c.installs}`;
    console.log(
      "  " + star + " " +
        pc.cyan(c.slug.padEnd(maxSlug)) +
        pc.dim("  ← " + c.reason.padEnd(10)) +
        pc.dim(installs.padStart(6) + " installs"),
    );
  }
}
