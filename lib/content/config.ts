import path from "node:path";
import { CONTENT_REPO_NAME, CONTENT_REPO_OWNER } from "./constants";

export { CONTENT_REPO_NAME, CONTENT_REPO_OWNER };
export const CONTENT_REPO_DEFAULT_BRANCH =
  process.env.CONTENT_REPO_REF?.trim() || "main";

export function getContentRoot(): string {
  return (
    process.env.CONTENT_CACHE_DIR?.trim() ||
    path.join(process.cwd(), ".content-cache")
  );
}

export function githubBlobUrl(filePath: string, ref?: string): string {
  const branch = ref || CONTENT_REPO_DEFAULT_BRANCH;
  return `https://github.com/${CONTENT_REPO_OWNER}/${CONTENT_REPO_NAME}/blob/${branch}/${filePath}`;
}

export function githubRawUrl(filePath: string, ref?: string): string {
  const branch = ref || CONTENT_REPO_DEFAULT_BRANCH;
  return `https://raw.githubusercontent.com/${CONTENT_REPO_OWNER}/${CONTENT_REPO_NAME}/${branch}/${filePath}`;
}

export function suggestIssueUrl(templateId: string, filePath: string): string {
  const title = encodeURIComponent(`Improve template: ${templateId}`);
  const body = encodeURIComponent(
    `Template: \`${templateId}\`\nSource file: \`${filePath}\`\n\nDescribe your suggested improvement:\n`,
  );
  return `https://github.com/${CONTENT_REPO_OWNER}/${CONTENT_REPO_NAME}/issues/new?title=${title}&body=${body}`;
}

export { EXPORT_TARGETS, PLATFORM_LABELS, type ExportTarget } from "./constants";