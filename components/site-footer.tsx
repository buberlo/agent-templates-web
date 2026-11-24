"use client";

import Link from "next/link";
import { useLocale } from "./locale-provider";

export function SiteFooter() {
  const { dict, href } = useLocale();

  return (
    <footer className="mt-auto border-t border-border py-10 text-sm text-muted">
      <div className="site-shell flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p>
          {dict.footer.contentFrom}{" "}
          <a
            href="https://github.com/buberlo/agent-templates"
            className="text-link"
            rel="noopener noreferrer"
            target="_blank"
          >
            buberlo/agent-templates
          </a>
        </p>
        <div className="flex gap-4">
          <Link href={href("/catalog")} className="hover:text-foreground">
            {dict.nav.catalog}
          </Link>
          <a
            href="https://github.com/buberlo/agent-templates-web"
            className="hover:text-foreground"
            rel="noopener noreferrer"
            target="_blank"
          >
            {dict.footer.websiteRepo}
          </a>
        </div>
      </div>
    </footer>
  );
}