import { resolveMcpTools } from "@/lib/content/resolve-mcp-tools";
import { generateMcpConfig, type McpClient, type McpMode } from "@/lib/export/mcp-config";
import type { Content } from "../content";

export function mcpConfig(content: Content, id: string, client: McpClient, transport: McpMode) {
  const doc = content.find(id);
  const tools = resolveMcpTools(doc.frontmatter.required_tools, content.mcpCatalog());
  const config = generateMcpConfig(tools, client, transport);
  const templateSource = content.sourceUrl(doc.filePath);
  console.error(`Target file: ${config.path}`);
  console.error(`Template source: ${templateSource}`);
  if (!tools.length) console.error("This template has no documented MCP servers.");
  for (const tool of tools) {
    console.error(tool.name);
    console.error(`  Sources: ${tool.sourceUrls.join(", ") || templateSource}`);
    console.error(`  Authentication: ${tool.auth || "See the source documentation."}`);
    console.error(`  Risk notes: ${tool.riskNotes || "See the source documentation."}`);
  }
  if (config.hasPlaceholders) {
    console.error("Replace placeholders using the source links before merging the snippet.");
  }
  process.stdout.write(config.content);
}
