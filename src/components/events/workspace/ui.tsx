"use client";

import { ChevronDown } from "lucide-react";

export const inputCls = "w-full rounded-lg border border-[#333] bg-[#0f1216] px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-brand-gold focus:outline-none";

/** A titled box. Every tab is built from these so the spacing is the same everywhere. */
export function Card({ title, hint, children }: { title?: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-[#2a2d35] bg-[#14171c] p-4 md:p-5">
      {(title || hint) && (
        <header>
          {title && <h3 className="text-sm font-bold text-white">{title}</h3>}
          {hint && <p className="mt-0.5 text-xs leading-relaxed text-brand-muted">{hint}</p>}
        </header>
      )}
      {children}
    </section>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-xs font-semibold text-brand-light">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-brand-muted">{hint}</span>}
    </label>
  );
}

/** An on/off switch with a label, instead of a bare checkbox. */
export function Switch({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white">{label}</p>
        {hint && <p className="text-[11px] text-brand-muted">{hint}</p>}
      </div>
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-brand-gold" : "bg-[#333]"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

/** A box that opens and closes. */
export function Collapse({ title, subtitle, open, onToggle, children }: { title: string; subtitle?: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#2a2d35] bg-[#14171c]">
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left md:px-5">
        <span>
          <span className="block text-sm font-bold text-white">{title}</span>
          {subtitle && <span className="mt-0.5 block text-xs text-brand-muted">{subtitle}</span>}
        </span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-brand-gold transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="space-y-4 border-t border-[#2a2d35] p-4 md:p-5">{children}</div>}
    </section>
  );
}
