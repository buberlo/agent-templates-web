import type { ExportTarget } from "@/lib/content/constants";
import type { TemplateDocument } from "@/lib/content/types";
import type { ExportExtraFile, ExportResult } from "./types";
import { section, systemInstructions, toolPlaceholders } from "./shared";

function yamlScalar(value: string): string {
  if (!/[\n:#"'&*!?|>@%`]/.test(value) && value.length < 80) return value;
  return JSON.stringify(value);
}

function gooseHints(doc: TemplateDocument): string {
  const fm = doc.frontmatter;
  const lines = [
    `# ${fm.title} (AgentStencil)`,
    "",
    systemInstructions(doc),
    "",
    "## Workflow",
    section(doc, "workflow"),
    "",
    "## Tool stack",
    ...toolPlaceholders(doc),
    section(doc, "toolStack"),
    "",
    "## Security",
    section(doc, "security"),
    "",
    "## Definition of done",
    section(doc, "definitionOfDone"),
  ];
  return lines.filter((line) => line !== "").join("\n").trim();
}

function gooseRecipe(doc: TemplateDocument): string {
  const fm = doc.frontmatter;
  const instructions = [
    systemInstructions(doc),
    "",
    "Workflow:",
    section(doc, "workflow"),
    "",
    "Security:",
    section(doc, "security"),
  ]
    .join("\n")
    .trim();
  return [
    `version: "1.0.0"`,
    `title: ${yamlScalar(fm.title)}`,
    `description: ${yamlScalar(section(doc, "purpose") || fm.title)}`,
    `instructions: |`,
    ...instructions.split("\n").map((line) => `  ${line}`),
  ].join("\n");
}

function aiderConventions(doc: TemplateDocument): string {
  const fm = doc.frontmatter;
  return [
    `# ${fm.title} conventions (AgentStencil)`,
    "",
    systemInstructions(doc),
    "",
    "## Workflow",
    section(doc, "workflow"),
    "",
    "## Outputs",
    ...fm.outputs.map((o) => `- ${o}`),
    "",
    "## Security",
    section(doc, "security"),
    "",
    "## Pitfalls",
    section(doc, "pitfalls"),
  ]
    .join("\n")
    .trim();
}

function crewAgentsYaml(doc: TemplateDocument): string {
  const fm = doc.frontmatter;
  const id = fm.id.replace(/-/g, "_");
  const goal = (section(doc, "purpose") || fm.title).split("\n")[0].trim();
  return [
    `${id}:`,
    `  role: >`,
    `    ${yamlScalar(fm.title)}`,
    `  goal: >`,
    `    ${yamlScalar(goal)}`,
    `  backstory: >`,
    `    ${yamlScalar(systemInstructions(doc).slice(0, 500))}`,
  ].join("\n");
}

function crewTasksYaml(doc: TemplateDocument): string {
  const fm = doc.frontmatter;
  const id = fm.id.replace(/-/g, "_");
  const desc = [
    section(doc, "workflow"),
    "",
    "Definition of done:",
    section(doc, "definitionOfDone"),
  ]
    .join("\n")
    .trim();
  return [
    `${id}_task:`,
    `  description: >`,
    `    ${yamlScalar(desc.slice(0, 800))}`,
    `  expected_output: >`,
    `    ${yamlScalar(fm.outputs.join("; ") || "Completed deliverables per definition of done.")}`,
    `  agent: ${id}`,
  ].join("\n");
}

function instructionBundle(doc: TemplateDocument): string {
  return [
    systemInstructions(doc),
    "",
    "Workflow:",
    section(doc, "workflow"),
    "",
    "Security:",
    section(doc, "security"),
  ]
    .join("\n")
    .trim();
}

function openaiAgentsPython(doc: TemplateDocument): string {
  const fm = doc.frontmatter;
  const name = fm.title.replace(/"/g, '\\"');
  const instructions = instructionBundle(doc)
    .replace(/"""/g, '\\"\\"\\"')
    .replace(/\\/g, "\\\\");
  const toolFns = fm.required_tools.map((t, i) => {
    const fn = `tool_${i}_${t.name.replace(/\W+/g, "_").toLowerCase() || "mcp"}`;
    return [
      "",
      "@tool",
      `def ${fn}() -> str:`,
      `    """${t.name}: ${t.install.replace(/"/g, '\\"')}"""`,
      `    raise NotImplementedError("Wire ${t.name} to your MCP or API client.")`,
    ].join("\n");
  });
  return [
    '"""AgentStencil export for OpenAI Agents SDK (Python)."""',
    "",
    "from agents import Agent",
    "from agents.decorators import tool",
    ...toolFns,
    "",
    "INSTRUCTIONS = \"\"\"",
    instructions,
    "\"\"\"",
    "",
    `${fm.id.replace(/-/g, "_")}_agent = Agent(`,
    `    name="${name}",`,
    "    instructions=INSTRUCTIONS,",
    `    tools=[${fm.required_tools.map((_, i) => `tool_${i}_${fm.required_tools[i].name.replace(/\W+/g, "_").toLowerCase() || "mcp"}`).join(", ") || ""}],`,
    ")",
    "",
  ].join("\n");
}

function openaiAgentsTypeScript(doc: TemplateDocument): string {
  const fm = doc.frontmatter;
  const instructions = instructionBundle(doc)
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$");
  const tools = fm.required_tools
    .map(
      (t, i) =>
        `const tool${i} = tool({\n  name: ${JSON.stringify(t.name)},\n  description: ${JSON.stringify(t.install)},\n  parameters: z.object({}),\n  execute: async () => {\n    throw new Error("Wire ${t.name} to your MCP or API client.");\n  },\n});`,
    )
    .join("\n\n");
  return [
    '/** AgentStencil export for OpenAI Agents SDK (TypeScript). */',
    "",
    'import { Agent } from "@openai/agents";',
    'import { tool } from "@openai/agents";',
    'import { z } from "zod";',
    "",
    tools,
    "",
    `export const ${fm.id.replace(/-/g, "_")}Agent = new Agent({`,
    `  name: ${JSON.stringify(fm.title)},`,
    "  instructions: `",
    instructions,
    "`,",
    `  tools: [${fm.required_tools.map((_, i) => `tool${i}`).join(", ")}],`,
    "});",
    "",
  ].join("\n");
}

function n8nWorkflow(doc: TemplateDocument): string {
  const fm = doc.frontmatter;
  const prompt = instructionBundle(doc).slice(0, 2000);
  return JSON.stringify(
    {
      name: `AgentStencil – ${fm.title}`,
      nodes: [
        {
          parameters: {},
          id: "trigger",
          name: "Manual Trigger",
          type: "n8n-nodes-base.manualTrigger",
          typeVersion: 1,
          position: [0, 0],
        },
        {
          parameters: {
            text: prompt,
            options: {},
          },
          id: "ai-agent",
          name: "AI Agent",
          type: "@n8n/n8n-nodes-langchain.agent",
          typeVersion: 1,
          position: [280, 0],
          notes: "Replace with your model credentials. Connect MCP Client Tool nodes for required tools.",
        },
        {
          parameters: {
            description: "MCP client placeholder — configure server URL and auth.",
          },
          id: "mcp-placeholder",
          name: "MCP Client Tool (placeholder)",
          type: "@n8n/n8n-nodes-langchain.mcpClientTool",
          typeVersion: 1,
          position: [280, 200],
        },
      ],
      connections: {
        "Manual Trigger": {
          main: [[{ node: "AI Agent", type: "main", index: 0 }]],
        },
      },
      meta: {
        templateId: fm.id,
        agentStencil: true,
        requiredTools: fm.required_tools.map((t) => t.name),
      },
    },
    null,
    2,
  );
}

function langGraphScaffold(doc: TemplateDocument): string {
  const fm = doc.frontmatter;
  const instructions = instructionBundle(doc).replace(/"""/g, '\\"\\"\\"');
  return [
    '"""Minimal LangGraph scaffold from AgentStencil."""',
    "",
    "from typing import Annotated, TypedDict",
    "",
    "from langgraph.graph import END, START, StateGraph",
    "from langgraph.graph.message import add_messages",
    "",
    "",
    "class AgentState(TypedDict):",
    "    messages: Annotated[list, add_messages]",
    "",
    "",
    "INSTRUCTIONS = \"\"\"",
    instructions,
    "\"\"\"",
    "",
    "",
    "def agent_node(state: AgentState) -> AgentState:",
    '    """Invoke your chat model with INSTRUCTIONS + state[\"messages\"]."""',
    "    # TODO: connect model and tools listed in the template.",
    "    return state",
    "",
    "",
    "graph_builder = StateGraph(AgentState)",
    'graph_builder.add_node("agent", agent_node)',
    'graph_builder.add_edge(START, "agent")',
    'graph_builder.add_edge("agent", END)',
    "",
    `${fm.id.replace(/-/g, "_")}_graph = graph_builder.compile()`,
    "",
  ].join("\n");
}

type Exporter = (doc: TemplateDocument) => ExportResult;

export const EXTENDED_EXPORT_MAP: Record<
  Extract<
    ExportTarget,
    | "roo-code"
    | "continue"
    | "goose"
    | "aider"
    | "zed"
    | "openai-agents-py"
    | "openai-agents-ts"
    | "crewai"
    | "n8n"
    | "langgraph"
  >,
  Exporter
> = {
  "roo-code": (doc) => ({
    filename: `.roo/rules/${doc.frontmatter.id}.md`,
    mimeType: "text/markdown",
    content: [
      `# ${doc.frontmatter.title}`,
      "",
      systemInstructions(doc),
      "",
      "## Workflow",
      section(doc, "workflow"),
      "",
      "## Pitfalls",
      section(doc, "pitfalls"),
    ].join("\n"),
    description: "Roo Code workspace rule (.roo/rules/)",
  }),
  continue: (doc) => ({
    filename: `.continue/rules/${doc.frontmatter.id}.md`,
    mimeType: "text/markdown",
    content: [
      "---",
      `name: ${yamlScalar(doc.frontmatter.title)}`,
      `description: ${yamlScalar(section(doc, "purpose").split("\n")[0] || doc.frontmatter.title)}`,
      "globs:",
      '  - "**/*"',
      "alwaysApply: false",
      "---",
      "",
      systemInstructions(doc),
      "",
      "## Workflow",
      section(doc, "workflow"),
    ].join("\n"),
    description: "Continue rule with YAML frontmatter",
  }),
  goose: (doc) => ({
    filename: ".goosehints",
    mimeType: "text/plain",
    content: gooseHints(doc),
    description: "Goose project hints (.goosehints)",
    extraFiles: [
      {
        filename: `recipes/${doc.frontmatter.id}.yaml`,
        mimeType: "text/yaml",
        content: gooseRecipe(doc),
      },
    ],
  }),
  aider: (doc) => {
    const conventionsName = `CONVENTIONS-${doc.frontmatter.id}.md`;
    return {
      filename: ".aider.conf.yml",
      mimeType: "text/yaml",
      content: `read:\n  - ${conventionsName}\n`,
      description: "Aider config pointing at conventions file",
      extraFiles: [
        {
          filename: conventionsName,
          mimeType: "text/markdown",
          content: aiderConventions(doc),
        },
      ],
    };
  },
  zed: (doc) => ({
    filename: ".rules",
    mimeType: "text/markdown",
    content: [
      `# ${doc.frontmatter.title}`,
      "",
      systemInstructions(doc),
      "",
      "## Workflow",
      section(doc, "workflow"),
      "",
      "## Security",
      section(doc, "security"),
    ].join("\n"),
    description: "Zed Agent compatibility instructions (.rules)",
  }),
  "openai-agents-py": (doc) => ({
    filename: `agentstencil_${doc.frontmatter.id.replace(/-/g, "_")}.py`,
    mimeType: "text/x-python",
    content: openaiAgentsPython(doc),
    description: "OpenAI Agents SDK Python Agent(...) scaffold",
  }),
  "openai-agents-ts": (doc) => ({
    filename: `agentstencil-${doc.frontmatter.id}.ts`,
    mimeType: "text/typescript",
    content: openaiAgentsTypeScript(doc),
    description: "OpenAI Agents SDK TypeScript Agent scaffold",
  }),
  crewai: (doc) => ({
    filename: `crewai/${doc.frontmatter.id}/agents.yaml`,
    mimeType: "text/yaml",
    content: crewAgentsYaml(doc),
    description: "CrewAI agents.yaml",
    extraFiles: [
      {
        filename: `crewai/${doc.frontmatter.id}/tasks.yaml`,
        mimeType: "text/yaml",
        content: crewTasksYaml(doc),
      },
    ],
  }),
  n8n: (doc) => ({
    filename: `${doc.frontmatter.id}-workflow.json`,
    mimeType: "application/json",
    content: n8nWorkflow(doc),
    description: "Importable n8n workflow JSON (AI Agent + MCP placeholder)",
  }),
  langgraph: (doc) => ({
    filename: `${doc.frontmatter.id.replace(/-/g, "_")}_graph.py`,
    mimeType: "text/x-python",
    content: langGraphScaffold(doc),
    description: "Minimal LangGraph StateGraph scaffold",
  }),
};