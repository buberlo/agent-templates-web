import fs from "node:fs";
import path from "node:path";
import type { ExportTarget } from "@/lib/content/constants";

export function validateId(id: string): void {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    throw new Error(`Invalid template ID ${JSON.stringify(id)}. Use an ID from agentstencil list.`);
  }
}

export function instructionPath(target: ExportTarget, filename: string): string {
  return target === "cursor" ? `.cursor/rules/${filename}` : filename;
}

function statIfPresent(file: string): fs.Stats | undefined {
  return fs.lstatSync(file, { throwIfNoEntry: false });
}

export function safePath(root: string, relative: string, createParents = false): string {
  const parts = relative.split("/");
  if (parts.some((part) => !part || /[. ]$|[\\:\x00-\x1f]/.test(part))) {
    throw new Error(`Unsafe path ${JSON.stringify(relative)}. Use a path inside the project or catalog.`);
  }

  let current = root;
  for (const [index, part] of parts.entries()) {
    current = path.join(current, part);
    const parent = index < parts.length - 1;
    if (parent && createParents && !statIfPresent(current)) {
      try {
        fs.mkdirSync(current);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      }
    }
    const stat = statIfPresent(current);
    if (stat?.isSymbolicLink()) {
      throw new Error(`Unsafe symlink at ${current}. Use a directory without symlinks in this path.`);
    }
    if (stat && !(parent ? stat.isDirectory() : stat.isFile())) {
      throw new Error(`Unexpected file type at ${current}. Use a regular file with directory parents.`);
    }
  }
  return current;
}

export function readFile(file: string): Buffer {
  const fd = fs.openSync(file, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW ?? 0) | (fs.constants.O_NONBLOCK ?? 0));
  try {
    const opened = fs.fstatSync(fd);
    const current = fs.lstatSync(file);
    if (!opened.isFile() || !current.isFile() || opened.ino !== current.ino || opened.dev !== current.dev) {
      throw new Error(`Unsafe file at ${file}. Use a regular file without symlinks.`);
    }
    return fs.readFileSync(fd);
  } finally {
    fs.closeSync(fd);
  }
}

export function writeInstructions(root: string, relative: string, content: string, dryRun: boolean): string {
  const file = safePath(root, relative);
  const bytes = Buffer.from(content);
  const existing = () => {
    if (readFile(safePath(root, relative)).equals(bytes)) return `Already up to date: ${relative}`;
    throw new Error(`File conflict at ${relative}. Use --stdout to print the export for manual merging.`);
  };
  if (statIfPresent(file)) return existing();
  if (dryRun) return `Would write: ${relative}`;

  const destination = safePath(root, relative, true);
  let fd: number;
  try {
    fd = fs.openSync(destination, "wx");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") return existing();
    throw error;
  }
  try {
    fs.writeFileSync(fd, bytes);
  } finally {
    fs.closeSync(fd);
  }
  return `Wrote: ${relative}`;
}
