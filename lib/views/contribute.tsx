import Link from "next/link";
import { CONTENT_REPO_NAME, CONTENT_REPO_OWNER } from "@/lib/content/constants";
import { getDictionary, localizePath, type Locale } from "@/lib/i18n";

const contentRepo = `https://github.com/${CONTENT_REPO_OWNER}/${CONTENT_REPO_NAME}`;

export function ContributePageContent({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);

  return (
    <article className="space-y-8">
      <header className="panel p-5 sm:p-8">
        <h1 className="page-title">{d.contribute.title}</h1>
        <p className="mt-4 max-w-3xl leading-relaxed text-muted">{d.contribute.intro}</p>
      </header>

      <section className="panel p-5 sm:p-8">
        <h2 className="section-title">{d.contribute.stepsHeading}</h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-muted marker:font-semibold marker:text-accent">
          {d.contribute.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <ul className="mt-6 space-y-2 text-sm">
          <li>
            <a href={`${contentRepo}/blob/main/CONTRIBUTING.md`} className="text-link">
              {d.contribute.contributingGuide}
            </a>
          </li>
          <li>
            <a href={`${contentRepo}/tree/main/scripts`} className="text-link">
              {d.contribute.validator}
            </a>
          </li>
          <li>
            <a href={`${contentRepo}/issues/new/choose`} className="text-link">
              {d.contribute.openIssue}
            </a>
          </li>
        </ul>
      </section>

      <section className="panel p-5 sm:p-8">
        <h2 className="section-title">{d.contribute.principleHeading}</h2>
        <p className="mt-3 text-muted">{d.contribute.principle}</p>
        <Link href={localizePath(locale, "/catalog")} className="button-primary mt-5">
          {d.common.catalog}
        </Link>
      </section>
    </article>
  );
}