import Link from "next/link";
import Script from "next/script";
import { YoutubeLazyEmbed } from "@/components/youtube-lazy-embed";
import {
  GROK_BOT_DOCS_URL,
  GROK_BOT_GALLERY_URL,
  GROK_BOT_TEMPLATE_GUIDE_URL,
} from "@/lib/content/grok-bot-links";
import {
  WALKTHROUGH_UPLOAD_DATE,
  WALKTHROUGH_VIDEO_IDS,
  youtubeEmbedUrl,
  youtubeThumbnailUrl,
  youtubeWatchUrl,
} from "@/lib/content/walkthrough-videos";
import type { Dictionary } from "@/lib/i18n/types";
import { formatMessage, getDictionary, localizePath, type Locale } from "@/lib/i18n";

function walkthroughVideoJsonLd(
  meta: Dictionary["howItWorks"]["videoWalkthroughs"]["grokbot"],
  youtubeId: string,
) {
  return {
    "@type": "VideoObject",
    name: meta.title,
    description: meta.description,
    thumbnailUrl: youtubeThumbnailUrl(youtubeId),
    uploadDate: WALKTHROUGH_UPLOAD_DATE,
    embedUrl: youtubeEmbedUrl(youtubeId),
    contentUrl: youtubeWatchUrl(youtubeId),
  };
}

export function HowItWorksPageContent({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const guide = d.howItWorks;
  const grok = guide.grokBot;
  const videos = guide.videoWalkthroughs;
  const additionalTargets = Object.keys(guide.additionalTargets) as
    (keyof Dictionary["howItWorks"]["additionalTargets"])[];
  const platforms = [
    { title: `${d.platforms.hermes} / ${d.platforms.openclaw}`, steps: guide.hermesOpenClaw },
    { title: d.platforms["claude-code"], steps: guide.claudeCode },
    { title: d.platforms.codex, steps: guide.codex },
    { title: d.platforms.cursor, steps: guide.cursor },
    ...additionalTargets.map((target) => ({ title: d.platforms[target], steps: guide.additionalTargets[target] })),
    { title: guide.otherAgents, steps: guide.generic },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      walkthroughVideoJsonLd(videos.grokbot, WALKTHROUGH_VIDEO_IDS.grokbot),
      walkthroughVideoJsonLd(videos.hermes, WALKTHROUGH_VIDEO_IDS.hermes),
    ],
  };

  const walkthroughItems = [
    { key: "grokbot" as const, anchor: "walkthrough-grokbot", meta: videos.grokbot },
    { key: "hermes" as const, anchor: "walkthrough-hermes", meta: videos.hermes },
  ];

  return (
    <article className="space-y-6">
      <Script id="how-it-works-video-jsonld" type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </Script>
      <header>
        <p className="section-kicker">{guide.kicker}</p>
        <h1 className="page-title mt-3">{guide.title}</h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">{guide.intro}</p>
        <Link href={localizePath(locale, "/catalog")} className="button-primary mt-4">
          {d.home.browseCatalog}
        </Link>
      </header>

      <section className="panel bg-surface p-5 sm:p-8" aria-labelledby="video-walkthroughs-heading">
        <h2 id="video-walkthroughs-heading" className="section-title">
          {videos.heading}
        </h2>
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          {walkthroughItems.map(({ key, anchor, meta }) => (
            <article key={key} id={anchor} className="min-w-0 scroll-mt-24">
              <h3 className="text-lg font-semibold">{meta.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{meta.description}</p>
              <YoutubeLazyEmbed
                youtubeId={WALKTHROUGH_VIDEO_IDS[key]}
                title={meta.title}
                watchOnYouTubeLabel={videos.watchOnYouTube}
                playLabel={formatMessage(videos.playVideo, { title: meta.title })}
              />
            </article>
          ))}
        </div>
      </section>

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

      <section className="panel p-5 sm:p-8">
        <h2 className="section-title">{guide.machineReadable.heading}</h2>
        <ul className="mt-3 space-y-2 text-muted">
          <li><a href="/llms.txt" className="text-link">/llms.txt</a> {guide.machineReadable.llms}</li>
          <li><a href="/api/templates.json" className="text-link">/api/templates.json</a> {guide.machineReadable.index}</li>
          <li><code>{"/api/templates/<id>.json"}</code> {guide.machineReadable.detail}</li>
        </ul>
      </section>
    </article>
  );
}