import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  formatInvalidFrontmatterWarning,
  parseTemplateRaw,
} from "./template-parse";

const fixturesDir = path.join(import.meta.dirname, "__fixtures__");

test("parseTemplateRaw returns null for invalid YAML frontmatter", () => {
  const raw = fs.readFileSync(
    path.join(fixturesDir, "invalid-frontmatter.md"),
    "utf8",
  );
  const doc = parseTemplateRaw(raw, "fixtures/invalid-frontmatter.md");
  assert.equal(doc, null);
});

test("parseTemplateRaw parses valid frontmatter", () => {
  const raw = `---
id: ok-template
title: Valid
domain: example
category: demo
tags: []
target_agents: []
required_tools: []
inputs: []
outputs: []
risk_level: low
example_count: 0
version: "1.0.0"
updated: "2026-01-01"
---

## System Prompt

Hello.
`;
  const doc = parseTemplateRaw(raw, "fixtures/valid.md");
  assert.ok(doc);
  assert.equal(doc.frontmatter.id, "ok-template");
  assert.equal(doc.frontmatter.title, "Valid");
});

test("formatInvalidFrontmatterWarning includes path and message", () => {
  const text = formatInvalidFrontmatterWarning(
    "templates/foo.md",
    new Error("can not read an implicit mapping pair; a colon is missed"),
  );
  assert.match(text, /templates\/foo\.md/);
  assert.match(text, /implicit mapping pair/);
});