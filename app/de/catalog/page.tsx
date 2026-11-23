import type { Metadata } from "next";
import { catalogMetadata } from "@/lib/views/metadata";
import { CatalogPageContent } from "@/lib/views/catalog";

export const metadata: Metadata = catalogMetadata("de");

export default function GermanCatalogPage() {
  return <CatalogPageContent locale="de" />;
}