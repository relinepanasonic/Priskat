"use client";

import { useState } from "react";
import { Check, Link as LinkIcon, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { registerLink } from "@/lib/eventReg";
import { slugify } from "@/lib/utils";

/** The magic link for an event: makes the registration settings row (and its short code) if it is missing. */
export async function getRegisterLink(eventId: string): Promise<string> {
  const db = createClient() as any;
  await db.from("event_reg_settings").upsert({ event_id: eventId }, { onConflict: "event_id", ignoreDuplicates: true });
  const { data, error } = await db.from("event_reg_settings").select("public_code, slug").eq("event_id", eventId).maybeSingle();
  if (error || !data?.public_code) throw new Error(error?.message ?? "Link belum bisa dibuat.");
  if (data.slug) return registerLink(data.slug);

  // the link takes the event's name, e.g. /e/pria-sejati-katolik-58-surabaya; if another event has that name, the short code is added
  const { data: ev } = await db.from("events").select("title").eq("id", eventId).maybeSingle();
  const base = slugify(String(ev?.title ?? "event")).slice(0, 60).replace(/-+$/, "") || "event";
  const first = await db.from("event_reg_settings").update({ slug: base }).eq("event_id", eventId).is("slug", null).select("slug");
  if (!first.error && first.data?.length) return registerLink(base);
  const second = await db.from("event_reg_settings").update({ slug: `${base}-${data.public_code}` }).eq("event_id", eventId).is("slug", null).select("slug");
  if (second.error) throw new Error(second.error.message);
  const { data: again } = await db.from("event_reg_settings").select("slug").eq("event_id", eventId).maybeSingle();
  return registerLink(again?.slug ?? data.public_code);
}

/** A camp that has no event yet becomes one first, then gets its link. */
export async function getCampRegisterLink(cohortId: string): Promise<string> {
  const { data, error } = await (createClient() as any).rpc("camp_make_event", { p_cohort: cohortId });
  if (error || !data) throw new Error(error?.message ?? "Link belum bisa dibuat.");
  return getRegisterLink(data as string);
}

/** The "Link Peserta" button: copies the magic link and shares it to WhatsApp. */
export function LinkPesertaButton({ run, title, compact = false }: { run: () => Promise<string>; title: string; compact?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setBusy(true); setError(null);
    try {
      const l = link ?? (await run());
      setLink(l);
      try { await navigator.clipboard.writeText(l); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={compact ? "space-y-1.5" : "space-y-2"}>
      <button type="button" onClick={go} disabled={busy}
        className={`flex w-full items-center justify-center gap-1.5 rounded-lg border border-brand-gold/40 font-bold text-brand-gold hover:bg-brand-gold/10 disabled:opacity-50 ${compact ? "px-2 py-2 text-[11px]" : "px-3 py-2.5 text-sm"}`}
        title={title}>
        {copied ? <Check className="h-3.5 w-3.5" /> : <LinkIcon className="h-3.5 w-3.5" />}
        {busy ? "Membuat..." : copied ? "Link disalin" : "Link Peserta"}
      </button>
      {link && !compact && (
        <div className="flex items-center gap-2">
          <a href={`https://wa.me/?text=${encodeURIComponent(`Daftar di sini: ${link}`)}`} target="_blank" rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-500 py-2 text-xs font-bold text-emerald-950"><MessageCircle className="h-3.5 w-3.5" /> Bagikan ke WhatsApp</a>
          <span className="min-w-0 flex-1 truncate text-[11px] text-brand-muted">{link.replace("https://", "")}</span>
        </div>
      )}
      {error && <p className="text-[11px] text-red-300">{error}</p>}
    </div>
  );
}
