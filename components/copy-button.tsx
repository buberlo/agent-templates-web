"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { useLocale } from "./locale-provider";

export function CopyButton({
  text,
  label,
  className = "",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const { dict } = useLocale();
  const [copied, setCopied] = useState(false);
  const buttonLabel = label ?? dict.common.copy;

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className={`inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm hover:bg-white/5 ${className}`}
    >
      {copied ? (
        <Check className="h-4 w-4 text-emerald-400" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      {copied ? dict.common.copied : buttonLabel}
    </button>
  );
}