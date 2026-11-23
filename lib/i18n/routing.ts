import { DEFAULT_LOCALE, type Locale, LOCALES } from "./types";

export { DEFAULT_LOCALE, LOCALES };

export function stripLocalePath(pathname: string): string {
  if (pathname === "/de") return "/";
  if (pathname.startsWith("/de/")) return pathname.slice(3) || "/";
  return pathname;
}

export function localizePath(locale: Locale, barePath: string): string {
  const path = barePath.startsWith("/") ? barePath : `/${barePath}`;
  if (locale === DEFAULT_LOCALE) return path === "" ? "/" : path;
  if (path === "/") return "/de";
  return `/de${path}`;
}

export function detectLocaleFromPath(pathname: string): Locale {
  return pathname === "/de" || pathname.startsWith("/de/") ? "de" : "en";
}