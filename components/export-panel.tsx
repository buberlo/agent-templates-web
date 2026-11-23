"use client";

import {
  EXPORT_TARGETS,
  PLATFORM_LABELS,
  type ExportTarget,
} from "@/lib/content/constants";
import { exportTemplate } from "@/lib/export";
import type { TemplateFrontmatter } from "@/lib/content/types";
import type { ParsedSections } from "@/lib/content/sections";
import { useMemo, useState } from "react";
import { CopyButton } from "./copy-button";
import { useLocale } from "./locale-provider";

export type ExportPanelDoc = {
  frontmatter: TemplateFrontmatter;
  sections: Pick<
    ParsedSections,
    | "purpose"
    | "whenToUse"
    | "toolStack"
    | "workflow"
    | "definitionOfDone"
    | "security"
    | "pitfalls"
    | "systemPromptText"
  >;
  body: string;
  filePath: string;
};

const TARGETS = EXPORT_TARGETS;

export function ExportPanel({ doc }: { doc: ExportPanelDoc }) {
  const { dict } = useLocale();
  const [target, setTarget] = useState<ExportTarget>("generic");
  const result = useMemo(() => {
    const fullDoc = {
      ...doc,
      sections: { ...doc.sections, examplesParsed: [] },
      searchText: "",
    };
    return exportTemplate(fullDoc, target);
  }, [doc, target]);

  const description = dict.export.descriptions[target];

  function download() {
    const blob = new Blob([result.content], { type: result.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section
      className="rounded-xl border border-border bg-card/50 p-5"
      aria-labelledby="export-heading"
    >
      <h2 id="export-heading" className="text-lg font-semibold">
        {dict.export.heading}
      </h2>
      <p className="mt-1 text-sm text-muted">{description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <select
          aria-label={dict.export.platformLabel}
          value={target}
          onChange={(e) => setTarget(e.target.value as ExportTarget)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          {TARGETS.map((t) => (
            <option key={t} value={t}>
              {PLATFORM_LABELS[t] || t}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={download}
          className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500"
        >
          {dict.export.download} {result.filename}
        </button>
        <CopyButton text={result.content} label={dict.export.copyExport} />
      </div>
      <pre className="mt-4 max-h-64 overflow-auto rounded-lg border border-border bg-black/30 p-3 font-mono text-xs">
        {result.content.slice(0, 4000)}
        {result.content.length > 4000 ? "\n…" : ""}
      </pre>
    </section>
  );
}