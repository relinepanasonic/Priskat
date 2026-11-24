"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookmarkCheck, Camera, ChevronLeft, ChevronRight, Download, ImagePlus, Loader2, Share2, Tag, Trash2, X, Search, Lock } from "lucide-react";
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";
import { photoUrl, type AlbumPerson, type AlbumPhoto, type AlbumTag } from "@/lib/albumPhoto";
import { formatWeekdayDate } from "@/lib/utils";
import AlbumShare from "@/components/album/AlbumShare";

type Props = {
  event: { id: string; title: string; date: string };
  me: string; isAdmin: boolean; isAttendee: boolean; open: boolean;
  initialPhotos: AlbumPhoto[]; initialTags: AlbumTag[]; people: AlbumPerson[]; initialCover: string | null; openPhoto: string | null;
};

/**
 * The album of one event. Camera and upload buttons while the event is on; a grid of everyone's photos;
 * a viewer to tag people (tap the picture, like Instagram), make a photo my album cover, share it or save it.
 */
export default function AlbumClient({ event, me, isAdmin, isAttendee, open, initialPhotos, initialTags, people, initialCover, openPhoto }: Props) {
  const db = () => createClient() as any;
  const [photos, setPhotos] = useState(initialPhotos);
  const [tags, setTags] = useState(initialTags);
  const [cover, setCover] = useState(initialCover);
  const [view, setView] = useState<string | null>(openPhoto && initialPhotos.some((p) => p.id === openPhoto) ? openPhoto : null);
  const [busy, setBusy] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [tagMode, setTagMode] = useState(false);
  const [pending, setPending] = useState<{ x: number; y: number } | null>(null);
  const [q, setQ] = useState("");
  const [sharing, setSharing] = useState(false);
  const camera = useRef<HTMLInputElement>(null);
  const gallery = useRef<HTMLInputElement>(null);

  const nameOf = useMemo(() => {
    const m = new Map(people.map((p) => [p.user_id, p.name]));
    return (id: string) => m.get(id) ?? "Peserta";
  }, [people]);

  const index = view ? photos.findIndex((p) => p.id === view) : -1;
  const photo = index >= 0 ? photos[index] : null;
  const photoTags = photo ? tags.filter((t) => t.photo_id === photo.id) : [];
  const canAdd = isAttendee && open;

  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2200); return () => clearTimeout(t); }, [toast]);
  useEffect(() => { setTagMode(false); setPending(null); setQ(""); }, [view]);

  async function addFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setError(null);
    const list = Array.from(files).slice(0, 30);
    let done = 0;
    for (const file of list) {
      setProgress(`Mengunggah ${done + 1} dari ${list.length}…`);
      try {
        const small = await imageCompression(file, { maxSizeMB: 1.2, maxWidthOrHeight: 1600, useWebWorker: true, fileType: "image/webp" });
        const path = `${event.id}/${crypto.randomUUID()}.webp`;
        const up = await db().storage.from("event-photos").upload(path, small, { contentType: "image/webp" });
        if (up.error) throw new Error(open ? "Foto belum bisa diunggah. Coba lagi." : "Album sudah ditutup untuk foto baru.");
        const { data, error: e } = await db().from("event_photos").insert({ event_id: event.id, uploader_id: me, path }).select("id, event_id, uploader_id, path, created_at").single();
        if (e || !data) { await db().storage.from("event-photos").remove([path]); throw new Error("Foto belum tersimpan."); }
        setPhotos((p) => [data as AlbumPhoto, ...p]);
        done++;
      } catch (err) {
        setError((err as Error).message);
        break;
      }
    }
    setProgress(null);
    if (done) setToast(done === 1 ? "Foto ditambahkan" : `${done} foto ditambahkan`);
    if (camera.current) camera.current.value = "";
    if (gallery.current) gallery.current.value = "";
  }

  async function makeCover() {
    if (!photo) return;
    setBusy("cover");
    const { error: e } = await db().from("event_album_prefs").upsert({ event_id: event.id, user_id: me, cover_photo_id: photo.id }, { onConflict: "event_id,user_id" });
    setBusy(null);
    if (e) { setError("Sampul belum tersimpan."); return; }
    setCover(photo.id);
    setToast("Jadi sampul albumku");
  }

  async function removePhoto() {
    if (!photo) return;
    if (!confirm("Hapus foto ini dari album? Ini tidak bisa dibatalkan.")) return;
    setBusy("delete");
    const { error: e } = await db().from("event_photos").delete().eq("id", photo.id);
    if (!e) await db().storage.from("event-photos").remove([photo.path]);
    setBusy(null);
    if (e) { setError("Foto belum bisa dihapus."); return; }
    const next = photos[index + 1] ?? photos[index - 1] ?? null;
    setPhotos((p) => p.filter((x) => x.id !== photo.id));
    setTags((t) => t.filter((x) => x.photo_id !== photo.id));
    if (cover === photo.id) setCover(null);
    setView(next ? next.id : null);
  }

  function tapImage(e: React.MouseEvent<HTMLDivElement>) {
    if (!tagMode) return;
    const r = e.currentTarget.getBoundingClientRect();
    setPending({ x: Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)), y: Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100)) });
    setQ("");
  }

  async function tagPerson(p: AlbumPerson) {
    if (!photo || !pending) return;
    setBusy("tag");
    const row = { photo_id: photo.id, user_id: p.user_id, x: Math.round(pending.x * 10) / 10, y: Math.round(pending.y * 10) / 10, tagged_by: me };
    const { error: e } = await db().from("event_photo_tags").upsert(row, { onConflict: "photo_id,user_id" });
    setBusy(null);
    if (e) { setError("Tag belum tersimpan."); return; }
    setTags((t) => [...t.filter((x) => !(x.photo_id === photo.id && x.user_id === p.user_id)), row]);
    setPending(null);
    setToast(`${p.name} ditandai`);
  }

  async function untag(t: AlbumTag) {
    const { error: e } = await db().from("event_photo_tags").delete().eq("photo_id", t.photo_id).eq("user_id", t.user_id);
    if (e) { setError("Tag belum bisa dihapus."); return; }
    setTags((all) => all.filter((x) => !(x.photo_id === t.photo_id && x.user_id === t.user_id)));
  }

  async function save() {
    if (!photo) return;
    try {
      const blob = await (await fetch(photoUrl(photo.path))).blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${event.title.replace(/[^\w]+/g, "-").toLowerCase()}-${photo.id.slice(0, 6)}.webp`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    } catch { setError("Foto belum bisa disimpan."); }
  }

  const taggable = people.filter((p) => !photoTags.some((t) => t.user_id === p.user_id) && p.name.toLowerCase().includes(q.trim().toLowerCase()));
  const mine = (p: AlbumPhoto) => p.uploader_id === me;

  return (
    <div className="mx-auto w-full max-w-3xl px-3 pb-10 pt-4 md:px-6">
      <Link href="/album" className="mb-3 inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-white"><ArrowLeft className="h-4 w-4" /> Semua album</Link>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-white">{event.title}</h1>
        <p className="text-xs text-brand-muted">{formatWeekdayDate(event.date)} · {photos.length} foto</p>
      </div>

      {canAdd ? (
        <div className="mb-4 grid grid-cols-2 gap-2.5">
          <button onClick={() => camera.current?.click()} disabled={!!progress} className="flex items-center justify-center gap-2 rounded-xl bg-brand-gold py-3.5 text-sm font-bold text-brand-dark disabled:opacity-60"><Camera className="h-5 w-5" /> Kamera</button>
          <button onClick={() => gallery.current?.click()} disabled={!!progress} className="flex items-center justify-center gap-2 rounded-xl border border-brand-gold/50 py-3.5 text-sm font-bold text-brand-gold hover:bg-brand-gold/10 disabled:opacity-60"><ImagePlus className="h-5 w-5" /> Unggah foto</button>
          <input ref={camera} type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => void addFiles(e.target.files)} />
          <input ref={gallery} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => void addFiles(e.target.files)} />
        </div>
      ) : (
        <p className="mb-4 flex items-start gap-2 rounded-xl border border-[#2a2d35] bg-[#14171c] p-3 text-xs leading-relaxed text-brand-muted">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" />
          {!isAttendee ? "Album ini untuk peserta event." : "Foto baru hanya bisa ditambahkan selama event berlangsung. Kamu tetap bisa melihat, menandai, dan membagikan foto di sini."}
        </p>
      )}
      {progress && <p className="mb-3 flex items-center gap-2 rounded-xl bg-brand-gold/10 px-3 py-2 text-xs font-semibold text-brand-gold"><Loader2 className="h-4 w-4 animate-spin" /> {progress}</p>}
      {error && <p className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}

      {photos.length === 0 ? (
        <p className="rounded-2xl border border-[#2a2d35] bg-[#14171c] px-6 py-12 text-center text-sm text-brand-muted">Belum ada foto. Jadi yang pertama mengabadikan momen ini.</p>
      ) : (
        <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
          {photos.map((p) => (
            <button key={p.id} onClick={() => setView(p.id)} className="relative aspect-square overflow-hidden rounded-md bg-[#14171c]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoUrl(p.path)} alt="" loading="lazy" className="h-full w-full object-cover" />
              {cover === p.id && <span className="absolute left-1 top-1 rounded-full bg-brand-gold p-1 text-brand-dark"><BookmarkCheck className="h-3 w-3" /></span>}
              {tags.some((t) => t.photo_id === p.id && t.user_id === me) && <span className="absolute bottom-1 right-1 rounded-full bg-black/70 p-1 text-white"><Tag className="h-3 w-3" /></span>}
            </button>
          ))}
        </div>
      )}

      {toast && <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[160] flex justify-center px-4"><span className="rounded-full bg-black/85 px-4 py-2 text-xs font-semibold text-white shadow-lg">{toast}</span></div>}

      {/* the viewer */}
      {photo && (
        <div className="fixed inset-0 z-[130] flex flex-col bg-black">
          <div className="flex items-center justify-between gap-2 px-3 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
            <button onClick={() => setView(null)} aria-label="Tutup" className="rounded-full bg-white/10 p-2 text-white"><X className="h-5 w-5" /></button>
            <p className="min-w-0 truncate text-xs text-gray-300">{index + 1} / {photos.length} · oleh {nameOf(photo.uploader_id)}</p>
            <span className="w-9" />
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-2">
            {index > 0 && <button onClick={() => setView(photos[index - 1].id)} aria-label="Sebelumnya" className="absolute left-1 z-10 rounded-full bg-black/50 p-2 text-white"><ChevronLeft className="h-6 w-6" /></button>}
            <div onClick={tapImage} className={`relative inline-block max-h-full max-w-full ${tagMode ? "cursor-crosshair" : ""}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoUrl(photo.path)} alt="" className="block max-h-[68vh] w-auto max-w-full select-none object-contain" draggable={false} />
              {photoTags.map((t) => t.x != null && t.y != null && (
                <span key={t.user_id} style={{ left: `${t.x}%`, top: `${t.y}%` }} className="absolute z-10 -translate-x-1/2 -translate-y-1/2" onClick={(e) => e.stopPropagation()}>
                  <span className="flex items-center gap-1 rounded-full bg-black/80 px-2 py-1 text-[11px] font-semibold text-white ring-1 ring-brand-gold/60">
                    {nameOf(t.user_id)}
                    {(t.tagged_by === me || t.user_id === me || isAdmin) && <button onClick={() => void untag(t)} aria-label="Hapus tag" className="text-gray-400 hover:text-red-400"><X className="h-3 w-3" /></button>}
                  </span>
                </span>
              ))}
              {pending && <span style={{ left: `${pending.x}%`, top: `${pending.y}%` }} className="absolute z-10 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-brand-gold bg-brand-gold/30" />}
            </div>
            {index < photos.length - 1 && <button onClick={() => setView(photos[index + 1].id)} aria-label="Berikutnya" className="absolute right-1 z-10 rounded-full bg-black/50 p-2 text-white"><ChevronRight className="h-6 w-6" /></button>}
          </div>

          {tagMode && !pending && <p className="px-4 pt-2 text-center text-xs text-brand-gold">Ketuk di foto untuk menandai seseorang</p>}

          <div className="grid grid-cols-5 gap-1 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 text-[10px] font-semibold text-gray-200">
            <button onClick={() => setTagMode((v) => !v)} className={`flex flex-col items-center gap-1 rounded-xl py-2 ${tagMode ? "bg-brand-gold text-brand-dark" : "bg-white/10"}`}><Tag className="h-5 w-5" /> Tag</button>
            <button onClick={makeCover} disabled={busy === "cover" || cover === photo.id} className="flex flex-col items-center gap-1 rounded-xl bg-white/10 py-2 disabled:opacity-50"><BookmarkCheck className="h-5 w-5" /> {cover === photo.id ? "Sampul" : "Jadikan sampul"}</button>
            <button onClick={() => setSharing(true)} className="flex flex-col items-center gap-1 rounded-xl bg-white/10 py-2"><Share2 className="h-5 w-5" /> Bagikan</button>
            <button onClick={save} className="flex flex-col items-center gap-1 rounded-xl bg-white/10 py-2"><Download className="h-5 w-5" /> Simpan</button>
            {(mine(photo) || isAdmin) ? (
              <button onClick={removePhoto} disabled={busy === "delete"} className="flex flex-col items-center gap-1 rounded-xl bg-white/10 py-2 text-red-300 disabled:opacity-50"><Trash2 className="h-5 w-5" /> Hapus</button>
            ) : <span />}
          </div>

          {/* who to tag */}
          {pending && (
            <div className="absolute inset-0 z-20 flex items-end bg-black/60" onClick={() => setPending(null)}>
              <div onClick={(e) => e.stopPropagation()} className="max-h-[70vh] w-full space-y-2 overflow-y-auto rounded-t-3xl border border-[#333] bg-[#1a1d24] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-white">Siapa ini?</p>
                  <button onClick={() => setPending(null)} aria-label="Batal" className="rounded-full p-1.5 text-gray-400 hover:bg-white/10"><X className="h-5 w-5" /></button>
                </div>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
                  <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama" className="w-full rounded-lg border border-[#333] bg-[#14171c] py-2.5 pl-9 pr-3 text-sm text-white focus:border-brand-gold focus:outline-none" />
                </div>
                {taggable.length === 0 && <p className="py-3 text-center text-xs text-brand-muted">Tidak ada nama yang cocok.</p>}
                {taggable.map((p) => (
                  <button key={p.user_id} onClick={() => void tagPerson(p)} disabled={busy === "tag"} className="flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left hover:bg-white/5 disabled:opacity-60">
                    {p.avatar_url
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={p.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                      : <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gold/20 text-sm font-bold text-brand-gold">{p.name[0]?.toUpperCase()}</span>}
                    <span className="min-w-0 flex-1 truncate text-sm text-white">{p.name}{p.user_id === me ? " (aku)" : ""}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {sharing && <AlbumShare url={photoUrl(photo.path)} eventTitle={event.title} onClose={() => setSharing(false)} />}
        </div>
      )}
    </div>
  );
}
