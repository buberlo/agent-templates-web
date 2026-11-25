import type { Metadata } from "next";
import { ChangelogPageContent } from "@/lib/views/changelog";
import { changelogMetadata } from "@/lib/views/metadata";

export const metadata: Metadata = changelogMetadata("en");

export default function ChangelogPage() {
  return <ChangelogPageContent locale="en" />;
}