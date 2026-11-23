import type { Metadata } from "next";
import { getCatalog } from "@/lib/content/loader";
import { DomainPageContent } from "@/lib/views/domain";
import { domainMetadata } from "@/lib/views/metadata";

export function generateStaticParams() {
  return getCatalog().domains.map((d) => ({ domain: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  return domainMetadata("de", domain);
}

export default async function GermanDomainPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  return <DomainPageContent locale="de" domain={domain} />;
}