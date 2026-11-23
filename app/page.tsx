import Link from "next/link";
import { getAdapters, getCatalog, getSiteStats } from "@/lib/content/loader";
import { PLATFORM_LABELS, EXPORT_TARGETS } from "@/lib/content/constants";
import { formatSlugLabel } from "@/lib/utils";

export default function HomePage() {
  const stats = getSiteStats();
  const catalog = getCatalog();
  const adapters = getAdapters();
  const topDomains = [...catalog.domains]
    .sort((a, b) => b.template_count - a.template_count)
    .slice(0, 8);

  return (
    <div className="space-y-16">
      <section className="space-y-6">
        <p className="text-sm font-medium uppercase tracking-widest text-sky-400">
          Phase 1 · Public catalog
        </p>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          Reusable agent instruction templates
        </h1>
        <p className="max-w-2xl text-lg text-muted">
          This site renders{" "}
          <a
            href="https://github.com/buberlo/agent-templates"
            className="text-sky-400 hover:underline"
          >
            buberlo/agent-templates
          </a>{" "}
          at build time: domains, categories, MCP catalog, and platform-specific
          exports — no content is copied into this repository.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/catalog"
            className="rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-500"
          >
            Browse catalog
          </Link>
          <Link
            href="/mcp"
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium hover:bg-white/5"
          >
            MCP servers
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Counts from the content repo</h2>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Templates", value: stats.templateCount },
            { label: "Domains", value: stats.domainCount },
            { label: "Categories", value: stats.categoryCount },
            { label: "MCP catalog entries", value: stats.mcpServerCount },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-border bg-card/50 p-5"
            >
              <dt className="text-sm text-muted">{item.label}</dt>
              <dd className="mt-1 text-3xl font-semibold tabular-nums">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-muted">
          Catalog generated at {catalog.generated_at}
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Supported platforms</h2>
        <p className="mt-2 max-w-2xl text-muted">
          Each template lists target agents. Export adapts the system prompt and
          workflow for:
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {EXPORT_TARGETS.map((p) => (
            <li
              key={p}
              className="rounded-full border border-border bg-white/5 px-3 py-1 text-sm"
            >
              {PLATFORM_LABELS[p]}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted">
          Integration notes live in the content repo under{" "}
          <code className="rounded bg-black/20 px-1">adapters/</code> (
          {adapters.map((a) => a.slug).join(", ")}).
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Domains</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {topDomains.map((d) => (
            <li key={d.slug}>
              <Link
                href={`/domains/${d.slug}`}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3 hover:border-sky-500/40 hover:bg-card/60"
              >
                <span className="font-medium">{formatSlugLabel(d.slug)}</span>
                <span className="text-sm text-muted tabular-nums">
                  {d.template_count} templates
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {catalog.domains.length > topDomains.length && (
          <p className="mt-3 text-sm text-muted">
            <Link href="/catalog" className="text-sky-400 hover:underline">
              View all in the catalog
            </Link>
          </p>
        )}
      </section>
    </div>
  );
}