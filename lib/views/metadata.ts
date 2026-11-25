import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPack } from "@/lib/content/packs";
import {
  formatMessage,
  getDictionary,
  languageAlternates,
  localizePath,
  siteMetadataBase,
  type Locale,
} from "@/lib/i18n";
import { formatSlugLabel } from "@/lib/utils";

export function rootLayoutMetadata(locale: Locale): Metadata {
  const d = getDictionary(locale);
  return {
    metadataBase: new URL(siteMetadataBase()),
    title: {
      default: d.meta.titleDefault,
      template: d.meta.titleTemplate,
    },
    description: d.meta.description,
    openGraph: {
      type: "website",
      siteName: d.site.name,
      title: d.meta.titleDefault,
      description: d.meta.ogDescription,
      locale: locale === "de" ? "de_DE" : "en_US",
      images: [{
        url: localizePath(locale, "/opengraph-image"),
        width: 1200,
        height: 630,
        alt: d.site.name,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: d.meta.titleDefault,
    },
    alternates: languageAlternates("/", locale),
  };
}

export function catalogMetadata(locale: Locale): Metadata {
  const d = getDictionary(locale);
  return {
    title: d.meta.catalogTitle,
    description: d.meta.catalogDescription,
    alternates: languageAlternates("/catalog", locale),
  };
}

export function howItWorksMetadata(locale: Locale): Metadata {
  const { howItWorks } = getDictionary(locale);
  return {
    title: howItWorks.title,
    description: howItWorks.intro,
    alternates: languageAlternates("/how-it-works", locale),
  };
}

export function agentSupportMetadata(locale: Locale): Metadata {
  const { agentSupport } = getDictionary(locale);
  return {
    title: agentSupport.title,
    description: agentSupport.intro,
    alternates: languageAlternates("/agent-support", locale),
  };
}

export function changelogMetadata(locale: Locale): Metadata {
  const { changelog } = getDictionary(locale);
  return {
    title: changelog.title,
    description: changelog.intro,
    alternates: languageAlternates("/changelog", locale),
  };
}

export function packsMetadata(locale: Locale): Metadata {
  const { packs } = getDictionary(locale);
  return {
    title: packs.title,
    description: packs.intro,
    alternates: languageAlternates("/packs", locale),
  };
}

export function packMetadata(locale: Locale, slug: string): Metadata {
  const pack = getPack(slug);
  if (!pack) notFound();

  return {
    ...getDictionary(locale).packs.entries[pack.slug],
    alternates: languageAlternates(`/packs/${pack.slug}`, locale),
  };
}

export function mcpMetadata(locale: Locale): Metadata {
  const d = getDictionary(locale);
  return {
    title: d.meta.mcpTitle,
    description: d.meta.mcpDescription,
    alternates: languageAlternates("/mcp", locale),
  };
}

export function domainMetadata(locale: Locale, domain: string): Metadata {
  const d = getDictionary(locale);
  return {
    title: formatSlugLabel(domain),
    description: formatMessage(d.domain.domainMeta, { domain }),
    alternates: languageAlternates(`/domains/${domain}`, locale),
  };
}

export function categoryMetadata(
  locale: Locale,
  domain: string,
  category: string,
): Metadata {
  return {
    title: `${formatSlugLabel(category)} · ${formatSlugLabel(domain)}`,
    alternates: languageAlternates(`/domains/${domain}/${category}`, locale),
  };
}

export function templateMetadata(
  locale: Locale,
  id: string,
  title: string,
  purpose?: string,
): Metadata {
  return {
    title,
    description: purpose?.slice(0, 160),
    openGraph: {
      title,
      description: purpose?.slice(0, 160),
      images: [
        locale === "de"
          ? `/de/templates/${id}/opengraph-image`
          : `/templates/${id}/opengraph-image`,
      ],
    },
    alternates: languageAlternates(`/templates/${id}`, locale),
  };
}

export function homeCanonical(locale: Locale): string {
  return localizePath(locale, "/");
}