"use client";

import { useEffect, useState } from "react";
import { BookOpenText, Check, Copy, MessageCircle, Search, Send, UserRound, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Friend = { id: string; name: string; avatar: string | null };

/**
 * Share a Marketplace product (or store) to:
 *   1. Thought di Beranda (with product photo)
 *   2. WhatsApp
 *   3. In-app Chat (DM to a Ruang Iman friend)
 *   4. Copy link / native share sheet
 */
export default function ProductShareModal({
  title,
  subtitle,
  url,
  imageUrl,
  shareText,
  onClose,
  lang = "id",
}: {
  title: string;
  subtitle: string;
  url: string;
  imageUrl?: string | null;
  shareText: string;
  onClose: () => void;
  lang?: "id" | "en";
}) {
  const isEn = lang === "en";
  const [friends, setFriends] = useState<Friend[] | null>(null);
  const [q, setQ] = useState("");
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [canNative, setCanNative] = useState(false);
  const [thoughtOpen, setThoughtOpen] = useState(false);
  const [thoughtText, setThoughtText] = useState(shareText);

  useEffect(() => {
    setCanNative(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    (async () => {
      const supabase = createClient() as any;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setFriends([]); return; }
      const { data: fr } = await supabase
        .from("friendships")
        .select("requester_id, receiver_id")
        .eq("status", "accepted")
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);
      const ids = ((fr as { requester_id: string; receiver_id: string }[]) ?? []).map((f) =>
        f.requester_id === user.id ? f.receiver_id : f.requester_id,
      );
      if (!ids.length) { setFriends([]); return; }
      const { data: ps } = await supabase
        .from("profiles")
        .select("id, full_name, nama_panggilan, avatar_url")
        .in("id", ids);
      setFriends(
        ((ps as { id: string; full_name: string | null; nama_panggilan: string | null; avatar_url: string | null }[]) ?? [])
          .map((p) => ({ id: p.id, name: p.nama_panggilan || p.full_name || "Teman", avatar: p.avatar_url }))
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
    })().catch(() => setFriends([]));
  }, []);

  async function nativeShare() {
    try {
      await navigator.share({ title, text: shareText, url });
    } catch { /* cancelled */ }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Tautan belum bisa disalin.");
    }
  }

  async function postThought() {
    setBusy("thought");
    setError(null);
    try {
      const supabase = createClient() as any;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Masuk dulu ke akunmu.");
      const content = `${thoughtText.trim() || shareText}\n${url}`;
      const row: Record<string, unknown> = { author_id: user.id, content };
      if (imageUrl) row.image_url = imageUrl;
      const { error: e } = await supabase.from("community_posts").insert(row);
      if (e) throw new Error("Thought belum terkirim.");
      setNote("Berhasil dibagikan ke Thought di Beranda!");
      setThoughtOpen(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function sendToFriend(f: Friend) {
    setBusy(f.id);
    setError(null);
    try {
      const supabase = createClient() as any;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Masuk dulu ke akunmu.");
      const { data: thread, error: tErr } = await supabase.rpc("get_or_create_dm_thread", { other: f.id });
      if (tErr || !thread) throw new Error("Percakapan belum bisa dibuka.");
      const { error: mErr } = await supabase
        .from("dm_messages")
        .insert({ thread_id: thread, author_id: user.id, content: `${shareText}\n${url}` });
      if (mErr) throw new Error("Pesan belum terkirim.");
      setSent((s) => new Set(s).add(f.id));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const row =
    "flex w-full items-center gap-3 rounded-xl border border-[#2a2d35] bg-[#14171c] px-4 py-3 text-left text-sm font-semibold text-white transition-colors hover:border-brand-gold/40";
  const shown = (friends ?? []).filter((f) => f.name.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div className="fixed inset-0 z-[150] flex items-end justify-center bg-black/75 backdrop-blur-sm md:items-center" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88dvh] w-full max-w-md space-y-2.5 overflow-y-auto rounded-t-3xl border border-[#333] bg-[#1a1d24] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-white shadow-2xl md:rounded-3xl"
      >
        <div className="mb-1 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-bold">{isEn ? "Share" : "Bagikan"}</h3>
            <p className="truncate text-xs text-brand-muted">{title} · {subtitle}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={isEn ? "Close" : "Tutup"} className="rounded-full p-1.5 text-gray-400 hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 1. Thought di Beranda */}
        {!thoughtOpen ? (
          <button type="button" onClick={() => setThoughtOpen(true)} className={row}>
            <BookOpenText className="h-5 w-5 text-brand-gold" /> {isEn ? "Share to Thought on Home" : "Bagikan ke Thought di Beranda"}
          </button>
        ) : (
          <div className="space-y-2 rounded-xl border border-brand-gold/35 bg-[#14171c] p-3">
            <textarea
              value={thoughtText}
              onChange={(e) => setThoughtText(e.target.value)}
              rows={3}
              maxLength={450}
              placeholder={isEn ? "Write a short recommendation..." : "Tulis rekomendasi singkatmu..."}
              className="w-full rounded-lg border border-[#333] bg-[#0f1216] px-3 py-2 text-xs text-white focus:border-brand-gold focus:outline-none"
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => setThoughtOpen(false)} className="flex-1 rounded-lg border border-[#333] py-2 text-xs font-semibold text-brand-light">
                {isEn ? "Cancel" : "Batal"}
              </button>
              <button
                type="button"
                onClick={() => void postThought()}
                disabled={busy === "thought"}
                className="flex-1 rounded-lg bg-brand-gold py-2 text-xs font-bold text-brand-dark disabled:opacity-60"
              >
                {busy === "thought" ? (isEn ? "Posting…" : "Mengirim…") : (isEn ? "Post to Thought" : "Posting ke Thought")}
              </button>
            </div>
          </div>
        )}

        {/* 2. WhatsApp */}
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${url}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={row}
        >
          <MessageCircle className="h-5 w-5 text-emerald-400" /> {isEn ? "Share to WhatsApp" : "Bagikan ke WhatsApp"}
        </a>

        {/* Copy & Native Share */}
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => void copyLink()} className={row}>
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-brand-gold" />}
            <span className="text-xs">{copied ? (isEn ? "Copied!" : "Tersalin!") : (isEn ? "Copy link" : "Salin tautan")}</span>
          </button>
          {canNative && (
            <button type="button" onClick={() => void nativeShare()} className={row}>
              <Send className="h-4 w-4 text-brand-gold" />
              <span className="text-xs">{isEn ? "Other apps" : "Aplikasi lain"}</span>
            </button>
          )}
        </div>

        {note && (
          <p className="flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-2 text-xs text-emerald-300">
            <Check className="h-3.5 w-3.5" /> {note}
          </p>
        )}
        {error && (
          <p className="rounded-lg bg-red-500/15 px-3 py-2 text-xs text-red-300">{error}</p>
        )}

        {/* 3. In-app Chat to a friend */}
        <div className="pt-2">
          <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-muted">
            <UserRound className="h-4 w-4" /> {isEn ? "Send to a friend's Chat" : "Kirim ke Chat teman"}
          </p>
          {friends === null && <p className="py-3 text-center text-xs text-brand-muted">{isEn ? "Loading friends…" : "Memuat teman…"}</p>}
          {friends !== null && friends.length === 0 && (
            <p className="rounded-xl bg-white/5 p-3 text-xs text-brand-muted">
              Belum ada teman di Ruang Iman. Tambah teman di menu Koneksi, atau bagikan lewat WhatsApp.
            </p>
          )}
          {friends !== null && friends.length > 0 && (
            <>
              <div className="relative mb-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Cari teman"
                  className="w-full rounded-lg border border-[#333] bg-[#14171c] py-2 pl-9 pr-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                />
              </div>
              <div className="max-h-52 space-y-1 overflow-y-auto">
                {shown.map((f) => {
                  const isSent = sent.has(f.id);
                  return (
                    <div key={f.id} className="flex items-center justify-between gap-2 rounded-xl px-2 py-1.5 hover:bg-white/5">
                      <div className="flex min-w-0 items-center gap-2.5">
                        {f.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={f.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold/20 text-xs font-bold text-brand-gold">
                            {f.name[0]?.toUpperCase()}
                          </span>
                        )}
                        <span className="truncate text-xs font-medium text-white">{f.name}</span>
                      </div>
                      <button
                        type="button"
                        disabled={isSent || busy === f.id}
                        onClick={() => void sendToFriend(f)}
                        className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-bold transition ${
                          isSent
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-brand-gold text-brand-dark hover:bg-brand-gold-hover disabled:opacity-50"
                        }`}
                      >
                        {isSent ? "Terkirim ✓" : busy === f.id ? "…" : "Kirim"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
