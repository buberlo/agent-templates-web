# Export targets

AgentStencil maps each template to documented file formats. The site, JSON API, and `agentstencil add` CLI share the same exporters in `lib/export`.

See the live **[Agent support matrix](/agent-support)** for output paths and documentation links.

## Targets added in phase 1

| CLI target | Output | Official format docs |
|------------|--------|---------------------|
| `roo-code` | `.roo/rules/<id>.md` | [Roo Code custom instructions](https://docs.roocode.com/features/custom-instructions) |
| `continue` | `.continue/rules/<id>.md` (YAML frontmatter) | [Continue rules](https://docs.continue.dev/customize/deep-dives/rules) |
| `goose` | `.goosehints` + `recipes/<id>.yaml` | [Goose hints](https://block.github.io/goose/docs/guides/context-engineering/using-goosehints/), [recipe reference](https://block.github.io/goose/docs/guides/recipes/recipe-reference/) |
| `aider` | `.aider.conf.yml` + `CONVENTIONS-<id>.md` | [aider.conf.yml](https://aider.chat/docs/config/aider_conf.html), [conventions](https://aider.chat/docs/usage/conventions.html) |
| `zed` | `.rules` | [Zed instructions](https://zed.dev/docs/ai/instructions) |
| `openai-agents-py` | `agentstencil_<id>.py` | [OpenAI Agents SDK (Python)](https://openai.github.io/openai-agents-python/) |
| `openai-agents-ts` | `agentstencil-<id>.ts` | [OpenAI Agents SDK (TypeScript)](https://openai.github.io/openai-agents-js/) |
| `crewai` | `crewai/<id>/agents.yaml` + `tasks.yaml` | [CrewAI agents](https://docs.crewai.com/concepts/agents), [tasks](https://docs.crewai.com/concepts/tasks) |
| `n8n` | `<id>-workflow.json` | [n8n AI Agent node](https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/) |
| `langgraph` | `<id>_graph.py` | [LangGraph](https://langchain-ai.github.io/langgraph/) |

Multi-file exports (`goose`, `aider`, `crewai`) write every file when you run `agentstencil add` without `--stdout`.

## Earlier targets

| CLI target | Default output |
|------------|----------------|
| `grokbot` | `<id>-grok-bot.txt` |
| `hermes` / `openclaw` | `<id>-SKILL.md` |
| `claude-code` | `CLAUDE.md` |
| `codex` | `AGENTS.md` |
| `cursor` | `.cursor/rules/<id>.mdc` |
| `windsurf` | `.windsurfrules` |
| `gemini-cli` | `GEMINI.md` |
| `copilot` | `.github/copilot-instructions.md` |
| `cline` | `.clinerules` |
| `kiro` | `.kiro/steering/<id>.md` |
| `generic` | `<id>-system-prompt.txt` |