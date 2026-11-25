import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getUseCaseLanding, listUseCaseLandings } from "@/lib/content/use-cases";
import { languageAlternates } from "@/lib/i18n";
import { UseCasePageContent } from "@/lib/views/use-case";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return listUseCaseLandings("en").map(({ agent, domain }) => ({
    agent,
    domain,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ agent: string; domain: string }>;
}): Promise<Metadata> {
  const { agent, domain } = await params;
  const landing = getUseCaseLanding(agent, domain, "en");
  if (!landing) return {};
  return {
    title: landing.title,
    description: landing.intro,
    alternates: languageAlternates(landing.canonicalPath, "en"),
  };
}

export default async function UseCasePage({
  params,
}: {
  params: Promise<{ agent: string; domain: string }>;
}) {
  const { agent, domain } = await params;
  const landing = getUseCaseLanding(agent, domain, "en");
  if (!landing) notFound();
  return <UseCasePageContent locale="en" landing={landing} />;
}