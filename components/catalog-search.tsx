"use client";

import Index from "flexsearch";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SearchX } from "lucide-react";
import { TemplateCard, type TemplateCardData } from "./template-card";
import { formatSlugLabel } from "@/lib/utils";
import { PLATFORM_LABELS } from "@/lib/content/constants";
import { formatMessage } from "@/lib/i18n/format";
import { useLocale } from "./locale-provider";

export type CatalogSearchItem = TemplateCardData & { searchText: string };

function InitialQuery({ onQuery }: { onQuery: (query: string) => void }) {
  const params = useSearchParams();
  const query = params.get("q") ?? "";
  useEffect(() => onQuery(query), [onQuery, query]);
  return null;
}

const RISK_LEVELS = ["low", "medium", "high"] as const;

export function CatalogSearch({ items }: { items: CatalogSearchItem[] }) {
  const { dict } = useLocale();
  const domains = useMemo(
    () => [...new Set(items.map((i) => i.domain))].sort(),
    [items],
  );
  const agents = useMemo(
    () => [...new Set(items.flatMap((i) => i.target_agents))].sort(),
    [items],
  );
  const allTags = useMemo(
    () => [...new Set(items.flatMap((i) => i.tags))].sort(),
    [items],
  );

  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("");
  const [category, setCategory] = useState("");
  const [agent, setAgent] = useState("");
  const [risk, setRisk] = useState("");
  const [tag, setTag] = useState("");

  const categories = useMemo(() => {
    return [
      ...new Set(
        items.filter((i) => !domain || i.domain === domain).map((i) => i.category),
      ),
    ].sort();
  }, [domain, items]);

  const index = useMemo(() => {
    const idx = new Index.Document({
      document: {
        id: "id",
        index: ["title", "searchText", "tags"],
      },
      tokenize: "forward",
      cache: true,
    });
    const docs = items.map((item) => ({
      id: item.id,
      title: item.title,
      searchText: item.searchText,
      tags: item.tags.join(" "),
    }));
    for (const d of docs) idx.add(d);
    return idx;
  }, [items]);

  const filtered = useMemo(() => {
    let matchIds: Set<string> | null = null;
    if (query.trim()) {
      const res = index.search(query.trim(), { limit: items.length }) as unknown as {
        result: Array<string | number>;
      }[];
      matchIds = new Set<string>();
      for (const group of res) {
        for (const id of group.result) matchIds.add(String(id));
      }
    }

    return items.filter((item) => {
      if (matchIds && !matchIds.has(item.id)) return false;
      if (domain && item.domain !== domain) return false;
      if (category && item.category !== category) return false;
      if (agent && !item.target_agents.includes(agent)) return false;
      if (risk && item.risk_level !== risk) return false;
      if (tag && !item.tags.includes(tag)) return false;
      return true;
    });
  }, [agent, category, domain, index, items, query, risk, tag]);

  const hasFilters = Boolean(query || domain || category || agent || risk || tag);

  function resetFilters() {
    setQuery("");
    setDomain("");
    setCategory("");
    setAgent("");
    setRisk("");
    setTag("");
    const url = new URL(window.location.href);
    url.searchParams.delete("q");
    window.history.replaceState(null, "", url);
    document.getElementById("catalog-q")?.focus();
  }

  return (
    <div className="space-y-6">
      <Suspense><InitialQuery onQuery={setQuery} /></Suspense>
      <div className="panel p-4 sm:p-5">
        <div className="relative">
          <Search size={19} className="pointer-events-none absolute left-3 top-3 text-muted" aria-hidden="true" />
          <label htmlFor="catalog-q" className="sr-only">
            {dict.catalog.searchLabel}
          </label>
          <input
            id="catalog-q"
            type="search"
            placeholder={dict.catalog.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="field w-full pl-10"
          />
        </div>
        <fieldset className="mt-4 grid min-w-0 grid-cols-2 gap-2 lg:grid-cols-5">
          <legend className="mb-2 text-sm font-semibold">{dict.catalog.filters}</legend>
          <select
            aria-label={dict.common.allDomains}
            value={domain}
            onChange={(e) => {
              setDomain(e.target.value);
              setCategory("");
            }}
            className="field"
          >
            <option value="">{dict.common.allDomains}</option>
            {domains.map((d) => (
              <option key={d} value={d}>
                {formatSlugLabel(d)}
              </option>
            ))}
          </select>
          <select
            aria-label={dict.common.allCategories}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="field"
          >
            <option value="">{dict.common.allCategories}</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {formatSlugLabel(c)}
              </option>
            ))}
          </select>
          <select
            aria-label={dict.common.allAgents}
            value={agent}
            onChange={(e) => setAgent(e.target.value)}
            className="field"
          >
            <option value="">{dict.common.allAgents}</option>
            {agents.map((a) => (
              <option key={a} value={a}>
                {PLATFORM_LABELS[a] || a}
              </option>
            ))}
          </select>
          <select
            aria-label={dict.common.allRisk}
            value={risk}
            onChange={(e) => setRisk(e.target.value)}
            className="field"
          >
            <option value="">{dict.common.allRisk}</option>
            {RISK_LEVELS.map((r) => (
              <option key={r} value={r}>
                {r === "high"
                  ? dict.risk.high
                  : r === "medium"
                    ? dict.risk.medium
                    : dict.risk.low}
              </option>
            ))}
          </select>
          <select
            aria-label={dict.common.allTags}
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="field"
          >
            <option value="">{dict.common.allTags}</option>
            {allTags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </fieldset>
      </div>
      <div className="flex min-h-11 flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-sm text-muted">
          {formatMessage(dict.common.showingCount, {
            shown: filtered.length,
            total: items.length,
          })}
        </p>
        {hasFilters && <button type="button" className="button" onClick={resetFilters}>{dict.common.resetFilters}</button>}
      </div>

      {filtered.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((template) => <TemplateCard key={template.id} template={template} />)}
        </div>
      ) : (
        <div className="panel grid justify-items-center gap-3 p-10 text-center">
          <SearchX size={28} className="text-accent" aria-hidden="true" />
          <p className="font-semibold">{items.length ? dict.common.noTemplatesMatch : dict.catalog.empty}</p>
        </div>
      )}
    </div>
  );
}
