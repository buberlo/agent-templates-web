import type { QualityLevel } from "@/lib/content/quality-score";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function agentStencilBadgeSvg(title: string): string {
  const label = escapeXml(title.slice(0, 48));
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="240" height="40" role="img" aria-label="Works with AgentStencil: ${label}">
  <rect width="240" height="40" rx="6" fill="#0f172a"/>
  <rect x="1" y="1" width="238" height="38" rx="5" fill="none" stroke="#38bdf8" stroke-width="1"/>
  <text x="12" y="17" fill="#94a3b8" font-family="system-ui,sans-serif" font-size="10">Works with</text>
  <text x="12" y="32" fill="#f8fafc" font-family="system-ui,sans-serif" font-size="13" font-weight="600">AgentStencil</text>
  <text x="128" y="32" fill="#38bdf8" font-family="system-ui,sans-serif" font-size="11">${label}</text>
</svg>`;
}

const qualityLabel: Record<QualityLevel, string> = {
  passes: "Quality passes",
  partial: "Quality partial",
  waived: "Quality waived",
};

export function qualityBadgeSvg(
  level: QualityLevel,
  passed: number,
  total: number,
): string {
  const tone = level === "passes" ? "#22c55e" : level === "waived" ? "#eab308" : "#f97316";
  const label = qualityLabel[level];
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="40" role="img" aria-label="${escapeXml(label)} ${passed}/${total}">
  <rect width="200" height="40" rx="6" fill="#0f172a"/>
  <rect x="1" y="1" width="198" height="38" rx="5" fill="none" stroke="${tone}" stroke-width="1"/>
  <text x="12" y="17" fill="#94a3b8" font-family="system-ui,sans-serif" font-size="10">AgentStencil</text>
  <text x="12" y="32" fill="#f8fafc" font-family="system-ui,sans-serif" font-size="12" font-weight="600">${escapeXml(label)}</text>
  <text x="130" y="32" fill="${tone}" font-family="ui-monospace,monospace" font-size="12">${passed}/${total}</text>
</svg>`;
}