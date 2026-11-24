import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatSlugLabel(slug: string): string {
  return slug
    .split("-")
    .map((w) => (["ai", "api", "crm", "hr", "it", "mcp", "sql", "ui", "ux"].includes(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ")
    .replace(/\bAi\b/gi, "AI")
    .replace(/\bCrm\b/gi, "CRM")
    .replace(/\bHr\b/gi, "HR");
}

export function riskBadgeClass(level: string): string {
  switch (level) {
    case "high":
      return "bg-high/10 text-high border-high/30";
    case "medium":
      return "bg-medium/10 text-medium border-medium/30";
    default:
      return "bg-low/10 text-low border-low/30";
  }
}