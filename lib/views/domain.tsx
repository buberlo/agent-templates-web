import Link from "next/link";
import { notFound } from "next/navigation";
import { TemplateCard } from "@/components/template-card";
import { MarkdownContent } from "@/components/markdown-content";
import {
  getCatalog,
  getDomainMeta,
  getTemplatesByDomain,
} from "@/lib/content/loader";
import {
  formatMessage,
  getDictionary,
  localizePath,
  type Locale,
} from "@/lib/i18n";
import { formatSlugLabel } from "@/lib/utils";

export function DomainPageContent({
  locale,
  domain,
}: {
  locale: Locale;
  domain: string;
}) {
  const d = getDictionary(locale);
  const catalog = getCatalog();
  const domainEntry = catalog.domains.find((item) => item.slug === domain);
  if (!domainEntry) notFound();

  const meta = getDomainMeta(domain);
  const templates = getTemplatesByDomain(domain);

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-sm text-muted">
          <Link href={localizePath(locale, "/catalog")} className="hover:text-foreground">
            {d.common.catalog}
          </Link>{" "}
          / {domain}
        </p>
        <h1 className="page-title">
          {meta?.title || formatSlugLabel(domain)}
        </h1>
        <p className="text-muted">
          {formatMessage(d.domain.statsLine, {
            templates: domainEntry.template_count,
            categories: domainEntry.category_count,
          })}
        </p>
      </header>

      {meta?.raw ? (
        <section className="panel p-5">
          <MarkdownContent locale={locale}>{meta.raw}</MarkdownContent>
        </section>
      ) : null}

      <section>
        <h2 className="text-xl font-semibold">{d.common.categories}</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {domainEntry.categories.map((c) => (
            <li key={c.slug}>
              <Link
                href={localizePath(locale, `/domains/${domain}/${c.slug}`)}
                className="flex justify-between rounded-lg border border-border px-4 py-3 hover:bg-card/60"
              >
                <span>{formatSlugLabel(c.slug)}</span>
                <span className="text-sm text-muted">{c.template_count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">{d.domain.allTemplates}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <TemplateCard key={t.frontmatter.id} template={t.frontmatter} />
          ))}
        </div>
      </section>
    </div>
  );
}