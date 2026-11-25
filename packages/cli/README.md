# AgentStencil CLI

Browse the public AgentStencil catalog and export reusable agent instructions. Requires Node.js 20+ and Git for remote catalog access.

```sh
npx agentstencil list
npx agentstencil list --domain agent-platforms --target codex
npx agentstencil list --category cursor
npx agentstencil search "code review"
npx agentstencil add <id> --target codex --dry-run
npx agentstencil add <id> --target codex
npx agentstencil add <id> --target cursor --stdout
npx agentstencil mcp-config <id> --client cursor --transport stdio
```

Replace `<id>` with an ID from `list` or `search`. List filters combine when supplied together. Search matches terms case-insensitively across IDs, titles, tags, and template text.

Run `add` from your project directory. Use `--dry-run` to check the destination without writing, or `--stdout` to print the exact export for review or manual merging. An identical file is already up to date. A differing file produces a conflict and stays untouched.

| Target | Project-relative destination |
| --- | --- |
| `grokbot` | `<id>-grok-bot.txt`, a setup message to paste into a new Grok Bot |
| `hermes`, `openclaw` | `<id>-SKILL.md`, for placement as `SKILL.md` in the agent's skill directory |
| `claude-code` | `CLAUDE.md` |
| `codex` | `AGENTS.md` |
| `cursor` | `.cursor/rules/<id>.mdc` |
| `generic` | `<id>-system-prompt.txt` |
| `windsurf` | `.windsurfrules` |
| `gemini-cli` | `GEMINI.md` |
| `copilot` | `.github/copilot-instructions.md` |
| `cline` | `.clinerules` |
| `kiro` | `.kiro/steering/<id>.md` |

`mcp-config` prints a JSON or TOML snippet to stdout and reports the destination, sources, authentication, risk notes, and placeholders on stderr. Select `stdio` or `http` for `cursor`, `claude-code`, `codex`, `copilot`, `windsurf`, `gemini-cli`, or `cline`. Review the sources, fill placeholders, and merge the snippet into your client's configuration.

By default, the CLI uses `AGENTSTENCIL_CONTENT_DIR` when set, then a project-local `.content-cache` containing `catalog.json`, then the public `buberlo/agent-templates` repository. All commands accept `--ref <branch|tag|commit>` to select a remote snapshot explicitly. Use a full commit SHA for reproducible exports. Remote snapshots are cached by ref under `agentstencil-cache` in the system temporary directory. Remove that cache to refresh a moving branch.

Run `npx agentstencil --help` for options or `npx agentstencil --version` for the package version.
