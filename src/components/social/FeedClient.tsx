"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Send, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

export default function FeedClient({ userAvatar, userName, userId }: { userAvatar: string | null, userName: string, userId: string }) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("community_posts")
        .insert({
          author_id: userId,
          content: content.trim(),
        });
      
      if (error) {
        console.error("Error creating post", error);
        alert("Failed to create post. Did you run the SQL script?");
      } else {
        setContent("");
        // Reload page to see the new post (simple approach for now)
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#1a1d24] border border-[#333] rounded-2xl p-4 shadow-lg mb-6">
      <div className="flex gap-3">
        <div className="relative h-10 w-10 rounded-full border border-[#333] bg-brand-bg overflow-hidden flex-shrink-0 flex items-center justify-center">
          {userAvatar ? (
            <Image src={userAvatar} alt={userName} fill className="object-cover" />
          ) : (
            <span className="text-brand-gold font-bold">{userName[0]?.toUpperCase()}</span>
          )}
        </div>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Bagikan pemikiran atau update Anda..."
            className="w-full bg-[#111] border border-[#333] rounded-xl p-3 text-sm text-brand-light placeholder-gray-500 focus:outline-none focus:border-brand-gold/50 resize-none min-h-[80px]"
          />
          <div className="flex items-center justify-between">
            <button type="button" className="text-brand-gold/70 hover:text-brand-gold transition-colors p-2 rounded-lg hover:bg-brand-gold/10">
              <ImageIcon className="h-5 w-5" />
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || !content.trim()}
              className="bg-brand-gold text-brand-dark px-4 py-1.5 rounded-full text-sm font-bold shadow-glow-gold hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
            >
              {isSubmitting ? "Posting..." : "Post"}
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
