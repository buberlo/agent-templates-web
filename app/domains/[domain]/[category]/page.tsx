import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TemplateCard } from "@/components/template-card";
import { MarkdownContent } from "@/components/markdown-content";
import {
  getCatalog,
  getCategoryMeta,
  getTemplatesByCategory,
} from "@/lib/content/loader";
import { formatSlugLabel } from "@/lib/utils";

export function generateStaticParams() {
  const catalog = getCatalog();
  return catalog.domains.flatMap((d) =>
    d.categories.map((c) => ({ domain: d.slug, category: c.slug })),
  );
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string; category: string }>;
}): Promise<Metadata> {
  return params.then(({ domain, category }) => ({
    title: `${formatSlugLabel(category)} · ${formatSlugLabel(domain)}`,
  }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ domain: string; category: string }>;
}) {
  const { domain, category } = await params;
  const catalog = getCatalog();
  const domainEntry = catalog.domains.find((d) => d.slug === domain);
  const catEntry = domainEntry?.categories.find((c) => c.slug === category);
  if (!domainEntry || !catEntry) notFound();

  const meta = getCategoryMeta(domain, category);
  const templates = getTemplatesByCategory(domain, category);

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-sm text-muted">
          <Link href="/catalog">Catalog</Link> /{" "}
          <Link href={`/domains/${domain}`}>{formatSlugLabel(domain)}</Link> /{" "}
          {category}
        </p>
        <h1 className="text-3xl font-bold">
          {meta?.title || formatSlugLabel(category)}
        </h1>
        {meta?.description ? (
          <p className="max-w-2xl text-muted">{meta.description}</p>
        ) : (
          <p className="text-muted">{catEntry.template_count} templates</p>
        )}
      </header>

      {meta?.raw ? (
        <section className="rounded-xl border border-border bg-card/30 p-5">
          <MarkdownContent>{meta.raw.slice(0, 12000)}</MarkdownContent>
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