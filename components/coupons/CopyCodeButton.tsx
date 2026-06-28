"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-sm font-semibold text-gray-900 transition-colors"
      aria-label={`Copy code ${code}`}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-emerald-600" />
          Copied
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          Copy code
        </>
      )}
    </button>
  );
}
