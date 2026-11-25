export const MCP_CLIENTS = {
  cursor: { label: "Cursor", path: ".cursor/mcp.json" },
  "claude-code": { label: "Claude Code", path: ".mcp.json" },
  codex: { label: "Codex", path: "~/.codex/config.toml" },
  copilot: { label: "VS Code / Copilot", path: ".vscode/mcp.json" },
  windsurf: { label: "Windsurf", path: "~/.codeium/windsurf/mcp_config.json" },
  "gemini-cli": { label: "Gemini CLI", path: "~/.gemini/settings.json" },
  cline: { label: "Cline / Roo Code", path: "cline_mcp_settings.json / .roo/mcp.json" },
} as const;

export type McpClient = keyof typeof MCP_CLIENTS;
export type McpMode = "stdio" | "http";
export type ClineVariant = "cline" | "roo";

export interface ResolvedMcpTool {
  slug: string;
  name: string;
  sourceUrls: string[];
  type?: string;
  auth?: string;
  riskNotes?: string;
  launch?: { command: string; args: string[] };
  endpoint?: { url: string; type: "http" | "sse" };
}

export function generateMcpConfig(
  tools: readonly ResolvedMcpTool[],
  client: McpClient,
  mode: McpMode,
  clineVariant?: ClineVariant,
) {
  let hasPlaceholders = false;
  const entries = tools.map((tool) => {
    if (mode === "stdio") {
      const launch = tool.launch ?? { command: "<command-from-repo>", args: ["<args-from-repo>"] };
      hasPlaceholders ||= !tool.launch;
      const entry = client === "claude-code" || client === "copilot"
        ? { type: "stdio", ...launch }
        : launch;
      return [tool.slug, entry] as const;
    }

    // Codex only supports Streamable HTTP for remote servers.
    const endpoint = client === "codex" && tool.endpoint?.type === "sse" ? undefined : tool.endpoint;
    const { url, type } = endpoint ?? { url: "https://<mcp-endpoint-from-repo>", type: "http" };
    hasPlaceholders ||= !endpoint;
    switch (client) {
      case "claude-code":
      case "copilot":
        return [tool.slug, { type, url }] as const;
      case "windsurf":
        return [tool.slug, { serverUrl: url }] as const;
      case "gemini-cli":
        return [tool.slug, type === "sse" ? { url } : { httpUrl: url }] as const;
      case "cline": {
        const transport = type === "sse" ? "sse" : "streamable-http";
        const clientType = transport === "streamable-http" && clineVariant !== "roo"
          ? "streamableHttp"
          : transport;
        return [tool.slug, { url, transport, type: clientType }] as const;
      }
      default:
        return [tool.slug, { url }] as const;
    }
  });

  const content = client === "codex"
    ? entries.map(([slug, entry]) => [
      `[mcp_servers.${slug}]`,
      ...Object.entries(entry).map(([key, value]) =>
        `${key} = ${JSON.stringify(value).replace(/\u007f/g, "\\u007f")}`,
      ),
    ].join("\n")).join("\n\n")
    : JSON.stringify({ [client === "copilot" ? "servers" : "mcpServers"]: Object.fromEntries(entries) }, null, 2);

  const info = MCP_CLIENTS[client];
  const path = client === "cline" && clineVariant
    ? clineVariant === "cline" ? "cline_mcp_settings.json" : ".roo/mcp.json"
    : info.path;
  return { ...info, path, content, hasPlaceholders };
}
