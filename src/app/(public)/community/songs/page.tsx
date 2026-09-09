import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLanguage } from "@/lib/lang";
import SongsClient from "./SongsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Songs" };

export default async function SongsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  const lang = await getLanguage();

  // Get my profile
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("id, full_name, nama_panggilan, avatar_url, favorite_songs")
    .eq("id", user.id)
    .single();

  const me = {
    id: profileRow?.id ?? user.id,
    full_name: profileRow?.full_name ?? ((user.user_metadata?.full_name as string) || user.email || null),
    nama_panggilan: profileRow?.nama_panggilan ?? null,
    avatar_url: profileRow?.avatar_url ?? null,
    favorite_songs: profileRow?.favorite_songs || [],
  };

  // Get my accepted friends
  const { data: friendships } = await supabase
    .from("friendships")
    .select("requester_id, receiver_id")
    .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .eq("status", "accepted");

  const friendIds = new Set<string>();
  (friendships || []).forEach((f: any) => {
    if (f.requester_id !== user.id) friendIds.add(f.requester_id);
    if (f.receiver_id !== user.id) friendIds.add(f.receiver_id);
  });

  let friendsAlbums: any[] = [];

  if (friendIds.size > 0) {
    const { data: friendsData } = await supabase
      .from("profiles")
      .select("id, full_name, nama_panggilan, avatar_url, favorite_songs")
      .in("id", Array.from(friendIds))
      .not("favorite_songs", "is", null);
      
    // Only keep friends who actually have at least 1 song
    friendsAlbums = (friendsData || []).filter((f) => Array.isArray(f.favorite_songs) && f.favorite_songs.length > 0);
  }
  
  // To avoid complex N+1 queries, we fetch all likes/comments for these albums
  const albumOwnerIds = [me.id, ...friendsAlbums.map(f => f.id)];
  
  // We can't fetch them if table doesn't exist yet! Wait, we assume table exists.
  let likes: any[] = [];
  let comments: any[] = [];
  
  try {
    const [{ data: lData }, { data: cData }] = await Promise.all([
      supabase.from("album_likes").select("user_id, album_owner_id").in("album_owner_id", albumOwnerIds),
      supabase.from("album_comments").select("id, album_owner_id, author_id, content, created_at, author:profiles!album_comments_author_id_fkey(id, full_name, avatar_url)").in("album_owner_id", albumOwnerIds).order("created_at", { ascending: true })
    ]);
    likes = lData || [];
    comments = cData || [];
  } catch (err) {
    console.error("Tables might not exist yet", err);
  }

  return (
    <div className="min-h-screen bg-brand-dark pb-32">
      <div className="bg-brand-surface pt-8 pb-6 px-4 mb-6 shadow-sm border-b border-brand-border/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        <div className="mx-auto max-w-5xl relative z-10">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-gold mb-1 drop-shadow-sm">
            {lang === "en" ? "Music & Albums" : "Musik & Album"}
          </h1>
          <p className="text-brand-muted text-sm max-w-md">
            {lang === "en" ? "Share your favorite songs and discover what your friends are listening to." : "Bagikan lagu favorit Anda dan temukan apa yang didengarkan teman Anda."}
          </p>
        </div>
      </div>
      <SongsClient
        lang={lang}
        me={me}
        friendsAlbums={friendsAlbums}
        initialLikes={likes}
        initialComments={comments}
      />
    </div>
  );
}
