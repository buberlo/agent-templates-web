import { buildTemplateDetailJson } from "@/lib/content/api-payloads";
import { getAllTemplates, getTemplate } from "@/lib/content/loader";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllTemplates().map(({ frontmatter }) => ({
    slug: `${frontmatter.id}.json`,
  }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const doc = slug.endsWith(".json") ? getTemplate(slug.slice(0, -5)) : undefined;
  const headers = { "Content-Type": "application/json; charset=utf-8" };

  if (!doc) {
    return Response.json({ error: "Template not found" }, { status: 404, headers });
  }

  return Response.json(buildTemplateDetailJson(doc), { headers });
}
