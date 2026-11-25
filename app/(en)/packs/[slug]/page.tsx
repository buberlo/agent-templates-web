import type { Metadata } from "next";
import { curatedPacks } from "@/lib/content/packs";
import { PackPageContent } from "@/lib/views/packs";
import { packMetadata } from "@/lib/views/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return curatedPacks.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return packMetadata("en", slug);
}

export default async function PackPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PackPageContent locale="en" slug={slug} />;
}
