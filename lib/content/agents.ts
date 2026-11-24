import { PLATFORM_LABELS } from "./constants";

/** Compact form used to collapse aliases such as "Grok Bot", "grok-bot", and "grokbot". */
function compactAgent(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

const COMPACT_TO_CANONICAL: Record<string, string> = {
  hermes: "hermes",
  grokbot: "grokbot",
  grok: "grokbot",
  openclaw: "openclaw",
  claudecode: "claude-code",
  codex: "codex",
  cursor: "cursor",
  genericmcpagents: "generic-mcp-agents",
  generic: "generic",
};

/** Canonical ids used in frontmatter, e.g. `grokbot`. */
export function normalizeAgentId(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const compact = compactAgent(trimmed);
  if (COMPACT_TO_CANONICAL[compact]) return COMPACT_TO_CANONICAL[compact];
  return trimmed.toLowerCase().replace(/[_\s]+/g, "-");
}

/** Public query-string value, e.g. `grok-bot` for the Grok Bot filter. */
export function agentToParam(canonical: string): string {
  if (canonical === "grokbot") return "grok-bot";
  return canonical;
}

export function agentFromParam(param: string): string {
  return normalizeAgentId(param);
}

export function uniqueAgentIds(values: Iterable<string>): string[] {
  return [...new Set([...values].map(normalizeAgentId).filter(Boolean))].sort();
}

export function templateSupportsAgent(targetAgents: string[], agent: string): boolean {
  if (!agent) return true;
  const wanted = normalizeAgentId(agent);
  return targetAgents.some((value) => normalizeAgentId(value) === wanted);
}

export function agentLabel(
  id: string,
  labels?: Record<string, string>,
): string {
  const canonical = normalizeAgentId(id);
  return labels?.[canonical] || PLATFORM_LABELS[canonical] || PLATFORM_LABELS[id] || id;
}
