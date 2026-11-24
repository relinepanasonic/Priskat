import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AlbumClient from "@/components/album/AlbumClient";
import type { AlbumPerson, AlbumPhoto, AlbumTag } from "@/lib/albumPhoto";

export const dynamic = "force-dynamic";
export const metadata = { title: "Album" };

/** One event's album: everyone who attended adds photos while the event is on; everyone who attended can see them. */
export default async function AlbumPage({ params, searchParams }: { params: Promise<{ eventId: string }>; searchParams: Promise<{ foto?: string }> }) {
  const { eventId } = await params;
  const { foto } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(eventId)) notFound();
  const supabase = (await createClient()) as any;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/album/${eventId}`);

  const { data: ev } = await supabase.from("events").select("id, title, event_date, end_date").eq("id", eventId).maybeSingle();
  if (!ev) notFound();

  const [attendee, open, photos, people, pref] = await Promise.all([
    supabase.rpc("event_attendee", { p_event: eventId }),
    supabase.rpc("event_gallery_open", { p_event: eventId }),
    supabase.from("event_photos").select("id, event_id, uploader_id, path, created_at").eq("event_id", eventId).order("created_at", { ascending: false }).limit(500),
    supabase.rpc("event_album_people", { p_event: eventId }),
    supabase.from("event_album_prefs").select("cover_photo_id").eq("event_id", eventId).eq("user_id", user.id).maybeSingle(),
  ]);
  const list = (photos.data as AlbumPhoto[]) ?? [];
  const ids = list.map((p) => p.id);
  const { data: tags } = ids.length ? await supabase.from("event_photo_tags").select("photo_id, user_id, x, y, tagged_by").in("photo_id", ids) : { data: [] };
  const { data: admin } = await supabase.rpc("event_admin_of", { p_event: eventId });

  return (
    <AlbumClient
      event={{ id: ev.id as string, title: ev.title as string, date: ev.event_date as string }}
      me={user.id}
      isAdmin={admin === true}
      isAttendee={attendee.data === true}
      open={open.data === true}
      initialPhotos={list}
      initialTags={(tags as AlbumTag[]) ?? []}
      people={(people.data as AlbumPerson[]) ?? []}
      initialCover={(pref.data as { cover_photo_id: string | null } | null)?.cover_photo_id ?? null}
      openPhoto={foto ?? null}
    />
  );
}
