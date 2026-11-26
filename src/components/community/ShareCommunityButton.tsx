"use client";

import { useEffect, useState } from "react";
import { Check, Copy, MessageCircle, Search, Send, Share2, UserRound, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Friend = { id: string; name: string; avatar: string | null };
const SITE = "https://apps.ruangiman.com";

/**
 * "Bagikan": share a community's About page. Phone share sheet (WhatsApp, Instagram, anything installed),
 * WhatsApp directly, copy the link, or send it to a friend inside Ruang Iman as a message.
 */
export default function ShareCommunityButton({
  name,
  slug,
  className = "",
  label = "Bagikan",
  compact = false,
}: {
  name: string;
  slug: string;
  className?: string;
  label?: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [friends, setFriends] = useState<Friend[] | null>(null);
  const [q, setQ] = useState("");
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [canNative, setCanNative] = useState(false);

  const url = `${SITE}/camp/${slug}/tentang`;
  const text = `Yuk kenalan dengan komunitas ${name} di Ruang Iman: ${url}`;

  useEffect(() => { setCanNative(typeof navigator !== "undefined" && typeof navigator.share === "function"); }, []);

  // my friends, only when the sheet is opened (and only when signed in)
  useEffect(() => {
    if (!open || friends !== null) return;
    (async () => {
      const supabase = createClient() as any;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setFriends([]); return; }
      const { data: fr } = await supabase.from("friendships").select("requester_id, receiver_id").eq("status", "accepted").or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);
      const ids = ((fr as { requester_id: string; receiver_id: string }[]) ?? []).map((f) => (f.requester_id === user.id ? f.receiver_id : f.requester_id));
      if (!ids.length) { setFriends([]); return; }
      const { data: ps } = await supabase.from("profiles").select("id, full_name, nama_panggilan, avatar_url, is_bot").in("id", ids);
      setFriends(((ps as { id: string; full_name: string | null; nama_panggilan: string | null; avatar_url: string | null }[]) ?? [])
        .map((p) => ({ id: p.id, name: p.nama_panggilan || p.full_name || "Teman", avatar: p.avatar_url }))
        .sort((a, b) => a.name.localeCompare(b.name)));
    })().catch(() => setFriends([]));
  }, [open, friends]);

  async function nativeShare() {
    try { await navigator.share({ title: name, text: `Komunitas ${name} di Ruang Iman`, url }); } catch { /* closed */ }
  }
  async function copy() {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { setError("Tautan belum bisa disalin."); }
  }
  async function sendTo(f: Friend) {
    setBusy(f.id); setError(null);
    try {
      const supabase = createClient() as any;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Masuk dulu ke akunmu.");
      const { data: thread, error: tErr } = await supabase.rpc("get_or_create_dm_thread", { other: f.id });
      if (tErr || !thread) throw new Error("Percakapan belum bisa dibuka.");
      const { error: mErr } = await supabase.from("dm_messages").insert({ thread_id: thread, author_id: user.id, content: text });
      if (mErr) throw new Error("Pesan belum terkirim.");
      setSent((s) => new Set(s).add(f.id));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const shown = (friends ?? []).filter((f) => f.name.toLowerCase().includes(q.trim().toLowerCase()));
  const row = "flex w-full items-center gap-3 rounded-xl border border-[#2a2d35] bg-[#14171c] px-4 py-3 text-left text-sm font-semibold text-white transition-colors hover:border-brand-gold/40";

  return (
    <>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        className={
          compact
            ? `inline-flex items-center gap-1.5 rounded-lg border border-brand-gold/40 bg-brand-gold/10 px-2.5 py-1.5 text-[11px] font-bold text-brand-gold transition-colors hover:bg-brand-gold hover:text-brand-dark md:px-3 md:text-xs ${className}`
            : `inline-flex items-center gap-2 rounded-xl border border-brand-gold/50 px-4 py-3 text-sm font-bold text-brand-gold transition-colors hover:bg-brand-gold/10 ${className}`
        }
      >
        <Share2 className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} /> {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/70 md:items-center" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="max-h-[88vh] w-full max-w-md space-y-2.5 overflow-y-auto rounded-t-3xl border border-[#333] bg-[#1a1d24] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-white md:rounded-3xl">
            <div className="mb-1 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold">Bagikan komunitas</h3>
                <p className="text-xs text-brand-muted">{name}</p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Tutup" className="rounded-full p-1.5 text-gray-400 hover:bg-white/10"><X className="h-5 w-5" /></button>
            </div>

            {canNative && <button onClick={nativeShare} className={row}><Send className="h-5 w-5 text-brand-gold" /> Bagikan lewat aplikasi lain</button>}
            <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" className={row}><MessageCircle className="h-5 w-5 text-emerald-400" /> WhatsApp</a>
            <button onClick={copy} className={row}>{copied ? <Check className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5 text-brand-gold" />} {copied ? "Tautan tersalin" : "Salin tautan"}</button>

            <div className="pt-2">
              <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-muted"><UserRound className="h-4 w-4" /> Kirim ke teman di Ruang Iman</p>
              {friends === null && <p className="py-3 text-center text-xs text-brand-muted">Memuat teman…</p>}
              {friends !== null && friends.length === 0 && <p className="rounded-xl bg-white/5 p-3 text-xs text-brand-muted">Belum ada teman di Ruang Iman. Tambah teman di menu Koneksi, atau bagikan lewat WhatsApp.</p>}
              {friends !== null && friends.length > 0 && (
                <>
                  <div className="relative mb-2">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari teman" className="w-full rounded-lg border border-[#333] bg-[#14171c] py-2.5 pl-9 pr-3 text-sm text-white focus:border-brand-gold focus:outline-none" />
                  </div>
                  <div className="max-h-56 space-y-1 overflow-y-auto">
                    {shown.map((f) => (
                      <div key={f.id} className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-white/5">
                        {f.avatar
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={f.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                          : <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gold/20 text-sm font-bold text-brand-gold">{f.name[0]?.toUpperCase()}</span>}
                        <span className="min-w-0 flex-1 truncate text-sm">{f.name}</span>
                        {sent.has(f.id)
                          ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300"><Check className="h-3.5 w-3.5" /> Terkirim</span>
                          : <button onClick={() => sendTo(f)} disabled={busy === f.id} className="rounded-full bg-brand-gold px-3.5 py-1.5 text-xs font-bold text-brand-dark disabled:opacity-60">{busy === f.id ? "…" : "Kirim"}</button>}
                      </div>
                    ))}
                  </div>
                </>
              )}
              {error && <p className="mt-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
