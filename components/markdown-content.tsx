import { Children, isValidElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check } from "lucide-react";
import { getDictionary, type Locale } from "@/lib/i18n";
import { CopyButton } from "./copy-button";

function codeText(children: ReactNode): string {
  return Children.toArray(children).map((child) => {
    if (typeof child === "string" || typeof child === "number") return String(child);
    return isValidElement<{ children?: ReactNode }>(child) ? codeText(child.props.children) : "";
  }).join("");
}

export function CodeBlock({ text, label, wrap }: { text: string; label?: string; wrap?: boolean }) {
  return (
    <div className="code-block">
      <div className="flex justify-end border-b px-2 py-1">
        <CopyButton text={text} label={label} />
      </div>
      <pre tabIndex={0} className={wrap ? "whitespace-pre-wrap [overflow-wrap:anywhere]" : undefined}><code>{text}</code></pre>
    </div>
  );
}

export function MarkdownContent({ children, locale }: { children: string; locale: Locale }) {
  const { common } = getDictionary(locale);
  return (
    <div className="prose-template">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          input: ({ checked }) => (
            <span role="img" aria-label={checked ? common.taskComplete : common.taskIncomplete} className="mr-1 inline-grid size-4 place-items-center rounded border border-control align-text-bottom text-accent">
              {checked && <Check size={13} aria-hidden="true" />}
            </span>
          ),
          pre: ({ children }) => <CodeBlock text={codeText(children).replace(/\n$/, "")} />,
          table: ({ children }) => <div className="my-4 overflow-x-auto" tabIndex={0}><table>{children}</table></div>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
