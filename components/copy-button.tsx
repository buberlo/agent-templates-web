"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "./locale-provider";

export function CopyButton({ text, label }: { text: string; label?: string }) {
  const { dict } = useLocale();
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const buttonLabel = label ?? dict.common.copy;

  useEffect(() => () => clearTimeout(timer.current), []);

  async function onCopy() {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
      timer.current = setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="relative inline-flex min-w-0">
      <button type="button" onClick={onCopy} className="button" aria-label={buttonLabel}>
        {status === "copied" ? <Check size={16} className="text-low" aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
        {buttonLabel}
      </button>
      <span role="status" className={status === "idle" ? "sr-only" : "absolute right-0 top-full z-10 mt-1 w-max max-w-56 rounded-md border bg-card p-2 text-xs shadow-[var(--shadow)]"}>
        {status === "copied" ? dict.common.copied : status === "error" ? dict.template.copyFailed : ""}
      </span>
    </div>
  );
}
