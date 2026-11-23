import type { Metadata } from "next";
import { getCatalog } from "@/lib/content/loader";
import { CategoryPageContent } from "@/lib/views/category";
import { categoryMetadata } from "@/lib/views/metadata";

export function generateStaticParams() {
  const catalog = getCatalog();
  return catalog.domains.flatMap((d) =>
    d.categories.map((c) => ({ domain: d.slug, category: c.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string; category: string }>;
}): Promise<Metadata> {
  const { domain, category } = await params;
  return categoryMetadata("de", domain, category);
}

export default async function GermanCategoryPage({
  params,
}: {
  params: Promise<{ domain: string; category: string }>;
}) {
  const { domain, category } = await params;
  return (
    <CategoryPageContent locale="de" domain={domain} category={category} />
  );
}