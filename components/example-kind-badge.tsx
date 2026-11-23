"use client";

import type { ExampleKind } from "@/lib/content/sections";
import { useLocale } from "./locale-provider";

const STYLES: Record<ExampleKind, string> = {
  synthetic: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  "real-world": "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  unknown: "bg-white/10 text-muted border-border",
};

export function ExampleKindBadge({ kind }: { kind: ExampleKind }) {
  const { dict } = useLocale();
  const label =
    kind === "synthetic"
      ? dict.exampleKind.synthetic
      : kind === "real-world"
        ? dict.exampleKind.realWorld
        : dict.exampleKind.unknown;

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${STYLES[kind]}`}
    >
      {label}
    </span>
  );
}