"use client";

import Index from "flexsearch";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SearchX } from "lucide-react";
import { TemplateCard, type TemplateCardData } from "./template-card";
import { formatSlugLabel } from "@/lib/utils";
import {
  agentFromParam,
  agentLabel,
  agentToParam,
  templateSupportsAgent,
  uniqueAgentIds,
} from "@/lib/content/agents";
import { formatMessage } from "@/lib/i18n/format";
import { useLocale } from "./locale-provider";

export type CatalogSearchItem = TemplateCardData & { searchText: string };

const RISK_LEVELS = ["low", "medium", "high"] as const;

type FilterState = {
  query: string;
  domain: string;
  category: string;
  agent: string;
  risk: string;
  tag: string;
};

const EMPTY_FILTERS: FilterState = {
  query: "",
  domain: "",
  category: "",
  agent: "",
  risk: "",
  tag: "",
};

function readFiltersFromParams(params: URLSearchParams): FilterState {
  return {
    query: params.get("q") ?? "",
    domain: params.get("domain") ?? "",
    category: params.get("category") ?? "",
    agent: agentFromParam(params.get("agent") ?? ""),
    risk: params.get("risk") ?? "",
    tag: params.get("tag") ?? "",
  };
}

function writeFiltersToUrl(filters: FilterState) {
  const url = new URL(window.location.href);
  const next = new URLSearchParams(url.searchParams);
  const entries: Array<[string, string]> = [
    ["q", filters.query.trim()],
    ["domain", filters.domain],
    ["category", filters.category],
    ["agent", filters.agent ? agentToParam(filters.agent) : ""],
    ["risk", filters.risk],
    ["tag", filters.tag],
  ];
  for (const [key, value] of entries) {
    if (value) next.set(key, value);
    else next.delete(key);
  }
  const search = next.toString();
  const nextUrl = url.pathname + (search ? `?${search}` : "");
  if (nextUrl !== url.pathname + url.search) {
    window.history.replaceState(null, "", nextUrl);
  }
}

function CatalogSearchFields({
  items,
  initial,
  syncUrl = true,
}: {
  items: CatalogSearchItem[];
  initial: FilterState;
  syncUrl?: boolean;
}) {
  const { dict } = useLocale();
  const domains = useMemo(
    () => [...new Set(items.map((i) => i.domain))].sort(),
    [items],
  );
  const agents = useMemo(
    () => uniqueAgentIds(items.flatMap((i) => i.target_agents)),
    [items],
  );
  const allTags = useMemo(
    () => [...new Set(items.flatMap((i) => i.tags))].sort(),
    [items],
  );

  const [query, setQuery] = useState(initial.query);
  const [domain, setDomain] = useState(initial.domain);
  const [category, setCategory] = useState(initial.category);
  const [agent, setAgent] = useState(initial.agent);
  const [risk, setRisk] = useState(initial.risk);
  const [tag, setTag] = useState(initial.tag);

  useEffect(() => {
    if (!syncUrl) return;
    writeFiltersToUrl({ query, domain, category, agent, risk, tag });
  }, [syncUrl, query, domain, category, agent, risk, tag]);

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
      if (agent && !templateSupportsAgent(item.target_agents, agent)) return false;
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
    writeFiltersToUrl(EMPTY_FILTERS);
    document.getElementById("catalog-q")?.focus();
  }

  return (
    <div className="space-y-6">
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
                {agentLabel(a, dict.platforms)}
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

function CatalogSearchFromUrl({ items }: { items: CatalogSearchItem[] }) {
  const params = useSearchParams();
  const initial = useMemo(
    () => readFiltersFromParams(new URLSearchParams(params.toString())),
    [params],
  );
  return <CatalogSearchFields items={items} initial={initial} />;
}

export function CatalogSearch({ items }: { items: CatalogSearchItem[] }) {
  return (
    <Suspense fallback={<CatalogSearchFields items={items} initial={EMPTY_FILTERS} syncUrl={false} />}>
      <CatalogSearchFromUrl items={items} />
    </Suspense>
  );
}
