export const PLATFORM_LABELS: Record<string, string> = {
  hermes: "Hermes",
  grokbot: "Grok Bot",
  openclaw: "OpenClaw",
  "claude-code": "Claude Code",
  codex: "Codex",
  cursor: "Cursor",
  "generic-mcp-agents": "Generic MCP agents",
  generic: "Generic",
  "windsurf": "Windsurf",
  "gemini-cli": "Gemini CLI",
  "copilot": "GitHub Copilot",
  "cline": "Cline",
  "kiro": "Kiro",
};

export const EXPORT_TARGETS = [
  "grokbot",
  "hermes",
  "openclaw",
  "claude-code",
  "codex",
  "cursor",
  "generic",
  "windsurf",
  "gemini-cli",
  "copilot",
  "cline",
  "kiro",
] as const;

export type ExportTarget = (typeof EXPORT_TARGETS)[number];

export const CONTENT_REPO_OWNER = "buberlo";
export const CONTENT_REPO_NAME = "agent-templates";