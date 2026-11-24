import type { Metadata } from "next";
import { mcpMetadata } from "@/lib/views/metadata";
import { McpPageContent } from "@/lib/views/mcp";

export const metadata: Metadata = mcpMetadata("en");

export default function McpPage() {
  return <McpPageContent locale="en" />;
}