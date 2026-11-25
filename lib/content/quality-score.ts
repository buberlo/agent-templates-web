const REQUIRED_SECTIONS = {
  purpose: "Purpose",
  whenToUse: "When to use",
  toolStack: "Tool stack",
  systemPrompt: "System prompt",
  workflow: "Workflow",
  definitionOfDone: "Definition of done",
  security: "Security",
  pitfalls: "Pitfalls",
  basicExamples: "Basic examples",
} as const;

type SectionId = keyof typeof REQUIRED_SECTIONS;
type GateId =
  | "placeholders" | "standardTask" | "demoPath" | "statusOutput"
  | "genericOpener" | "exampleHeading" | "promptFence" | "workflowSteps"
  | "pitfallBullets" | "exampleCount" | "requiredSection"
  | "promptLines" | "promptLength" | "sentenceLines" | "keywordFragments"
  | "expectedOutput";

export type QualityLevel = "passes" | "partial" | "waived";

interface GateResult {
  passed: boolean;
  waivable: boolean;
}

type QualityGate =
  | (GateResult & { id: Exclude<GateId, "requiredSection" | "expectedOutput"> })
  | (GateResult & { id: "requiredSection"; section: SectionId })
  | (GateResult & { id: "expectedOutput"; index: number });

export interface QualityScore {
  level: QualityLevel;
  passedGates: number;
  totalGates: number;
  gates: QualityGate[];
  hasBacklogWaiver: boolean;
}

const MIN_SYSTEM_PROMPT_CHARS = 350;
const MIN_SENTENCE_LIKE_LINES = 3;
const MIN_EXPECTED_OUTPUT_CHARS = 40;
const MAX_COLON_KEYWORD_WITHOUT_SENTENCES = [5, 5];

// Python's Unicode word and whitespace classes differ from JavaScript's.
const WORD = "[\\p{L}\\p{N}_]";
const SPACE = "[\\p{White_Space}\\u001c-\\u001f]";
const BOUNDARY = `(?:(?<!${WORD})(?=${WORD})|(?<=${WORD})(?!${WORD}))`;

function validatorRegex(pattern: string, flags = ""): RegExp {
  return new RegExp(
    pattern.replace(/\\[bdsSw]/g, (token) => ({
      "\\b": BOUNDARY,
      "\\d": "\\p{Nd}",
      "\\s": SPACE,
      "\\S": "[^\\p{White_Space}\\u001c-\\u001f]",
      "\\w": WORD,
    })[token]!),
    `u${flags}`,
  );
}

// Python re.I also matches dotted and dotless I for ASCII i.
const SENTENCE_LIKE_RE = validatorRegex(
  String.raw`(^(You are\b)|(\b(must|should|never|always|Do not|w[iİı]ll|When|[Iİı]f|Before|After)\b)|(\b(the|a|an)\b[^\n]*\b(the|a|an)\b))`,
  "i",
);
const ROLE_FRAGMENT = validatorRegex(String.raw`^Role:\s`, "i");
const COLON_FRAGMENT = validatorRegex(String.raw`^[A-Za-z][\p{L}\p{N}_\p{White_Space}\u001c-\u001f/&-]*:\s+\S`);
const SYSTEM_PROMPT = validatorRegex("## System prompt\\s+```(?:text)?\\s*\\n(.*?)```", "s");
const EXPECTED_OUTPUT_PATTERNS = [
  validatorRegex("\\*\\*Expected result:\\*\\*\\s*\\n\\n```(?:text|bash)?\\s*\\n(.*?)```", "gs"),
  validatorRegex("\\*\\*Expected result:\\*\\*\\s+```(?:text|bash)?\\s*\\n(.*?)```", "gs"),
];
const EXAMPLE_HEADING = validatorRegex(String.raw`(?:^|(?<=\n))### Example \d+ \(Example data \(self-written\)\)`);
const EXAMPLE_COUNT = validatorRegex(String.raw`(?:^|(?<=\n))### Example \d+`, "g");
const WORKFLOW_STEP = validatorRegex(String.raw`(?:^|(?<=\n))\d+\.\s+`, "g");
const PITFALL_BULLET = validatorRegex(String.raw`(?:^|(?<=\n))\s*[-*]\s+`, "g");
const STATUS_OUTPUT = validatorRegex(String.raw`Status: OK\s*\nArtefakt:`);
const GENERIC_OPENER = validatorRegex(String.raw`You are a specialist for \w+ \(`);
const SPLIT_LINES = /\r\n|[\n\r\v\f\x1c-\x1e\x85\u2028\u2029]/;

const EDGE_SPACE = validatorRegex("^\\s+|\\s+$", "g");
const WORD_SEPARATOR = validatorRegex("\\s+");

function strip(text: string): string {
  return text.replace(EDGE_SPACE, "");
}

function sectionTail(body: string, heading: string): string | undefined {
  const marker = `## ${heading}`;
  const start = body.indexOf(marker);
  return start === -1 ? undefined : body.slice(start + marker.length);
}

export function lineIsColonKeywordFragment(line: string): boolean {
  line = strip(line);
  return ROLE_FRAGMENT.test(line)
    || (COLON_FRAGMENT.test(line) && line.split(WORD_SEPARATOR).length < 18);
}

export function lineIsSentenceLike(line: string): boolean {
  line = strip(line);
  if (lineIsColonKeywordFragment(line)) return false;
  const words = line ? line.split(WORD_SEPARATOR).length : 0;
  if (words < 8) return false;
  if (SENTENCE_LIKE_RE.test(line)) return true;
  return words >= 14 && /[.!?]$/.test(line);
}

export function extractBasicExamplesExpectedOutputs(body: string): string[] {
  const part = sectionTail(body, REQUIRED_SECTIONS.basicExamples);
  if (part === undefined) return [];
  // The two validator patterns intentionally overlap for blank-line fences.
  return EXPECTED_OUTPUT_PATTERNS.flatMap((pattern) =>
    Array.from(part.matchAll(pattern), (match) => strip(match[1])),
  );
}

export function parseQualityBacklog(text: string): ReadonlySet<string> {
  return new Set(text.split(SPLIT_LINES).map(strip)
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.replaceAll("\\", "/")));
}

export function computeQualityScore(
  body: string,
  filePath: string,
  backlog?: ReadonlySet<string>,
): QualityScore {
  // Match Python read_text's universal newline handling.
  body = body.replace(/\r\n?/g, "\n");
  const prompt = SYSTEM_PROMPT.exec(body)?.[1];
  const examples = sectionTail(body, REQUIRED_SECTIONS.basicExamples);
  const workflow = sectionTail(body, REQUIRED_SECTIONS.workflow);
  const pitfalls = sectionTail(body, REQUIRED_SECTIONS.pitfalls);
  const gates: QualityGate[] = [
    { id: "placeholders", passed: !/\{slug\}|\{title\}|\{domain\}|\{category\}/.test(body), waivable: false },
    { id: "standardTask", passed: !/Standard-[^\n]+-Aufgabe/.test(body), waivable: false },
    { id: "demoPath", passed: !(body.includes("output/{slug}-demo") || (body.includes("Artefakt: output/") && body.includes("{slug}"))), waivable: false },
    { id: "statusOutput", passed: !STATUS_OUTPUT.test(body), waivable: false },
    { id: "genericOpener", passed: !GENERIC_OPENER.test(body), waivable: false },
    { id: "promptFence", passed: prompt !== undefined, waivable: false },
    { id: "exampleCount", passed: Array.from((examples ?? "").matchAll(EXAMPLE_COUNT)).length >= 2, waivable: false },
  ];
  if (examples !== undefined) {
    gates.push({ id: "exampleHeading", passed: EXAMPLE_HEADING.test(body), waivable: false });
  }
  if (workflow !== undefined) {
    gates.push({ id: "workflowSteps", passed: Array.from(workflow.split("##", 1)[0].matchAll(WORKFLOW_STEP)).length >= 5, waivable: false });
  }
  if (pitfalls !== undefined) {
    gates.push({ id: "pitfallBullets", passed: Array.from(pitfalls.split("##", 1)[0].matchAll(PITFALL_BULLET)).length >= 3, waivable: false });
  }
  for (const section of Object.keys(REQUIRED_SECTIONS) as SectionId[]) {
    gates.push({ id: "requiredSection", section, passed: body.includes(`## ${REQUIRED_SECTIONS[section]}`), waivable: false });
  }

  if (prompt !== undefined) {
    const lines = prompt.split(SPLIT_LINES).map(strip).filter(Boolean);
    const enoughLines = lines.length >= 10;
    gates.push({ id: "promptLines", passed: enoughLines, waivable: true });
    if (enoughLines) {
      const longEnough = Array.from(strip(prompt)).length >= MIN_SYSTEM_PROMPT_CHARS;
      gates.push({ id: "promptLength", passed: longEnough, waivable: true });
      if (longEnough) {
        const sentences = lines.filter(lineIsSentenceLike).length;
        const fragments = lines.filter(lineIsColonKeywordFragment).length;
        const [minColon, minSentences] = MAX_COLON_KEYWORD_WITHOUT_SENTENCES;
        gates.push(
          { id: "sentenceLines", passed: sentences >= MIN_SENTENCE_LIKE_LINES, waivable: true },
          { id: "keywordFragments", passed: fragments < minColon || sentences >= minSentences, waivable: true },
        );
      }
    }
    extractBasicExamplesExpectedOutputs(body).forEach((output, index) => {
      gates.push({ id: "expectedOutput", index: index + 1, passed: Array.from(output).length >= MIN_EXPECTED_OUTPUT_CHARS, waivable: true });
    });
  }

  // Score = passed gates / evaluated gates. Short-circuited checks are omitted.
  const failures = gates.filter((gate) => !gate.passed);
  const hasBacklogWaiver = (backlog?.has(filePath.replaceAll("\\", "/")) ?? false)
    && failures.some((gate) => gate.waivable);
  const waived = hasBacklogWaiver && failures.every((gate) => gate.waivable);
  return {
    level: failures.length === 0 ? "passes" : waived ? "waived" : "partial",
    passedGates: gates.length - failures.length,
    totalGates: gates.length,
    gates,
    hasBacklogWaiver,
  };
}
