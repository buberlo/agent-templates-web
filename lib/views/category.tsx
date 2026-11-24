import Link from "next/link";
import { notFound } from "next/navigation";
import { TemplateCard } from "@/components/template-card";
import { MarkdownContent } from "@/components/markdown-content";
import {
  getCatalog,
  getCategoryMeta,
  getTemplatesByCategory,
} from "@/lib/content/loader";
import { getDictionary, localizePath, type Locale } from "@/lib/i18n";
import { formatSlugLabel } from "@/lib/utils";

export function CategoryPageContent({
  locale,
  domain,
  category,
}: {
  locale: Locale;
  domain: string;
  category: string;
}) {
  const d = getDictionary(locale);
  const catalog = getCatalog();
  const domainEntry = catalog.domains.find((item) => item.slug === domain);
  const catEntry = domainEntry?.categories.find((c) => c.slug === category);
  if (!domainEntry || !catEntry) notFound();

  const meta = getCategoryMeta(domain, category);
  const templates = getTemplatesByCategory(domain, category);

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-sm text-muted">
          <Link href={localizePath(locale, "/catalog")}>{d.common.catalog}</Link> /{" "}
          <Link href={localizePath(locale, `/domains/${domain}`)}>
            {formatSlugLabel(domain)}
          </Link>{" "}
          / {category}
        </p>
        <h1 className="page-title">
          {meta?.title || formatSlugLabel(category)}
        </h1>
        {meta?.description ? (
          <p className="max-w-2xl text-muted">{meta.description}</p>
        ) : (
          <p className="text-muted">
            {catEntry.template_count} {d.common.templates}
          </p>
        )}
      </header>

      {meta?.raw ? (
        <section className="panel p-5">
          <MarkdownContent locale={locale}>{meta.raw.slice(0, 12000)}</MarkdownContent>
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <TemplateCard key={t.frontmatter.id} template={t.frontmatter} />
        ))}
      </section>
    </div>
  );
}