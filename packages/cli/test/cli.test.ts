import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test, { type TestContext } from "node:test";
import { EXPORT_TARGETS } from "@/lib/content/constants";
import { resolveMcpTools } from "@/lib/content/resolve-mcp-tools";
import { parseTemplateRaw } from "@/lib/content/template-parse";
import { exportTemplate } from "@/lib/export";
import { generateMcpConfig, MCP_CLIENTS, type McpClient } from "@/lib/export/mcp-config";

const binary = path.resolve("packages/cli/dist/index.js");
const id = "review-draft";
const entry = {
  id, title: "Review Draft", domain: "writing", category: "editing",
  target_agents: ["Grok Bot", "codex"], tags: ["copyediting"], path: "review.md",
};
const other = {
  id: "plan-essay", title: "Plan Essay", domain: "writing", category: "planning",
  target_agents: ["claude-code"], tags: ["outline"], path: "plan.md",
};
const raw = `---
id: ${id}
title: Review Draft
domain: writing
category: editing
risk_level: low
tags: [copyediting]
target_agents: [Grok Bot, codex]
required_tools:
  - name: Example MCP
    install: npx -y example-mcp
  - name: Remote MCP
    install: https://example.org/mcp
outputs: [Edited draft]
---

## System Prompt

Review the draft for precision.

## Workflow

Check for inconsistent metaphors.
`;
const catalog = {
  generated_at: "", count: 1,
  servers: [{
    name: "Example MCP", url: "https://github.com/example/server", type: "stdio",
    stars: null, categories: [], auth: "API token", risk_notes: "Review permissions",
  }],
};

function fixture(t: TestContext) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "agentstencil-test-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const cwd = path.join(directory, "project");
  const content = path.join(cwd, ".content-cache");
  fs.mkdirSync(path.join(content, "mcp"), { recursive: true });
  fs.writeFileSync(path.join(content, "catalog.json"), JSON.stringify({ templates: [entry, other] }));
  fs.writeFileSync(path.join(content, entry.path), raw);
  fs.writeFileSync(path.join(content, other.path), "---\nid: plan-essay\ntitle: Plan Essay\n---\nMake a plan.");
  fs.writeFileSync(path.join(content, "mcp/catalog.json"), JSON.stringify(catalog));

  function run(args: string[], override = content) {
    const env = { ...process.env };
    if (override) env.AGENTSTENCIL_CONTENT_DIR = override;
    else delete env.AGENTSTENCIL_CONTENT_DIR;
    const result = spawnSync(binary, args, { cwd, env, encoding: "utf8" });
    if (result.error) throw result.error;
    return result;
  }
  return { cwd, content, run };
}

test("built binary runs directly and reports its help and version", (t) => {
  const { run } = fixture(t);
  assert.match(fs.readFileSync(binary, "utf8"), /^#!\/usr\/bin\/env node\n/);
  const help = run(["--help"]);
  assert.equal(help.status, 0);
  assert.match(help.stdout, /mcp-config/);
  assert.equal(run(["--version"]).stdout, "0.1.0\n");
});

test("list works with a local cache and combines filters", (t) => {
  const { run } = fixture(t);
  const listed = run(["list"], "");
  assert.equal(listed.status, 0, listed.stderr);
  assert.equal(listed.stdout, "review-draft\tReview Draft\nplan-essay\tPlan Essay\n");
  assert.equal(run(["list", "--domain", "writing", "--category", "editing", "--target", "grokbot"]).stdout, "review-draft\tReview Draft\n");
  assert.equal(run(["list", "--domain", "other"]).stdout, "");
  assert.equal(run(["list", "--target", "claude-code"]).stdout, "plan-essay\tPlan Essay\n");
});

test("search matches IDs, titles, tags and template text case-insensitively", (t) => {
  const { run } = fixture(t);
  for (const query of [id, "REVIEW DRAFT", "copyediting", "inconsistent metaphors", "review precision"]) {
    const result = run(["search", query]);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, "review-draft\tReview Draft\n");
  }
  assert.equal(run(["search", "unmatched"]).stdout, "");
});

const instructionPaths = [
  `${id}-grok-bot.txt`, `${id}-SKILL.md`, `${id}-SKILL.md`, "CLAUDE.md", "AGENTS.md",
  `.cursor/rules/${id}.mdc`, `${id}-system-prompt.txt`, ".windsurfrules", "GEMINI.md",
  ".github/copilot-instructions.md", ".clinerules", `.kiro/steering/${id}.md`,
  `.roo/rules/${id}.md`, `.continue/rules/${id}.md`, ".goosehints", ".aider.conf.yml", ".rules",
  `agentstencil_${id.replace(/-/g, "_")}.py`, `agentstencil-${id}.ts`,
  `crewai/${id}/agents.yaml`, `${id}-workflow.json`, `${id.replace(/-/g, "_")}_graph.py`,
];

for (const [index, target] of EXPORT_TARGETS.entries()) {
  test(`add ${target} matches the shared exporter and writes to the expected path`, (t) => {
    const { cwd, run } = fixture(t);
    const args = ["add", id, "--target", target];
    const relative = instructionPaths[index];
    const exported = exportTemplate(parseTemplateRaw(raw, entry.path)!, target);
    const print = run([...args, "--stdout"]);
    assert.equal(print.status, 0, print.stderr);
    assert.equal(print.stdout, exported.content);
    if (exported.extraFiles?.length) {
      assert.match(print.stderr, /also generates/);
    } else {
      assert.equal(print.stderr, "");
    }
    const preview = run([...args, "--dry-run"]);
    assert.equal(preview.status, 0, preview.stderr);
    assert.ok(preview.stdout.includes(`Would write: ${relative}`));
    assert.deepEqual(fs.readdirSync(cwd), [".content-cache"]);
    const write = run(args);
    assert.equal(write.status, 0, write.stderr);
    assert.ok(write.stdout.includes(`Wrote: ${relative}`));
    assert.equal(fs.readFileSync(path.join(cwd, relative), "utf8"), exported.content);
    for (const extra of exported.extraFiles ?? []) {
      assert.ok(write.stdout.includes(`Wrote: ${extra.filename}`));
      assert.equal(fs.readFileSync(path.join(cwd, extra.filename), "utf8"), extra.content);
    }
  });
}

test("identical output is a no-op and differing files are preserved", (t) => {
  const { cwd, run } = fixture(t);
  const args = ["add", id, "--target", "codex"];
  assert.equal(run(args).status, 0);
  const destination = path.join(cwd, "AGENTS.md");
  fs.utimesSync(destination, 100, 100);
  const same = run(args);
  assert.equal(same.status, 0, same.stderr);
  assert.match(same.stdout, /Already up to date: AGENTS.md/);
  assert.equal(fs.statSync(destination).mtimeMs, 100_000);
  fs.writeFileSync(destination, "Existing rules");
  for (const opts of [[], ["--dry-run"]]) {
    const conflict = run([...args, ...opts]);
    assert.equal(conflict.status, 1);
    assert.match(conflict.stderr, /AGENTS\.md.*--stdout/);
    assert.equal(conflict.stdout, "");
    assert.equal(fs.readFileSync(destination, "utf8"), "Existing rules");
  }
  assert.equal(run([...args, "--stdout"]).status, 0);
  assert.equal(fs.readFileSync(destination, "utf8"), "Existing rules");
});

test("unsafe IDs, catalog traversal, and symlink destinations are rejected", (t) => {
  const { cwd, content, run } = fixture(t);
  const invalid = run(["add", "../review-draft", "--target", "cursor"]);
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /Invalid template ID/);

  const outside = path.join(path.dirname(cwd), "outside");
  fs.mkdirSync(outside);
  fs.symlinkSync(outside, path.join(cwd, ".cursor"), "dir");
  fs.symlinkSync(path.join(outside, "missing"), path.join(cwd, "AGENTS.md"), "file");
  for (const target of ["cursor", "codex"]) {
    const result = run(["add", id, "--target", target]);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Unsafe symlink/);
  }
  assert.deepEqual(fs.readdirSync(outside), []);

  const index = path.join(content, "catalog.json");
  for (const unsafe of ["../outside.md", ".. /outside.md", "/etc/passwd", "C:\\Windows\\system.ini"]) {
    fs.writeFileSync(index, JSON.stringify({ templates: [{ ...entry, path: unsafe }] }));
    const result = run(["add", id, "--target", "cursor", "--stdout"]);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Unsafe path/);
  }
});

test("content overrides take priority and executable frontmatter is rejected", (t) => {
  const { cwd, run } = fixture(t);
  const override = path.join(cwd, "override");
  fs.mkdirSync(override);
  fs.writeFileSync(path.join(override, "catalog.json"), JSON.stringify({ templates: [entry] }));
  fs.writeFileSync(path.join(override, entry.path), "---js\nprocess.exit(0)\n---\n");
  assert.equal(run(["list"], override).stdout, "review-draft\tReview Draft\n");
  const result = run(["search", "draft"], override);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Expected YAML frontmatter/);
});

for (const [client, { path: destination }] of Object.entries(MCP_CLIENTS) as [McpClient, { path: string }][]) {
  test(`mcp-config ${client} prints both transports and reports metadata`, (t) => {
    const { cwd, run } = fixture(t);
    const tools = resolveMcpTools(parseTemplateRaw(raw, entry.path)!.frontmatter.required_tools, catalog);
    for (const transport of ["stdio", "http"] as const) {
      const result = run(["mcp-config", id, "--client", client, "--transport", transport]);
      assert.equal(result.status, 0, result.stderr);
      assert.equal(result.stdout, generateMcpConfig(tools, client, transport).content);
      assert.ok(result.stderr.includes(`Target file: ${destination}`));
      assert.match(result.stderr, /https:\/\/github\.com\/example\/server/);
      assert.match(result.stderr, /Authentication: API token/);
      assert.match(result.stderr, /Risk notes: Review permissions/);
      assert.match(result.stderr, /Replace placeholders/);
    }
    assert.deepEqual(fs.readdirSync(cwd), [".content-cache"]);
  });
}

test("argument and lookup failures return actionable errors", (t) => {
  const { run } = fixture(t);
  const cases: [string[], RegExp][] = [
    [["missing"], /Unknown command/],
    [["list", "--bogus"], /Unknown option/],
    [["list", "--stdout"], /Unsupported option/],
    [["list", "--domain"], /Provide a value/],
    [["list", "--ref", "main", "--ref", "main"], /only once/],
    [["list", "--ref", "../main"], /Invalid --ref/],
    [["search"], /Expected one query/],
    [["add", id], /Select a supported --target/],
    [["add", "missing", "--target", "codex"], /Unknown template ID.*list or search/],
    [["add", id, "--target", "codex", "--dry-run", "--stdout"], /Choose either/],
    [["mcp-config", id, "--client", "unknown", "--transport", "stdio"], /Select a supported --client/],
    [["mcp-config", id, "--client", "cursor", "--transport", "sse"], /Select --transport stdio or --transport http/],
  ];
  for (const [args, pattern] of cases) {
    const result = run(args);
    assert.equal(result.status, 1, args.join(" "));
    assert.match(result.stderr, pattern);
    assert.equal(result.stdout, "");
  }
});
