import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { getContentRoot } from "./config";
import { getTemplate, getTemplateQuality } from "./loader";
import {
  computeQualityScore,
  extractBasicExamplesExpectedOutputs,
  lineIsColonKeywordFragment,
  lineIsSentenceLike,
  parseQualityBacklog,
} from "./quality-score";

const file = "domains/test/category/template.md";
const sentence = "Before you begin, you must verify all the supplied input data carefully.";
const normalPrompt = Array(10).fill(sentence).join("\n");
const roleFragment = "Role: set input configuration options for the workflow and complete all actions after examining all expected results.";
const neutralLine = "Configuration options currently include input mappings, output paths, plus relevant operational settings";
const fence = "```";

function fixture(prompt = normalPrompt, output = "x".repeat(40)): string {
  return [
    "## Purpose",
    "## When to use",
    "## Tool stack",
    "## System prompt",
    fence + "text",
    prompt,
    fence,
    "## Workflow",
    "1. Inspect\n2. Plan\n3. Run\n4. Review\n5. Record",
    "## Definition of done",
    "## Security",
    "## Pitfalls",
    "- Missing data\n* Invalid data\n  - Duplicate data",
    "## Basic examples",
    "### Example 1 (Example data (self-written))",
    `**Expected result:**\n\n${fence}text\n${output}\n${fence}`,
    "### Example 2 (Example data (self-written))",
    `**Expected result:** ${fence}bash\n${output}\n${fence}`,
  ].join("\n");
}

function failures(body: string) {
  return computeQualityScore(body, file).gates.filter((gate) => !gate.passed).map((gate) => gate.id);
}

test("sentence-like lines honor word minima, cues, punctuation and Python word boundaries", () => {
  assert.equal(lineIsSentenceLike(sentence), true);
  assert.equal(lineIsSentenceLike("You are a reliable assistant"), false);
  assert.equal(lineIsSentenceLike("Process all incoming messages using known sender details."), false);
  assert.equal(lineIsSentenceLike("Process all incoming messages using known sender details provided through organizational communication channels carefully."), true);
  assert.equal(lineIsSentenceLike("Find the source and carefully check the quoted material"), true);
  assert.equal(lineIsSentenceLike("éMust review these supplied details very carefully every time"), false);
  assert.equal(lineIsSentenceLike("İf several supplied details conflict compare both records carefully"), true);
  assert.equal(lineIsSentenceLike(roleFragment), false);
});

test("colon-keyword fragments honor the special Role prefix and the strict word cap", () => {
  assert.equal(lineIsColonKeywordFragment("  rOlE: long form " + roleFragment), true);
  assert.equal(lineIsColonKeywordFragment("Préflight / IO: inspect"), true);
  assert.equal(lineIsColonKeywordFragment("État: inspect"), false);
  assert.equal(lineIsColonKeywordFragment("Label: " + Array(16).fill("word").join(" ")), true);
  assert.equal(lineIsColonKeywordFragment("Label: " + Array(17).fill("word").join(" ")), false);
  assert.equal(lineIsColonKeywordFragment("Label: "), false);
});

test("expected output extraction preserves validator pattern order and overlapping matches", () => {
  const body = fixture().replace("x".repeat(40), "  first \n ").replace("x".repeat(40), "second");
  assert.deepEqual(extractBasicExamplesExpectedOutputs(body), ["first", "first", "second"]);
  assert.deepEqual(extractBasicExamplesExpectedOutputs(body.replace("## Basic examples", "## Examples")), []);
  assert.deepEqual(extractBasicExamplesExpectedOutputs(body.replace(fence + "text\n  first", fence + "json\n  first")), ["second"]);
});

test("passing score counts each required section and expected output match", () => {
  const score = computeQualityScore(fixture(), file);
  assert.equal(score.level, "passes");
  assert.equal(score.passedGates, 26);
  assert.equal(score.totalGates, 26);
  assert.deepEqual(failures(fixture()), []);
});

test("prompt checks short-circuit in validator order but still check output length", () => {
  const tooFewLines = Array(9).fill(sentence).join("\n");
  const score = computeQualityScore(fixture(tooFewLines, "😀".repeat(39)), file);
  assert.deepEqual(score.gates.filter((gate) => gate.waivable).map(({ id, passed }) => [id, passed]), [
    ["promptLines", false], ["expectedOutput", false], ["expectedOutput", false], ["expectedOutput", false],
  ]);
  assert.deepEqual(failures(fixture(Array(10).fill("short").join("\n"))), ["promptLength"]);
  const prompt = [sentence, sentence, sentence, ...Array(6).fill("short")].join("\n") + "\n";
  const padding = "😀".repeat(350 - Array.from(prompt).length);
  assert.deepEqual(failures(fixture(prompt + padding, "😀".repeat(40))), []);
  assert.deepEqual(failures(fixture(prompt + padding.slice(2))), ["promptLength"]);
  assert.deepEqual(failures(fixture().replace(fence + "text", fence + "markdown")), ["promptFence"]);
  assert.deepEqual(failures(fixture("", "short")), ["promptLines", "expectedOutput", "expectedOutput", "expectedOutput"]);
});

test("sentence and fragment gates can fail independently or together", () => {
  const prompt = (sentences: number, fragments: number) =>
    [...Array(sentences).fill(sentence), ...Array(fragments).fill(roleFragment),
      ...Array(10 - sentences - fragments).fill(neutralLine)].join("\n");
  assert.deepEqual(failures(fixture(prompt(2, 4))), ["sentenceLines"]);
  assert.deepEqual(failures(fixture(prompt(3, 5))), ["keywordFragments"]);
  assert.deepEqual(failures(fixture(prompt(2, 5))), ["sentenceLines", "keywordFragments"]);
  assert.deepEqual(failures(fixture(prompt(5, 5))), []);
});

test("structural gates detect every boilerplate marker and required section", () => {
  assert.deepEqual(failures(fixture() + "\nStandard-Test-Aufgabe\nStatus: OK\nArtefakt: output/file\n{slug}\nYou are a specialist for Prüfung ("), [
    "placeholders", "standardTask", "demoPath", "statusOutput", "genericOpener",
  ]);
  assert.deepEqual(failures(fixture() + "\noutput/{slug}-demo"), ["placeholders", "demoPath"]);
  const score = computeQualityScore("", file);
  assert.equal(score.gates.filter((gate) => gate.id === "requiredSection" && !gate.passed).length, 9);
  assert.deepEqual(failures(fixture().replace("## Purpose", "## Overview")), ["requiredSection"]);
});

test("structural section checks preserve validator split, anchor and count behavior", () => {
  assert.deepEqual(failures(fixture().replace("5. Record", "## Extra\n5. Record").replace("  - Duplicate data", "+ Duplicate data")), [
    "workflowSteps", "pitfallBullets",
  ]);
  assert.deepEqual(failures(fixture().replaceAll("(Example data (self-written))", "(Other)")), ["exampleHeading"]);
  assert.deepEqual(failures(fixture().replace("### Example 2", "   ### Example 2")), ["exampleCount"]);
  assert.deepEqual(failures(fixture().replace("### Example 2 (Example data (self-written))", "### Example 2 (Other)")), []);
  assert.deepEqual(failures(fixture().replace("## Basic examples", "## Examples")), ["exampleCount", "requiredSection"]);
  assert.deepEqual(failures(fixture().replaceAll("\n", "\r\n")), []);
});

test("backlog entries waive quality failures only and do not change the score", () => {
  const backlog = parseQualityBacklog(" # comment\r\n\r\n " + file.replaceAll("/", "\\") + " \r\n");
  assert.deepEqual([...backlog], [file]);
  const body = fixture("short");
  const partial = computeQualityScore(body, file);
  const waived = computeQualityScore(body, file, backlog);
  assert.equal(partial.level, "partial");
  assert.equal(partial.hasBacklogWaiver, false);
  assert.deepEqual(waived, { ...partial, level: "waived", hasBacklogWaiver: true });
  const mixed = computeQualityScore(body + "\n{title}", file, backlog);
  assert.equal(mixed.level, "partial");
  assert.equal(mixed.hasBacklogWaiver, true);
  const structural = computeQualityScore(fixture() + "\n{title}", file, backlog);
  assert.equal(structural.level, "partial");
  assert.equal(structural.hasBacklogWaiver, false);
  const passing = computeQualityScore(fixture(), file, backlog);
  assert.equal(passing.level, "passes");
  assert.equal(passing.hasBacklogWaiver, false);
});

test("scores published passing and waived templates from the cached catalog", {
  skip: !existsSync(path.join(getContentRoot(), "catalog.json"))
    || !existsSync(path.join(getContentRoot(), "scripts", "quality_backlog.txt")),
}, () => {
  for (const [id, level] of [
    ["active-directory-entra-workflow", "passes"],
    ["outreach-workflow", "waived"],
  ] as const) {
    const doc = getTemplate(id);
    assert.ok(doc, id);
    assert.equal(getTemplateQuality(doc).level, level, id);
  }
});
