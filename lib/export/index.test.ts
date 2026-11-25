import assert from "node:assert/strict";
import test from "node:test";
import { EXPORT_TARGETS, type ExportTarget } from "@/lib/content/constants";
import { parseTemplateRaw } from "@/lib/content/template-parse";
import { exportTemplate, exportTemplateForAgents } from ".";

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
};

test("exports exactly the twelve supported targets", () => {
  assert.equal(EXPORT_TARGETS.length, 12);
  assert.deepEqual(new Set(EXPORT_TARGETS), new Set(Object.keys(expected)));
});

for (const target of EXPORT_TARGETS) {
  test(`${target} exports the expected file and instructions`, () => {
    assert.ok(doc);
    const result = exportTemplate(doc, target);
    assert.deepEqual([result.filename, result.mimeType], expected[target]);
    assert.match(result.content, /Group books by topic\./);
    assert.match(result.content, /Remove duplicate entries\./);
    assert.deepEqual(exportTemplateForAgents(doc, target), result);
    if (target === "kiro") assert.match(result.content, /^---\ninclusion: always\n---\n\n/);
  });
}
