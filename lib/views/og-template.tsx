import { getTemplate } from "@/lib/content/loader";
import { getDictionary, type Locale } from "@/lib/i18n";

export function templateOgLabels(locale: Locale, id: string) {
  const d = getDictionary(locale);
  const doc = getTemplate(id);
  const title = doc?.frontmatter.title ?? "Agent template";
  const domain = doc?.frontmatter.domain ?? "";
  const risk = doc?.frontmatter.risk_level ?? "low";
  const riskLabel =
    risk === "high"
      ? d.risk.high
      : risk === "medium"
        ? d.risk.medium
        : d.risk.low;
  return {
    brand: d.site.name,
    title,
    footer: `${domain} · ${riskLabel} ${d.risk.suffix}`,
  };
}