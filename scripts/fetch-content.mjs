import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const repoUrl =
  process.env.CONTENT_REPO_URL?.trim() ||
  "https://github.com/buberlo/agent-templates.git";
const ref = process.env.CONTENT_REPO_REF?.trim() || "main";
const cacheDir = path.join(process.cwd(), ".content-cache");

function run(cmd, options = {}) {
  execSync(cmd, { stdio: "inherit", ...options });
}

function hasGit() {
  try {
    execSync("git --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

if (!hasGit()) {
  console.error("git is required to fetch the content repository");
  process.exit(1);
}

const marker = path.join(cacheDir, ".ref");
const current = fs.existsSync(marker)
  ? fs.readFileSync(marker, "utf8").trim()
  : "";

if (!fs.existsSync(cacheDir)) {
  console.log(`Cloning ${repoUrl} (ref ${ref}) into ${cacheDir}`);
  run(`git clone --depth 1 --branch ${ref} ${repoUrl} ${cacheDir}`);
  try {
    run(`git -C ${cacheDir} fetch --deepen=64 origin ${ref}`);
  } catch {
    console.warn("Could not deepen content history; changelog may be sparse.");
  }
  fs.writeFileSync(marker, ref);
} else if (current !== ref) {
  console.log(`Updating content cache to ref ${ref}`);
  run(`git -C ${cacheDir} fetch origin ${ref} --depth 1`);
  run(`git -C ${cacheDir} checkout FETCH_HEAD`);
  fs.writeFileSync(marker, ref);
} else {
  console.log(`Content cache present (${ref}), fetching latest…`);
  run(`git -C ${cacheDir} fetch origin ${ref} --depth 1`);
  run(`git -C ${cacheDir} reset --hard FETCH_HEAD`);
  try {
    run(`git -C ${cacheDir} fetch --deepen=64 origin ${ref}`);
  } catch {
    console.warn("Could not deepen content history; changelog may be sparse.");
  }
}

const catalog = path.join(cacheDir, "catalog.json");
if (!fs.existsSync(catalog)) {
  console.log("Running validate_and_index.py in content repo…");
  try {
    run(`python3 ${path.join(cacheDir, "scripts", "validate_and_index.py")}`);
  } catch {
    console.warn("Could not run validate script; using existing catalog if any");
  }
}

console.log("Content ready at", cacheDir);