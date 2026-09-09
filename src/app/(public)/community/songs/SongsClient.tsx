"use client";

import { useState } from "react";
import { Heart, MessageCircle, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import VinylPlayer from "@/components/home/VinylPlayer";
import Image from "next/image";
import { formatDate } from "@/lib/utils";

type Song = { id: string; title: string; url: string; coverImage: string };

type AlbumProfile = {
  id: string;
  full_name: string | null;
  nama_panggilan: string | null;
  avatar_url: string | null;
  favorite_songs: Song[];
};

type Like = { user_id: string; album_owner_id: string };
type Comment = {
  id: string;
  album_owner_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author: { id: string; full_name: string; avatar_url: string };
};

function AlbumView({
  owner,
  isMe,
  likes,
  comments,
  meId,
  isEn,
}: {
  owner: AlbumProfile;
  isMe: boolean;
  likes: Like[];
  comments: Comment[];
  meId: string;
  isEn: boolean;
}) {
  const [localLikes, setLocalLikes] = useState(likes);
  const [localComments, setLocalComments] = useState(comments);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(isMe);
  const [loading, setLoading] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  const albumName = isMe 
    ? (isEn ? "My Album" : "Album Saya") 
    : (owner.nama_panggilan || owner.full_name || "Member") + (isEn ? "'s Album" : " Album");

  const hasLiked = localLikes.some(l => l.user_id === meId);

  const toggleLike = async () => {
    try {
      if (hasLiked) {
        setLocalLikes(prev => prev.filter(l => l.user_id !== meId));
        await supabase.from("album_likes").delete().eq("user_id", meId).eq("album_owner_id", owner.id);
      } else {
        setLocalLikes(prev => [...prev, { user_id: meId, album_owner_id: owner.id }]);
        await supabase.from("album_likes").insert({ user_id: meId, album_owner_id: owner.id });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const postComment = async () => {
    if (!newComment.trim() || loading) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from("album_comments").insert({
        album_owner_id: owner.id,
        author_id: meId,
        content: newComment.trim()
      }).select("id, album_owner_id, author_id, content, created_at, author:profiles!album_comments_author_id_fkey(id, full_name, avatar_url)").single();
      
      if (error) throw error;
      if (data) {
        setLocalComments(prev => [...prev, data as any]);
        setNewComment("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-brand-surface/40 border border-brand-border rounded-2xl overflow-hidden shadow-lg mb-8 max-w-5xl mx-auto">
      <div className="p-4 sm:p-6 border-b border-brand-border bg-black/20 flex items-center gap-4">
        {owner.avatar_url ? (
          <Image src={owner.avatar_url} alt="Avatar" width={48} height={48} className="rounded-full object-cover w-12 h-12 ring-2 ring-brand-gold/30" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold font-bold text-xl ring-2 ring-brand-gold/30">
            {(owner.nama_panggilan || owner.full_name || "?")[0].toUpperCase()}
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">{albumName}</h2>
          <p className="text-sm text-brand-muted">{owner.favorite_songs.length} {isEn ? "songs" : "lagu"}</p>
        </div>
      </div>
      
      <div className="p-4">
        <VinylPlayer initialSongs={owner.favorite_songs} userId={owner.id} readOnly={!isMe} />
      </div>

      <div className="px-4 sm:px-6 py-3 border-t border-brand-border/50 bg-black/10 flex items-center gap-6">
        <button onClick={toggleLike} className="flex items-center gap-2 group transition-colors">
          <Heart className={`w-5 h-5 transition-transform group-hover:scale-110 ${hasLiked ? "fill-red-500 text-red-500" : "text-brand-muted group-hover:text-red-400"}`} />
          <span className={`text-sm font-medium ${hasLiked ? "text-red-500" : "text-brand-muted"}`}>{localLikes.length}</span>
        </button>
        <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-2 group transition-colors">
          <MessageCircle className="w-5 h-5 text-brand-muted group-hover:text-blue-400 transition-transform group-hover:scale-110" />
          <span className="text-sm font-medium text-brand-muted group-hover:text-blue-400">{localComments.length}</span>
        </button>
      </div>

      {showComments && (
        <div className="px-4 sm:px-6 py-4 border-t border-brand-border bg-black/40">
          {localComments.length > 0 ? (
            <div className="space-y-4 mb-6">
              {localComments.map(c => (
                <div key={c.id} className="flex gap-3">
                  {c.author?.avatar_url ? (
                    <Image src={c.author.avatar_url} alt="Avatar" width={32} height={32} className="rounded-full object-cover w-8 h-8 flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold font-bold text-sm flex-shrink-0">
                      {(c.author?.full_name || "?")[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 bg-brand-bg/50 border border-brand-border rounded-xl px-3 py-2">
                    <p className="text-xs font-bold text-white mb-0.5">{c.author?.full_name}</p>
                    <p className="text-sm text-brand-light">{c.content}</p>
                    <p className="text-[10px] text-brand-muted mt-1">{formatDate(c.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-brand-muted text-center mb-6">{isEn ? "No comments yet." : "Belum ada komentar."}</p>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && postComment()}
              placeholder={isEn ? "Add a comment..." : "Tambahkan komentar..."}
              className="flex-1 bg-brand-bg border border-brand-border rounded-full px-4 text-sm text-white focus:outline-none focus:border-brand-gold"
            />
            <button onClick={postComment} disabled={!newComment.trim() || loading} className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center text-brand-dark disabled:opacity-50 transition-colors hover:bg-yellow-500">
              <Send className="w-4 h-4 -ml-0.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SongsClient({
  lang,
  me,
  friendsAlbums,
  initialLikes,
  initialComments
}: {
  lang: string;
  me: AlbumProfile;
  friendsAlbums: AlbumProfile[];
  initialLikes: Like[];
  initialComments: Comment[];
}) {
  const isEn = lang === "en";

  return (
    <div className="px-3 sm:px-4 space-y-8 animate-in fade-in duration-500">
      <AlbumView
        owner={me}
        isMe={true}
        likes={initialLikes.filter(l => l.album_owner_id === me.id)}
        comments={initialComments.filter(c => c.album_owner_id === me.id)}
        meId={me.id}
        isEn={isEn}
      />

      {friendsAlbums.length > 0 && (
        <div className="max-w-5xl mx-auto mt-12">
          <h2 className="text-xl font-bold text-brand-gold mb-6 border-b border-brand-border pb-2">
            {isEn ? "Friends' Albums" : "Album Teman"}
          </h2>
          {friendsAlbums.map(f => (
            <AlbumView
              key={f.id}
              owner={f}
              isMe={false}
              likes={initialLikes.filter(l => l.album_owner_id === f.id)}
              comments={initialComments.filter(c => c.album_owner_id === f.id)}
              meId={me.id}
              isEn={isEn}
            />
          ))}
        </div>
      )}
    </div>
  );
}
