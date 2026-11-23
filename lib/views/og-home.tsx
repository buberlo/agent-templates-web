import { getSiteStats } from "@/lib/content/loader";
import { getDictionary, type Locale } from "@/lib/i18n";

export function ogHomeContent(locale: Locale) {
  const stats = getSiteStats();
  const d = getDictionary(locale);
  const statsLine = `${stats.templateCount} · ${stats.domainCount} · ${stats.mcpServerCount}`;
  return {
    brand: d.meta.ogTemplateBrand,
    title: d.meta.ogHomeTitle,
    stats: `${statsLine} ${d.meta.ogHomeSubtitle}`,
  };
}