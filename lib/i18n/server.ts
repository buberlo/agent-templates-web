import { headers } from "next/headers";
import type { Locale } from "./types";

export async function getRequestLocale(): Promise<Locale> {
  const headersList = await headers();
  const value = headersList.get("x-locale");
  if (value === "de") return "de";
  return "en";
}