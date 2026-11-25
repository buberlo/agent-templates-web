"use client";

import { useState } from "react";
import {
  generateMcpConfig,
  MCP_CLIENTS,
  type ClineVariant,
  type McpClient,
  type McpMode,
  type ResolvedMcpTool,
} from "@/lib/export/mcp-config";
import { CopyButton } from "./copy-button";
import { useLocale } from "./locale-provider";

export function McpConfigGenerator({ tools }: { tools: ResolvedMcpTool[] }) {
  const { dict } = useLocale();
  const labels = dict.mcpConfig;
  const [client, setClient] = useState<McpClient>("cursor");
  const [mode, setMode] = useState<McpMode>(() => tools.some((tool) => tool.endpoint) ? "http" : "stdio");
  const [clineVariant, setClineVariant] = useState<ClineVariant>("cline");
  const { path, content, hasPlaceholders } = generateMcpConfig(tools, client, mode, clineVariant);

  return (
    <div className="panel space-y-4 p-4 sm:p-6">
      <div className="flex flex-wrap gap-4">
        <label className="grid gap-1 text-sm font-medium">
          {labels.client}
          <select className="rounded-md border border-control bg-background p-2" value={client}
            onChange={(event) => setClient(event.target.value as McpClient)}>
            {Object.entries(MCP_CLIENTS).map(([id, { label }]) =>
              <option key={id} value={id}>{label}</option>,
            )}
          </select>
        </label>
        {client === "cline" && (
          <label className="grid gap-1 text-sm font-medium">
            {labels.editor}
            <select className="rounded-md border border-control bg-background p-2" value={clineVariant}
              onChange={(event) => setClineVariant(event.target.value as ClineVariant)}>
              <option value="cline">Cline</option>
              <option value="roo">Roo Code</option>
            </select>
          </label>
        )}
        <label className="grid gap-1 text-sm font-medium">
          {labels.transport}
          <select className="rounded-md border border-control bg-background p-2" value={mode}
            onChange={(event) => setMode(event.target.value as McpMode)}>
            <option value="stdio">{labels.stdio}</option>
            <option value="http">{labels.http}</option>
          </select>
        </label>
      </div>
      <ul className="space-y-2 text-sm text-muted">
        {tools.map((tool) => (
          <li key={tool.slug} className="[overflow-wrap:anywhere]">
            <p className="font-semibold text-foreground">{tool.name}</p>
            {tool.type && <p>{dict.common.type} · {tool.type}</p>}
            <p>{dict.common.auth} · {tool.auth || labels.authUnknown}</p>
            {tool.riskNotes && <p>{tool.riskNotes}</p>}
            {tool.sourceUrls.map((url) => (
              <a key={url} href={url} className="text-link block">{url}</a>
            ))}
          </li>
        ))}
      </ul>
      <p className="text-sm">{labels.file} <code className="[overflow-wrap:anywhere]">{path}</code></p>
      <p className="text-sm text-muted">{labels.merge}</p>
      {hasPlaceholders && <p className="text-sm text-muted">{labels.placeholders}</p>}
      <div className="code-block">
        <div className="flex justify-end border-b px-2 py-1">
          <CopyButton key={`${client}-${mode}-${clineVariant}`} text={content} label={labels.copy} />
        </div>
        <pre tabIndex={0}><code>{content}</code></pre>
      </div>
    </div>
  );
}
