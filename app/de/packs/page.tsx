import type { Metadata } from "next";
import { PacksPageContent } from "@/lib/views/packs";
import { packsMetadata } from "@/lib/views/metadata";

export const metadata: Metadata = packsMetadata("de");

export default function PacksPage() {
  return <PacksPageContent locale="de" />;
}
