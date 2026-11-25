import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { CONTENT_REPO_NAME, CONTENT_REPO_OWNER } from "@/lib/content/constants";
import { parseTemplateRaw } from "@/lib/content/template-parse";
import type { CatalogJson, CatalogTemplateEntry, McpCatalog } from "@/lib/content/types";
import { readFile, safePath, validateId } from "./destinations";

const source = `https://github.com/${CONTENT_REPO_OWNER}/${CONTENT_REPO_NAME}`;

function fetchContent(ref: string): string {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._/-]*$/.test(ref) || ref.includes("..")) {
    throw new Error("Invalid --ref. Use a public Git branch, tag, or commit SHA.");
  }

  const cache = path.join(os.tmpdir(), "agentstencil-cache");
  fs.mkdirSync(cache, { recursive: true, mode: 0o700 });
  const stat = fs.lstatSync(cache);
  if (!stat.isDirectory() || (process.getuid && (stat.uid !== process.getuid() || (stat.mode & 0o022)))) {
    throw new Error(`Unsafe cache at ${cache}. Use a private temporary directory or set AGENTSTENCIL_CONTENT_DIR.`);
  }
  const cached = path.join(cache, createHash("sha256").update(ref).digest("hex"));
  if (fs.lstatSync(cached, { throwIfNoEntry: false })?.isDirectory()) return cached;

  // Stage each checkout separately so readers only see complete snapshots.
  const temp = fs.mkdtempSync(path.join(cache, "fetch-"));
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (key.toUpperCase().startsWith("GIT_")) delete env[key];
  }
  const git = (...args: string[]) => execFileSync("git", ["-c", "credential.helper=", "-C", temp, ...args], {
    env: {
      ...env,
      GIT_CONFIG_NOSYSTEM: "1",
      GIT_CONFIG_GLOBAL: os.devNull,
      GIT_TERMINAL_PROMPT: "0",
      GIT_ASKPASS: "",
    },
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 60_000,
  });

  try {
    git("init", "--quiet", "--template=");
    git("fetch", "--quiet", "--depth=1", "--", `${source}.git`, ref);
    git("checkout", "--quiet", "--detach", "FETCH_HEAD");
    readFile(safePath(temp, "catalog.json"));
    try {
      fs.renameSync(temp, cached);
    } catch (error) {
      if (!fs.lstatSync(cached, { throwIfNoEntry: false })?.isDirectory()) throw error;
    }
    return cached;
  } catch (error) {
    const detail = (error as NodeJS.ErrnoException).code === "ENOENT"
      ? " Check that Git is installed and the ref contains catalog.json."
      : " Check network access and that the ref exists.";
    throw new Error(`Could not fetch AgentStencil content for ${ref}.${detail} For offline use, omit --ref and set AGENTSTENCIL_CONTENT_DIR.`);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
}

export function openContent(ref?: string) {
  const local = path.resolve(".content-cache");
  const override = process.env.AGENTSTENCIL_CONTENT_DIR;
  const selected = ref !== undefined
    ? fetchContent(ref)
    : override || (fs.existsSync(path.join(local, "catalog.json")) ? local : fetchContent("main"));
  let root: string;
  try {
    root = fs.realpathSync(selected);
  } catch {
    throw new Error(`Could not open content at ${selected}. Set AGENTSTENCIL_CONTENT_DIR to a catalog directory.`);
  }
  const read = (relative: string) => readFile(safePath(root, relative)).toString("utf8");
  function readCatalog<T>(relative: string): T {
    try {
      return JSON.parse(read(relative)) as T;
    } catch (error) {
      throw new Error(`Could not read ${relative} in ${root}. Check the content source. ${(error as Error).message}`);
    }
  }

  const catalog = readCatalog<CatalogJson>("catalog.json");
  if (!Array.isArray(catalog?.templates)) {
    throw new Error(`Invalid catalog.json in ${root}. Use a catalog with a templates array.`);
  }

  function template(entry: CatalogTemplateEntry) {
    validateId(entry.id);
    const raw = read(entry.path);
    // Only permit YAML frontmatter. Gray Matter also supports executable JavaScript.
    if (!/^\uFEFF?---[ \t]*\r?\n/.test(raw)) {
      throw new Error(`Expected YAML frontmatter in ${entry.path}. Check the content source.`);
    }
    const doc = parseTemplateRaw(raw, entry.path);
    if (!doc || doc.frontmatter.id !== entry.id) {
      throw new Error(`Invalid template ${entry.id} at ${entry.path}. Check the content source.`);
    }
    return doc;
  }

  return {
    entries: catalog.templates,
    template,
    find(id: string) {
      validateId(id);
      const entry = catalog.templates.find((item) => item.id === id);
      if (!entry) throw new Error(`Unknown template ID "${id}". Use agentstencil list or search to find an ID.`);
      return template(entry);
    },
    mcpCatalog: () => readCatalog<McpCatalog>("mcp/catalog.json"),
    sourceUrl: (relative: string) =>
      `${source}/blob/${encodeURIComponent(ref ?? "main")}/${relative.split("/").map(encodeURIComponent).join("/")}`,
  };
}

export type Content = ReturnType<typeof openContent>;
