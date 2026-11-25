import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Layers } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { TemplateCard } from "@/components/template-card";
import { getAllTemplates } from "@/lib/content/loader";
import {
  curatedPacks,
  getPack,
  getPackDomains,
  getPackInstallCommand,
  getPackMcpTools,
  resolvePackTemplates,
} from "@/lib/content/packs";
import { formatMessage, getDictionary, localizePath, type Locale } from "@/lib/i18n";
import { formatSlugLabel } from "@/lib/utils";

export function PacksPageContent({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const templates = getAllTemplates();

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <h1 className="page-title">{d.packs.title}</h1>
        <p className="max-w-2xl text-muted">{d.packs.intro}</p>
      </header>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {curatedPacks.map((pack) => {
          const { title, description } = d.packs.entries[pack.slug];
          const count = resolvePackTemplates(pack, templates).length;
          return (
            <li key={pack.slug} className="interactive-panel group relative flex min-w-0 flex-col p-5 focus-within:border-accent">
              <span className="mb-4 grid size-10 place-items-center rounded-lg bg-surface text-accent">
                <Layers size={19} aria-hidden="true" />
              </span>
              <h2 className="text-lg font-semibold leading-snug tracking-tight">
                <Link href={localizePath(locale, `/packs/${pack.slug}`)} className="flex items-start justify-between gap-2 rounded group-hover:text-accent after:absolute after:inset-0 after:rounded-[var(--radius)]">
                  {title}
                  <ArrowUpRight size={17} className="mt-1 shrink-0 text-accent" aria-hidden="true" />
                </Link>
              </h2>
              <p className="mb-4 mt-2 text-sm leading-relaxed text-muted">{description}</p>
              <p className="mt-auto border-t pt-3 text-xs text-muted">{formatMessage(d.packs.templateCount, { count })}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function PackPageContent({ locale, slug }: { locale: Locale; slug: string }) {
  const pack = getPack(slug);
  if (!pack) notFound();

  const d = getDictionary(locale);
  const { title, description } = d.packs.entries[pack.slug];
  const templates = resolvePackTemplates(pack);
  const domains = getPackDomains(templates);
  const tools = getPackMcpTools(templates);
  const command = getPackInstallCommand(templates);

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-sm text-muted">
          <Link href={localizePath(locale, "/packs")} className="hover:text-foreground">{d.packs.title}</Link>{" "}
          / {title}
        </p>
        <h1 className="page-title">{title}</h1>
        <p className="max-w-2xl text-muted">{description}</p>
        <ul aria-label={d.packs.domains} className="flex flex-wrap gap-1.5">
          {domains.map((domain) => (
            <li key={domain}>
              <Link href={localizePath(locale, `/domains/${domain}`)} className="chip min-h-7 hover:text-accent">{formatSlugLabel(domain)}</Link>
            </li>
          ))}
        </ul>
      </header>

      <section>
        <h2 className="text-xl font-semibold">{d.packs.includedTemplates}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map(({ frontmatter }) => <TemplateCard key={frontmatter.id} template={frontmatter} />)}
        </div>
      </section>

      {tools.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold">{formatMessage(d.packs.toolCount, { count: tools.length })}</h2>
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {tools.map((tool) => <li key={tool.slug} className="chip">{tool.name}</li>)}
          </ul>
        </section>
      )}

      {command && (
        <section className="panel min-w-0 space-y-3 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">{d.packs.install}</h2>
            <CopyButton text={command} />
          </div>
          <p className="text-sm text-muted">{d.packs.installIntro}</p>
          <pre className="overflow-x-auto rounded-lg border bg-surface p-4 text-sm"><code>{command}</code></pre>
        </section>
      )}
    </div>
  );
}
