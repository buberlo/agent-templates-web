import type { Metadata } from "next";
import { ContributePageContent } from "@/lib/views/contribute";
import { contributeMetadata } from "@/lib/views/metadata";

export const metadata: Metadata = contributeMetadata("de");

export default function ContributePageDe() {
  return <ContributePageContent locale="de" />;
}