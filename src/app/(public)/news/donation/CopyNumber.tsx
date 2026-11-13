"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** The account number, with a button that copies it */
export default function CopyNumber({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ }
  }
  const spaced = value.replace(/(\d{4})(?=\d)/g, "$1 ");
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="select-all text-2xl font-bold tracking-wider text-brand-gold">{spaced}</p>
      <button onClick={copy} className="inline-flex items-center gap-1.5 rounded-full border border-brand-gold/40 px-3 py-1.5 text-xs font-semibold text-brand-gold active:scale-95">
        {copied ? <><Check className="h-3.5 w-3.5" /> Tersalin</> : <><Copy className="h-3.5 w-3.5" /> Salin nomor rekening</>}
      </button>
    </div>
  );
}
