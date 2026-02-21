"use client";

import { useState, useCallback } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="absolute right-3 top-3 rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-300"
    >
      {copied ? "✓" : "📋"}
    </button>
  );
}
