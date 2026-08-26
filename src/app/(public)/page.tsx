import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import FeedClient from "@/components/social/FeedClient";

export const revalidate = 0;

export default async function FeedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch current user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  // Try fetching posts (if table exists)
  let posts: any[] = [];
  try {
    const { data } = await supabase
      .from("community_posts")
      .select(`
        id, 
        content, 
        created_at, 
        author_id,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .order("created_at", { ascending: false })
      .limit(50);
    
    if (data) {
      posts = data;
    }
  } catch (err) {
    console.error("Posts table might not exist yet.");
  }

  return (
    <div className="min-h-screen bg-brand-dark py-6 px-4 md:py-12 md:px-8 overflow-y-auto pb-24 md:pb-12">
      <div className="max-w-xl mx-auto">
        
        <h1 className="text-2xl font-bold text-white mb-6">Priskat Feed</h1>

        {/* Create Post Input */}
        <FeedClient 
          userId={user.id} 
          userName={profile.full_name || "User"} 
          userAvatar={profile.avatar_url} 
        />

        {/* Feed Posts */}
        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="bg-[#1a1d24] border border-[#333] rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  
                  {/* Author Info */}
                  <Link href={post.author_id === user.id ? "/profile" : `/friends/${post.author_id}`} className="flex items-center gap-3 group">
                    <div className="relative h-12 w-12 rounded-full border border-[#333] bg-brand-bg overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {post.profiles?.avatar_url ? (
                        <Image src={post.profiles.avatar_url} alt={post.profiles.full_name} fill className="object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <span className="text-brand-gold font-bold">{(post.profiles?.full_name || "U")[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-brand-light group-hover:text-brand-gold transition-colors text-sm">
                        {post.profiles?.full_name || "Unknown User"}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </Link>

                </div>

                {/* Post Content */}
                <div className="mt-4 text-brand-light text-sm leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-[#1a1d24] border border-[#333] rounded-2xl">
              <p className="text-brand-muted mb-2">No posts yet.</p>
              <p className="text-sm text-gray-600">Be the first to share an update with the alumni!</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
