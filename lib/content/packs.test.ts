import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { getDictionary, LOCALES } from "@/lib/i18n";
import { getContentRoot } from "./config";
import { getAllTemplates, getCatalog } from "./loader";
import {
  curatedPacks,
  getPack,
  getPackDomains,
  getPackInstallCommand,
  getPackMcpTools,
  resolvePackTemplates,
} from "./packs";
import type { McpCatalog, RequiredTool, TemplateDocument } from "./types";

test("curated packs have unique slugs, localized metadata, and at least four distinct template IDs", () => {
  assert.ok(curatedPacks.length >= 6 && curatedPacks.length <= 8);
  assert.equal(new Set(curatedPacks.map(({ slug }) => slug)).size, curatedPacks.length);
  for (const pack of curatedPacks) {
    assert.match(pack.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.equal(getPack(pack.slug), pack);
    assert.ok(pack.templateIds.length >= 4, pack.slug);
    assert.equal(new Set(pack.templateIds).size, pack.templateIds.length, pack.slug);
    for (const locale of LOCALES) {
      const { title, description } = getDictionary(locale).packs.entries[pack.slug];
      assert.ok(title.trim(), `${locale}/${pack.slug} title`);
      assert.ok(description.trim(), `${locale}/${pack.slug} description`);
    }
  }
  assert.equal(getPack("missing-pack"), undefined);
});

test("every curated template exists in the catalog and resolves to a parsed document", {
  skip: !existsSync(path.join(getContentRoot(), "catalog.json")) && "Content cache is unavailable",
}, () => {
  const catalogIds = new Set(getCatalog().templates.map(({ id }) => id));
  const templates = getAllTemplates();
  for (const pack of curatedPacks) {
    for (const id of pack.templateIds) {
      assert.ok(catalogIds.has(id), `${pack.slug} references missing catalog ID ${id}`);
    }
    assert.deepEqual(
      resolvePackTemplates(pack, templates).map(({ frontmatter }) => frontmatter.id),
      pack.templateIds,
      pack.slug,
    );
  }
});

function template(id: string, domain: string, required_tools: RequiredTool[] = []): TemplateDocument {
  return {
    frontmatter: {
      id, domain, required_tools, title: id, category: "example",
      tags: [], target_agents: [], inputs: [], outputs: [],
      risk_level: "low", example_count: 0, version: "1", updated: "",
    },
    sections: { examplesParsed: [] },
    body: "",
    filePath: "",
    searchText: "",
    changelog: [],
  };
}

test("resolution keeps pack order and omits missing and repeated IDs", () => {
  const first = template("first-template", "development");
  const second = template("second-template", "research");
  assert.deepEqual(
    resolvePackTemplates({ templateIds: ["second-template", "missing", "first-template", "second-template"] }, [first, second]),
    [second, first],
  );
  assert.deepEqual(resolvePackTemplates({ templateIds: [] }, [first]), []);
});

test("pack domains are unique and sorted", () => {
  const ops = template("first-template", "operations");
  assert.deepEqual(getPackDomains([ops, template("second-template", "development"), ops]), ["development", "operations"]);
  assert.deepEqual(getPackDomains([]), []);
});

test("pack MCP tools deduplicate equivalent configurations and exclude unrelated tools", () => {
  const catalog: McpCatalog = {
    generated_at: "",
    count: 1,
    servers: [{
      name: "Docs Search", url: "https://docs.example/source", type: "http",
      stars: null, categories: [], auth: "OAuth", risk_notes: "",
    }],
  };
  const docs = { name: "Docs Search", install: "https://docs.example/mcp", version_notes: "" };
  const alternative = { ...docs, install: "https://docs.example/sse" };
  const git = { name: "Git", install: "https://git-scm.com", version_notes: "" };
  const tools = getPackMcpTools([
    template("first-template", "development", [docs, git]),
    template("second-template", "research", [docs, alternative]),
  ], catalog);
  assert.deepEqual(tools.map(({ slug, endpoint }) => ({ slug, endpoint })), [
    { slug: "docs-search", endpoint: { url: docs.install, type: "http" } },
    { slug: "docs-search-2", endpoint: { url: alternative.install, type: "sse" } },
  ]);
  assert.deepEqual(getPackMcpTools([], catalog), []);
});

test("CLI command uses one generic export per unique template, in pack order", () => {
  const first = template("first-template", "development");
  const second = template("second-template", "research");
  assert.equal(
    getPackInstallCommand([second, first, second]),
    "npx agentstencil add second-template --target generic &&\nnpx agentstencil add first-template --target generic",
  );
  assert.equal(getPackInstallCommand([]), "");
  assert.throws(() => getPackInstallCommand([template("bad;id", "development")]), /Invalid pack template ID/);
});
