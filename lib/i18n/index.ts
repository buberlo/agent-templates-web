import type { Metadata } from "next";
import de from "./dictionaries/de";
import en from "./dictionaries/en";
import {
  DEFAULT_LOCALE,
  type Dictionary,
  type Locale,
  LOCALES,
} from "./types";
import { localizePath } from "./routing";

export type { Dictionary, Locale };
export { DEFAULT_LOCALE, LOCALES };
export {
  detectLocaleFromPath,
  localizePath,
  stripLocalePath,
} from "./routing";
export { formatMessage } from "./format";

const dictionaries: Record<Locale, Dictionary> = { en, de };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function languageAlternates(
  barePath: string,
  locale: Locale = DEFAULT_LOCALE,
): Metadata["alternates"] {
  return {
    canonical: localizePath(locale, barePath),
    languages: {
      en: localizePath("en", barePath),
      de: localizePath("de", barePath),
      "x-default": localizePath("en", barePath),
    },
  };
}

export function siteMetadataBase(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://agent-templates-web.vercel.app"
  );
}
