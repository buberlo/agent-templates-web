import { EXPORT_TARGETS, type ExportTarget } from "@/lib/content/constants";
import type { TemplateDocument } from "@/lib/content/types";
import { EXTENDED_EXPORT_MAP } from "./extended-targets";
import { hermesSkillDescription, section, stripMarkdownInline } from "./shared";
import type { ExportResult } from "./types";

export type { ExportExtraFile, ExportResult } from "./types";
export { allExportFiles } from "./types";

function yamlQuoted(value: string): string {
  return JSON.stringify(value);
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

function hermesSkillMarkdown(doc: TemplateDocument): string {
  const fm = doc.frontmatter;
  const body = skillMarkdown(doc);
  return [
    "---",
    `name: ${fm.id}`,
    `description: ${yamlQuoted(hermesSkillDescription(doc))}`,
    "---",
    "",
    body,
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
    `description: ${fm.title} (AgentStencil)`,
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

function grokPlain(text: string): string {
  return stripMarkdownInline(text);
}

function grokBotMessage(doc: TemplateDocument): string {
  const fm = doc.frontmatter;
  const tools = fm.required_tools.map(({ name, install, version_notes }) =>
    grokPlain(`- ${[name, install, version_notes].filter(Boolean).join(" — ")}`),
  );

  return [
    grokPlain(`Your role is ${fm.title}. Use the following instructions for this job.`),
    "",
    "Job",
    grokPlain(section(doc, "purpose") || fm.title),
    "",
    "System prompt",
    grokPlain(doc.sections.systemPromptText || doc.sections.systemPrompt || ""),
    "",
    "Workflow",
    grokPlain(section(doc, "workflow")),
    "",
    "Tool stack and sources",
    "Use the listed apps and MCP connectors as applicable. Tell me which ones I need to connect before you start.",
    ...tools,
    grokPlain(section(doc, "toolStack")),
    "",
    "Definition of done",
    grokPlain(section(doc, "definitionOfDone")),
    ...fm.outputs.map((output) => grokPlain(`- ${output}`)),
    "",
    "Security and approval boundaries",
    grokPlain(section(doc, "security")),
    "Ask me before taking any action that requires approval.",
    "",
    "Save this workflow as a reusable skill and remember these rules for future messages.",
    "If this work is recurring, propose a routine for my approval.",
  ].join("\n");
}

function markdownInstructions(doc: TemplateDocument, filename: string, description: string): ExportResult {
  return { filename, mimeType: "text/markdown", content: agentsMd(doc), description };
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
    content: hermesSkillMarkdown(doc),
    description:
      "Hermes skill with YAML frontmatter (name + description) for ~/.hermes/skills/<name>/SKILL.md",
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
  "windsurf": (doc) => markdownInstructions(doc, ".windsurfrules", "Windsurf instructions"),
  "gemini-cli": (doc) => markdownInstructions(doc, "GEMINI.md", "Gemini CLI instructions"),
  "copilot": (doc) => markdownInstructions(doc, ".github/copilot-instructions.md", "GitHub Copilot instructions"),
  "cline": (doc) => markdownInstructions(doc, ".clinerules", "Cline instructions"),
  kiro: (doc) => {
    const result = markdownInstructions(doc, `.kiro/steering/${doc.frontmatter.id}.md`, "Kiro steering");
    return { ...result, content: `---\ninclusion: always\n---\n\n${result.content}` };
  },
  generic: (doc) => ({
    filename: `${doc.frontmatter.id}-system-prompt.txt`,
    mimeType: "text/plain",
    content: genericPrompt(doc),
    description: "Portable ROLE/TOOLS/WORKFLOW prompt block",
  }),
  ...EXTENDED_EXPORT_MAP,
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
  const target = agent === "generic-mcp-agents"
    ? "generic"
    : EXPORT_TARGETS.find((entry) => entry === agent);
  if (!target) return null;
  return exportTemplate(doc, target);
}

export { EXPORT_MAP };