import { getAllTemplates, getMcpCatalog } from "./loader";
import { resolveMcpTools } from "./resolve-mcp-tools";
import type { TemplateDocument } from "./types";

export const curatedPacks = [
  {
    slug: "developer-code-review",
    templateIds: ["coding-workflow", "code-review-mcp-focus", "testing-workflow", "refactoring-workflow", "tech-docs-workflow"],
  },
  {
    slug: "devops-cloud-operations",
    templateIds: ["coding-github-actions-ci-pipeline", "docker-container-workflow", "k8s-kubectl-rollout-debug", "monitoring-observability-mcp-focus", "incident-response-workflow"],
  },
  {
    slug: "research-grounded-knowledge",
    templateIds: ["web-exa-perplexity-briefing", "academic-workflow", "library-zotero-mcp-focus", "grounded-citations-workflow", "wikis-documentation-workflow"],
  },
  {
    slug: "security-compliance-baseline",
    templateIds: ["it-ansible-patch-baseline", "backup-restore-workflow", "email-postfix-dmarc-parse", "privacy-compliance-workflow"],
  },
  {
    slug: "ai-ops-mcp-builder",
    templateIds: ["mcp-server-build-workflow", "skills-authoring-workflow", "context-token-management-mcp-focus", "evals-benchmarks-workflow", "model-routing-workflow"],
  },
  {
    slug: "office-document-automation",
    templateIds: ["ocr-workflow", "word-docx-mcp-focus", "excel-xlsx-workflow", "powerpoint-pptx-workflow", "documents-pandoc-markdown-pdf"],
  },
  {
    slug: "content-growth-operations",
    templateIds: ["content-strategy-workflow", "copywriting-workflow", "seo-workflow", "newsletter-workflow", "social-buffer-schedule-campaign"],
  },
  {
    slug: "support-crm-operations",
    templateIds: ["support-ticket-triage-reply-v1", "escalation-workflow", "help-center-kb-gap-analysis-v1", "qos-csat-workflow", "crm-workflow"],
  },
] as const;

type CuratedPack = (typeof curatedPacks)[number];
export type PackSlug = CuratedPack["slug"];

export function getPack(slug: string): CuratedPack | undefined {
  return curatedPacks.find((pack) => pack.slug === slug);
}

export function resolvePackTemplates(
  { templateIds }: { templateIds: readonly string[] },
  templates = getAllTemplates(),
): TemplateDocument[] {
  const byId = new Map(templates.map((template) => [template.frontmatter.id, template]));
  return [...new Set(templateIds)].flatMap((id) => {
    const template = byId.get(id);
    return template ? [template] : [];
  });
}

export function getPackDomains(templates: readonly TemplateDocument[]): string[] {
  return [...new Set(templates.map(({ frontmatter }) => frontmatter.domain))].sort();
}

export function getPackMcpTools(templates: readonly TemplateDocument[], catalog = getMcpCatalog()) {
  return resolveMcpTools(templates.flatMap(({ frontmatter }) => frontmatter.required_tools), catalog);
}

export function getPackInstallCommand(templates: readonly TemplateDocument[]): string {
  const ids = new Set(templates.map(({ frontmatter }) => frontmatter.id));
  return [...ids].map((id) => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
      throw new Error(`Invalid pack template ID: ${JSON.stringify(id)}`);
    }
    return `npx agentstencil add ${id} --target generic`;
  }).join(" &&\n");
}
