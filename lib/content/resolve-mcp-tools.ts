import type { ResolvedMcpTool } from "@/lib/export/mcp-config";
import type { McpCatalog, RequiredTool } from "./types";

function webUrl(value: string): URL | undefined {
  if (!/^https?:\/\//i.test(value) || /[\s\\]/.test(value)) return undefined;
  try {
    const url = new URL(value);
    if ((url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password) {
      return url;
    }
  } catch {
    return undefined;
  }
}

function endpointFromInstall(install: string): ResolvedMcpTool["endpoint"] {
  const url = webUrl(install);
  if (!url || url.hash || /^(?:www\.)?(?:github\.com|gitlab\.com|bitbucket\.org)$/i.test(url.hostname)) {
    return undefined;
  }
  const suffix = /\/(mcp|sse)\/?$/.exec(url.pathname)?.[1];
  if (suffix) return { url: install, type: suffix === "sse" ? "sse" : "http" };
}

function launchFromInstall(install: string): ResolvedMcpTool["launch"] {
  // Accept a single invocation with simple or quoted arguments. Shell expressions
  // and setup instructions require review against the linked source.
  if (/[\r\n;&|<>`$\\]/.test(install)) return undefined;
  const invocation = /^(npx|uvx|node|python3?|docker)(?=\s)\s+(.+)$/.exec(install);
  if (!invocation) return undefined;
  const rawArgs = invocation[2];
  const tokens = rawArgs.match(/"[^"]*"|'[^']*'|[^\s"']+/g);
  if (!tokens || tokens.join(" ") !== rawArgs.replace(/(?:"[^"]*"|'[^']*')|\s+/g,
    (part) => part.trim() ? part : " ")) return undefined;
  const args = tokens.map((token) => /^["']/.test(token) ? token.slice(1, -1) : token);
  if (!args.some((arg) => arg && !arg.startsWith("-"))) return undefined;
  return { command: invocation[1], args };
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/\s*\((?:hermes-catalog|community)\)\s*$/, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function sourceKey(url: URL) {
  return `${url.origin}${url.pathname.replace(/\/$/, "")}`;
}

export function resolveMcpTools(tools: RequiredTool[], catalog: McpCatalog): ResolvedMcpTool[] {
  const resolved: ResolvedMcpTool[] = [];
  const slugs = new Set<string>();
  const seen = new Set<string>();
  for (const tool of tools) {
    const install = tool.install.trim();
    const installUrl = webUrl(install);
    const name = normalizeName(tool.name);
    const named = catalog.servers.filter((entry) => name && normalizeName(entry.name) === name);
    const byUrl = catalog.servers.filter((entry) => {
      const url = webUrl(entry.url);
      return installUrl && url && sourceKey(installUrl) === sourceKey(url);
    });
    const matches = named.length ? named : byUrl;
    const server = matches.length === 1 ? matches[0] : matches.find((entry) => byUrl.includes(entry));
    const endpoint = endpointFromInstall(install);
    if (!matches.length && !endpoint && !/\bmcp\b/i.test(`${tool.name} ${install}`)) continue;

    const identity = JSON.stringify([name, install]);
    if (seen.has(identity)) continue;
    seen.add(identity);
    const base = name || "mcp-server";
    let slug = base;
    for (let suffix = 2; slugs.has(slug); suffix++) slug = `${base}-${suffix}`;
    slugs.add(slug);

    const sourceUrls = [...new Set([
      ...matches.map((entry) => entry.url).filter((url) => webUrl(url)),
      ...(installUrl ? [install] : []),
    ])];
    resolved.push({
      slug,
      name: tool.name,
      sourceUrls,
      type: server?.type,
      auth: server?.auth || (/^OAuth\b/i.test(install) ? install : undefined),
      riskNotes: server?.risk_notes,
      launch: launchFromInstall(install),
      endpoint,
    });
  }
  return resolved;
}
