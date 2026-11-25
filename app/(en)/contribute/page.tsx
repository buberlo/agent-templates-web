import type { Metadata } from "next";
import { ContributePageContent } from "@/lib/views/contribute";
import { contributeMetadata } from "@/lib/views/metadata";

export const metadata: Metadata = contributeMetadata("en");

export default function ContributePage() {
  return <ContributePageContent locale="en" />;
}