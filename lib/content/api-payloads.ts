import { exportTemplate } from "@/lib/export";
import { MCP_CLIENTS } from "@/lib/export/mcp-config";
import { siteMetadataBase } from "@/lib/i18n";
import { formatSlugLabel } from "@/lib/utils";
import { githubBlobUrl } from "./config";
import { EXPORT_TARGETS, PLATFORM_LABELS } from "./constants";
import { getAllTemplates, getCatalog, getMcpCatalog } from "./loader";
import { resolveMcpTools } from "./resolve-mcp-tools";
import type { TemplateDocument } from "./types";

function templateIndexEntry({ frontmatter }: TemplateDocument) {
  const { id, title, domain, category, tags, target_agents, risk_level, version, updated } =
    frontmatter;
  const slug = encodeURIComponent(id);

  return {
    id,
    title,
    domain,
    category,
    tags,
    target_agents,
    risk_level,
    version,
    updated,
    required_tools: frontmatter.required_tools.map(({ name, install, version_notes }) => ({
      name,
      install,
      version_notes,
    })),
    json_url: `/api/templates/${slug}.json`,
    page_url: `/templates/${slug}`,
  };
}

export function buildTemplatesIndexJson(
  templates = getAllTemplates(),
  { generated_at, domains } = getCatalog(),
  siteUrl = siteMetadataBase(),
) {
  return {
    generated_at,
    count: templates.length,
    site_url: siteUrl,
    domains,
    templates: templates.map(templateIndexEntry),
  };
}

export function buildTemplateDetailJson(
  doc: TemplateDocument,
  mcpCatalog = getMcpCatalog(),
  sourceUrl = githubBlobUrl(doc.filePath),
) {
  const { frontmatter, sections } = doc;

  return {
    ...templateIndexEntry(doc),
    inputs: frontmatter.inputs,
    outputs: frontmatter.outputs,
    example_count: frontmatter.example_count,
    grokbot_template_url: frontmatter.grokbot_template_url,
    purpose: sections.purpose ?? "",
    when_to_use: sections.whenToUse ?? "",
    tool_stack: sections.toolStack ?? "",
    system_prompt: sections.systemPromptText ?? sections.systemPrompt ?? "",
    workflow: sections.workflow ?? "",
    definition_of_done: sections.definitionOfDone ?? "",
    security: sections.security ?? "",
    pitfalls: sections.pitfalls ?? "",
    examples: sections.examplesParsed,
    examples_markdown: sections.examples ?? "",
    resolved_mcp_tools: resolveMcpTools(frontmatter.required_tools, mcpCatalog),
    exports: EXPORT_TARGETS.map((target) => {
      const { filename, mimeType, description, extraFiles } = exportTemplate(doc, target);
      return {
        target,
        filename,
        mime_type: mimeType,
        description,
        ...(extraFiles?.length
          ? {
              extra_files: extraFiles.map((f) => ({
                filename: f.filename,
                mime_type: f.mimeType,
              })),
            }
          : {}),
      };
    }),
    source_url: sourceUrl,
    changelog: doc.changelog,
  };
}

function purposeSummary(purpose = "") {
  const summary = purpose
    .split(/\r?\n\s*\r?\n/, 1)[0]
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

  return summary.length > 200
    ? `${summary.slice(0, 199).trimEnd()}…`
    : summary || "See the template for its purpose.";
}

function listLink(title: string, url: string, description?: string) {
  const label = title.replace(/[\\[\]]/g, "\\$&").replace(/\s+/g, " ");
  return `- [${label}](${url})${description ? `: ${description}` : ""}`;
}

export function buildLlmsTxt(
  templates = getAllTemplates(),
  { domains } = getCatalog(),
  mcpCatalog = getMcpCatalog(),
  siteUrl = siteMetadataBase(),
) {
  return [
    "# AgentStencil",
    "",
    "> AgentStencil is a public catalog of reusable AI agent instruction templates with platform exports and MCP configuration guidance.",
    "",
    `${templates.length} templates across ${domains.length} domains and ${mcpCatalog.count ?? mcpCatalog.servers.length} MCP servers.`,
    "",
    "## Key resources",
    "",
    listLink("Template catalog", `${siteUrl}/catalog`, "Browse and search templates."),
    listLink("Curated Packs", `${siteUrl}/packs`, "Browse free template collections for common workflows."),
    listLink("MCP catalog", `${siteUrl}/mcp`, "Browse MCP servers and their usage notes."),
    listLink("How it works", `${siteUrl}/how-it-works`, "Read the template setup guide."),
    listLink("Template index JSON", `${siteUrl}/api/templates.json`, "Lists templates and their detail URLs."),
    "",
    "Template details are available at `/api/templates/<id>.json`. Use each index entry's `json_url`.",
    "",
    "## Export targets",
    "",
    ...EXPORT_TARGETS.map((target) => `- ${PLATFORM_LABELS[target]} (\`${target}\`)`),
    "",
    "## MCP configuration clients",
    "",
    ...Object.entries(MCP_CLIENTS).map(([client, { label }]) => `- ${label} (\`${client}\`)`),
    "",
    "## Domains",
    "",
    ...domains.map(({ slug }) =>
      listLink(formatSlugLabel(slug), `${siteUrl}/domains/${encodeURIComponent(slug)}`),
    ),
    "",
    "## Templates",
    "",
    ...templates.map(({ frontmatter, sections }) =>
      listLink(
        frontmatter.title,
        `${siteUrl}/templates/${encodeURIComponent(frontmatter.id)}`,
        purposeSummary(sections.purpose),
      ),
    ),
    "",
  ].join("\n");
}
