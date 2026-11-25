import type { Metadata } from "next";
import { AgentSupportPageContent } from "@/lib/views/agent-support";
import { agentSupportMetadata } from "@/lib/views/metadata";

export const metadata: Metadata = agentSupportMetadata("de");

export default function AgentSupportPageDe() {
  return <AgentSupportPageContent locale="de" />;
}