"use client";

import Index from "flexsearch";
import { useMemo, useState } from "react";
import { TemplateCard, type TemplateCardData } from "./template-card";
import { formatSlugLabel } from "@/lib/utils";
import { PLATFORM_LABELS } from "@/lib/content/constants";

export type CatalogSearchItem = TemplateCardData & { searchText: string };

const RISK_LEVELS = ["low", "medium", "high"] as const;

export function CatalogSearch({ items }: { items: CatalogSearchItem[] }) {
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
    if (!domain) return [];
    return [
      ...new Set(
        items.filter((i) => i.domain === domain).map((i) => i.category),
      ),
    ].sort();
  }, [domain, items]);

  const index = useMemo(() => {
    const idx = new Index.Document({
      document: {
        id: "id",
        index: ["title", "searchText", "tags"],
        store: true,
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
      const res = index.search(query.trim(), { enrich: true }) as unknown as {
        result: Array<string | number | { id?: string | number }>;
      }[];
      matchIds = new Set<string>();
      for (const group of res) {
        for (const hit of group.result) {
          if (hit && typeof hit === "object" && "id" in hit) {
            matchIds.add(String(hit.id));
          } else {
            matchIds.add(String(hit));
          }
        }
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

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card/50 p-4">
        <label htmlFor="catalog-q" className="sr-only">
          Search templates
        </label>
        <input
          id="catalog-q"
          type="search"
          placeholder="Full-text search (title, tags, prompt text)…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none ring-sky-500/30 focus:ring-2"
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <select
            aria-label="Filter by domain"
            value={domain}
            onChange={(e) => {
              setDomain(e.target.value);
              setCategory("");
            }}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">All domains</option>
            {domains.map((d) => (
              <option key={d} value={d}>
                {formatSlugLabel(d)}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by category"
            value={category}
            disabled={!domain}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm disabled:opacity-50"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {formatSlugLabel(c)}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by target agent"
            value={agent}
            onChange={(e) => setAgent(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">All agents</option>
            {agents.map((a) => (
              <option key={a} value={a}>
                {PLATFORM_LABELS[a] || a}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by risk"
            value={risk}
            onChange={(e) => setRisk(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">All risk levels</option>
            {RISK_LEVELS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by tag"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">All tags</option>
            {allTags.slice(0, 200).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-3 text-sm text-muted">
          Showing {filtered.length} of {items.length} templates
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => (
          <TemplateCard key={t.id} template={t} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted">No templates match your filters.</p>
      )}
    </div>
  );
}