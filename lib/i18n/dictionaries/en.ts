import type { Dictionary } from "../types";

const en: Dictionary = {
  site: {
    name: "Agent Templates",
    phaseBadge: "Phase 1 · Public catalog",
  },
  nav: {
    catalog: "Catalog",
    mcp: "MCP servers",
    contentRepo: "Content repo",
  },
  language: {
    label: "Language",
    en: "English",
    de: "Deutsch",
  },
  theme: {
    switchToLight: "Switch to light mode",
    switchToDark: "Switch to dark mode",
  },
  footer: {
    contentFrom: "Content from",
    phaseNote:
      "This site is read-only; no accounts or reviews in phase 1.",
    websiteRepo: "Website repo",
  },
  common: {
    catalog: "Catalog",
    templates: "templates",
    template: "template",
    version: "Version",
    updated: "Updated",
    tags: "Tags",
    inputs: "Inputs",
    outputs: "Outputs",
    metadata: "Metadata",
    source: "Source",
    viewOnGitHub: "View on GitHub",
    suggestImprovement: "Suggest an improvement",
    copy: "Copy",
    copied: "Copied",
    idLabel: "id",
    noTemplatesMatch: "No templates match your filters.",
    allDomains: "All domains",
    allCategories: "All categories",
    allAgents: "All agents",
    allRisk: "All risk levels",
    allTags: "All tags",
    showingCount: "Showing {shown} of {total} templates",
    generatedAt: "Catalog generated at",
    categories: "Categories",
    auth: "Auth",
    name: "Name",
    type: "Type",
  },
  risk: {
    suffix: "risk",
    low: "low",
    medium: "medium",
    high: "high",
  },
  exampleKind: {
    synthetic: "Example data",
    realWorld: "Real-world example",
    unknown: "Example",
  },
  home: {
    title: "Reusable agent instruction templates",
    introBeforeLink: "This site renders ",
    introAfterLink:
      " at build time: domains, categories, MCP catalog, and platform-specific exports — no content is copied into this repository.",
    browseCatalog: "Browse catalog",
    mcpServers: "MCP servers",
    countsHeading: "Counts from the content repo",
    countsTemplates: "Templates",
    countsDomains: "Domains",
    countsCategories: "Categories",
    countsMcp: "MCP catalog entries",
    platformsHeading: "Supported platforms",
    platformsIntro:
      "Each template lists target agents. Export adapts the system prompt and workflow for:",
    adaptersNote:
      "Integration notes live in the content repo under adapters/",
    domainsHeading: "Domains",
    viewAllCatalog: "View all in the catalog",
  },
  catalog: {
    title: "Template catalog",
    intro:
      "Full-text search across titles, tags, and prompt bodies (indexed at build time).",
    searchPlaceholder: "Full-text search (title, tags, prompt text)…",
    searchLabel: "Search templates",
  },
  mcp: {
    title: "MCP server catalog",
    intro:
      "{count} entries from mcp/catalog.json in the content repo (generated {date}).",
  },
  domain: {
    statsLine: "{templates} templates across {categories} categories",
    allTemplates: "All templates",
    domainMeta: "Agent templates in the {domain} domain.",
  },
  template: {
    notFound: "Template not found",
    noPromptBlock: "No fenced prompt block found.",
    sections: {
      purpose: "Purpose",
      whenToUse: "When to use",
      toolStack: "Tool stack",
      systemPrompt: "System prompt",
      workflow: "Workflow",
      definitionOfDone: "Definition of done",
      security: "Security",
      pitfalls: "Pitfalls",
      examples: "Examples",
    },
    copyPrompt: "Copy prompt",
  },
  export: {
    heading: "Export for your platform",
    download: "Download",
    copyExport: "Copy export",
    platformLabel: "Export target platform",
    descriptions: {
      hermes: "Hermes skill (system prompt + workflow, no YAML frontmatter)",
      openclaw: "OpenClaw skill body (verify before production)",
      "claude-code": "Claude Code project instructions",
      codex: "Codex / multi-agent AGENTS.md",
      cursor: "Cursor rule file (.mdc)",
      generic: "Portable ROLE/TOOLS/WORKFLOW prompt block",
    },
  },
  meta: {
    titleDefault: "Agent Templates",
    titleTemplate: "%s · Agent Templates",
    description:
      "Browse, search, and export reusable AI agent instruction templates from the buberlo/agent-templates database.",
    ogDescription:
      "Reusable agent prompts for Hermes, OpenClaw, Claude Code, Codex, Cursor, and more.",
    catalogTitle: "Catalog",
    catalogDescription:
      "Search and filter agent templates by domain, category, agent, risk, and tags.",
    mcpTitle: "MCP catalog",
    mcpDescription:
      "MCP servers referenced by the agent-templates content database.",
    ogHomeTitle: "Reusable agent instruction library",
    ogHomeSubtitle: "templates · domains · MCP entries",
    ogTemplateBrand: "Agent Templates",
  },
};

export default en;