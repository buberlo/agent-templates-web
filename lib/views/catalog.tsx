import { CatalogSearch } from "@/components/catalog-search";
import { getCatalogSearchPayload } from "@/lib/content/loader";
import { getDictionary, type Locale } from "@/lib/i18n";

export function CatalogPageContent({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const items = getCatalogSearchPayload();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{d.catalog.title}</h1>
        <p className="mt-2 text-muted">{d.catalog.intro}</p>
      </div>
      <CatalogSearch items={items} />
    </div>
  );
}