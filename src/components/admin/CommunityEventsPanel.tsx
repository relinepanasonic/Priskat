"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ImagePlus,
  Loader2,
  MapPin,
  Megaphone,
  Newspaper,
  Trash2,
  X,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { createClient } from "@/lib/supabase/client";
import { uploadImage, storagePath } from "@/lib/upload";
import { promoteEvent, deleteEvent } from "@/app/actions/events";

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
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });

// Standard promo poster: Instagram portrait.
const POSTER_W = 1080;
const POSTER_H = 1350; // 4:5

export default function CommunityEventsPanel({
  initialEvents,
  communityId = null,
}: {
  initialEvents: EventRow[];
  communityId?: string | null;
}) {
  const router = useRouter();
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
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setBanner("");
    setSizeNote(null);
    setTitle("");
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
      const url = await uploadImage(
        file,
        "event-banners",
        storagePath(user?.id ?? "anon", file.name)
      );
      setBanner(url);
    } catch {
      setError("Content upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim() || description.trim().length < 10 || !eventDate || !location.trim()) {
      setError("Fill in content title, a description (10+ chars), time and location.");
      return;
    }
    const fd = new FormData();
    fd.append("title", title.trim());
    fd.append("description", description.trim());
    fd.append("event_date", eventDate);
    if (endDate) fd.append("end_date", endDate);
    fd.append("location", location.trim());
    if (city.trim()) fd.append("city", city.trim());
    if (communityId) fd.append("community_id", communityId);
    if (mapsUrl.trim()) fd.append("maps_url", mapsUrl.trim());
    if (banner) fd.append("banner_image_url", banner);
    if (pushNews) fd.append("push_to_news", "on");

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
      <div className="flex items-center justify-between">
        <p className="text-sm text-brand-muted">
          Promote a community event — optionally publish it to News in one go.
        </p>
        <Button
          onClick={() => {
            reset();
            setOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Megaphone className="h-4 w-4" /> Promotion
        </Button>
      </div>

      {initialEvents.length === 0 ? (
        <div className="rounded-xl border border-[#333] bg-[#15181e] p-10 text-center text-sm text-gray-500">
          No events yet. Hit <span className="text-brand-gold">Promotion</span> to
          create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {initialEvents.map((ev) => (
            <div
              key={ev.id}
              className="card-3d relative flex gap-4 p-4"
            >
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-[#15181e]">
                {ev.banner_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={ev.banner_image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-600">
                    <CalendarDays className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="truncate font-bold text-white">{ev.title}</h3>
                  <button
                    onClick={() => remove(ev.id)}
                    className="p-1 text-gray-500 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-brand-muted">
                  <CalendarDays className="h-3.5 w-3.5" /> {fmt(ev.event_date)}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-brand-muted">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="truncate">{ev.location}</span>
                  {ev.maps_url && (
                    <a
                      href={ev.maps_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-gold hover:underline"
                    >
                      map
                    </a>
                  )}
                </p>
                <span className="mt-2 inline-block rounded-full bg-brand-gold/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-brand-gold">
                  {ev.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Event Promotion">
        <form
          onSubmit={submit}
          className="max-h-[72vh] space-y-4 overflow-y-auto pr-2"
        >
          {/* upload konten */}
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

          <div>
            <label className="mb-1 block text-sm text-brand-light">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-3d w-full text-sm"
              placeholder="e.g. Family Retreat 2026"
            />
          </div>

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
            {pushNews ? "Promote + Publish to News" : "Create Event"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
