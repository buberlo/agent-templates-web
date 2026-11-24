"use client";

import type { ExampleKind } from "@/lib/content/sections";
import { useLocale } from "./locale-provider";

const STYLES: Record<ExampleKind, string> = {
  synthetic: "bg-accent/10 text-accent border-accent/30",
  "real-world": "bg-low/10 text-low border-low/30",
  unknown: "bg-surface text-muted border-border",
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