import type { Metadata } from "next";
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
import { getAllTemplates, getTemplate } from "@/lib/content/loader";
import { formatSlugLabel } from "@/lib/utils";

export function generateStaticParams() {
  return getAllTemplates().map((t) => ({ id: t.frontmatter.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const doc = getTemplate(id);
  if (!doc) return { title: "Template not found" };
  return {
    title: doc.frontmatter.title,
    description: doc.sections.purpose?.slice(0, 160),
    openGraph: {
      title: doc.frontmatter.title,
      description: doc.sections.purpose?.slice(0, 160),
      images: [`/templates/${id}/opengraph-image`],
    },
  };
}

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

export default async function TemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doc = getTemplate(id);
  if (!doc) notFound();

  const fm = doc.frontmatter;
  const ghUrl = githubBlobUrl(doc.filePath);
  const issueUrl = suggestIssueUrl(fm.id, doc.filePath);
  const prompt = doc.sections.systemPromptText || "";

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
          <Link href="/catalog">Catalog</Link> /{" "}
          <Link href={`/domains/${fm.domain}`}>{formatSlugLabel(fm.domain)}</Link>{" "}
          /{" "}
          <Link href={`/domains/${fm.domain}/${fm.category}`}>
            {formatSlugLabel(fm.category)}
          </Link>
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold">{fm.title}</h1>
          <RiskBadge level={fm.risk_level} />
        </div>
        <p className="font-mono text-sm text-muted">id: {fm.id}</p>
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
            View on GitHub
          </a>
          <a href={issueUrl} className="text-sky-400 hover:underline">
            Suggest an improvement
          </a>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-2 rounded-xl border border-border bg-card/40 p-4 lg:col-span-1">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Metadata
          </h2>
          <ul className="space-y-2 text-sm">
            <li>
              <span className="text-muted">Version</span> {fm.version}
            </li>
            <li>
              <span className="text-muted">Updated</span> {fm.updated}
            </li>
            <li>
              <span className="text-muted">Tags</span> {fm.tags.join(", ")}
            </li>
          </ul>
          <h3 className="pt-3 text-sm font-semibold">Inputs</h3>
          <ul className="list-disc pl-4 text-sm text-muted">
            {fm.inputs.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
          <h3 className="pt-3 text-sm font-semibold">Outputs</h3>
          <ul className="list-disc pl-4 text-sm text-muted">
            {fm.outputs.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-8 lg:col-span-2">
          <SectionBlock title="Purpose">{doc.sections.purpose}</SectionBlock>
          <SectionBlock title="When to use">{doc.sections.whenToUse}</SectionBlock>
          <SectionBlock title="Tool stack">{doc.sections.toolStack}</SectionBlock>

          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-semibold">System prompt</h2>
              {prompt ? <CopyButton text={prompt} label="Copy prompt" /> : null}
            </div>
            {prompt ? (
              <pre className="overflow-x-auto rounded-xl border border-border bg-black/40 p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                {prompt}
              </pre>
            ) : (
              <MarkdownContent>
                {doc.sections.systemPrompt || "_No fenced prompt block found._"}
              </MarkdownContent>
            )}
          </section>

          <SectionBlock title="Workflow">{doc.sections.workflow}</SectionBlock>
          <SectionBlock title="Definition of done">
            {doc.sections.definitionOfDone}
          </SectionBlock>
          <SectionBlock title="Security">{doc.sections.security}</SectionBlock>
          <SectionBlock title="Pitfalls">{doc.sections.pitfalls}</SectionBlock>

          {doc.sections.examplesParsed.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-xl font-semibold">Examples</h2>
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
                        Source
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