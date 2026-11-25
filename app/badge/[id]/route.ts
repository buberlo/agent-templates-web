import { agentStencilBadgeSvg } from "@/lib/badges/svg";
import { getAllTemplates, getTemplate } from "@/lib/content/loader";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllTemplates().map(({ frontmatter }) => ({ id: frontmatter.id }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const doc = getTemplate(id);
  if (!doc) {
    return new Response("Not found", { status: 404 });
  }
  const svg = agentStencilBadgeSvg(doc.frontmatter.title);
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}