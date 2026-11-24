import type { ExportTarget } from "@/lib/content/constants";
import type { TemplateDocument } from "@/lib/content/types";

export interface ExportResult {
  filename: string;
  mimeType: string;
  content: string;
  description: string;
}

type SectionTextKey =
  | "purpose"
  | "whenToUse"
  | "toolStack"
  | "workflow"
  | "definitionOfDone"
  | "security"
  | "pitfalls";

function section(
  doc: TemplateDocument,
  key: SectionTextKey,
  fallback = "",
): string {
  const v = doc.sections[key];
  return typeof v === "string" ? v.trim() : fallback;
}

function skillMarkdown(doc: TemplateDocument): string {
  const fm = doc.frontmatter;
  const prompt = doc.sections.systemPromptText || "";
  const workflow = section(doc, "workflow");
  const safety = section(doc, "security");
  return [
    `# ${fm.title}`,
    "",
    prompt,
    "",
    "## Workflow",
    "",
    workflow,
    "",
    "## Safety",
    "",
    safety,
  ]
    .join("\n")
    .trim();
}

function claudeMarkdown(doc: TemplateDocument): string {
  const fm = doc.frontmatter;
  const prompt = doc.sections.systemPromptText || "";
  return [
    `# ${fm.title}`,
    "",
    `Domain: \`${fm.domain}/${fm.category}\` · Risk: **${fm.risk_level}**`,
    "",
    "## Agent instructions",
    "",
    prompt,
    "",
    "## Workflow",
    "",
    section(doc, "workflow"),
    "",
    "## Definition of done",
    "",
    section(doc, "definitionOfDone"),
    "",
    "## Security",
    "",
    section(doc, "security"),
  ]
    .join("\n")
    .trim();
}

function agentsMd(doc: TemplateDocument): string {
  const fm = doc.frontmatter;
  const tools = fm.required_tools
    .map((t) => `- ${t.name}: ${t.install}`)
    .join("\n");
  return [
    `# ${fm.title}`,
    "",
    "## Role",
    "",
    section(doc, "purpose"),
    "",
    "## Tools",
    "",
    tools,
    "",
    "## Instructions",
    "",
    doc.sections.systemPromptText || "",
    "",
    "## Workflow",
    "",
    section(doc, "workflow"),
    "",
    "## Outputs",
    "",
    fm.outputs.map((o) => `- ${o}`).join("\n"),
    "",
    "## Safety",
    "",
    section(doc, "security"),
  ]
    .join("\n")
    .trim();
}

function cursorRules(doc: TemplateDocument): string {
  const fm = doc.frontmatter;
  const prompt = doc.sections.systemPromptText || section(doc, "purpose");
  return [
    `---`,
    `description: ${fm.title} (agent-templates)`,
    `globs: **/*`,
    `alwaysApply: false`,
    `---`,
    "",
    `# ${fm.title}`,
    "",
    prompt,
    "",
    "## Workflow",
    "",
    section(doc, "workflow"),
    "",
    "## Pitfalls",
    "",
    section(doc, "pitfalls"),
  ]
    .join("\n")
    .trim();
}

function genericPrompt(doc: TemplateDocument): string {
  const fm = doc.frontmatter;
  return [
    `ROLE: ${fm.title}`,
    "",
    "PURPOSE:",
    section(doc, "purpose"),
    "",
    "TOOLS:",
    ...fm.required_tools.map((t) => `- ${t.name}: ${t.install}`),
    "",
    "INSTRUCTIONS:",
    doc.sections.systemPromptText || "",
    "",
    "WORKFLOW:",
    section(doc, "workflow"),
    "",
    "SAFETY:",
    section(doc, "security"),
  ]
    .join("\n")
    .trim();
}

function grokBotMessage(doc: TemplateDocument): string {
  const fm = doc.frontmatter;
  const tools = fm.required_tools.map(({ name, install, version_notes }) =>
    `- ${[name, install, version_notes].filter(Boolean).join(" — ")}`,
  );

  return [
    `Your role is ${fm.title}. Use the following instructions for this job.`,
    "",
    "Job",
    section(doc, "purpose") || fm.title,
    "",
    "System prompt",
    doc.sections.systemPromptText || doc.sections.systemPrompt || "",
    "",
    "Workflow",
    section(doc, "workflow"),
    "",
    "Tool stack and sources",
    "Use the listed apps and MCP connectors as applicable. Tell me which ones I need to connect before you start.",
    ...tools,
    section(doc, "toolStack"),
    "",
    "Definition of done",
    section(doc, "definitionOfDone"),
    ...fm.outputs.map((output) => `- ${output}`),
    "",
    "Security and approval boundaries",
    section(doc, "security"),
    "Ask me before taking any action that requires approval.",
    "",
    "Save this workflow as a reusable skill and remember these rules for future messages.",
    "If this work is recurring, propose a routine for my approval.",
  ].join("\n");
}

const EXPORT_MAP: Record<
  ExportTarget,
  (doc: TemplateDocument) => ExportResult
> = {
  grokbot: (doc) => ({
    filename: `${doc.frontmatter.id}-grok-bot.txt`,
    mimeType: "text/plain",
    content: grokBotMessage(doc),
    description: "First setup message for a new Grok Bot",
  }),
  hermes: (doc) => ({
    filename: `${doc.frontmatter.id}-SKILL.md`,
    mimeType: "text/markdown",
    content: skillMarkdown(doc),
    description: "Hermes skill (system prompt + workflow, no YAML frontmatter)",
  }),
  openclaw: (doc) => ({
    filename: `${doc.frontmatter.id}-SKILL.md`,
    mimeType: "text/markdown",
    content: skillMarkdown(doc),
    description: "OpenClaw skill body (verify before production)",
  }),
  "claude-code": (doc) => ({
    filename: "CLAUDE.md",
    mimeType: "text/markdown",
    content: claudeMarkdown(doc),
    description: "Claude Code project instructions",
  }),
  codex: (doc) => ({
    filename: "AGENTS.md",
    mimeType: "text/markdown",
    content: agentsMd(doc),
    description: "Codex / multi-agent AGENTS.md",
  }),
  cursor: (doc) => ({
    filename: `${doc.frontmatter.id}.mdc`,
    mimeType: "text/markdown",
    content: cursorRules(doc),
    description: "Cursor rule file (.mdc)",
  }),
  generic: (doc) => ({
    filename: `${doc.frontmatter.id}-system-prompt.txt`,
    mimeType: "text/plain",
    content: genericPrompt(doc),
    description: "Portable ROLE/TOOLS/WORKFLOW prompt block",
  }),
};

export function exportTemplate(
  doc: TemplateDocument,
  target: ExportTarget,
): ExportResult {
  const fn = EXPORT_MAP[target];
  if (!fn) {
    throw new Error(`Unknown export target: ${target}`);
  }
  return fn(doc);
}

export function exportTemplateForAgents(
  doc: TemplateDocument,
  agent: string,
): ExportResult | null {
  const map: Record<string, ExportTarget> = {
    hermes: "hermes",
    openclaw: "openclaw",
    "claude-code": "claude-code",
    codex: "codex",
    cursor: "cursor",
    generic: "generic",
    "generic-mcp-agents": "generic",
    grokbot: "grokbot",
  };
  const target = map[agent];
  if (!target) return null;
  return exportTemplate(doc, target);
}

export { EXPORT_MAP };