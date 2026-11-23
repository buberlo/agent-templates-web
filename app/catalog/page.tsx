import type { Metadata } from "next";
import { CatalogSearch } from "@/components/catalog-search";
import { getCatalogSearchPayload } from "@/lib/content/loader";

export const metadata: Metadata = {
  title: "Catalog",
  description: "Search and filter agent templates by domain, category, agent, risk, and tags.",
};

export default function CatalogPage() {
  const items = getCatalogSearchPayload();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Template catalog</h1>
        <p className="mt-2 text-muted">
          Full-text search across titles, tags, and prompt bodies (indexed at
          build time).
        </p>
      </div>
      <CatalogSearch items={items} />
    </div>
  );
}