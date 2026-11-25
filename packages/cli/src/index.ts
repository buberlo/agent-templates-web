import { EXPORT_TARGETS, type ExportTarget } from "@/lib/content/constants";
import { normalizeAgentId } from "@/lib/content/agents";
import { MCP_CLIENTS, type McpClient, type McpMode } from "@/lib/export/mcp-config";
import { version } from "../package.json";
import { add } from "./commands/add";
import { list } from "./commands/list";
import { mcpConfig } from "./commands/mcp-config";
import { search } from "./commands/search";
import { openContent } from "./content";
import { validateId } from "./destinations";

const help = `Usage:
  agentstencil list [--domain <domain>] [--category <category>] [--target <agent>]
  agentstencil search <query>
  agentstencil add <id> --target <agent> [--dry-run | --stdout]
  agentstencil mcp-config <id> --client <client> --transport <stdio|http>

Use --ref <ref> with any command to select a public catalog branch, tag, or commit.
Use --help for usage and --version for the package version.

Instruction targets: ${EXPORT_TARGETS.join(", ")}
MCP clients: ${Object.keys(MCP_CLIENTS).join(", ")}`;

const commandOptions = {
  list: ["domain", "category", "target"],
  search: [],
  add: ["target", "dry-run", "stdout"],
  "mcp-config": ["client", "transport"],
};

const flags = new Set(["dry-run", "stdout"]);

function main(args: string[]) {
  if (!args.length || args.includes("--help") || args.includes("-h")) {
    console.log(help);
    return;
  }
  if (args.length === 1 && args[0] === "--version") {
    console.log(version);
    return;
  }

  const options: Record<string, string | undefined> = Object.create(null);
  const positionals: string[] = [];
  const knownOptions = new Set(["ref", ...Object.values(commandOptions).flat()]);
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === "--") {
      positionals.push(...args.slice(index + 1));
      break;
    }
    if (!arg.startsWith("-")) {
      positionals.push(arg);
      continue;
    }
    const key = arg.slice(2);
    if (!arg.startsWith("--") || !knownOptions.has(key)) {
      throw new Error(`Unknown option ${arg}. Use --help to see supported options.`);
    }
    if (options[key] !== undefined) throw new Error(`Specify --${key} only once.`);
    const value = flags.has(key) ? "true" : args[index + 1];
    if (!value?.trim() || value.startsWith("-")) {
      throw new Error(`Provide a value for --${key}. Use --help for examples.`);
    }
    options[key] = value;
    if (!flags.has(key)) index++;
  }

  const [command, operand, ...extra] = positionals;
  if (!Object.hasOwn(commandOptions, command)) {
    throw new Error(`Unknown command ${command ?? "(missing)"}. Use --help to see available commands.`);
  }
  const allowed: string[] = commandOptions[command as keyof typeof commandOptions];
  for (const key of Object.keys(options)) {
    if (key !== "ref" && !allowed.includes(key)) {
      throw new Error(`Unsupported option --${key} for ${command}. Use --help to see supported options.`);
    }
  }

  if (command === "list" ? operand !== undefined : !operand?.trim() || extra.length) {
    const expected = command === "list" ? "no positional arguments" : command === "search" ? "one query (quote multiple words)" : "one template ID";
    throw new Error(`Expected ${expected} for ${command}. Use --help for usage.`);
  }

  if (command === "list" || command === "add") {
    if (command === "add" || options.target !== undefined) {
      const target = normalizeAgentId(options.target ?? "");
      if (!EXPORT_TARGETS.some((value) => value === target) &&
          !(command === "list" && target === "generic-mcp-agents")) {
        throw new Error(`Select a supported --target for ${command}. Use --help to see instruction targets.`);
      }
      options.target = target;
    }
  }
  if (command === "add" || command === "mcp-config") validateId(operand);
  if (command === "add" && options.stdout && options["dry-run"]) {
    throw new Error("Choose either --dry-run to preview the destination or --stdout to print the export.");
  }
  if (command === "mcp-config") {
    if (!Object.hasOwn(MCP_CLIENTS, options.client ?? "")) {
      throw new Error("Select a supported --client. Use --help to see MCP clients.");
    }
    if (options.transport !== "stdio" && options.transport !== "http") {
      throw new Error("Select --transport stdio or --transport http.");
    }
  }

  const content = openContent(options.ref);
  switch (command) {
    case "list":
      list(content, options);
      break;
    case "search":
      search(content, operand.trim());
      break;
    case "add":
      add(content, operand, options.target as ExportTarget, Boolean(options.stdout), Boolean(options["dry-run"]));
      break;
    case "mcp-config":
      mcpConfig(content, operand, options.client as McpClient, options.transport as McpMode);
      break;
  }
}

try {
  main(process.argv.slice(2));
} catch (error) {
  console.error(`agentstencil: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
