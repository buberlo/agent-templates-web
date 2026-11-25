import assert from "node:assert/strict";
import test from "node:test";
import { MCP_CLIENTS } from "@/lib/export/mcp-config";
import { buildLlmsTxt, buildTemplateDetailJson, buildTemplatesIndexJson } from "./api-payloads";
import { EXPORT_TARGETS } from "./constants";
import type { CatalogJson, McpCatalog, TemplateDocument } from "./types";

const siteUrl = "https://agentstencil.example";
const generatedAt = "2026-01-01T00:00:00Z";
const filePath = "domains/writing/editing/copy-editor.md";
const mcpUrl = "https://tools.example/mcp";
const mcpCatalog: McpCatalog = {
  generated_at: generatedAt,
  count: 1,
  servers: [{
    name: "Dictionary MCP",
    url: mcpUrl,
    type: "http",
    stars: null,
    categories: ["writing"],
    auth: "OAuth",
    risk_notes: "Review requested permissions.",
  }],
};
const catalog: CatalogJson = {
  generated_at: generatedAt,
  domains: [{
    slug: "writing",
    category_count: 1,
    template_count: 1,
    categories: [{ slug: "editing", template_count: 1 }],
  }],
  templates: [],
};
const doc: TemplateDocument = {
  frontmatter: {
    id: "copy-editor",
    title: "Copy Editor",
    domain: "writing",
    category: "editing",
    tags: ["writing"],
    target_agents: ["codex"],
    required_tools: [
      { name: "Dictionary MCP", install: mcpUrl, version_notes: "Stable" },
      { name: "Unknown MCP", install: "Requires manual setup", version_notes: "" },
    ],
    inputs: ["Draft"],
    outputs: ["Edited draft"],
    risk_level: "low",
    example_count: 1,
    version: "1.0",
    updated: "2026-01-01",
  },
  sections: {
    purpose: "Review drafts for clarity.\n\nMore detail.",
    whenToUse: "When an article is ready for review.",
    toolStack: "Dictionary MCP.",
    systemPrompt: "```text\nReview the draft.\n```",
    systemPromptText: "Review the draft.",
    workflow: "Read, edit, and review.",
    definitionOfDone: "The draft is clear.",
    security: "Keep drafts private.",
    pitfalls: "Preserve the author's voice.",
    examples: "### Example 1\nEdit a sample article.",
    examplesParsed: [{ title: "Example 1", kind: "synthetic", body: "Edit a sample article." }],
  },
  body: "Internal raw body",
  filePath,
  searchText: "Internal search text",
  changelog: [],
};

test("llms.txt lists resources, capabilities, domains, and template summaries", () => {
  const output = buildLlmsTxt([doc], catalog, mcpCatalog, siteUrl);
  assert.ok(output.startsWith("# AgentStencil\n\n> "));
  assert.match(output, /1 templates across 1 domains and 1 MCP servers/);
  for (const heading of ["Key resources", "Export targets", "MCP configuration clients", "Domains", "Templates"]) {
    assert.ok(output.includes(`\n## ${heading}\n`));
  }
  for (const path of ["/catalog", "/packs", "/mcp", "/how-it-works", "/api/templates.json", "/domains/writing"]) {
    assert.ok(output.includes(`(${siteUrl}${path})`));
  }
  assert.ok(output.includes("/api/templates/<id>.json"));
  const exportSection = output.split("## Export targets")[1].split("##")[0];
  const clientSection = output.split("## MCP configuration clients")[1].split("##")[0];
  assert.deepEqual([...exportSection.matchAll(/`([^`]+)`/g)].map((match) => match[1]), [...EXPORT_TARGETS]);
  assert.deepEqual([...clientSection.matchAll(/`([^`]+)`/g)].map((match) => match[1]), Object.keys(MCP_CLIENTS));
  assert.ok(output.includes(`- [Copy Editor](${siteUrl}/templates/copy-editor): Review drafts for clarity.\n`));
  assert.ok(!output.includes("More detail."));
});

test("template index exposes the catalog timestamp and public metadata", () => {
  assert.deepEqual(buildTemplatesIndexJson([doc], catalog, siteUrl), {
    generated_at: generatedAt,
    count: 1,
    site_url: siteUrl,
    domains: catalog.domains,
    templates: [{
      id: "copy-editor",
      title: "Copy Editor",
      domain: "writing",
      category: "editing",
      tags: ["writing"],
      target_agents: ["codex"],
      risk_level: "low",
      version: "1.0",
      updated: "2026-01-01",
      required_tools: doc.frontmatter.required_tools,
      json_url: "/api/templates/copy-editor.json",
      page_url: "/templates/copy-editor",
    }],
  });
});

test("template detail preserves sections and only publishes known URLs and public fields", () => {
  const privateValue = "private-fixture-token";
  const sourceUrl = `https://github.com/buberlo/agent-templates/blob/main/${filePath}`;
  const detail = buildTemplateDetailJson({
    ...doc,
    frontmatter: { ...doc.frontmatter, ...{ internal_token: privateValue } },
  }, mcpCatalog, sourceUrl);
  const { sections } = doc;
  assert.deepEqual(detail, {
    ...buildTemplatesIndexJson([doc], catalog, siteUrl).templates[0],
    inputs: ["Draft"],
    outputs: ["Edited draft"],
    example_count: 1,
    grokbot_template_url: undefined,
    purpose: sections.purpose,
    when_to_use: sections.whenToUse,
    tool_stack: sections.toolStack,
    system_prompt: sections.systemPromptText,
    workflow: sections.workflow,
    definition_of_done: sections.definitionOfDone,
    security: sections.security,
    pitfalls: sections.pitfalls,
    examples: sections.examplesParsed,
    examples_markdown: sections.examples,
    resolved_mcp_tools: detail.resolved_mcp_tools,
    exports: detail.exports,
    source_url: sourceUrl,
    changelog: [],
  });
  assert.deepEqual(detail.resolved_mcp_tools.map(({ sourceUrls }) => sourceUrls), [[mcpUrl], []]);
  assert.deepEqual(detail.resolved_mcp_tools[0].endpoint, { url: mcpUrl, type: "http" });
  assert.equal(detail.resolved_mcp_tools[1].endpoint, undefined);
  assert.equal(detail.resolved_mcp_tools[1].launch, undefined);
  assert.deepEqual(detail.exports.map(({ target }) => target), [...EXPORT_TARGETS]);
  assert.ok(detail.exports.every(({ filename, mime_type }) => filename && mime_type));
  const serialized = JSON.stringify(detail);
  assert.ok(!serialized.includes(privateValue));
  assert.ok(!serialized.includes("grokbot_template_url"));
  assert.ok(!serialized.includes(doc.body));
  assert.ok(!serialized.includes(doc.searchText));
  assert.deepEqual(
    new Set(serialized.match(/https?:\/\/[^"]+/g)),
    new Set([mcpUrl, sourceUrl]),
  );
});
