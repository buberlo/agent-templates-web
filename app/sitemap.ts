import type { MetadataRoute } from "next";
import { getAllTemplates, getCatalog } from "@/lib/content/loader";
import { localizePath, LOCALES } from "@/lib/i18n";
import { siteMetadataBase } from "@/lib/i18n";

const siteUrl = siteMetadataBase();

function pushBoth(
  routes: MetadataRoute.Sitemap,
  barePath: string,
  lastModified: Date,
) {
  for (const locale of LOCALES) {
    routes.push({
      url: `${siteUrl}${localizePath(locale, barePath)}`,
      lastModified,
      alternates: {
        languages: {
          en: `${siteUrl}${localizePath("en", barePath)}`,
          de: `${siteUrl}${localizePath("de", barePath)}`,
        },
      },
    });
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const catalog = getCatalog();
  const templates = getAllTemplates();
  const now = new Date();
  const routes: MetadataRoute.Sitemap = [];

  pushBoth(routes, "/", now);
  pushBoth(routes, "/catalog", now);
  pushBoth(routes, "/mcp", now);
  pushBoth(routes, "/how-it-works", now);

  for (const d of catalog.domains) {
    pushBoth(routes, `/domains/${d.slug}`, now);
    for (const c of d.categories) {
      pushBoth(routes, `/domains/${d.slug}/${c.slug}`, now);
    }
  }

  for (const t of templates) {
    const updated = t.frontmatter.updated
      ? new Date(t.frontmatter.updated)
      : now;
    pushBoth(routes, `/templates/${t.frontmatter.id}`, updated);
  }

  return routes;
}