import Link from "next/link";
import { ArrowDownToLine, ArrowRight, Boxes, Braces, Command, Database, FileCode2, Layers, Search, Terminal, Workflow } from "lucide-react";
import { TemplateCard } from "@/components/template-card";
import { getCatalog } from "@/lib/content/loader";
import { getDictionary, localizePath, type Locale } from "@/lib/i18n";
import { formatSlugLabel } from "@/lib/utils";

const featuredIds = ["code-review-workflow", "grounded-citations-workflow", "data-duckdb-sql-report"];

const domainIcons = {
  "software-development": Braces,
  "ai-ops": Command,
  automation: Workflow,
  "data-analytics": Database,
  "devops-cloud": Terminal,
  "agent-platforms": Layers,
} as const;

export function HomePageContent({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const catalog = getCatalog();
  const catalogPath = localizePath(locale, "/catalog");
  const domains = Object.entries(domainIcons).flatMap(([slug, icon]) => {
    const domain = catalog.domains.find((item) => item.slug === slug);
    return domain ? [{ domain, icon }] : [];
  });
  const featured = featuredIds.flatMap((id) => {
    const template = catalog.templates.find((item) => item.id === id);
    return template ? [template] : [];
  });
  const extraTemplates = catalog.templates.filter((item) => !featured.includes(item));

  return (
    <div className="space-y-[var(--section-space)]">
      <section className="grid items-center gap-8 lg:grid-cols-[1.18fr_1fr] lg:gap-12">
        <div className="min-w-0 py-3 sm:py-6">
          <p className="section-kicker flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
            {d.site.name}
          </p>
          <h1 className="mt-5 text-[length:var(--type-display)] font-semibold leading-[.99] tracking-[-.065em]">
            {d.home.headlineStart}
            <span className="mt-1 block text-accent">{d.home.headlineEnd}</span>
          </h1>
          <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-muted sm:text-lg">
            {d.home.value}
          </p>
          <form action={catalogPath} role="search" className="panel mt-7 flex max-w-xl items-center gap-2 border-control p-1.5 shadow-[var(--shadow)]">
            <label htmlFor="home-query" className="sr-only">{d.catalog.searchLabel}</label>
            <Search size={19} className="ml-2 shrink-0 text-muted" aria-hidden="true" />
            <input id="home-query" name="q" type="search" placeholder={d.catalog.searchPlaceholder} className="min-h-11 min-w-0 flex-1 rounded bg-transparent text-base" />
            <button className="button-primary shrink-0" type="submit">
              {d.catalog.searchAction}<ArrowRight size={16} aria-hidden="true" className="hidden sm:block" />
            </button>
          </form>
          <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-muted">
            <span><strong className="text-foreground">{catalog.templates.length}</strong> {d.common.templates}</span>
            <span><strong className="text-foreground">{catalog.domains.length}</strong> {d.home.countsDomains}</span>
            <Link href={catalogPath} className="text-link inline-flex items-center gap-1">
              {d.home.browseCatalog} <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </p>
        </div>

        <div aria-hidden="true" className="hero-art relative hidden min-h-[25rem] items-center justify-center overflow-hidden rounded-[var(--radius)] border border-[#486451] px-10 py-12 sm:flex">
          <Braces size={210} strokeWidth={.45} className="absolute -right-10 -top-7 rotate-12 text-[#829e72] opacity-50" />
          <div className="hero-sheet relative w-full max-w-[22rem] -rotate-3 overflow-hidden rounded-xl border border-[#718d72] bg-[#11251d]">
            <div className="flex items-center gap-2 border-b border-[#49644f] bg-[#203a2d] px-4 py-3 font-mono text-sm">
              <FileCode2 size={16} className="text-[#cde998]" /> AGENTS.md
              <span className="ml-auto flex gap-1.5">
                <span className="size-1.5 rounded-full bg-[#809a80]" />
                <span className="size-1.5 rounded-full bg-[#809a80]" />
                <span className="size-1.5 rounded-full bg-[#cde998]" />
              </span>
            </div>
            <div className="space-y-4 px-5 py-6 font-mono text-sm">
              {Object.entries({ purpose: d.template.sections.purpose, toolStack: d.template.sections.toolStack, workflow: d.template.sections.workflow }).map(([key, label], index) => (
                <div key={key}>
                  <pre># {label}</pre>
                  <div className="mt-2 h-1.5 rounded bg-[#3e5b48]" style={{ width: [83, 63, 90][index] + "%" }} />
                  <div className="mt-2 h-1.5 w-2/5 rounded bg-[#304c3b]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {catalog.templates.length > 0 && (
        <section>
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3 border-b pb-4">
            <h2 className="section-title">{d.home.featured}</h2>
            <Link href={catalogPath} className="text-link inline-flex items-center gap-2 text-sm">
              {d.home.viewAllCatalog} <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...featured, ...extraTemplates].slice(0, 3).map((template) => <TemplateCard key={template.id} template={template} />)}
          </div>
        </section>
      )}

      <section className="panel flex flex-wrap items-center justify-between gap-4 p-5 sm:p-8">
        <div>
          <h2 className="section-title">{d.packs.title}</h2>
          <p className="mt-3 max-w-prose text-muted">{d.packs.intro}</p>
        </div>
        <Link href={localizePath(locale, "/packs")} className="button">
          {d.packs.browse} <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>

      <section className="panel grid gap-6 bg-surface p-5 sm:p-8 lg:grid-cols-[1fr_2.5fr]">
        <div>
          <h2 className="section-title">{d.howItWorks.title}</h2>
          <p className="mt-3 max-w-prose leading-relaxed text-muted">{d.howItWorks.intro}</p>
          <Link href={localizePath(locale, "/how-it-works")} className="text-link mt-3 inline-flex items-center gap-2 text-sm">
            {d.howItWorks.readGuide} <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <ol className="grid gap-5 sm:grid-cols-3">
          {[
            { icon: Search, title: d.home.importFind, body: d.home.importFindText },
            { icon: ArrowDownToLine, title: d.home.importExport, body: d.home.importExportText },
            { icon: Terminal, title: d.home.importUse, body: d.home.importUseText },
          ].map(({ icon: Icon, title, body }) => (
            <li key={title} className="border-t pt-3">
              <Icon size={20} className="mb-3 text-accent" aria-hidden="true" />
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      {catalog.domains.length > 0 && (
        <section>
          <h2 className="section-title mb-5 border-b pb-4">{d.home.browseDomains}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(domains.length ? domains : catalog.domains.slice(0, 6).map((domain) => ({ domain, icon: Boxes }))).map(({ domain, icon: Icon }) => (
              <div key={domain.slug} className="panel p-4">
                <Link href={localizePath(locale, `/domains/${domain.slug}`)} className="group flex items-center gap-3 rounded">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-surface text-accent"><Icon size={19} aria-hidden="true" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold group-hover:text-accent">{formatSlugLabel(domain.slug)}</span>
                    <span className="text-xs text-muted">{domain.template_count} {d.common.templates}</span>
                  </span>
                  <ArrowRight size={17} aria-hidden="true" className="shrink-0 text-accent" />
                </Link>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {domain.categories.slice(0, 3).map((category) => (
                    <li key={category.slug}><Link href={localizePath(locale, `/domains/${domain.slug}/${category.slug}`)} className="chip min-h-7 hover:text-accent">{formatSlugLabel(category.slug)}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
