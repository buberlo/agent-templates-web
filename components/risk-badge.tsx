"use client";

import { riskBadgeClass } from "@/lib/utils";
import { useLocale } from "./locale-provider";

export function RiskBadge({ level }: { level: string }) {
  const { dict } = useLocale();
  const riskWord =
    level === "high"
      ? dict.risk.high
      : level === "medium"
        ? dict.risk.medium
        : dict.risk.low;

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${riskBadgeClass(level)}`}
    >
      {riskWord} {dict.risk.suffix}
    </span>
  );
}