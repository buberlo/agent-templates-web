import type { Metadata } from "next";
import { AgentSupportPageContent } from "@/lib/views/agent-support";
import { agentSupportMetadata } from "@/lib/views/metadata";

export const metadata: Metadata = agentSupportMetadata("en");

export default function AgentSupportPage() {
  return <AgentSupportPageContent locale="en" />;
}