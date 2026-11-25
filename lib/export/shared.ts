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