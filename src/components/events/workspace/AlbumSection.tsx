"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AlbumClient from "@/components/album/AlbumClient";
import type { AlbumPerson, AlbumPhoto, AlbumTag } from "@/lib/albumPhoto";

/** Gallery Album tab inside the Event Workspace (Community Center & My Services). */
export default function AlbumSection({ eventId }: { eventId: string }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    event: { id: string; title: string; date: string };
    me: string;
    isAdmin: boolean;
    isAttendee: boolean;
    open: boolean;
    photos: AlbumPhoto[];
    tags: AlbumTag[];
    people: AlbumPerson[];
    cover: string | null;
  } | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const supabase = createClient() as any;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !alive) { setLoading(false); return; }

      const { data: ev } = await supabase
        .from("events")
        .select("id, title, event_date")
        .eq("id", eventId)
        .maybeSingle();
      if (!ev || !alive) { setLoading(false); return; }

      const [attendee, open, photos, people, pref, admin] = await Promise.all([
        supabase.rpc("event_attendee", { p_event: eventId }),
        supabase.rpc("event_gallery_open", { p_event: eventId }),
        supabase
          .from("event_photos")
          .select("id, event_id, uploader_id, path, created_at")
          .eq("event_id", eventId)
          .order("created_at", { ascending: false })
          .limit(500),
        supabase.rpc("event_album_people", { p_event: eventId }),
        supabase
          .from("event_album_prefs")
          .select("cover_photo_id")
          .eq("event_id", eventId)
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase.rpc("event_admin_of", { p_event: eventId }),
      ]);

      const list = (photos.data as AlbumPhoto[]) ?? [];
      const ids = list.map((p) => p.id);
      const { data: tags } = ids.length
        ? await supabase
            .from("event_photo_tags")
            .select("photo_id, user_id, x, y, tagged_by")
            .in("photo_id", ids)
        : { data: [] };

      if (!alive) return;
      setData({
        event: { id: ev.id as string, title: ev.title as string, date: ev.event_date as string },
        me: user.id,
        isAdmin: admin.data === true,
        // Admins/panitia can always upload & manage the album from the workspace
        isAttendee: attendee.data === true || admin.data === true,
        open: open.data === true,
        photos: list,
        tags: (tags as AlbumTag[]) ?? [],
        people: (people.data as AlbumPerson[]) ?? [],
        cover: (pref.data as { cover_photo_id: string | null } | null)?.cover_photo_id ?? null,
      });
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [eventId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-brand-muted">
        <Loader2 className="h-4 w-4 animate-spin text-brand-gold" />
        Memuat galeri album…
      </div>
    );
  }

  if (!data) {
    return <p className="py-10 text-center text-sm text-brand-muted">Album belum tersedia untuk event ini.</p>;
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-white">Galeri Album Event</h2>
          <p className="text-xs text-brand-muted">
            Foto dari panitia dan peserta. Foto buram otomatis disaring agar album tetap tajam.
          </p>
        </div>
        <Link
          href={`/album/${eventId}`}
          className="inline-flex items-center gap-1.5 rounded-xl border border-brand-gold/40 bg-brand-gold/10 px-3 py-2 text-xs font-semibold text-brand-gold transition hover:bg-brand-gold/20"
        >
          Buka tampilan penuh <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      <AlbumClient
        embedded
        event={data.event}
        me={data.me}
        isAdmin={data.isAdmin}
        isAttendee={data.isAttendee}
        open={data.open}
        initialPhotos={data.photos}
        initialTags={data.tags}
        people={data.people}
        initialCover={data.cover}
        openPhoto={null}
      />
    </div>
  );
}
