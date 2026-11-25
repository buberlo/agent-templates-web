import Link from "next/link";
import { EXPORT_TARGETS, PLATFORM_LABELS } from "@/lib/content/config";
import { getAllTemplates, getTemplate } from "@/lib/content/loader";
import { exportTemplate } from "@/lib/export";
import { getDictionary, localizePath, type Locale } from "@/lib/i18n";

const DOC_LINKS: Partial<Record<(typeof EXPORT_TARGETS)[number], string>> = {
  "roo-code": "https://docs.roocode.com/features/custom-instructions",
  continue: "https://docs.continue.dev/customize/deep-dives/rules",
  goose: "https://block.github.io/goose/docs/guides/context-engineering/using-goosehints/",
  aider: "https://aider.chat/docs/config/aider_conf.html",
  zed: "https://zed.dev/docs/ai/instructions",
  "openai-agents-py": "https://openai.github.io/openai-agents-python/",
  "openai-agents-ts": "https://openai.github.io/openai-agents-js/",
  crewai: "https://docs.crewai.com/concepts/agents",
  n8n: "https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/",
  langgraph: "https://langchain-ai.github.io/langgraph/",
  grokbot: "https://docs.x.ai/docs/grok",
  hermes: "https://github.com/mercurial-ai/hermes",
  openclaw: "https://github.com/openclaw/openclaw",
  "claude-code": "https://docs.anthropic.com/en/docs/claude-code",
  codex: "https://github.com/openai/codex",
  cursor: "https://docs.cursor.com/context/rules",
  windsurf: "https://docs.windsurf.com/windsurf/cascade/memories",
  "gemini-cli": "https://github.com/google-gemini/gemini-cli",
  copilot: "https://docs.github.com/en/copilot",
  cline: "https://docs.cline.bot",
  kiro: "https://kiro.dev/docs",
  generic: "https://github.com/buberlo/agent-templates-web/blob/main/docs/export-targets.md",
};

export function AgentSupportPageContent({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const sample = getTemplate("ticket-triage-v1") ?? getAllTemplates()[0];

  return (
    <div className="space-y-8">
      <header className="panel p-5 sm:p-8">
        <h1 className="page-title">{d.agentSupport.title}</h1>
        <p className="mt-3 max-w-3xl text-muted">{d.agentSupport.intro}</p>
        <p className="mt-2 text-sm">
          <Link href={localizePath(locale, "/how-it-works")} className="text-link">
            {d.howItWorks.title}
          </Link>
          {" · "}
          <a
            href="https://github.com/buberlo/agent-templates-web/blob/main/docs/export-targets.md"
            className="text-link"
          >
            {d.agentSupport.exportDocs}
          </a>
        </p>
      </header>

      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead>
            <tr className="border-b text-muted">
              <th className="p-3 font-semibold">{d.agentSupport.columns.target}</th>
              <th className="p-3 font-semibold">{d.agentSupport.columns.output}</th>
              <th className="p-3 font-semibold">{d.agentSupport.columns.multiFile}</th>
              <th className="p-3 font-semibold">{d.agentSupport.columns.docs}</th>
            </tr>
          </thead>
          <tbody>
            {EXPORT_TARGETS.map((target) => {
              const exp = sample ? exportTemplate(sample, target) : null;
              const multi = (exp?.extraFiles?.length ?? 0) > 0;
              const docs = DOC_LINKS[target];
              return (
                <tr key={target} className="border-b last:border-0">
                  <td className="p-3 font-medium">{PLATFORM_LABELS[target]}</td>
                  <td className="p-3 font-mono text-xs [overflow-wrap:anywhere]">
                    {exp?.filename}
                    {exp?.extraFiles?.map((f) => (
                      <span key={f.filename} className="block text-muted">
                        {f.filename}
                      </span>
                    ))}
                  </td>
                  <td className="p-3">{multi ? d.common.taskComplete : "—"}</td>
                  <td className="p-3">
                    {docs ? (
                      <a href={docs} className="text-link" rel="noopener noreferrer" target="_blank">
                        {d.agentSupport.officialDocs}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}