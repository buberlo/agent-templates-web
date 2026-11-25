import assert from "node:assert/strict";
import test from "node:test";
import { parseTemplateRaw } from "@/lib/content/template-parse";
import { exportTemplate, exportTemplateForAgents } from ".";

const fixture = `---
id: reading-list
title: Reading List Organizer
required_tools:
  - name: Library MCP
    install: Connect the library catalog
    version_notes: Read-only access
outputs:
  - A sorted reading list
---

## Purpose

Organize saved book recommendations.

## System Prompt

Group books by topic.

## Workflow

Remove duplicate entries.

## Tool Stack

Use the saved reading list as the source.

## Definition of Done

Every book appears once.

## Security

Ask before editing the source list.
`;

test("Grok Bot export strips markdown bold markers from pasted text", () => {
  const doc = parseTemplateRaw(
    `---
id: bold-demo
title: Bold Demo
required_tools: []
outputs: [Done]
---

## Purpose

Track **critical** paths only.

## System Prompt

Always use **double-check** mode.

## Workflow

1. Review **every** item.
`,
    "fixtures/bold-demo.md",
  );
  assert.ok(doc);
  const result = exportTemplate(doc, "grokbot");
  assert.ok(!result.content.includes("**"), result.content);
  assert.match(result.content, /Track critical paths only/);
  assert.match(result.content, /Always use double-check mode/);
  assert.match(result.content, /Review every item/);
});

test("Grok Bot export includes the setup instructions and maps the agent slug", () => {
  const doc = parseTemplateRaw(fixture, "fixtures/reading-list.md");
  assert.ok(doc);
  const result = exportTemplate(doc, "grokbot");
  assert.equal(result.mimeType, "text/plain");
  assert.deepEqual(exportTemplateForAgents(doc, "grokbot"), result);
  for (const instruction of [
    "Reading List Organizer",
    "Organize saved book recommendations.",
    "Group books by topic.",
    "Remove duplicate entries.",
    "Library MCP",
    "Connect the library catalog",
    "Use the saved reading list as the source.",
    "Every book appears once.",
    "A sorted reading list",
    "Ask before editing the source list.",
    "Save this workflow as a reusable skill and remember these rules",
    "If this work is recurring, propose a routine",
  ]) {
    assert.ok(result.content.includes(instruction), `Missing instruction: ${instruction}`);
  }
});
