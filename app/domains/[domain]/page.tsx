import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TemplateCard } from "@/components/template-card";
import { MarkdownContent } from "@/components/markdown-content";
import {
  getCatalog,
  getDomainMeta,
  getTemplatesByDomain,
} from "@/lib/content/loader";
import { formatSlugLabel } from "@/lib/utils";

export function generateStaticParams() {
  return getCatalog().domains.map((d) => ({ domain: d.slug }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  return params.then(({ domain }) => ({
    title: formatSlugLabel(domain),
    description: `Agent templates in the ${domain} domain.`,
  }));
}

export default async function DomainPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const catalog = getCatalog();
  const domainEntry = catalog.domains.find((d) => d.slug === domain);
  if (!domainEntry) notFound();

  const meta = getDomainMeta(domain);
  const templates = getTemplatesByDomain(domain);

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-sm text-muted">
          <Link href="/catalog" className="hover:text-foreground">
            Catalog
          </Link>{" "}
          / {domain}
        </p>
        <h1 className="text-3xl font-bold">{meta?.title || formatSlugLabel(domain)}</h1>
        <p className="text-muted">
          {domainEntry.template_count} templates across{" "}
          {domainEntry.category_count} categories.
        </p>
      </header>

      {meta?.raw ? (
        <section className="rounded-xl border border-border bg-card/30 p-5">
          <MarkdownContent>{meta.raw}</MarkdownContent>
        </section>
      ) : null}

      <section>
        <h2 className="text-xl font-semibold">Categories</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {domainEntry.categories.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/domains/${domain}/${c.slug}`}
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
        <h2 className="text-xl font-semibold">All templates</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <TemplateCard key={t.frontmatter.id} template={t.frontmatter} />
          ))}
        </div>
      </section>
    </div>
  );
}