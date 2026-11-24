"use client";

import Link from "next/link";
import { ArrowUpRight, FileCode2 } from "lucide-react";
import { PLATFORM_LABELS } from "@/lib/content/constants";
import { formatSlugLabel } from "@/lib/utils";
import { RiskBadge } from "./risk-badge";
import { useLocale } from "./locale-provider";

export interface TemplateCardData {
  id: string;
  title: string;
  domain: string;
  category: string;
  tags: string[];
  target_agents: string[];
  risk_level: string;
}

export function TemplateCard({ template }: { template: TemplateCardData }) {
  const { href, dict } = useLocale();

  return (
    <article className="interactive-panel group relative flex min-w-0 flex-col p-5 focus-within:border-accent">
      <div className="mb-4 flex items-start justify-between gap-2">
        <span className="grid size-10 place-items-center rounded-lg bg-surface text-accent">
          <FileCode2 size={19} aria-hidden="true" />
        </span>
        <RiskBadge level={template.risk_level} />
      </div>
      <p className="mb-1 text-xs font-medium text-muted">{formatSlugLabel(template.domain)} / {formatSlugLabel(template.category)}</p>
      <h3 className="text-lg font-semibold leading-snug tracking-tight">
        <Link href={href(`/templates/${template.id}`)} className="flex items-start justify-between gap-2 rounded group-hover:text-accent after:absolute after:inset-0 after:rounded-[var(--radius)]">
          {template.title}
          <ArrowUpRight size={17} className="mt-1 shrink-0 text-accent transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </h3>
      {template.tags.length > 0 && <p className="mb-4 mt-2 text-sm text-muted [overflow-wrap:anywhere]">{template.tags.slice(0, 3).join(" · ")}</p>}
      {template.target_agents.length > 0 && (
        <ul aria-label={dict.common.allAgents} className="mt-auto flex flex-wrap gap-1.5 border-t pt-3">
          {template.target_agents.slice(0, 3).map((agent) => (
            <li key={agent} className="chip">{PLATFORM_LABELS[agent] || agent}</li>
          ))}
        </ul>
      )}
    </article>
  );
}
