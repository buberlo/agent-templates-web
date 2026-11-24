import { getAllTemplates } from "@/lib/content/loader";
import { catalogOgImage } from "@/lib/views/og-image";
import { templateOgLabels } from "@/lib/views/og-template";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllTemplates().map((template) => ({ id: template.frontmatter.id }));
}

export default async function TemplateOgImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { brand, title, footer } = templateOgLabels("en", id);
  return catalogOgImage({ brand, title, caption: footer }, size);
}
