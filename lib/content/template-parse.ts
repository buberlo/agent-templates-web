import matter from "gray-matter";
import { parseSections, stripMarkdownForSearch } from "./sections";
import type { TemplateDocument, TemplateFrontmatter } from "./types";

export function formatInvalidFrontmatterWarning(
  relativePath: string,
  err: unknown,
): string {
  const message = err instanceof Error ? err.message : String(err);
  return `[content] Skipping template with invalid YAML frontmatter: ${relativePath}\n  ${message}`;
}

/** Parse template markdown; returns null when frontmatter YAML is invalid. */
export function parseTemplateRaw(
  raw: string,
  relativePath: string,
): TemplateDocument | null {
  let data: unknown;
  let content: string;
  try {
    const parsed = matter(raw);
    data = parsed.data;
    content = parsed.content;
  } catch (err) {
    console.warn(formatInvalidFrontmatterWarning(relativePath, err));
    return null;
  }

  const frontmatter = data as TemplateFrontmatter;
  const sections = parseSections(content);
  const searchText = stripMarkdownForSearch(
    [
      frontmatter.title,
      frontmatter.id,
      frontmatter.domain,
      frontmatter.category,
      ...(frontmatter.tags || []),
      ...(frontmatter.target_agents || []),
      sections.systemPromptText || "",
      content,
    ].join(" "),
  );
  return {
    frontmatter,
    sections,
    body: content,
    filePath: relativePath.replace(/\\/g, "/"),
    searchText,
  };
}