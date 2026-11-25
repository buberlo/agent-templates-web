import { execSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { getContentRoot } from "./config";

export interface ChangelogEntry {
  sha: string;
  date: string;
  subject: string;
}

export interface ResolvedVersioning {
  version: string;
  updated: string;
  changelog: ChangelogEntry[];
}

const HISTORY_CACHE = new Map<string, ResolvedVersioning>();

function hasGit(): boolean {
  try {
    execSync("git --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/** Prefer frontmatter `version`, else suffix like `-v1` on the filename stem. */
export function deriveVersionFromPath(
  relativePath: string,
  frontmatterVersion?: string,
): string {
  const trimmed = frontmatterVersion?.trim();
  if (trimmed) return trimmed;
  const stem = path.basename(relativePath, path.extname(relativePath));
  const suffix = stem.match(/-v(\d+(?:\.\d+)*)$/i);
  if (suffix) return `v${suffix[1]}`;
  return "v1";
}

function parseGitLog(stdout: string): ChangelogEntry[] {
  return stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [sha, iso, ...rest] = line.split("\t");
      return {
        sha: sha ?? "",
        date: (iso ?? "").slice(0, 10),
        subject: rest.join("\t").trim(),
      };
    })
    .filter((entry) => entry.sha && entry.subject);
}

export function resolveTemplateVersioning(
  relativePath: string,
  frontmatterVersion?: string,
  frontmatterUpdated?: string,
): ResolvedVersioning {
  const cached = HISTORY_CACHE.get(relativePath);
  if (cached) return cached;

  const version = deriveVersionFromPath(relativePath, frontmatterVersion);
  let changelog: ChangelogEntry[] = [];
  const root = getContentRoot();
  const full = path.join(root, relativePath);

  if (hasGit() && fs.existsSync(path.join(root, ".git"))) {
    try {
      const log = spawnSync(
        "git",
        ["log", "--follow", "-n", "20", "--format=%h\t%aI\t%s", "--", relativePath],
        { cwd: root, encoding: "utf8" },
      );
      changelog = log.status === 0 ? parseGitLog(log.stdout ?? "") : [];
    } catch {
      changelog = [];
    }
  }

  const updated =
    changelog[0]?.date ||
    (frontmatterUpdated?.trim() ? frontmatterUpdated.trim().slice(0, 10) : "") ||
    (fs.existsSync(full) ? new Date(fs.statSync(full).mtime).toISOString().slice(0, 10) : "");

  const resolved: ResolvedVersioning = { version, updated, changelog };
  HISTORY_CACHE.set(relativePath, resolved);
  return resolved;
}

export function getSiteChangelog(limit = 80): ChangelogEntry[] {
  if (!hasGit()) return [];
  const root = getContentRoot();
  if (!fs.existsSync(path.join(root, ".git"))) return [];
  try {
    const out = execSync(
      'git log --format=%h%x09%aI%x09%s -n ' + String(limit) + ' -- "domains/" "workflows/"',
      { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    );
    return parseGitLog(out);
  } catch {
    return [];
  }
}