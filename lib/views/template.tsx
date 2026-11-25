import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDownToLine, ArrowUpRight, Plug } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { ExampleKindBadge } from "@/components/example-kind-badge";
import { McpConfigGenerator } from "@/components/mcp-config-generator";
import { EmbedBadges } from "@/components/embed-badges";
import { ExportPanel } from "@/components/export-panel";
import { CodeBlock, MarkdownContent } from "@/components/markdown-content";
import { QualityBadge } from "@/components/quality-badge";
import { RiskBadge } from "@/components/risk-badge";
import { githubBlobUrl, PLATFORM_LABELS, suggestIssueUrl } from "@/lib/content/config";
import { GROK_BOT_DOCS_URL } from "@/lib/content/grok-bot-links";
import { getMcpCatalog, getTemplate, getTemplateQuality } from "@/lib/content/loader";
import { resolveMcpTools } from "@/lib/content/resolve-mcp-tools";
import { exportTemplate } from "@/lib/export";
import { formatMessage, getDictionary, localizePath, type Locale } from "@/lib/i18n";
import { formatSlugLabel } from "@/lib/utils";

export function TemplatePageContent({ locale, id }: { locale: Locale; id: string }) {
  const d = getDictionary(locale);
  const doc = getTemplate(id);
  if (!doc) notFound();

  const fm = doc.frontmatter;
  const content = doc.sections;
  const quality = getTemplateQuality(doc);
  const score = formatMessage(d.quality.score, { passed: quality.passedGates, total: quality.totalGates });
  const grok = d.howItWorks.grokBot;
  const resolvedMcpTools = resolveMcpTools(fm.required_tools, getMcpCatalog());
  const mcpTools = [...new Set(resolvedMcpTools.map((tool) => tool.name))];

  const sections = [
    { id: "purpose", label: d.template.sections.purpose, body: content.purpose },
    { id: "when-to-use", label: d.template.sections.whenToUse, body: content.whenToUse },
    { id: "tool-stack", label: d.template.sections.toolStack, body: content.toolStack, extra: mcpTools.length > 0 && (
      <div className="mb-4">
        <h3 className="mb-2 text-sm font-semibold">{d.template.mcpTools}</h3>
        <ul className="flex flex-wrap gap-2">
          {mcpTools.map((tool) => <li key={tool} className="chip gap-1.5"><Plug size={14} className="shrink-0 text-accent" aria-hidden="true" />{tool}</li>)}
        </ul>
      </div>
    ) },
    { id: "mcp-config", label: d.mcpConfig.heading, extra: resolvedMcpTools.length > 0 && (
      <McpConfigGenerator tools={resolvedMcpTools} />
    ) },
    { id: "system-prompt", label: d.template.sections.systemPrompt, extra: content.systemPromptText
      ? <CodeBlock text={content.systemPromptText} label={d.template.copyPrompt} wrap />
      : <MarkdownContent locale={locale}>{content.systemPrompt || `_${d.template.noPromptBlock}_`}</MarkdownContent> },
    { id: "workflow", label: d.template.sections.workflow, body: content.workflow },
    { id: "definition-of-done", label: d.template.sections.definitionOfDone, body: content.definitionOfDone },
    { id: "security", label: d.template.sections.security, body: content.security },
    { id: "pitfalls", label: d.template.sections.pitfalls, body: content.pitfalls },
    { id: "changelog", label: d.changelog.templateHeading, extra: doc.changelog.length > 0 && (
      <ol className="space-y-3 text-sm">
        {doc.changelog.map((entry) => (
          <li key={entry.sha} className="border-b pb-3 last:border-0">
            <p className="text-muted">
              <time dateTime={entry.date}>{entry.date}</time>
              {" · "}
              <code className="text-xs">{entry.sha}</code>
            </p>
            <p className="mt-1">{entry.subject}</p>
          </li>
        ))}
      </ol>
    ) },
    { id: "examples", label: d.template.sections.examples, body: content.examplesParsed.length ? undefined : content.examples, extra: content.examplesParsed.length > 0 && (
      <div className="space-y-4">
        {content.examplesParsed.map((example) => {
          const title = example.title;
          const kind = example.kind === "unknown" && /\((?:example data|beispieldaten|synthetic)\b/i.test(title)
            ? "synthetic"
            : example.kind === "unknown" && /\((?:real[- ]world|real example|echtwelt)\b/i.test(title)
              ? "real-world"
              : example.kind;
          return (
            <div key={title} className="panel p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">{title}</h3>
                <ExampleKindBadge kind={kind} />
                {example.sourceUrl && <a href={example.sourceUrl} className="text-link text-sm">{d.common.source}</a>}
              </div>
              <MarkdownContent locale={locale}>{example.body.replace(/^### [^\n]+\n?/, "")}</MarkdownContent>
            </div>
          );
        })}
      </div>
    ) },
  ].filter((section) => section.body?.trim() || section.extra);

  return (
    <article className="space-y-7">
      <header className="panel p-5 sm:p-8">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
          <Link className="text-link" href={localizePath(locale, "/catalog")}>{d.common.catalog}</Link> /
          <Link className="text-link" href={localizePath(locale, `/domains/${fm.domain}`)}>{formatSlugLabel(fm.domain)}</Link> /
          <Link className="text-link" href={localizePath(locale, `/domains/${fm.domain}/${fm.category}`)}>{formatSlugLabel(fm.category)}</Link>
        </p>
        <h1 className="page-title mt-4">{fm.title}</h1>
        <p className="mt-2 font-mono text-sm text-muted [overflow-wrap:anywhere]">{fm.id}</p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <RiskBadge level={fm.risk_level} />
          <QualityBadge level={quality.level} />
          {fm.target_agents.map((agent) => <span className="chip" key={agent}>{PLATFORM_LABELS[agent] || agent}</span>)}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-4 text-sm">
          <a href="#export" className="button-primary"><ArrowDownToLine size={17} aria-hidden="true" />{d.export.heading}</a>
          <a href={githubBlobUrl(doc.filePath)} className="text-link inline-flex items-center gap-1">{d.common.viewOnGitHub}<ArrowUpRight size={14} aria-hidden="true" /></a>
          <a href={suggestIssueUrl(fm.id, doc.filePath)} className="text-link">{d.common.suggestImprovement}</a>
        </div>
      </header>

      <section className="panel border-control bg-surface p-5 sm:p-8" aria-labelledby="grok-bot-heading">
        <h2 id="grok-bot-heading" className="section-title">{grok.heading}</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted marker:font-semibold marker:text-accent">
          <li>{grok.create}</li>
          <li>{grok.paste}</li>
          <li>{grok.connect}</li>
        </ol>
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3">
          {fm.grokbot_template_url && (
            <a href={fm.grokbot_template_url} target="_blank" rel="noopener noreferrer" className="button-primary">
              {grok.add}<ArrowUpRight size={16} aria-hidden="true" />
            </a>
          )}
          <CopyButton text={exportTemplate(doc, "grokbot").content} label={grok.copy} />
          <a href={GROK_BOT_DOCS_URL} className="text-link text-sm">{grok.docs}</a>
        </div>
      </section>

      <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10">
        <nav aria-label={d.template.onPage} className="sticky top-24 z-20 min-w-0 border-b bg-background py-2 sm:top-14 lg:top-[4.5rem] lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto lg:border-b-0">
          <p className="section-kicker mb-2 hidden pl-2 lg:block">{d.template.onPage}</p>
          <ul className="flex gap-1 overflow-x-auto p-1 lg:flex-col lg:overflow-visible">
            {sections.map(({ id, label }) => <li key={id} className="shrink-0"><a href={`#${id}`} className="block whitespace-nowrap rounded-md px-2 py-2 text-sm text-muted transition-colors hover:bg-surface hover:text-accent lg:whitespace-normal">{label}</a></li>)}
          </ul>
        </nav>

        <div className="min-w-0">
          <section className="mb-6">
            <h2 className="mb-3 text-lg font-semibold">{d.common.metadata}</h2>
            <dl className="panel grid gap-4 p-4 text-sm sm:grid-cols-2 sm:p-5">
              {[
                { label: d.common.version, value: fm.version },
                { label: d.common.updated, value: fm.updated },
                { label: d.common.inputs, value: fm.inputs.join(" · ") },
                { label: d.common.outputs, value: fm.outputs.join(" · ") },
                { label: d.common.tags, value: fm.tags.join(" · ") },
              ].filter(({ value }) => value).map(({ label, value }) => (
                <div key={label} className="min-w-0 [overflow-wrap:anywhere]"><dt className="font-medium">{label}</dt><dd className="mt-1 text-muted">{value}</dd></div>
              ))}
            </dl>
          </section>
          <details className="panel mb-6 p-4 text-sm sm:p-5">
            <summary className="cursor-pointer font-semibold">{d.quality.heading} · {score}</summary>
            <p className="mt-3 text-muted">{d.quality.method}</p>
            {quality.hasBacklogWaiver && <p className="mt-2 text-muted">{d.quality.waiver}</p>}
            <ul className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {quality.gates.map((gate) => {
                const label = gate.id === "requiredSection"
                  ? formatMessage(d.quality.gates.requiredSection, { section: gate.section === "basicExamples" ? d.template.sections.examples : d.template.sections[gate.section] })
                  : gate.id === "expectedOutput"
                    ? formatMessage(d.quality.gates.expectedOutput, { index: gate.index })
                    : d.quality.gates[gate.id];
                return (
                  <li key={label} className="flex items-baseline justify-between gap-2 border-t pt-2">
                    <span>{label}</span>
                    <span className={gate.passed ? "text-low" : "text-high"}>
                      {gate.passed ? d.quality.passed : d.quality.failed}
                    </span>
                  </li>
                );
              })}
            </ul>
          </details>
          {sections.map(({ id, label, body, extra }) => (
            <section key={id} id={id} tabIndex={-1} className="anchor-section">
              <h2 className="section-title mb-4">{label}</h2>
              {extra}
              {body && <MarkdownContent locale={locale}>{body}</MarkdownContent>}
            </section>
          ))}
          <EmbedBadges id={fm.id} title={fm.title} />
          <ExportPanel doc={{ frontmatter: fm, sections: content, body: doc.body, filePath: doc.filePath }} />
        </div>
      </div>
    </article>
  );
}
