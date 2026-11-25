import type { TemplateDocument } from "@/lib/content/types";

export type SectionTextKey =
  | "purpose"
  | "whenToUse"
  | "toolStack"
  | "workflow"
  | "definitionOfDone"
  | "security"
  | "pitfalls";

export function section(
  doc: TemplateDocument,
  key: SectionTextKey,
  fallback = "",
): string {
  const v = doc.sections[key];
  return typeof v === "string" ? v.trim() : fallback;
}

export function systemInstructions(doc: TemplateDocument): string {
  return doc.sections.systemPromptText || section(doc, "purpose");
}

export function toolPlaceholders(doc: TemplateDocument): string[] {
  return doc.frontmatter.required_tools.map(
    (t) => `- ${t.name}: ${t.install}${t.version_notes ? ` (${t.version_notes})` : ""}`,
  );
}

/** Strip common inline markdown markers so plain-text exports read naturally when pasted. */
export function stripMarkdownInline(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1");
}

export function hermesSkillDescription(doc: TemplateDocument): string {
  const purpose = section(doc, "purpose");
  const line = purpose
    ? purpose.split(/\n+/).find((entry) => entry.trim())?.replace(/\s+/g, " ").trim() ?? ""
    : "";
  const cleaned = line ? stripMarkdownInline(line) : "";
  if (cleaned) return cleaned.length <= 1024 ? cleaned : `${cleaned.slice(0, 1021)}...`;
  const title = doc.frontmatter.title.trim();
  return title.endsWith(".") ? title : `${title}.`;
}