"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Braces, Github } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import { useLocale } from "./locale-provider";

export function SiteHeader() {
  const { dict, href } = useLocale();
  const pathname = usePathname();
  const nav = [
    { path: "/catalog", label: dict.nav.catalog },
    { path: "/packs", label: dict.nav.packs },
    { path: "/mcp", label: dict.nav.mcp },
    { path: "/agent-support", label: dict.nav.agents },
    { path: "/how-it-works", label: dict.howItWorks.title },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-md">
      <div className="site-shell grid grid-cols-[1fr_auto] items-center gap-x-3 sm:grid-cols-[1fr_auto_auto] sm:gap-x-3 lg:gap-x-6">
        <Link href={href("/")} className="col-start-1 row-start-1 flex min-h-14 min-w-0 items-center gap-2.5 rounded font-semibold leading-tight tracking-tight">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-action text-on-action">
            <Braces size={20} aria-hidden="true" />
          </span>
          <span>{dict.site.name}</span>
        </Link>
        <nav aria-label={dict.common.navigation} className="col-span-2 row-start-2 flex min-h-10 flex-wrap items-center gap-x-3 gap-y-1 text-sm lg:gap-5 text-muted sm:col-span-1 sm:col-start-2 sm:row-start-1">
          {nav.map(({ path, label }) => (
            <Link key={path} href={href(path)} aria-current={pathname === href(path) ? "page" : undefined} className="rounded transition-colors hover:text-accent aria-[current=page]:font-semibold aria-[current=page]:text-accent">
              {label}
            </Link>
          ))}
          <a href="https://github.com/buberlo/agent-templates" className="ml-auto rounded hover:text-accent sm:ml-0" aria-label={dict.nav.contentRepo}>
            <Github size={19} aria-hidden="true" />
          </a>
        </nav>
        <div className="col-start-2 row-start-1 flex items-center gap-2 sm:col-start-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
