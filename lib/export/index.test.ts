import assert from "node:assert/strict";
import test from "node:test";
import { EXPORT_TARGETS, type ExportTarget } from "@/lib/content/constants";
import { parseTemplateRaw } from "@/lib/content/template-parse";
import { exportTemplate, exportTemplateForAgents } from ".";
import type { ExportResult } from "./types";

function combinedExportText(result: ExportResult): string {
  return [result.content, ...(result.extraFiles?.map((f) => f.content) ?? [])].join("\n");
}

const doc = parseTemplateRaw(`---
id: reading-list
title: Reading List Organizer
required_tools:
  - name: Library
    install: Connect the library catalog
outputs:
  - A sorted reading list
---

## System Prompt

Group books by topic.

## Workflow

Remove duplicate entries.

## Security

Ask before editing the source list.
`, "fixtures/reading-list.md");

const expected: Record<ExportTarget, [filename: string, mimeType: string]> = {
  grokbot: ["reading-list-grok-bot.txt", "text/plain"],
  hermes: ["reading-list-SKILL.md", "text/markdown"],
  openclaw: ["reading-list-SKILL.md", "text/markdown"],
  "claude-code": ["CLAUDE.md", "text/markdown"],
  codex: ["AGENTS.md", "text/markdown"],
  cursor: ["reading-list.mdc", "text/markdown"],
  generic: ["reading-list-system-prompt.txt", "text/plain"],
  windsurf: [".windsurfrules", "text/markdown"],
  "gemini-cli": ["GEMINI.md", "text/markdown"],
  copilot: [".github/copilot-instructions.md", "text/markdown"],
  cline: [".clinerules", "text/markdown"],
  kiro: [".kiro/steering/reading-list.md", "text/markdown"],
  "roo-code": [".roo/rules/reading-list.md", "text/markdown"],
  continue: [".continue/rules/reading-list.md", "text/markdown"],
  goose: [".goosehints", "text/plain"],
  aider: [".aider.conf.yml", "text/yaml"],
  zed: [".rules", "text/markdown"],
  "openai-agents-py": ["agentstencil_reading_list.py", "text/x-python"],
  "openai-agents-ts": ["agentstencil-reading-list.ts", "text/typescript"],
  crewai: ["crewai/reading-list/agents.yaml", "text/yaml"],
  n8n: ["reading-list-workflow.json", "application/json"],
  langgraph: ["reading_list_graph.py", "text/x-python"],
};

test("exports all supported targets", () => {
  assert.equal(EXPORT_TARGETS.length, 22);
  assert.deepEqual(new Set(EXPORT_TARGETS), new Set(Object.keys(expected)));
});

for (const target of EXPORT_TARGETS) {
  test(`${target} exports the expected file and instructions`, () => {
    assert.ok(doc);
    const result = exportTemplate(doc, target);
    assert.deepEqual([result.filename, result.mimeType], expected[target]);
    const body = combinedExportText(result);
    assert.match(body, /Group books by topic\./);
    assert.match(body, /Remove duplicate entries\./);
    assert.deepEqual(exportTemplateForAgents(doc, target), result);
    if (target === "kiro") assert.match(result.content, /^---\ninclusion: always\n---\n\n/);
    if (target === "continue") assert.match(result.content, /^---\nname:/);
    if (target === "goose") {
      assert.ok(result.extraFiles?.some((f) => f.filename.endsWith(".yaml")));
    }
    if (target === "aider") {
      assert.match(result.content, /read:/);
      assert.ok(result.extraFiles?.length === 1);
    }
    if (target === "crewai") assert.ok(result.extraFiles?.some((f) => f.filename.endsWith("tasks.yaml")));
  });
}
