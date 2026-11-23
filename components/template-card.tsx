import Link from "next/link";
import { PLATFORM_LABELS } from "@/lib/content/constants";
import { RiskBadge } from "./risk-badge";

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
  return (
    <article className="flex flex-col rounded-xl border border-border bg-card/60 p-5 transition hover:border-sky-500/40 hover:bg-card">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <RiskBadge level={template.risk_level} />
        <span className="text-xs text-muted">
          {template.domain}/{template.category}
        </span>
      </div>
      <h3 className="text-lg font-semibold leading-snug">
        <Link href={`/templates/${template.id}`} className="hover:text-sky-400">
          {template.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-2 text-sm text-muted">
        {template.tags.slice(0, 4).join(" · ")}
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {template.target_agents.slice(0, 4).map((a) => (
          <span
            key={a}
            className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-muted"
          >
            {PLATFORM_LABELS[a] || a}
          </span>
        ))}
      </div>
    </article>
  );
}