export const PLATFORM_LABELS: Record<string, string> = {
  hermes: "Hermes",
  grokbot: "Grok Bot",
  openclaw: "OpenClaw",
  "claude-code": "Claude Code",
  codex: "Codex",
  cursor: "Cursor",
  "generic-mcp-agents": "Generic MCP agents",
  generic: "Generic",
};

export const EXPORT_TARGETS = [
  "grokbot",
  "hermes",
  "openclaw",
  "claude-code",
  "codex",
  "cursor",
  "generic",
] as const;

export type ExportTarget = (typeof EXPORT_TARGETS)[number];

export const CONTENT_REPO_OWNER = "buberlo";
export const CONTENT_REPO_NAME = "agent-templates";