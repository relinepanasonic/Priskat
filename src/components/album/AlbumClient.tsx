"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookmarkCheck,
  Camera,
  ChevronLeft,
  ChevronRight,
  Download,
  ImagePlus,
  Loader2,
  Lock,
  ScanEye,
  Search,
  Share2,
  Sparkles,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";
import { photoUrl, type AlbumPerson, type AlbumPhoto, type AlbumTag } from "@/lib/albumPhoto";
import { measureSharpness } from "@/lib/blurDetect";
import { formatWeekdayDate } from "@/lib/utils";
import AlbumShare from "@/components/album/AlbumShare";

type Props = {
  event: { id: string; title: string; date: string };
  me: string; isAdmin: boolean; isAttendee: boolean; open: boolean;
  initialPhotos: AlbumPhoto[]; initialTags: AlbumTag[]; people: AlbumPerson[]; initialCover: string | null; openPhoto: string | null;
};

const AUTO_BLUR_KEY = "album-auto-blur-v1";

/**
 * The album of one event. Camera during the event, gallery uploads any time; automatic blur detection & removal
 * keeps the album sharp; Instagram-style tap-to-tag, custom cover, share or download.
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

  // Automatic blur filter (on by default) + existing-album blur scanner
  const [autoBlur, setAutoBlur] = useState(true);
  const [rejectedBlur, setRejectedBlur] = useState<{ file: File; score: number }[]>([]);
  const [blurryIds, setBlurryIds] = useState<Map<string, number>>(new Map());
  const [scanDone, setScanDone] = useState(false);

  const camera = useRef<HTMLInputElement>(null);
  const gallery = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTO_BLUR_KEY);
      if (saved === "0") setAutoBlur(false);
    } catch { /* ignore */ }
  }, []);

  function toggleAutoBlur() {
    setAutoBlur((prev) => {
      const next = !prev;
      try { localStorage.setItem(AUTO_BLUR_KEY, next ? "1" : "0"); } catch { /* ignore */ }
      return next;
    });
  }

  const nameOf = useMemo(() => {
    const m = new Map(people.map((p) => [p.user_id, p.name]));
    return (id: string) => m.get(id) ?? "Peserta";
  }, [people]);

  const index = view ? photos.findIndex((p) => p.id === view) : -1;
  const photo = index >= 0 ? photos[index] : null;
  const photoTags = photo ? tags.filter((t) => t.photo_id === photo.id) : [];
  const canUpload = isAttendee; // from the phone gallery: any time
  const canCamera = isAttendee && open; // the camera: only while the event is on

  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2600); return () => clearTimeout(t); }, [toast]);
  useEffect(() => { setTagMode(false); setPending(null); setQ(""); }, [view]);

  async function uploadSingle(file: File): Promise<AlbumPhoto> {
    const small = await imageCompression(file, {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1600,
      initialQuality: 0.75,
      useWebWorker: true,
      fileType: "image/webp",
    });
    const path = `${event.id}/${crypto.randomUUID()}.webp`;
    const up = await db().storage.from("event-photos").upload(path, small, { contentType: "image/webp" });
    if (up.error) throw new Error("Foto belum bisa diunggah. Coba lagi.");
    const { data, error: e } = await db()
      .from("event_photos")
      .insert({ event_id: event.id, uploader_id: me, path })
      .select("id, event_id, uploader_id, path, created_at")
      .single();
    if (e || !data) {
      await db().storage.from("event-photos").remove([path]);
      throw new Error("Foto belum tersimpan.");
    }
    return data as AlbumPhoto;
  }

  async function addFiles(files: FileList | null, skipBlurCheck = false) {
    if (!files || !files.length) return;
    setError(null);
    if (!skipBlurCheck) setRejectedBlur([]);
    const list = Array.from(files).slice(0, 30);
    let done = 0;
    const skipped: { file: File; score: number }[] = [];

    for (let i = 0; i < list.length; i++) {
      const file = list[i];
      try {
        if (autoBlur && !skipBlurCheck) {
          setProgress(`Memeriksa ketajaman foto ${i + 1} dari ${list.length}…`);
          const res = await measureSharpness(file);
          if (res.blurry) {
            skipped.push({ file, score: res.score });
            continue;
          }
        }
        setProgress(`Mengunggah ${done + 1} dari ${list.length - skipped.length}…`);
        const saved = await uploadSingle(file);
        setPhotos((p) => [saved, ...p]);
        done++;
      } catch (err) {
        setError((err as Error).message);
        break;
      }
    }

    setProgress(null);
    if (skipped.length) setRejectedBlur(skipped);
    if (done && skipped.length) {
      setToast(`${done} foto disimpan · ${skipped.length} foto buram otomatis dihapus`);
    } else if (done) {
      setToast(done === 1 ? "Foto ditambahkan" : `${done} foto ditambahkan`);
    } else if (skipped.length) {
      setToast(
        skipped.length === 1
          ? "Foto terdeteksi buram dan otomatis dihapus"
          : `${skipped.length} foto buram otomatis dihapus`,
      );
    }
    if (camera.current) camera.current.value = "";
    if (gallery.current) gallery.current.value = "";
  }

  async function keepRejectedBlurry() {
    if (rejectedBlur.length === 0) return;
    const toKeep = rejectedBlur;
    setRejectedBlur([]);
    let done = 0;
    for (let i = 0; i < toKeep.length; i++) {
      setProgress(`Mengunggah ${i + 1} dari ${toKeep.length}…`);
      try {
        const saved = await uploadSingle(toKeep[i].file);
        setPhotos((p) => [saved, ...p]);
        done++;
      } catch (err) {
        setError((err as Error).message);
        break;
      }
    }
    setProgress(null);
    if (done) setToast(done === 1 ? "Foto tetap diunggah" : `${done} foto tetap diunggah`);
  }

  /** Scan existing photos in the album (all for admins, own photos for attendees) and auto-flag blurry ones. */
  async function scanAlbumForBlur() {
    const targets = isAdmin ? photos : photos.filter((p) => p.uploader_id === me);
    if (targets.length === 0) {
      setToast("Belum ada foto milikmu untuk diperiksa.");
      return;
    }
    setError(null);
    setScanDone(false);
    const found = new Map<string, number>();
    for (let i = 0; i < targets.length; i++) {
      setProgress(`Memeriksa ketajaman album ${i + 1} / ${targets.length}…`);
      const res = await measureSharpness(photoUrl(targets[i].path));
      if (res.blurry) found.set(targets[i].id, res.score);
    }
    setProgress(null);
    setBlurryIds(found);
    setScanDone(true);
    if (found.size === 0) {
      setToast("Semua foto terlihat tajam ✨");
    } else {
      setToast(`Ditemukan ${found.size} foto buram`);
    }
  }

  async function deleteAllBlurry() {
    if (blurryIds.size === 0) return;
    const targets = photos.filter((p) => blurryIds.has(p.id));
    if (targets.length === 0) return;
    setBusy("clean-blur");
    setError(null);
    let removed = 0;
    const removedIds = new Set<string>();
    const paths: string[] = [];

    for (let i = 0; i < targets.length; i++) {
      setProgress(`Menghapus foto buram ${i + 1} / ${targets.length}…`);
      const { error: e } = await db().from("event_photos").delete().eq("id", targets[i].id);
      if (!e) {
        removedIds.add(targets[i].id);
        paths.push(targets[i].path);
        removed++;
      }
    }
    if (paths.length) {
      await db().storage.from("event-photos").remove(paths);
    }

    setPhotos((prev) => prev.filter((p) => !removedIds.has(p.id)));
    setTags((prev) => prev.filter((t) => !removedIds.has(t.photo_id)));
    if (cover && removedIds.has(cover)) setCover(null);
    setBlurryIds(new Map());
    setScanDone(false);
    setProgress(null);
    setBusy(null);
    setToast(`${removed} foto buram dihapus dari album`);
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
  const canScanAny = isAdmin ? photos.length > 0 : photos.some(mine);

  return (
    <div className="mx-auto w-full max-w-3xl px-3 pb-10 pt-4 md:px-6">
      <Link href="/album" className="mb-3 inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-white"><ArrowLeft className="h-4 w-4" /> Semua album</Link>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">{event.title}</h1>
          <p className="text-xs text-brand-muted">{formatWeekdayDate(event.date)} · {photos.length} foto</p>
        </div>
        {canScanAny && (
          <button
            type="button"
            onClick={() => void scanAlbumForBlur()}
            disabled={!!progress || busy === "clean-blur"}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-[#14171c] px-3 py-2 text-xs font-semibold text-brand-light transition hover:border-brand-gold/40 hover:text-white disabled:opacity-50"
          >
            <ScanEye className="h-3.5 w-3.5 text-brand-gold" />
            Cek Foto Buram
          </button>
        )}
      </div>

      {canUpload ? (
        <>
          <div className="mb-2.5 grid grid-cols-2 gap-2.5">
            <button onClick={() => camera.current?.click()} disabled={!!progress || !canCamera} className="flex items-center justify-center gap-2 rounded-xl bg-brand-gold py-3.5 text-sm font-bold text-brand-dark disabled:opacity-40"><Camera className="h-5 w-5" /> Kamera</button>
            <button onClick={() => gallery.current?.click()} disabled={!!progress} className="flex items-center justify-center gap-2 rounded-xl border border-brand-gold/50 py-3.5 text-sm font-bold text-brand-gold hover:bg-brand-gold/10 disabled:opacity-60"><ImagePlus className="h-5 w-5" /> Unggah foto</button>
            <input ref={camera} type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => void addFiles(e.target.files)} />
            <input ref={gallery} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => void addFiles(e.target.files)} />
          </div>

          {/* Auto-filter blurry photos toggle */}
          <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-[#2a2d35] bg-[#14171c] px-3.5 py-2.5">
            <div className="flex items-center gap-2 text-xs">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-brand-gold" />
              <span className="text-brand-light">Auto-hapus foto buram saat memotret / unggah</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={autoBlur}
              onClick={toggleAutoBlur}
              className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${autoBlur ? "bg-brand-gold" : "bg-[#333]"}`}
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${autoBlur ? "left-[18px]" : "left-0.5"}`} />
            </button>
          </div>

          {!canCamera && <p className="mb-4 flex items-start gap-2 text-[11px] leading-relaxed text-brand-muted"><Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-gold" /> Kamera hanya aktif selama event berlangsung. Foto dari galeri HP tetap bisa diunggah kapan saja.</p>}
        </>
      ) : (
        <p className="mb-4 flex items-start gap-2 rounded-xl border border-[#2a2d35] bg-[#14171c] p-3 text-xs leading-relaxed text-brand-muted">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" />
          Album ini untuk peserta event.
        </p>
      )}

      {/* Rejected blurry photos notice with optional override */}
      {rejectedBlur.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-500/35 bg-amber-500/10 px-3.5 py-2.5 text-xs">
          <span className="text-amber-200">
            <b>{rejectedBlur.length} foto buram</b> otomatis dihapus agar album tetap tajam.
          </span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => void keepRejectedBlurry()} className="font-semibold text-brand-gold underline underline-offset-2">
              Tetap unggah
            </button>
            <button type="button" onClick={() => setRejectedBlur([])} aria-label="Tutup" className="text-amber-200/70 hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Existing album scan results banner */}
      {scanDone && blurryIds.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-500/35 bg-red-500/10 px-3.5 py-3 text-xs">
          <span className="text-red-200">
            Ditemukan <b>{blurryIds.size} foto buram</b> di album ini (ditandai badge merah).
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void deleteAllBlurry()}
              disabled={busy === "clean-blur"}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 font-bold text-white transition hover:bg-red-600 disabled:opacity-60"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Hapus Semua ({blurryIds.size})
            </button>
            <button
              type="button"
              onClick={() => { setBlurryIds(new Map()); setScanDone(false); }}
              className="rounded-lg border border-white/15 px-2.5 py-1.5 text-gray-300 hover:text-white"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {progress && <p className="mb-3 flex items-center gap-2 rounded-xl bg-brand-gold/10 px-3 py-2 text-xs font-semibold text-brand-gold"><Loader2 className="h-4 w-4 animate-spin" /> {progress}</p>}
      {error && <p className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}

      {photos.length === 0 ? (
        <p className="rounded-2xl border border-[#2a2d35] bg-[#14171c] px-6 py-12 text-center text-sm text-brand-muted">Belum ada foto. Jadi yang pertama mengabadikan momen ini.</p>
      ) : (
        <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
          {photos.map((p) => {
            const isBlurry = blurryIds.has(p.id);
            return (
              <button
                key={p.id}
                onClick={() => setView(p.id)}
                className={`relative aspect-square overflow-hidden rounded-md bg-[#14171c] ${isBlurry ? "ring-2 ring-red-500" : ""}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoUrl(p.path)} alt="" loading="lazy" className="h-full w-full object-cover" />
                {cover === p.id && <span className="absolute left-1 top-1 rounded-full bg-brand-gold p-1 text-brand-dark"><BookmarkCheck className="h-3 w-3" /></span>}
                {isBlurry && (
                  <span className="absolute right-1 top-1 rounded-full bg-red-600/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow">
                    Buram
                  </span>
                )}
                {tags.some((t) => t.photo_id === p.id && t.user_id === me) && <span className="absolute bottom-1 right-1 rounded-full bg-black/70 p-1 text-white"><Tag className="h-3 w-3" /></span>}
              </button>
            );
          })}
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
