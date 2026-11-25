import assert from "node:assert/strict";
import test from "node:test";
import { resolveMcpTools } from "@/lib/content/resolve-mcp-tools";
import type { McpCatalog } from "@/lib/content/types";
import { generateMcpConfig, MCP_CLIENTS, type McpClient } from "./mcp-config";

const repo = "https://github.com/example/library-mcp";
const url = "https://library.example.org/mcp";
const catalog: McpCatalog = {
  count: 1,
  generated_at: "",
  servers: [{
    name: "Library MCP (Hermes-Catalog)",
    url: repo,
    type: "MCP",
    stars: null,
    categories: [],
    auth: "OAuth",
    risk_notes: "Use read-only access.",
  }],
};

function tool(install: string, name = "Library MCP") {
  return { name, install, version_notes: "" };
}

const clients = Object.keys(MCP_CLIENTS) as McpClient[];
const launch = { command: "npx", args: ["-y", "@example/library", "--label", "My library"] };
const resolved = resolveMcpTools([
  tool('npx -y @example/library --label "My library"'),
  tool(url, "Remote Library"),
], catalog);

const remoteEntries = {
  cursor: { url },
  "claude-code": { type: "http", url },
  copilot: { type: "http", url },
  windsurf: { serverUrl: url },
  "gemini-cli": { httpUrl: url },
  cline: { url, transport: "streamable-http", type: "streamableHttp" },
};
const paths: Record<McpClient, string> = {
  cursor: ".cursor/mcp.json",
  "claude-code": ".mcp.json",
  codex: "~/.codex/config.toml",
  copilot: ".vscode/mcp.json",
  windsurf: "~/.codeium/windsurf/mcp_config.json",
  "gemini-cli": "~/.gemini/settings.json",
  cline: "cline_mcp_settings.json / .roo/mcp.json",
};

for (const client of clients) {
  test(`${client} serializes the explicit stdio and HTTP inputs`, () => {
    const stdio = generateMcpConfig([resolved[0]], client, "stdio");
    const remote = generateMcpConfig([resolved[1]], client, "http");
    assert.equal(stdio.path, paths[client]);
    assert.equal(remote.path, paths[client]);
    assert.equal(stdio.hasPlaceholders, false);
    assert.equal(remote.hasPlaceholders, false);
    if (client === "codex") {
      assert.equal(stdio.content, '[mcp_servers.library-mcp]\ncommand = "npx"\nargs = ["-y","@example/library","--label","My library"]');
      assert.equal(remote.content, `[mcp_servers.remote-library]\nurl = "${url}"`);
      return;
    }
    const key = client === "copilot" ? "servers" : "mcpServers";
    const stdioEntry = client === "copilot" || client === "claude-code" ? { type: "stdio", ...launch } : launch;
    assert.deepEqual(JSON.parse(stdio.content), { [key]: { "library-mcp": stdioEntry } });
    assert.deepEqual(JSON.parse(remote.content), { [key]: { "remote-library": remoteEntries[client] } });
  });

  test(`${client} uses placeholders for a repository-only installation`, () => {
    const repoTools = resolveMcpTools([tool(repo)], catalog);
    const stdio = generateMcpConfig(repoTools, client, "stdio");
    const remote = generateMcpConfig(repoTools, client, "http");
    assert.equal(stdio.hasPlaceholders, true);
    assert.equal(remote.hasPlaceholders, true);
    assert.match(stdio.content, /"<command-from-repo>"/);
    assert.match(stdio.content, /\[\s*"<args-from-repo>"\s*\]/);
    assert.match(remote.content, /"https:\/\/<mcp-endpoint-from-repo>"/);
    assert.doesNotMatch(stdio.content + remote.content, /github\.com|npx|uvx/);
  });
}

test("matches catalog by name or source URL and preserves catalog notes", () => {
  for (const required of [tool("See documentation"), tool(repo, "Library")]) {
    const [match] = resolveMcpTools([required], catalog);
    assert.deepEqual(match.sourceUrls, [repo]);
    assert.equal(match.type, "MCP");
    assert.equal(match.auth, "OAuth");
    assert.equal(match.riskNotes, "Use read-only access.");
  }
  assert.deepEqual(resolveMcpTools([tool("pip install reportlab", "ReportLab")], catalog), []);
});

test("catalog endpoints and ambiguous install instructions do not become runnable values", () => {
  const endpointCatalog = { ...catalog, servers: [{ ...catalog.servers[0], url }] };
  for (const install of [repo + "/mcp", "npx @example/library && node setup", "See https://library.example.org/mcp", "https://library.example.org/docs"]) {
    const [match] = resolveMcpTools([tool(install)], endpointCatalog);
    assert.equal(match.endpoint, undefined);
    assert.equal(match.launch, undefined);
    assert.ok(match.sourceUrls.includes(url));
  }
});

test("explicit legacy SSE is preserved for compatible clients", () => {
  const sse = "https://library.example.org/sse";
  const tools = resolveMcpTools([tool(sse)], catalog);
  const config = (client: McpClient) => JSON.parse(generateMcpConfig(tools, client, "http").content);
  assert.deepEqual(config("claude-code").mcpServers["library-mcp"], { type: "sse", url: sse });
  assert.deepEqual(config("gemini-cli").mcpServers["library-mcp"], { url: sse });
  assert.equal(generateMcpConfig(tools, "codex", "http").hasPlaceholders, true);
});

test("deduplicates identical tools and avoids slug collisions", () => {
  const tools = resolveMcpTools([tool(repo), tool(repo), tool(url, "Library-MCP")], catalog);
  assert.deepEqual(tools.map(({ slug }) => slug), ["library-mcp", "library-mcp-2"]);
});

test("selects the specific file and remote type for Cline and Roo Code", () => {
  const cline = generateMcpConfig([resolved[1]], "cline", "http", "cline");
  const roo = generateMcpConfig([resolved[1]], "cline", "http", "roo");
  assert.equal(cline.path, "cline_mcp_settings.json");
  assert.equal(roo.path, ".roo/mcp.json");
  assert.deepEqual(JSON.parse(cline.content).mcpServers["remote-library"], remoteEntries.cline);
  assert.deepEqual(JSON.parse(roo.content).mcpServers["remote-library"], {
    url, transport: "streamable-http", type: "streamable-http",
  });
});
