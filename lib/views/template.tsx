import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyButton } from "@/components/copy-button";
import { ExampleKindBadge } from "@/components/example-kind-badge";
import { ExportPanel, type ExportPanelDoc } from "@/components/export-panel";
import { MarkdownContent } from "@/components/markdown-content";
import { RiskBadge } from "@/components/risk-badge";
import {
  githubBlobUrl,
  PLATFORM_LABELS,
  suggestIssueUrl,
} from "@/lib/content/config";
import { getTemplate } from "@/lib/content/loader";
import { getDictionary, localizePath, type Locale } from "@/lib/i18n";
import { formatSlugLabel } from "@/lib/utils";

function SectionBlock({
  title,
  children: body,
}: {
  title: string;
  children?: string;
}) {
  if (!body?.trim()) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      <MarkdownContent>{body}</MarkdownContent>
    </section>
  );
}

export function TemplatePageContent({
  locale,
  id,
}: {
  locale: Locale;
  id: string;
}) {
  const d = getDictionary(locale);
  const doc = getTemplate(id);
  if (!doc) notFound();

  const fm = doc.frontmatter;
  const ghUrl = githubBlobUrl(doc.filePath);
  const issueUrl = suggestIssueUrl(fm.id, doc.filePath);
  const prompt = doc.sections.systemPromptText || "";
  const s = d.template.sections;

  const exportDoc: ExportPanelDoc = {
    frontmatter: fm,
    sections: {
      purpose: doc.sections.purpose,
      whenToUse: doc.sections.whenToUse,
      toolStack: doc.sections.toolStack,
      workflow: doc.sections.workflow,
      definitionOfDone: doc.sections.definitionOfDone,
      security: doc.sections.security,
      pitfalls: doc.sections.pitfalls,
      systemPromptText: doc.sections.systemPromptText,
    },
    body: doc.body,
    filePath: doc.filePath,
  };

  return (
    <article className="space-y-10">
      <header className="space-y-4">
        <p className="text-sm text-muted">
          <Link href={localizePath(locale, "/catalog")}>{d.common.catalog}</Link> /{" "}
          <Link href={localizePath(locale, `/domains/${fm.domain}`)}>
            {formatSlugLabel(fm.domain)}
          </Link>{" "}
          /{" "}
          <Link href={localizePath(locale, `/domains/${fm.domain}/${fm.category}`)}>
            {formatSlugLabel(fm.category)}
          </Link>
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold">{fm.title}</h1>
          <RiskBadge level={fm.risk_level} />
        </div>
        <p className="font-mono text-sm text-muted">
          {d.common.idLabel}: {fm.id}
        </p>
        <div className="flex flex-wrap gap-2">
          {fm.target_agents.map((a) => (
            <span
              key={a}
              className="rounded-md border border-border bg-white/5 px-2 py-0.5 text-xs"
            >
              {PLATFORM_LABELS[a] || a}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <a
            href={ghUrl}
            className="text-sky-400 hover:underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            {d.common.viewOnGitHub}
          </a>
          <a href={issueUrl} className="text-sky-400 hover:underline">
            {d.common.suggestImprovement}
          </a>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-2 rounded-xl border border-border bg-card/40 p-4 lg:col-span-1">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            {d.common.metadata}
          </h2>
          <ul className="space-y-2 text-sm">
            <li>
              <span className="text-muted">{d.common.version}</span> {fm.version}
            </li>
            <li>
              <span className="text-muted">{d.common.updated}</span> {fm.updated}
            </li>
            <li>
              <span className="text-muted">{d.common.tags}</span> {fm.tags.join(", ")}
            </li>
          </ul>
          <h3 className="pt-3 text-sm font-semibold">{d.common.inputs}</h3>
          <ul className="list-disc pl-4 text-sm text-muted">
            {fm.inputs.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
          <h3 className="pt-3 text-sm font-semibold">{d.common.outputs}</h3>
          <ul className="list-disc pl-4 text-sm text-muted">
            {fm.outputs.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-8 lg:col-span-2">
          <SectionBlock title={s.purpose}>{doc.sections.purpose}</SectionBlock>
          <SectionBlock title={s.whenToUse}>{doc.sections.whenToUse}</SectionBlock>
          <SectionBlock title={s.toolStack}>{doc.sections.toolStack}</SectionBlock>

          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-semibold">{s.systemPrompt}</h2>
              {prompt ? (
                <CopyButton text={prompt} label={d.template.copyPrompt} />
              ) : null}
            </div>
            {prompt ? (
              <pre className="overflow-x-auto rounded-xl border border-border bg-black/40 p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                {prompt}
              </pre>
            ) : (
              <MarkdownContent>
                {doc.sections.systemPrompt || `_${d.template.noPromptBlock}_`}
              </MarkdownContent>
            )}
          </section>

          <SectionBlock title={s.workflow}>{doc.sections.workflow}</SectionBlock>
          <SectionBlock title={s.definitionOfDone}>
            {doc.sections.definitionOfDone}
          </SectionBlock>
          <SectionBlock title={s.security}>{doc.sections.security}</SectionBlock>
          <SectionBlock title={s.pitfalls}>{doc.sections.pitfalls}</SectionBlock>

          {doc.sections.examplesParsed.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-xl font-semibold">{s.examples}</h2>
              {doc.sections.examplesParsed.map((ex) => (
                <div
                  key={ex.title}
                  className="rounded-xl border border-border bg-card/30 p-5"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{ex.title}</h3>
                    <ExampleKindBadge kind={ex.kind} />
                    {ex.sourceUrl ? (
                      <a
                        href={ex.sourceUrl}
                        className="text-sm text-sky-400 hover:underline"
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {d.common.source}
                      </a>
                    ) : null}
                  </div>
                  <MarkdownContent>{ex.body}</MarkdownContent>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>

      <ExportPanel doc={exportDoc} />
    </article>
  );
}