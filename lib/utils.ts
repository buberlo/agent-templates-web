import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatSlugLabel(slug: string): string {
  return slug
    .split("-")
    .map((w) => (w.length <= 3 ? w.toUpperCase() : w))
    .join(" ")
    .replace(/\bAi\b/gi, "AI")
    .replace(/\bCrm\b/gi, "CRM")
    .replace(/\bHr\b/gi, "HR");
}

export function riskBadgeClass(level: string): string {
  switch (level) {
    case "high":
      return "bg-red-500/15 text-red-400 border-red-500/30";
    case "medium":
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    default:
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  }
}