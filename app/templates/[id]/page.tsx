import type { Metadata } from "next";
import { getAllTemplates, getTemplate } from "@/lib/content/loader";
import { templateMetadata } from "@/lib/views/metadata";
import { TemplatePageContent } from "@/lib/views/template";

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
  return templateMetadata(
    "en",
    id,
    doc.frontmatter.title,
    doc.sections.purpose,
  );
}

export default async function TemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TemplatePageContent locale="en" id={id} />;
}