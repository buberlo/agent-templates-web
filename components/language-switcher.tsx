"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, localizePath, stripLocalePath } from "@/lib/i18n/routing";
import { useLocale } from "./locale-provider";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const { locale, dict } = useLocale();
  const bare = stripLocalePath(pathname);

  return (
    <div
      className="flex items-center gap-1 rounded-lg border border-border bg-card p-0.5 text-xs"
      role="navigation"
      aria-label={dict.language.label}
    >
      {LOCALES.map((loc) => {
        const target = localizePath(loc, bare);
        const active = loc === locale;
        return (
          <Link
            key={loc}
            href={target}
            className={`rounded-md px-2 py-1.5 font-medium transition ${
              active
                ? "bg-action text-on-action"
                : "text-muted hover:text-foreground"
            }`}
            aria-label={dict.language[loc]}
            hrefLang={loc}
            aria-current={active ? "page" : undefined}
          >
            <span aria-hidden="true" className="uppercase md:hidden">{loc}</span>
            <span aria-hidden="true" className="hidden md:inline">{dict.language[loc]}</span>
          </Link>
        );
      })}
    </div>
  );
}