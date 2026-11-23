import { riskBadgeClass } from "@/lib/utils";

export function RiskBadge({ level }: { level: string }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${riskBadgeClass(level)}`}
    >
      {level} risk
    </span>
  );
}