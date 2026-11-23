"use client";

import { useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  ImagePlus,
  Loader2,
  Megaphone,
  Newspaper,
  Trash2,
  X,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Link from "next/link";
import { CAMP_SERIES, EVENT_KINDS, isCampSeries } from "@/lib/campTypes";
import { Tent } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { uploadImage, storagePath } from "@/lib/upload";
import { promoteEvent, deleteEvent } from "@/app/actions/events";
import { formatDateTime } from "@/lib/utils";

type EventRow = {
  id: string;
  title: string;
  description: string;
  event_date: string;
  end_date: string | null;
  location: string;
  maps_url: string | null;
  banner_image_url: string | null;
  status: string;
  created_at: string;
  event_type?: string | null;
};

/** A camp (camp_cohorts) that has no event of its own; shown in the same list. */
export type CampCard = {
  id: string;
  branch: string | null;
  camp_name: string | null;
  angkatan: string | null;
  custom_name: string | null;
  start_date: string | null;
  banner_url: string | null;
};

const fmt = (iso: string) => formatDateTime(iso);

// Standard promo poster: Instagram portrait.
const POSTER_W = 1080;
const POSTER_H = 1350; // 4:5

export default function CommunityEventsPanel({
  initialEvents,
  communityId = null,
  camps,
}: {
  initialEvents: EventRow[];
  communityId?: string | null;
  /** Camp Directory communities: camps are listed with the events, in one list */
  camps?: CampCard[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [opening, setOpening] = useState<string | null>(null);
  const m0 = pathname.match(/^\/(admin\/communities|camp)\/([^/]+)\//);
  const campBase = m0?.[1] === "camp" ? `/camp/${m0[2]}/ongoing` : `/admin/communities/${m0?.[2] ?? ""}/promotion/workspace`;

  // Open the event's workspace (made the first time): crew, to do, meetings, chat and Keuangan
  async function openWorkspace(eventId: string) {
    setOpening(eventId);
    const { data, error } = await createClient().rpc("event_workspace", { p_event: eventId });
    setOpening(null);
    if (error || !data) { alert(error?.message ?? "Workspace tidak bisa dibuka. Jalankan 120_event_workspace.sql dulu."); return; }
    const m = pathname.match(/^\/(admin\/communities|camp)\/([^/]+)\//);
    router.push(m?.[1] === "camp" ? `/camp/${m[2]}/ongoing/${data}` : `/admin/communities/${m?.[2] ?? ""}/promotion/workspace/${data}`);
  }
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // form
  const [banner, setBanner] = useState("");
  const [uploading, setUploading] = useState(false);
  const [sizeNote, setSizeNote] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");
  const [pushNews, setPushNews] = useState(true);
  const [eventType, setEventType] = useState<string>("Camp");
  const [campName, setCampName] = useState<string>(CAMP_SERIES[0]);
  const [angkatan, setAngkatan] = useState("");
  // Camp with a known name: the name (and Angkatan) is the title; otherwise the typed name is
  const campNamed = eventType === "Camp" && campName !== "Other";
  const finalTitle = campNamed ? `${campName}${angkatan.trim() ? " " + angkatan.trim() : ""}` : title.trim();
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setBanner("");
    setSizeNote(null);
    setTitle("");
    setEventType("Camp");
    setCampName(CAMP_SERIES[0]);
    setAngkatan("");
    setDescription("");
    setEventDate("");
    setEndDate("");
    setLocation("");
    setCity("");
    setMapsUrl("");
    setPushNews(true);
    setError(null);
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    setSizeNote(null);

    // soft check against the 4:5 (1080x1350) standard
    try {
      const dims = await new Promise<{ w: number; h: number }>(
        (resolve, reject) => {
          const img = new window.Image();
          img.onload = () =>
            resolve({ w: img.naturalWidth, h: img.naturalHeight });
          img.onerror = reject;
          img.src = URL.createObjectURL(file);
        }
      );
      const ratio = dims.w / dims.h;
      const target = POSTER_W / POSTER_H; // 0.8
      if (Math.abs(ratio - target) > 0.06) {
        setSizeNote(
          `This image is ${dims.w}×${dims.h}. Posters look best at ${POSTER_W}×${POSTER_H} (4:5 portrait) — it will be cropped to fit.`
        );
      } else if (dims.w < POSTER_W - 40) {
        setSizeNote(
          `This image is only ${dims.w}px wide. ${POSTER_W}×${POSTER_H} keeps it sharp.`
        );
      }
    } catch {
      /* ignore — proceed with upload */
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in again to upload.");
      const url = await uploadImage(
        file,
        "event-banners",
        storagePath(user.id, file.name)
      );
      setBanner(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Content upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (finalTitle.length < 3 || description.trim().length < 10 || !eventDate || !location.trim()) {
      setError("Isi judul, deskripsi (minimal 10 huruf), waktu, dan lokasi.");
      return;
    }
    const fd = new FormData();
    fd.append("title", finalTitle);
    fd.append("description", description.trim());
    fd.append("event_date", eventDate);
    if (endDate) fd.append("end_date", endDate);
    fd.append("location", location.trim());
    if (city.trim()) fd.append("city", city.trim());
    if (communityId) fd.append("community_id", communityId);
    if (mapsUrl.trim()) fd.append("maps_url", mapsUrl.trim());
    if (banner) fd.append("banner_image_url", banner);
    if (pushNews) fd.append("push_to_news", "on");
    fd.append("event_type", eventType);

    startTransition(async () => {
      const res = await promoteEvent(fd);
      if (res?.error) {
        const err = res.error as Record<string, unknown>;
        setError(
          (err._form as string) ||
            Object.values(err).flat().join(", ") ||
            "Could not save."
        );
        return;
      }
      setOpen(false);
      reset();
      router.refresh();
    });
  };

  const remove = (id: string) => {
    if (!confirm("Delete this event?")) return;
    startTransition(async () => {
      const res = await deleteEvent(id);
      if (res?.error) alert(res.error);
      else router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            reset();
            setOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <CalendarDays className="h-4 w-4" /> Buat event
        </Button>
      </div>

      {initialEvents.length === 0 && (camps?.length ?? 0) === 0 ? (
        <div className="rounded-xl border border-[#333] bg-[#15181e] p-10 text-center text-sm text-gray-500">
          Belum ada event. Tekan <span className="text-brand-gold">Buat event</span> untuk membuatnya.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {initialEvents.map((ev) => (
            <div key={ev.id} className="flex aspect-[4/5] flex-col overflow-hidden rounded-2xl border border-[#2a2d35] bg-[#14171c]">
              <div className="relative min-h-0 flex-1 bg-[#15181e]">
                {ev.banner_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ev.banner_image_url} alt="" className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-600">
                    <CalendarDays className="h-8 w-8" />
                  </div>
                )}
                <span className="absolute left-2 top-2 max-w-[calc(100%-1rem)] truncate rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-brand-gold">
                  {ev.event_type || "Event"}
                </span>
              </div>
              <div className="shrink-0 space-y-2 p-3">
                <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-tight text-white">{ev.title}</h3>
                <p className="truncate text-[11px] text-brand-muted">{fmt(ev.event_date)}</p>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => openWorkspace(ev.id)} disabled={opening === ev.id}
                    className="flex flex-1 items-center justify-center rounded-lg bg-brand-gold px-2 py-2 text-[11px] font-bold text-brand-dark disabled:opacity-50">
                    {opening === ev.id ? "Membuka..." : "Enter"}
                  </button>
                  <button onClick={() => remove(ev.id)} aria-label="Hapus" className="flex shrink-0 items-center justify-center rounded-lg px-2 text-gray-500 hover:text-red-400">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {(camps ?? []).map((c) => {
            const series = isCampSeries(c.camp_name);
            return (
              <div key={c.id} className="flex aspect-[4/5] flex-col overflow-hidden rounded-2xl border border-[#2a2d35] bg-[#14171c]">
                <div className="relative min-h-0 flex-1 bg-[#15181e]">
                  {c.banner_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.banner_url} alt="" className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-600">
                      <Tent className="h-8 w-8" />
                    </div>
                  )}
                  <span className="absolute left-2 top-2 max-w-[calc(100%-1rem)] truncate rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-brand-gold">
                    {c.camp_name || "Camp"}
                  </span>
                </div>
                <div className="shrink-0 space-y-2 p-3">
                  <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-tight text-white">{c.custom_name || c.camp_name}</h3>
                  <p className="truncate text-[11px] text-brand-muted">{series ? `Angkatan ${c.angkatan}` : c.branch}{c.start_date ? ` · ${fmt(c.start_date)}` : ""}</p>
                  <Link href={`${campBase}/${c.id}`} className="flex items-center justify-center rounded-lg bg-brand-gold px-2 py-2 text-[11px] font-bold text-brand-dark">
                    Enter
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Buat event">
        <form
          onSubmit={submit}
          className="max-h-[72vh] space-y-4 overflow-y-auto pr-2"
        >
          <div>
            <label className="mb-1 block text-sm text-brand-light">Tipe Event</label>
            <select value={eventType} onChange={(e) => setEventType(e.target.value)} className="input-3d w-full text-sm">
              {EVENT_KINDS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {eventType === "Camp" && (
            <div>
              <label className="mb-1 block text-sm text-brand-light">Nama Event</label>
              <select value={campName} onChange={(e) => setCampName(e.target.value)} className="input-3d w-full text-sm">
                {CAMP_SERIES.map((t) => <option key={t} value={t}>{t}</option>)}
                <option value="Other">Other</option>
              </select>
            </div>
          )}

          {campNamed ? (
            <div>
              <label className="mb-1 block text-sm text-brand-light">Angkatan (optional)</label>
              <input value={angkatan} onChange={(e) => setAngkatan(e.target.value)} className="input-3d w-full text-sm" placeholder="e.g. 58" />
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-sm text-brand-light">{eventType === "Camp" || eventType === "Other" ? "Tulis nama event" : "Nama event"}</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-3d w-full text-sm"
                placeholder="e.g. Family Retreat 2026"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm text-brand-light">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="input-3d w-full resize-y text-sm"
              placeholder="What is it about, who is it for…"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-brand-light">
                Event time
              </label>
              <input
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="input-3d w-full text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-brand-light">
                Ends (optional)
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-3d w-full text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-brand-light">
                Location
              </label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input-3d w-full text-sm"
                placeholder="Venue / address"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-brand-light">
                City
              </label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="input-3d w-full text-sm"
                placeholder="e.g. Bandung"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-brand-light">
              Google Maps link (optional)
            </label>
            <input
              value={mapsUrl}
              onChange={(e) => setMapsUrl(e.target.value)}
              className="input-3d w-full text-sm"
              placeholder="https://maps.app.goo.gl/…"
            />
          </div>

          {/* Promotion is part of the event: a poster and, if wanted, a post in News */}
          <div className="space-y-3 rounded-xl border border-brand-gold/30 bg-brand-gold/[0.04] p-3">
            <p className="flex items-center gap-2 text-sm font-bold text-brand-gold"><Megaphone className="h-4 w-4" /> Promosi (opsional)</p>
            <p className="text-xs text-brand-muted">Poster akan tampil sebagai banner di halaman Tentang komunitas, diurutkan dari event terdekat.</p>
          
          <div>
            <label className="mb-1 flex items-baseline justify-between gap-2 text-sm text-brand-light">
              <span>Content (poster / image)</span>
              <span className="text-[11px] font-normal text-brand-muted">
                {POSTER_W}×{POSTER_H} · 4:5 portrait
              </span>
            </label>
            <div className="mx-auto w-full max-w-[220px]">
              {banner ? (
                <div className="relative aspect-[4/5]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={banner}
                    alt="preview"
                    className="h-full w-full rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setBanner("");
                      setSizeNote(null);
                    }}
                    className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-border text-brand-muted hover:border-brand-gold"
                >
                  {uploading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <ImagePlus className="h-6 w-6" />
                      <span className="text-sm">Upload content</span>
                      <span className="text-[11px]">
                        {POSTER_W}×{POSTER_H}
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>
            {sizeNote && (
              <p className="mt-2 rounded-lg bg-amber-500/10 px-3 py-2 text-[11px] text-amber-400">
                {sizeNote}
              </p>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={onUpload}
            />
          </div>


          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#333] bg-[#15181e] p-3 text-sm text-brand-light">
            <input
              type="checkbox"
              checked={pushNews}
              onChange={(e) => setPushNews(e.target.checked)}
              className="h-4 w-4 accent-brand-gold"
            />
            <Newspaper className="h-4 w-4 text-brand-gold" />
            Also publish this to News
          </label>

          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            loading={pending || uploading}
          >
            {pushNews ? "Simpan event dan publikasikan ke Warta" : "Simpan event"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
