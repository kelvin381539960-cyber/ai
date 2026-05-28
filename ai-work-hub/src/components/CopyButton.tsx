'use client';

import { useState } from 'react';

export function CopyButton({ text, label = '复制' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button className="btn secondary" type="button" onClick={onCopy}>
      {copied ? '已复制' : label}
    </button>
  );
}
