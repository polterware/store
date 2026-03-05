import pc from "picocolors";
import { commandExists, execCapture } from "./exec.js";

interface Check {
  name: string;
  cmd: string;
  versionCmd?: string;
  required: boolean;
  installHint: string;
}

const CHECKS: Check[] = [
  {
    name: "Node.js",
    cmd: "node",
    versionCmd: "node -v",
    required: true,
    installHint: "https://nodejs.org (v20+)",
  },
  {
    name: "pnpm",
    cmd: "pnpm",
    versionCmd: "pnpm -v",
    required: true,
    installHint: "corepack enable && corepack prepare pnpm@latest --activate",
  },
  {
    name: "Rust",
    cmd: "rustc",
    versionCmd: "rustc --version",
    required: false,
    installHint: "https://rustup.rs (needed for desktop builds)",
  },
  {
    name: "Supabase CLI",
    cmd: "supabase",
    versionCmd: "supabase --version",
    required: true,
    installHint: "brew install supabase/tap/supabase",
  },
];

export function checkPrereqs(): { ok: boolean; summary: string[] } {
  const summary: string[] = [];
  let ok = true;

  for (const check of CHECKS) {
    const found = commandExists(check.cmd);
    let version = "";
    if (found && check.versionCmd) {
      try {
        version = execCapture(check.versionCmd);
      } catch {
        version = "?";
      }
    }

    if (found) {
      summary.push(`  ${pc.green("✓")} ${check.name} ${pc.dim(version)}`);
    } else if (check.required) {
      summary.push(
        `  ${pc.red("✗")} ${check.name} ${pc.dim(`— install: ${check.installHint}`)}`,
      );
      ok = false;
    } else {
      summary.push(
        `  ${pc.yellow("○")} ${check.name} ${pc.dim(`— optional: ${check.installHint}`)}`,
      );
    }
  }

  return { ok, summary };
}
