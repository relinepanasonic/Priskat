"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Image as ImageIcon, BookOpen, HeartHandshake, X } from "lucide-react";
import Image from "next/image";

export default function FeedClient({ userAvatar, userName, userId }: { userAvatar: string | null, userName: string, userId: string }) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleSubmit = async () => {
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
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#1a1d24] border-b border-[#333] p-4 mb-6 relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button className="text-brand-light hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
          <h2 className="text-xl font-bold text-white tracking-tight">New though</h2>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting || !content.trim()}
          className="text-brand-gold font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:text-yellow-400 transition-colors"
        >
          {isSubmitting ? "Posting..." : "Post"}
        </button>
      </div>

      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <div className="relative h-10 w-10 rounded-full border border-[#333] bg-brand-bg overflow-hidden flex-shrink-0 flex items-center justify-center z-10">
            {userAvatar ? (
              <Image src={userAvatar} alt={userName} fill className="object-cover" />
            ) : (
              <span className="text-brand-gold font-bold">{userName[0]?.toUpperCase()}</span>
            )}
          </div>
          {/* Vertical line to mimic Threads connecting line */}
          <div className="w-0.5 bg-[#333] flex-1 mt-2 mb-2"></div>
        </div>

        <div className="flex-1 flex flex-col pt-1 pb-4">
          <div className="flex items-center gap-1 mb-1">
            <span className="font-bold text-white text-[15px]">{userName}</span>
          </div>
          
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's new?"
            rows={1}
            className="w-full bg-transparent border-none text-[15px] text-brand-light placeholder-gray-500 focus:outline-none focus:ring-0 resize-none overflow-hidden"
          />
          
          <div className="flex items-center gap-4 mt-3">
            <button type="button" className="text-gray-400 hover:text-brand-gold transition-colors flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
            </button>
            <button type="button" className="text-gray-400 hover:text-brand-gold transition-colors flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
            </button>
            <button type="button" className="text-gray-400 hover:text-brand-gold transition-colors flex items-center gap-2">
              <HeartHandshake className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
