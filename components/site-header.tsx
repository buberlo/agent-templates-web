"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import { useLocale } from "./locale-provider";

export function SiteHeader() {
  const { dict, href } = useLocale();

  const nav = [
    { href: href("/catalog"), label: dict.nav.catalog },
    { href: href("/mcp"), label: dict.nav.mcp },
    {
      href: "https://github.com/buberlo/agent-templates",
      label: dict.nav.contentRepo,
      external: true,
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href={href("/")} className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/20 text-sm text-sky-400">
            AT
          </span>
          <span>{dict.site.name}</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          {nav.map((item) =>
            item.external ? (
              <a
                key={item.href}
                href={item.href}
                className="hover:text-foreground"
                rel="noopener noreferrer"
                target="_blank"
              >
                {item.label}
              </a>
            ) : (
              <Link key={item.href} href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ),
          )}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}