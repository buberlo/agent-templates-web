"use client";

import {
  EXPORT_TARGETS,
  type ExportTarget,
} from "@/lib/content/constants";
import { allExportFiles, exportTemplate } from "@/lib/export";
import type { TemplateFrontmatter } from "@/lib/content/types";
import type { ParsedSections } from "@/lib/content/sections";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
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
    | "systemPrompt"
    | "systemPromptText"
  >;
  body: string;
  filePath: string;
};

export function ExportPanel({ doc }: { doc: ExportPanelDoc }) {
  const { dict } = useLocale();
  const [target, setTarget] = useState<ExportTarget>("generic");
  const result = useMemo(() => {
    const fullDoc = {
      ...doc,
      sections: { ...doc.sections, examplesParsed: [] },
      searchText: "",
      changelog: [],
    };
    return exportTemplate(fullDoc, target);
  }, [doc, target]);

  const description = dict.export.descriptions[target];

  const files = useMemo(() => allExportFiles(result), [result]);

  function download(file: (typeof files)[number]) {
    const blob = new Blob([file.content], { type: file.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.filename.split("/").pop() ?? file.filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section id="export" className="anchor-section panel p-4 sm:p-6" aria-labelledby="export-heading">
      <h2 id="export-heading" className="section-title">{dict.export.heading}</h2>
      <fieldset className="mt-4">
        <legend className="mb-2 text-sm font-semibold">{dict.export.platformLabel}</legend>
        <div className="flex flex-wrap gap-2">
          {EXPORT_TARGETS.map((platform) => (
            <label key={platform}>
              <input
                type="radio"
                name="export-platform"
                value={platform}
                checked={target === platform}
                onChange={() => setTarget(platform)}
                className="peer sr-only"
              />
              <span className="button cursor-pointer peer-checked:border-accent peer-checked:bg-surface peer-checked:text-accent peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
                {dict.platforms[platform]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <p className="mt-4 text-sm text-muted">{description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {files.map((file) => (
          <button
            key={file.filename}
            type="button"
            onClick={() => download(file)}
            className="button-primary min-w-0 text-left [overflow-wrap:anywhere]"
          >
            <Download size={17} className="shrink-0" aria-hidden="true" />
            <span>{dict.export.download} {file.filename}</span>
          </button>
        ))}
        <CopyButton key={target} text={result.content} label={dict.export.copyExport} />
      </div>
      <pre tabIndex={0} className="mt-4 max-h-64 overflow-auto rounded-lg border bg-surface p-4 font-mono text-xs">
        {result.content.slice(0, 4000)}
        {result.content.length > 4000 ? "\n…" : ""}
      </pre>
    </section>
  );
}
