import type { Metadata } from "next";
import { ChangelogPageContent } from "@/lib/views/changelog";
import { changelogMetadata } from "@/lib/views/metadata";

export const metadata: Metadata = changelogMetadata("de");

export default function ChangelogPageDe() {
  return <ChangelogPageContent locale="de" />;
}