import { agentLabel, normalizeAgentId } from "./agents";
import { getAllTemplates } from "./loader";
import type { TemplateDocument } from "./types";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";
import { formatSlugLabel } from "@/lib/utils";

export const USE_CASE_MIN_TEMPLATES = 3;

export interface UseCaseLanding {
  agent: string;
  domain: string;
  templates: TemplateDocument[];
  title: string;
  intro: string;
  canonicalPath: string;
}

function summarizePurposes(templates: TemplateDocument[], max = 3): string[] {
  return templates
    .map((doc) => doc.sections.purpose?.split(/\n\s*\n/, 1)[0]?.trim())
    .filter((line): line is string => Boolean(line))
    .slice(0, max);
}

export function buildUseCaseIntro(
  locale: Locale,
  agent: string,
  domain: string,
  templates: TemplateDocument[],
): string {
  const labels = getDictionary(locale).platforms;
  const agentName = agentLabel(agent, labels);
  const domainLabel = formatSlugLabel(domain);
  const categories = [...new Set(templates.map((t) => t.frontmatter.category))].sort();
  const categoryText =
    categories.length === 1
      ? formatSlugLabel(categories[0])
      : `${categories.length} categories`;
  const purposes = summarizePurposes(templates);
  const purposeClause = purposes.length
    ? ` Topics include ${purposes.join("; ")}.`
    : "";
  return (
    `${agentName} teams use these ${templates.length} AgentStencil templates for ${domainLabel} ` +
    `workflows (${categoryText}). Each entry includes export targets, MCP tool notes, and quality checks.${purposeClause}`
  );
}

export function listUseCaseLandings(locale: Locale = "en"): UseCaseLanding[] {
  const byKey = new Map<string, TemplateDocument[]>();

  for (const doc of getAllTemplates()) {
    const domain = doc.frontmatter.domain;
    const agents = new Set(
      doc.frontmatter.target_agents.map((value) => normalizeAgentId(value)).filter(Boolean),
    );
    for (const agent of agents) {
      const key = `${agent}\0${domain}`;
      const bucket = byKey.get(key) ?? [];
      bucket.push(doc);
      byKey.set(key, bucket);
    }
  }

  const landings: UseCaseLanding[] = [];
  for (const [key, templates] of byKey.entries()) {
    if (templates.length < USE_CASE_MIN_TEMPLATES) continue;
    const [agent, domain] = key.split("\0");
    const sorted = [...templates].sort((a, b) =>
      a.frontmatter.title.localeCompare(b.frontmatter.title),
    );
    const agentName = agentLabel(agent, getDictionary(locale).platforms);
    const domainLabel = formatSlugLabel(domain);
    landings.push({
      agent,
      domain,
      templates: sorted,
      title: `${agentName} templates for ${domainLabel}`,
      intro: buildUseCaseIntro(locale, agent, domain, sorted),
      canonicalPath: `/use-cases/${encodeURIComponent(agent)}/${encodeURIComponent(domain)}`,
    });
  }

  return landings.sort((a, b) => a.title.localeCompare(b.title));
}

export function getUseCaseLanding(
  agentParam: string,
  domain: string,
  locale: Locale = "en",
): UseCaseLanding | undefined {
  const agent = normalizeAgentId(agentParam);
  return listUseCaseLandings(locale).find(
    (entry) => entry.agent === agent && entry.domain === domain,
  );
}