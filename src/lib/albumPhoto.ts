/** Event album photos live in the public bucket "event-photos" under <event id>/<random>.webp (see supabase/142_event_album.sql). */
export const photoUrl = (path: string) => `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/event-photos/${path}`;

export type AlbumPerson = { user_id: string; name: string; avatar_url: string | null };
export type AlbumPhoto = { id: string; event_id: string; uploader_id: string; path: string; created_at: string };
export type AlbumTag = { photo_id: string; user_id: string; x: number | null; y: number | null; tagged_by: string };
