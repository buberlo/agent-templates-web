import Link from "next/link";
import {
  GROK_BOT_DOCS_URL,
  GROK_BOT_GALLERY_URL,
  GROK_BOT_TEMPLATE_GUIDE_URL,
} from "@/lib/content/grok-bot-links";
import { getDictionary, localizePath, type Locale } from "@/lib/i18n";

export function HowItWorksPageContent({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const guide = d.howItWorks;
  const grok = guide.grokBot;
  const platforms = [
    { title: `${d.platforms.hermes} / ${d.platforms.openclaw}`, steps: guide.hermesOpenClaw },
    { title: d.platforms["claude-code"], steps: guide.claudeCode },
    { title: d.platforms.codex, steps: guide.codex },
    { title: d.platforms.cursor, steps: guide.cursor },
    { title: guide.otherAgents, steps: guide.generic },
  ];

  return (
    <article className="space-y-6">
      <header>
        <p className="section-kicker">{guide.kicker}</p>
        <h1 className="page-title mt-3">{guide.title}</h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">{guide.intro}</p>
        <Link href={localizePath(locale, "/catalog")} className="button-primary mt-4">
          {d.home.browseCatalog}
        </Link>
      </header>

      <section className="panel bg-surface p-5 sm:p-8">
        <h2 className="section-title">{d.platforms.grokbot}</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-muted marker:font-semibold marker:text-accent">
          <li>{grok.create}</li>
          <li>{grok.paste}</li>
          <li>{grok.connect}</li>
        </ol>
        <a href={GROK_BOT_DOCS_URL} className="text-link mt-3 inline-block">{grok.docs}</a>

        <div className="mt-5 border-t pt-5">
          <h3 className="font-semibold">{grok.publishingHeading}</h3>
          <p className="mt-2 max-w-3xl leading-relaxed text-muted">{grok.publishing}</p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            <a href={GROK_BOT_TEMPLATE_GUIDE_URL} className="text-link">{grok.guide}</a>
            <a href={GROK_BOT_GALLERY_URL} className="text-link">{grok.gallery}</a>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {platforms.map(({ title, steps }) => (
          <section key={title} className="panel p-5">
            <h2 className="text-lg font-semibold">{title}</h2>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-muted marker:font-semibold marker:text-accent">
              {steps.map((step) => <li key={step}>{step}</li>)}
            </ol>
          </section>
        ))}
      </div>
    </article>
  );
}
