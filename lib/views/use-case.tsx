import Link from "next/link";
import Script from "next/script";
import { TemplateCard } from "@/components/template-card";
import { getTemplateQuality } from "@/lib/content/loader";
import type { UseCaseLanding } from "@/lib/content/use-cases";
import { getDictionary, localizePath, siteMetadataBase, type Locale } from "@/lib/i18n";

export function UseCasePageContent({
  locale,
  landing,
}: {
  locale: Locale;
  landing: UseCaseLanding;
}) {
  const d = getDictionary(locale);
  const siteUrl = siteMetadataBase().replace(/\/$/, "");
  const pageUrl = `${siteUrl}${localizePath(locale, landing.canonicalPath)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: landing.title,
    description: landing.intro,
    numberOfItems: landing.templates.length,
    itemListElement: landing.templates.map((doc, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "SoftwareSourceCode",
        name: doc.frontmatter.title,
        codeRepository: `https://github.com/buberlo/agent-templates`,
        url: `${siteUrl}${localizePath(locale, `/templates/${doc.frontmatter.id}`)}`,
        programmingLanguage: "Markdown",
      },
    })),
  };

  return (
    <div className="space-y-8">
      <Script id="use-case-jsonld" type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </Script>
      <header className="panel p-5 sm:p-8">
        <p className="text-sm text-muted">
          <Link href={localizePath(locale, "/catalog")} className="text-link">
            {d.common.catalog}
          </Link>
        </p>
        <h1 className="page-title mt-3">{landing.title}</h1>
        <p className="mt-4 max-w-3xl leading-relaxed text-muted">{landing.intro}</p>
        <p className="mt-3 text-sm text-muted">
          {landing.templates.length} {d.common.templates} ·{" "}
          <a href={pageUrl} className="text-link font-mono text-xs">
            {pageUrl}
          </a>
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {landing.templates.map((doc) => (
          <TemplateCard
            key={doc.frontmatter.id}
            template={{
              ...doc.frontmatter,
              qualityLevel: getTemplateQuality(doc).level,
            }}
          />
        ))}
      </section>
    </div>
  );
}