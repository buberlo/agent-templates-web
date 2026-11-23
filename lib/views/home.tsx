import Link from "next/link";
import { getAdapters, getCatalog, getSiteStats } from "@/lib/content/loader";
import { EXPORT_TARGETS, PLATFORM_LABELS } from "@/lib/content/constants";
import { getDictionary, localizePath, type Locale } from "@/lib/i18n";
import { formatSlugLabel } from "@/lib/utils";

export function HomePageContent({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const stats = getSiteStats();
  const catalog = getCatalog();
  const adapters = getAdapters();
  const topDomains = [...catalog.domains]
    .sort((a, b) => b.template_count - a.template_count)
    .slice(0, 8);

  return (
    <div className="space-y-16">
      <section className="space-y-6">
        <p className="text-sm font-medium uppercase tracking-widest text-sky-400">
          {d.site.phaseBadge}
        </p>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          {d.home.title}
        </h1>
        <p className="max-w-2xl text-lg text-muted">
          {d.home.introBeforeLink}
          <a
            href="https://github.com/buberlo/agent-templates"
            className="text-sky-400 hover:underline"
          >
            buberlo/agent-templates
          </a>
          {d.home.introAfterLink}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={localizePath(locale, "/catalog")}
            className="rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-500"
          >
            {d.home.browseCatalog}
          </Link>
          <Link
            href={localizePath(locale, "/mcp")}
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium hover:bg-white/5"
          >
            {d.home.mcpServers}
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">{d.home.countsHeading}</h2>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: d.home.countsTemplates, value: stats.templateCount },
            { label: d.home.countsDomains, value: stats.domainCount },
            { label: d.home.countsCategories, value: stats.categoryCount },
            { label: d.home.countsMcp, value: stats.mcpServerCount },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-border bg-card/50 p-5"
            >
              <dt className="text-sm text-muted">{item.label}</dt>
              <dd className="mt-1 text-3xl font-semibold tabular-nums">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-muted">
          {d.common.generatedAt} {catalog.generated_at}
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">{d.home.platformsHeading}</h2>
        <p className="mt-2 max-w-2xl text-muted">{d.home.platformsIntro}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {EXPORT_TARGETS.map((p) => (
            <li
              key={p}
              className="rounded-full border border-border bg-white/5 px-3 py-1 text-sm"
            >
              {PLATFORM_LABELS[p]}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted">
          {d.home.adaptersNote}{" "}
          <code className="rounded bg-black/20 px-1">adapters/</code> (
          {adapters.map((a) => a.slug).join(", ")}).
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">{d.home.domainsHeading}</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {topDomains.map((dom) => (
            <li key={dom.slug}>
              <Link
                href={localizePath(locale, `/domains/${dom.slug}`)}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3 hover:border-sky-500/40 hover:bg-card/60"
              >
                <span className="font-medium">{formatSlugLabel(dom.slug)}</span>
                <span className="text-sm text-muted tabular-nums">
                  {dom.template_count} {d.common.templates}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {catalog.domains.length > topDomains.length && (
          <p className="mt-3 text-sm text-muted">
            <Link
              href={localizePath(locale, "/catalog")}
              className="text-sky-400 hover:underline"
            >
              {d.home.viewAllCatalog}
            </Link>
          </p>
        )}
      </section>
    </div>
  );
}