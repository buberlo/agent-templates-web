# AgentStencil CLI specification

The planned `agentstencil` npm package will run on Node.js 20+ and use the public [template content repository](https://github.com/buberlo/agent-templates). The CLI will reuse the website's content parser, export renderers, and MCP resolver so the same template and options produce the same content.

## Commands

| Command | Behavior |
| --- | --- |
| `npx agentstencil list` | List template IDs and titles. Support domain, category, and target filters. |
| `npx agentstencil search <query>` | Search IDs, titles, tags, and template text. Show IDs for use with `add`. |
| `npx agentstencil add <id> --target <agent>` | Render instructions for the requested target and report the destination. Use `--dry-run` to preview it or `--stdout` to print the export. |
| `npx agentstencil mcp-config <id> --client <client> --transport <stdio\|http>` | Print a configuration snippet to stdout. Report the target file, source links, authentication notes, risk notes, and any placeholders on stderr. |

Read commands use the public catalog. Support a pinned content ref for repeatable results. Unknown IDs, unsupported options, content fetch failures, and file conflicts produce a nonzero exit status and an actionable message on stderr.

## Instruction destinations

Paths are relative to the project directory unless noted.

| Target | Destination |
| --- | --- |
| `grokbot` | `<id>-grok-bot.txt`, a setup message to paste into a new Grok Bot |
| `hermes` | `<id>-SKILL.md`, then place it as `SKILL.md` in the agent's skill directory |
| `openclaw` | `<id>-SKILL.md`, then place it as `SKILL.md` in the agent's skill directory |
| `claude-code` | `CLAUDE.md` |
| `codex` | `AGENTS.md` |
| `cursor` | `.cursor/rules/<id>.mdc` |
| `generic` | `<id>-system-prompt.txt` |
| `windsurf` | `.windsurfrules` |
| `gemini-cli` | `GEMINI.md` |
| `copilot` | `.github/copilot-instructions.md` |
| `cline` | `.clinerules` |
| `kiro` | `.kiro/steering/<id>.md`, with `inclusion: always` in YAML frontmatter |

## MCP destinations

| Client | Target file |
| --- | --- |
| `cursor` | `.cursor/mcp.json` |
| `claude-code` | `.mcp.json` |
| `codex` | `~/.codex/config.toml` |
| `copilot` | `.vscode/mcp.json` |
| `windsurf` | `~/.codeium/windsurf/mcp_config.json` |
| `gemini-cli` | `~/.gemini/settings.json` |
| `cline` | `cline_mcp_settings.json` or Roo Code's project-level `.roo/mcp.json` |

## File conflicts

Validate template IDs and resolve the destination inside the project before writing. Reject traversal and symlink destinations. Create missing parent directories for a write. An identical destination is a successful no-op. For different content, leave the existing file untouched, report the path, and offer the rendered content through `--stdout` for manual merging. Use an exclusive create operation so a concurrent writer cannot be overwritten. The MCP command only prints configuration and leaves merging to the user.

## Zero-secrets design

Use public template sources and require no accounts or credentials. The CLI will never read secret files, prompt for credentials, interpolate environment values into exports, run install commands, or contact generated MCP endpoints. Users configure authentication directly in their client. Copy concrete commands and endpoints only from explicit install instructions, and display placeholders with the documented source when connection details are missing.

## Planned package layout

```text
packages/cli/
  package.json        npm metadata and agentstencil bin entry
  src/
    index.ts          Argument parsing and exit status
    commands/        add, list, search, and mcp-config
    content.ts       Public content lookup and ref selection
    destinations.ts  Target paths and exclusive file writes
  test/              Command, conflict, and output parity tests
```

Use shared TypeScript modules from `lib/content` and `lib/export` without importing Next.js or React into the CLI runtime.
