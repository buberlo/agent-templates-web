import type { Metadata } from "next";
import { mcpMetadata } from "@/lib/views/metadata";
import { McpPageContent } from "@/lib/views/mcp";

export const metadata: Metadata = mcpMetadata("de");

export default function GermanMcpPage() {
  return <McpPageContent locale="de" />;
}