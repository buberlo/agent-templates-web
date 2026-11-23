import type { MetadataRoute } from "next";
import { getAllTemplates, getCatalog } from "@/lib/content/loader";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://agent-templates.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const catalog = getCatalog();
  const templates = getAllTemplates();
  const now = new Date();

  const routes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now },
    { url: `${siteUrl}/catalog`, lastModified: now },
    { url: `${siteUrl}/mcp`, lastModified: now },
  ];

  for (const d of catalog.domains) {
    routes.push({
      url: `${siteUrl}/domains/${d.slug}`,
      lastModified: now,
    });
    for (const c of d.categories) {
      routes.push({
        url: `${siteUrl}/domains/${d.slug}/${c.slug}`,
        lastModified: now,
      });
    }
  }

  for (const t of templates) {
    routes.push({
      url: `${siteUrl}/templates/${t.frontmatter.id}`,
      lastModified: t.frontmatter.updated
        ? new Date(t.frontmatter.updated)
        : now,
    });
  }

  return routes;
}