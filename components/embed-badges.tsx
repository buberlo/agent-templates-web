"use client";

import { CopyButton } from "./copy-button";
import { useLocale } from "./locale-provider";
import { siteMetadataBase } from "@/lib/i18n";

export function EmbedBadges({ id, title }: { id: string; title: string }) {
  const { dict } = useLocale();
  const origin = siteMetadataBase().replace(/\/$/, "");
  const brandUrl = `${origin}/badge/${encodeURIComponent(id)}.svg`;
  const qualityUrl = `${origin}/badge/${encodeURIComponent(id)}/quality.svg`;
  const alt = `${dict.embed.altWorksWith} — ${title}`;
  const markdown = `[![${alt}](${brandUrl})](${origin}/templates/${encodeURIComponent(id)})`;
  const html = `<a href="${origin}/templates/${encodeURIComponent(id)}"><img src="${brandUrl}" alt="${alt}" width="240" height="40" /></a>`;

  return (
    <section className="panel p-4 sm:p-6" aria-labelledby="embed-badges-heading">
      <h2 id="embed-badges-heading" className="section-title">{dict.embed.heading}</h2>
      <p className="mt-2 text-sm text-muted">{dict.embed.intro}</p>
      <div className="mt-4 flex flex-wrap gap-4">
        <img src={brandUrl} alt={alt} width={240} height={40} className="rounded-md border" />
        <img src={qualityUrl} alt={dict.embed.altQuality} width={200} height={40} className="rounded-md border" />
      </div>
      <div className="mt-5 space-y-4">
        <div>
          <p className="mb-2 text-sm font-semibold">{dict.embed.markdown}</p>
          <pre className="overflow-x-auto rounded-lg border bg-surface p-3 font-mono text-xs">{markdown}</pre>
          <CopyButton text={markdown} label={dict.embed.copyMarkdown} />
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">{dict.embed.html}</p>
          <pre className="overflow-x-auto rounded-lg border bg-surface p-3 font-mono text-xs">{html}</pre>
          <CopyButton text={html} label={dict.embed.copyHtml} />
        </div>
      </div>
    </section>
  );
}