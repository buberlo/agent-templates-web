import fs from "node:fs";
import path from "node:path";
import { getContentRoot } from "./config";
import { computeQualityScore, parseQualityBacklog, type QualityScore } from "./quality-score";
import { parseTemplateRaw } from "./template-parse";
import type {
  AdapterNote,
  CatalogJson,
  DomainMeta,
  CategoryMeta,
  McpCatalog,
  SiteStats,
  TemplateDocument,
} from "./types";

const CACHE: {
  catalog?: CatalogJson;
  templates?: Map<string, TemplateDocument>;
  mcp?: McpCatalog;
  adapters?: AdapterNote[];
  loaded?: boolean;
} = {};

const qualityScores = new WeakMap<TemplateDocument, QualityScore>();
let qualityBacklog: ReadonlySet<string> | undefined;

export function getTemplateQuality(doc: TemplateDocument): QualityScore {
  const cached = qualityScores.get(doc);
  if (cached) return cached;

  if (!qualityBacklog) {
    const backlogPath = path.join(getContentRoot(), "scripts", "quality_backlog.txt");
    qualityBacklog = fs.existsSync(backlogPath)
      ? parseQualityBacklog(fs.readFileSync(backlogPath, "utf8"))
      : new Set();
  }
  const score = computeQualityScore(doc.body, doc.filePath, qualityBacklog);
  qualityScores.set(doc, score);
  return score;
}

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function loadCatalog(): CatalogJson {
  if (CACHE.catalog) return CACHE.catalog;
  const root = getContentRoot();
  const catalogPath = path.join(root, "catalog.json");
  if (!fs.existsSync(catalogPath)) {
    throw new Error(
      `Missing catalog.json in ${root}. Run npm run fetch-content first.`,
    );
  }
  CACHE.catalog = readJson<CatalogJson>(catalogPath);
  return CACHE.catalog;
}

function parseTemplateFile(
  filePath: string,
  relativePath: string,
): TemplateDocument | null {
  const raw = fs.readFileSync(filePath, "utf8");
  return parseTemplateRaw(raw, relativePath);
}

function loadAllTemplates(): Map<string, TemplateDocument> {
  if (CACHE.templates) return CACHE.templates;
  const catalog = loadCatalog();
  const root = getContentRoot();
  const map = new Map<string, TemplateDocument>();

  for (const entry of catalog.templates) {
    const full = path.join(root, entry.path);
    if (!fs.existsSync(full)) {
      console.warn("Missing template file:", entry.path);
      continue;
    }
    const doc = parseTemplateFile(full, entry.path);
    if (!doc) continue;
    map.set(entry.id, doc);
  }
  CACHE.templates = map;
  return map;
}

export function getTemplate(id: string): TemplateDocument | undefined {
  return loadAllTemplates().get(id);
}

export function getAllTemplates(): TemplateDocument[] {
  return [...loadAllTemplates().values()].sort((a, b) =>
    a.frontmatter.title.localeCompare(b.frontmatter.title),
  );
}

export function getCatalog(): CatalogJson {
  return loadCatalog();
}

export function getMcpCatalog(): McpCatalog {
  if (CACHE.mcp) return CACHE.mcp;
  const root = getContentRoot();
  const p = path.join(root, "mcp", "catalog.json");
  CACHE.mcp = readJson<McpCatalog>(p);
  return CACHE.mcp;
}

export function getAdapters(): AdapterNote[] {
  if (CACHE.adapters) return CACHE.adapters;
  const root = getContentRoot();
  const dir = path.join(root, "adapters");
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort();
  CACHE.adapters = files.map((f) => {
    const slug = f.replace(/\.md$/, "");
    const body = fs.readFileSync(path.join(dir, f), "utf8");
    const title = body.split("\n")[0]?.replace(/^#\s+/, "") || slug;
    return { slug, title, body };
  });
  return CACHE.adapters;
}

export function getDomainMeta(slug: string): DomainMeta | undefined {
  const root = getContentRoot();
  const p = path.join(root, "domains", slug, "_domain.md");
  if (!fs.existsSync(p)) return { slug, raw: "" };
  const raw = fs.readFileSync(p, "utf8");
  const title =
    raw.match(/^#\s+(.+)$/m)?.[1] ||
    slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return { slug, title, raw };
}

export function getCategoryMeta(
  domain: string,
  category: string,
): CategoryMeta | undefined {
  const root = getContentRoot();
  const p = path.join(root, "domains", domain, category, "_category.md");
  if (!fs.existsSync(p)) {
    return { domain, category, raw: "" };
  }
  const raw = fs.readFileSync(p, "utf8");
  const title = raw.match(/^#\s+(.+)$/m)?.[1] || category;
  const desc = raw.match(/##\s+Kurzbeschreibung\s*\n+([^\n#]+)/)?.[1]?.trim();
  const descEn = raw.match(/##\s+Summary\s*\n+([^\n#]+)/)?.[1]?.trim();
  return {
    domain,
    category,
    title,
    description: descEn || desc,
    raw,
  };
}

export function getSiteStats(): SiteStats {
  const catalog = loadCatalog();
  const categoryCount = catalog.domains.reduce(
    (n, d) => n + d.category_count,
    0,
  );
  const mcp = getMcpCatalog();
  const templates = getAllTemplates();
  const platformSet = new Set<string>();
  for (const t of templates) {
    for (const a of t.frontmatter.target_agents) platformSet.add(a);
  }
  return {
    domainCount: catalog.domains.length,
    categoryCount,
    templateCount: templates.length,
    mcpServerCount: mcp.count ?? mcp.servers.length,
    platforms: [...platformSet].sort(),
  };
}

export function getTemplatesByDomain(domain: string): TemplateDocument[] {
  return getAllTemplates().filter((t) => t.frontmatter.domain === domain);
}

export function getTemplatesByCategory(
  domain: string,
  category: string,
): TemplateDocument[] {
  return getAllTemplates().filter(
    (t) =>
      t.frontmatter.domain === domain && t.frontmatter.category === category,
  );
}

/** JSON payload for client-side catalog search (embedded at build time). */
export function getCatalogSearchPayload() {
  return getAllTemplates().map((t) => ({
    id: t.frontmatter.id,
    title: t.frontmatter.title,
    domain: t.frontmatter.domain,
    category: t.frontmatter.category,
    tags: t.frontmatter.tags,
    target_agents: t.frontmatter.target_agents,
    risk_level: t.frontmatter.risk_level,
    updated: t.frontmatter.updated,
    searchText: t.searchText,
    qualityLevel: getTemplateQuality(t).level,
  }));
}