import matter from "gray-matter";
import { parseSections, stripMarkdownForSearch } from "./sections";
import type { TemplateDocument, TemplateFrontmatter } from "./types";
import { resolveTemplateVersioning } from "./versioning";

export function formatInvalidFrontmatterWarning(
  relativePath: string,
  err: unknown,
): string {
  const message = err instanceof Error ? err.message : String(err);
  return `[content] Skipping template with invalid YAML frontmatter: ${relativePath}\n  ${message}`;
}

export function validateGrokBotTemplateUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || !/^https:\/\//i.test(value)) return undefined;

  try {
    const url = new URL(value);
    const isXaiHost = url.hostname === "x.ai" || url.hostname.endsWith(".x.ai");
    return url.protocol === "https:" && isXaiHost && !url.username && !url.password
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
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

  const { grokbot_template_url, ...fields } = data as TemplateFrontmatter;
  const grokBotTemplateUrl = validateGrokBotTemplateUrl(grokbot_template_url);
  const normalizedPath = relativePath.replace(/\\/g, "/");
  const versioning = resolveTemplateVersioning(
    normalizedPath,
    (fields as TemplateFrontmatter).version,
    (fields as TemplateFrontmatter).updated,
  );
  const frontmatter: TemplateFrontmatter = {
    ...fields,
    version: versioning.version,
    updated: versioning.updated,
    ...(grokBotTemplateUrl && { grokbot_template_url: grokBotTemplateUrl }),
  };
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
    filePath: normalizedPath,
    searchText,
    changelog: versioning.changelog,
  };
}