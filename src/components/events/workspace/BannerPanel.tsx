"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, ImagePlus, Loader2, Megaphone, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { uploadImage, storagePath } from "@/lib/upload";
import { registerLink, rupiah } from "@/lib/eventReg";
import { BANNER_OFFERS } from "@/lib/bannerPrices";
import { formatDate } from "@/lib/utils";
import { useEventData } from "./useEventData";
import { inputCls } from "./ui";

type Banner = { id: string; image_url: string; title: string | null; link_url: string | null; is_active: boolean };
type Req = { id: string; kind: string; price: number; status: string; created_at: string };

const db = () => createClient() as any;
const STATUS: Record<string, string> = { new: "Menunggu tim Ruang Iman", processing: "Sedang diproses", done: "Selesai", cancelled: "Dibatalkan" };

/** Banner di Aplikasi: one free banner per event in the app's promotional strip, and requests for more. */
export default function BannerPanel({ eventId }: { eventId: string }) {
  const { event, settings } = useEventData(eventId);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [reqs, setReqs] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState("");
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    const [b, r] = await Promise.all([
      db().from("premium_banners").select("id, image_url, title, link_url, is_active").eq("event_id", eventId).limit(1).maybeSingle(),
      db().from("event_banner_requests").select("id, kind, price, status, created_at").eq("event_id", eventId).order("created_at", { ascending: false }).limit(10),
    ]);
    setBanner((b.data as Banner) ?? null);
    setReqs((r.data as Req[]) ?? []);
    setLoading(false);
  }, [eventId]);
  useEffect(() => { void load(); }, [load]);

  const regLink = settings?.slug || settings?.public_code ? registerLink((settings?.slug || settings?.public_code) as string) : "";

  async function upload(file: File) {
    setUploading(true); setMsg(null);
    try {
      const { data: { user } } = await createClient().auth.getUser();
      if (!user) throw new Error("Masuk lagi untuk mengunggah.");
      setImage(await uploadImage(file, "event-banners", storagePath(user.id, `app-${file.name}`)));
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message || "Gambar belum bisa diunggah." });
    } finally {
      setUploading(false);
    }
  }

  async function create() {
    setBusy(true); setMsg(null);
    const { error } = await db().rpc("create_event_banner", { p_event: eventId, p_image: image, p_title: title || event?.title || "", p_link: link || regLink });
    setBusy(false);
    if (error) { setMsg({ ok: false, text: error.message }); return; }
    setImage(""); setTitle(""); setLink("");
    setMsg({ ok: true, text: "Banner dibuat. Sekarang tayang di Event, bagian Sedang dipromosikan." });
    await load();
  }

  async function manage(action: "on" | "off" | "delete") {
    if (!banner) return;
    if (action === "delete" && !confirm("Hapus banner ini? Jatah banner gratis event ini kembali.")) return;
    setBusy(true); setMsg(null);
    const { error } = await db().rpc("manage_event_banner", { p_banner: banner.id, p_action: action });
    setBusy(false);
    if (error) { setMsg({ ok: false, text: error.message }); return; }
    await load();
  }

  async function request(kind: string) {
    setBusy(true); setMsg(null);
    try {
      const res = await fetch("/api/camp/banner-request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: eventId, kind }) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error ?? "Permintaan belum terkirim.");
      setMsg({ ok: true, text: j.already ? "Permintaan ini sudah ada dan sedang ditunggu tim." : "Permintaan terkirim. Tim Ruang Iman menerima notifikasi dan akan menghubungimu." });
      await load();
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="py-6 text-center text-sm text-gray-500">Memuat...</p>;

  return (
    <div className="space-y-5">
      {/* the free banner */}
      <div className="space-y-3">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-gold"><Megaphone className="h-4 w-4" /> Banner gratis (1 per event)</p>
        {banner ? (
          <div className="space-y-3 rounded-xl border border-[#2a2d35] p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={banner.image_url} alt={banner.title ?? "Banner"} className="mx-auto aspect-[4/5] w-44 rounded-xl bg-black/30 object-cover" />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{banner.title || event?.title}</p>
                <p className={`text-xs font-semibold ${banner.is_active ? "text-emerald-300" : "text-gray-400"}`}>{banner.is_active ? "Tayang di Event" : "Dimatikan"}</p>
              </div>
              <div className="flex gap-2">
                <button disabled={busy} onClick={() => void manage(banner.is_active ? "off" : "on")} className="rounded-lg border border-[#333] px-3 py-2 text-xs font-semibold text-brand-light hover:bg-white/5 disabled:opacity-50">{banner.is_active ? "Matikan" : "Nyalakan"}</button>
                <button disabled={busy} onClick={() => void manage("delete")} aria-label="Hapus banner" className="rounded-lg border border-red-500/40 px-3 py-2 text-red-300 hover:bg-red-500/10 disabled:opacity-50"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 rounded-xl border border-dashed border-[#444] p-3.5">
            <p className="text-xs leading-relaxed text-brand-muted">Gambar potret 4:5 (mis. 1080 x 1350), sama seperti poster event. Tayang di bagian "Sedang dipromosikan" di Event untuk semua pengguna Ruang Iman.</p>
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="Banner" className="mx-auto aspect-[4/5] w-40 rounded-xl bg-black/30 object-cover" />
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#333] py-3 text-sm font-semibold text-brand-light hover:bg-white/5 ${uploading ? "opacity-60" : ""}`}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />} {uploading ? "Mengunggah..." : "Unggah gambar"}
                  <input type="file" accept="image/*" className="sr-only" disabled={uploading} onChange={(e) => { const x = e.target.files?.[0]; if (x) void upload(x); e.target.value = ""; }} />
                </label>
                {event?.banner_image_url && (
                  <button type="button" onClick={() => setImage(event.banner_image_url as string)} className="rounded-xl border border-[#333] py-3 text-sm font-semibold text-brand-light hover:bg-white/5">Pakai poster event</button>
                )}
              </div>
            )}
            {image && <button type="button" onClick={() => setImage("")} className="text-xs font-semibold text-red-300 underline">Ganti gambar</button>}
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder={`Judul (kosong = ${event?.title ?? "nama event"})`} className={inputCls} />
            <input value={link} onChange={(e) => setLink(e.target.value)} placeholder={regLink ? "Link tujuan (kosong = link pendaftaran)" : "Link tujuan (opsional)"} className={inputCls} />
            <button onClick={create} disabled={busy || !image} className="w-full rounded-xl bg-brand-gold py-3 text-sm font-bold text-brand-dark disabled:opacity-50">{busy ? "Membuat..." : "Buat banner gratis"}</button>
          </div>
        )}
      </div>

      {/* more promotion */}
      <div className="space-y-3 border-t border-[#2a2d35] pt-5">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-gold">Mau lebih banyak tayang?</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {BANNER_OFFERS.map((o) => (
            <div key={o.kind} className="flex flex-col justify-between gap-3 rounded-xl border border-[#2a2d35] p-3.5">
              <div>
                <p className="text-sm font-bold text-white">{o.label}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-brand-muted">{o.note}</p>
                <p className="mt-2 text-base font-bold text-brand-gold">{rupiah(o.price)}</p>
              </div>
              <button disabled={busy} onClick={() => void request(o.kind)} className="rounded-xl border border-brand-gold/50 py-2.5 text-sm font-bold text-brand-gold hover:bg-brand-gold/10 disabled:opacity-50">Ajukan</button>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-brand-muted">Setelah kamu menekan Ajukan, tim Ruang Iman menerima notifikasi dan menghubungimu untuk pembayaran dan pemasangan.</p>
        {reqs.length > 0 && (
          <ul className="divide-y divide-[#2a2d35] rounded-xl border border-[#2a2d35]">
            {reqs.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs">
                <span className="min-w-0 truncate text-brand-light">{BANNER_OFFERS.find((o) => o.kind === r.kind)?.label ?? r.kind} · {formatDate(r.created_at)}</span>
                <span className="shrink-0 font-semibold text-brand-gold">{STATUS[r.status] ?? r.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {msg && <p className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs ${msg.ok ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>{msg.ok && <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />}{msg.text}</p>}
    </div>
  );
}
