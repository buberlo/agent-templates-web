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
            className={`rounded-md px-2 py-1 font-medium transition ${
              active
                ? "bg-sky-600 text-white"
                : "text-muted hover:text-foreground"
            }`}
            hrefLang={loc}
            aria-current={active ? "page" : undefined}
          >
            {loc === "en" ? dict.language.en : dict.language.de}
          </Link>
        );
      })}
    </div>
  );
}