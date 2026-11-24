import type { Metadata } from "next";
import { HowItWorksPageContent } from "@/lib/views/how-it-works";
import { howItWorksMetadata } from "@/lib/views/metadata";

export const metadata: Metadata = howItWorksMetadata("de");

export default function HowItWorksPage() {
  return <HowItWorksPageContent locale="de" />;
}
