"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { Dictionary, Locale } from "@/lib/i18n/types";
import { localizePath } from "@/lib/i18n/routing";

type LocaleContextValue = {
  locale: Locale;
  dict: Dictionary;
  href: (path: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({
      locale,
      dict,
      href: (path: string) => localizePath(locale, path),
    }),
    [locale, dict],
  );
  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}