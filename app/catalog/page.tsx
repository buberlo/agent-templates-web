import type { Metadata } from "next";
import { catalogMetadata } from "@/lib/views/metadata";
import { CatalogPageContent } from "@/lib/views/catalog";

export const metadata: Metadata = catalogMetadata("en");

export default function CatalogPage() {
  return <CatalogPageContent locale="en" />;
}