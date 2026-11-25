import { templateSupportsAgent } from "@/lib/content/agents";
import type { Content } from "../content";

export function list(content: Content, options: Record<string, string | undefined>) {
  for (const entry of content.entries) {
    if (options.domain && entry.domain !== options.domain) continue;
    if (options.category && entry.category !== options.category) continue;
    if (options.target && !templateSupportsAgent(entry.target_agents, options.target)) continue;
    console.log(`${entry.id}\t${entry.title}`);
  }
}
