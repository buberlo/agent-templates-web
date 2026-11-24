import Link from "next/link";
import { getMcpCatalog } from "@/lib/content/loader";
import { formatMessage, getDictionary, localizePath, type Locale } from "@/lib/i18n";
import { formatSlugLabel } from "@/lib/utils";

export function McpPageContent({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const mcp = getMcpCatalog();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">{d.mcp.title}</h1>
        <p className="mt-2 text-muted">
          {formatMessage(d.mcp.intro, {
            count: mcp.count ?? mcp.servers.length,
            date: mcp.generated_at || "—",
          })}
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border bg-card/60 text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">{d.common.name}</th>
              <th className="px-4 py-3 font-medium">{d.common.type}</th>
              <th className="px-4 py-3 font-medium">{d.common.categories}</th>
              <th className="px-4 py-3 font-medium">{d.common.auth}</th>
            </tr>
          </thead>
          <tbody>
            {mcp.servers.map((s) => (
              <tr key={s.name + s.url} className="border-b border-border/60">
                <td className="px-4 py-3 align-top">
                  <a
                    href={s.url}
                    className="font-medium text-link"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {s.name}
                  </a>
                  {s.risk_notes ? (
                    <p className="mt-1 text-xs text-muted">{s.risk_notes}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3 align-top text-muted">{s.type}</td>
                <td className="px-4 py-3 align-top">
                  <div className="flex flex-wrap gap-1">
                    {s.categories.slice(0, 4).map((c) => {
                      const [dom, cat] = c.split("/");
                      return dom && cat ? (
                        <Link
                          key={c}
                          href={localizePath(locale, `/domains/${dom}/${cat}`)}
                          className="rounded bg-surface px-1.5 py-0.5 text-xs hover:text-accent"
                        >
                          {formatSlugLabel(cat)}
                        </Link>
                      ) : (
                        <span key={c} className="text-xs text-muted">
                          {c}
                        </span>
                      );
                    })}
                    {s.categories.length > 4 ? (
                      <span className="text-xs text-muted">
                        +{s.categories.length - 4}
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3 align-top text-muted">{s.auth}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}