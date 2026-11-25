import type { ParsedSections, TemplateExample } from "./sections";

export interface RequiredTool {
  name: string;
  install: string;
  version_notes: string;
}

export interface TemplateFrontmatter {
  id: string;
  title: string;
  domain: string;
  category: string;
  tags: string[];
  target_agents: string[];
  required_tools: RequiredTool[];
  grokbot_template_url?: string;
  inputs: string[];
  outputs: string[];
  risk_level: "low" | "medium" | "high";
  example_count: number;
  version: string;
  updated: string;
}

export interface CatalogTemplateEntry {
  id: string;
  title: string;
  domain: string;
  category: string;
  tags: string[];
  target_agents: string[];
  risk_level: string;
  example_count: number;
  version: string;
  updated: string;
  path: string;
}

export interface CatalogCategory {
  slug: string;
  template_count: number;
}

export interface CatalogDomain {
  slug: string;
  category_count: number;
  template_count: number;
  categories: CatalogCategory[];
}

export interface CatalogJson {
  generated_at: string;
  domains: CatalogDomain[];
  templates: CatalogTemplateEntry[];
}

export interface TemplateChangelogEntry {
  sha: string;
  date: string;
  subject: string;
}

export interface TemplateDocument {
  frontmatter: TemplateFrontmatter;
  sections: ParsedSections;
  body: string;
  filePath: string;
  searchText: string;
  changelog: TemplateChangelogEntry[];
}

export interface CategoryMeta {
  domain: string;
  category: string;
  title?: string;
  description?: string;
  raw: string;
}

export interface DomainMeta {
  slug: string;
  title?: string;
  raw: string;
}

export interface McpServerEntry {
  name: string;
  url: string;
  type: string;
  stars: number | null;
  categories: string[];
  auth: string;
  risk_notes: string;
}

export interface McpCatalog {
  generated_at: string;
  count: number;
  servers: McpServerEntry[];
}

export interface AdapterNote {
  slug: string;
  title: string;
  body: string;
}

export interface SiteStats {
  domainCount: number;
  categoryCount: number;
  templateCount: number;
  mcpServerCount: number;
  platforms: string[];
}

export type { ParsedSections, TemplateExample };