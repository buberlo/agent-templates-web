import type { ExampleKind } from "@/lib/content/sections";

const LABELS: Record<ExampleKind, string> = {
  synthetic: "Example data",
  "real-world": "Real-world example",
  unknown: "Example",
};

const STYLES: Record<ExampleKind, string> = {
  synthetic: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  "real-world": "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  unknown: "bg-white/10 text-muted border-border",
};

export function ExampleKindBadge({ kind }: { kind: ExampleKind }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${STYLES[kind]}`}
    >
      {LABELS[kind]}
    </span>
  );
}