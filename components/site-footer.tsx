import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border py-10 text-sm text-muted">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Content from{" "}
          <a
            href="https://github.com/buberlo/agent-templates"
            className="text-sky-400 hover:underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            buberlo/agent-templates
          </a>
          . This site is read-only; no accounts or reviews in phase 1.
        </p>
        <div className="flex gap-4">
          <Link href="/catalog" className="hover:text-foreground">
            Catalog
          </Link>
          <a
            href="https://github.com/buberlo/agent-templates-web"
            className="hover:text-foreground"
            rel="noopener noreferrer"
            target="_blank"
          >
            Website repo
          </a>
        </div>
      </div>
    </footer>
  );
}