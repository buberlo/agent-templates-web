/** Canonical section keys with German + English heading patterns (migration-safe). */
export const SECTION_ALIASES: Record<
  string,
  { key: string; patterns: RegExp[] }
> = {
  purpose: {
    key: "purpose",
    patterns: [/^##\s+Zweck\s*$/im, /^##\s+Purpose\s*$/im],
  },
  whenToUse: {
    key: "whenToUse",
    patterns: [/^##\s+Wann nutzen\s*$/im, /^##\s+When to use\s*$/im],
  },
  toolStack: {
    key: "toolStack",
    patterns: [/^##\s+Tool-Stack\s*$/im, /^##\s+Tool stack\s*$/im],
  },
  systemPrompt: {
    key: "systemPrompt",
    patterns: [
      /^##\s+System-Prompt\s*\/\s*Instruktionen\s*$/im,
      /^##\s+System prompt\s*$/im,
      /^##\s+Instructions\s*$/im,
    ],
  },
  workflow: {
    key: "workflow",
    patterns: [/^##\s+Arbeitsablauf\s*$/im, /^##\s+Workflow\s*$/im],
  },
  definitionOfDone: {
    key: "definitionOfDone",
    patterns: [
      /^##\s+Qualitätskriterien\s*\/\s*Definition of Done\s*$/im,
      /^##\s+Definition of done\s*$/im,
    ],
  },
  security: {
    key: "security",
    patterns: [
      /^##\s+Sicherheit\s*&\s*Freigaben\s*$/im,
      /^##\s+Security\s*$/im,
    ],
  },
  pitfalls: {
    key: "pitfalls",
    patterns: [/^##\s+Fallstricke\s*$/im, /^##\s+Pitfalls\s*$/im],
  },
  examples: {
    key: "examples",
    patterns: [
      /^##\s+Grundbeispiele\s*$/im,
      /^##\s+Basic examples\s*$/im,
      /^##\s+Examples\s*$/im,
    ],
  },
};

export type SectionKey = keyof typeof SECTION_ALIASES extends never
  ? string
  : (typeof SECTION_ALIASES)[keyof typeof SECTION_ALIASES]["key"];

export type ParsedSections = {
  purpose?: string;
  whenToUse?: string;
  toolStack?: string;
  systemPrompt?: string;
  workflow?: string;
  definitionOfDone?: string;
  security?: string;
  pitfalls?: string;
  examples?: string;
  systemPromptText?: string;
  examplesParsed: TemplateExample[];
};

export type ExampleKind = "synthetic" | "real-world" | "unknown";

export interface TemplateExample {
  title: string;
  kind: ExampleKind;
  body: string;
  sourceUrl?: string;
}

function findSectionStarts(body: string): { index: number; heading: string }[] {
  const matches: { index: number; heading: string }[] = [];
  let m: RegExpExecArray | null;
  const re = /^##\s+.+$/gm;
  while ((m = re.exec(body)) !== null) {
    matches.push({ index: m.index, heading: m[0] });
  }
  return matches;
}

export function parseSections(body: string): ParsedSections {
  const starts = findSectionStarts(body);
  const sections: ParsedSections = { examplesParsed: [] };

  for (let i = 0; i < starts.length; i++) {
    const start = starts[i].index;
    const end = i + 1 < starts.length ? starts[i + 1].index : body.length;
    const chunk = body.slice(start, end);
    const headingLine = starts[i].heading.trim();

    for (const def of Object.values(SECTION_ALIASES)) {
      if (def.patterns.some((p) => p.test(headingLine))) {
        const content = chunk.replace(/^##[^\n]+\n?/, "").trim();
        (sections as Record<string, string | TemplateExample[] | undefined>)[
          def.key
        ] = content;
        if (def.key === "systemPrompt") {
          sections.systemPromptText = extractFencedText(content) ?? content;
        }
        if (def.key === "examples") {
          sections.examplesParsed = parseExamples(content);
        }
        break;
      }
    }
  }

  if (!sections.systemPromptText) {
    const m = body.match(
      /##\s+(?:System-Prompt[^`\n]*|System prompt)\s+```(?:text)?\s*\n([\s\S]*?)```/i,
    );
    if (m) sections.systemPromptText = m[1].trim();
  }

  return sections;
}

export function extractFencedText(markdown: string): string | undefined {
  const m = markdown.match(/```(?:text)?\s*\n([\s\S]*?)```/);
  return m ? m[1].trim() : undefined;
}

const EXAMPLE_HEADER =
  /^###\s+(?:Beispiel|Example)\s+\d+[^\n]*(?:\(([^)]+)\))?/gim;

function classifyExampleKind(label: string | undefined): ExampleKind {
  if (!label) return "unknown";
  const l = label.toLowerCase();
  if (
    l.includes("beispieldaten") ||
    l.includes("example data") ||
    l.includes("synthetic")
  ) {
    return "synthetic";
  }
  if (
    l.includes("real") ||
    l.includes("echtwelt") ||
    l.includes("production") ||
    l.includes("live")
  ) {
    return "real-world";
  }
  return "unknown";
}

function parseExamples(sectionBody: string): TemplateExample[] {
  const parts: TemplateExample[] = [];
  const headers = [...sectionBody.matchAll(EXAMPLE_HEADER)];
  for (let i = 0; i < headers.length; i++) {
    const match = headers[i];
    const start = match.index ?? 0;
    const end =
      i + 1 < headers.length
        ? (headers[i + 1].index ?? sectionBody.length)
        : sectionBody.length;
    const block = sectionBody.slice(start, end).trim();
    const label = match[1]?.trim();
    const title = match[0].replace(/^###\s+/, "").trim();
    let sourceUrl: string | undefined;
    const sourceMatch = block.match(
      /(?:\*\*Quelle:\*\*|\*\*Source:\*\*|Source:)\s*(https?:\/\/[^\s)]+)/i,
    );
    if (sourceMatch) sourceUrl = sourceMatch[1];
    parts.push({
      title,
      kind: classifyExampleKind(label),
      body: block,
      sourceUrl,
    });
  }
  return parts;
}

export function stripMarkdownForSearch(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#*_`[\]()>-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}