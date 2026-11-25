import Link from "next/link";
import { getSiteChangelog } from "@/lib/content/versioning";
import { getDictionary, localizePath, type Locale } from "@/lib/i18n";

export function ChangelogPageContent({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const entries = getSiteChangelog(100);

  return (
    <div className="space-y-8">
      <header className="panel p-5 sm:p-8">
        <h1 className="page-title">{d.changelog.title}</h1>
        <p className="mt-3 max-w-3xl text-muted">{d.changelog.intro}</p>
      </header>

      <section className="panel p-5 sm:p-8">
        {entries.length === 0 ? (
          <p className="text-muted">{d.changelog.empty}</p>
        ) : (
          <ol className="space-y-4">
            {entries.map((entry) => (
              <li key={entry.sha} className="border-b pb-4 last:border-0">
                <p className="text-sm text-muted">
                  <time dateTime={entry.date}>{entry.date}</time>
                  {" · "}
                  <code className="text-xs">{entry.sha}</code>
                </p>
                <p className="mt-1 font-medium">{entry.subject}</p>
              </li>
            ))}
          </ol>
        )}
        <p className="mt-6 text-sm">
          <Link href={localizePath(locale, "/catalog")} className="text-link">
            {d.common.catalog}
          </Link>
        </p>
      </section>
    </div>
  );
}