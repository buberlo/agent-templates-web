"use client";

import type { QualityLevel } from "@/lib/content/quality-score";
import { riskBadgeClass } from "@/lib/utils";
import { useLocale } from "./locale-provider";

const badgeTone = { passes: "low", partial: "medium", waived: "medium" } as const;

export function QualityBadge({ level }: { level: QualityLevel }) {
  const { dict } = useLocale();

  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${riskBadgeClass(badgeTone[level])}`}>
      {dict.quality.levels[level]}
    </span>
  );
}
