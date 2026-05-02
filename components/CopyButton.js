"use client";

import { useState } from "react";

export default function CopyButton({ text, label = "Copy", copiedLabel = "Copied!", className = "" }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={
        className ||
        "inline-flex items-center gap-2 bg-warm-900 text-parchment px-4 py-2 text-sm font-semibold hover:bg-warm-800"
      }
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
