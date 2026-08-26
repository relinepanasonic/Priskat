"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, Video, MessageSquare, Tent, Heart, Camera, Pencil, Info } from "lucide-react";
import FeedClient from "@/components/social/FeedClient";
import { formatDistanceToNow } from "date-fns";

export default function HomeTabsClient({ 
  profile, 
  posts, 
  userId 
}: { 
  profile: any, 
  posts: any[], 
  userId: string 
}) {
  const [activeTab, setActiveTab] = useState<"Profile" | "Though">("Profile");

  // Mock data based on user request
  const angkatan = "44";
  const city = "Surabaya";
  const mobile = "+6281234567890";
  const waLink = `https://wa.me/${mobile.replace(/\D/g, '')}`;
  const gallery = [1, 2, 3, 4, 5]; // Mock gallery
  
  // Filter my own posts
  const myPosts = posts.filter(post => post.author_id === userId);

  return (
    <div className="w-full max-w-md mx-auto bg-brand-dark min-h-screen relative font-sans text-white pb-24 md:pb-12">
      
      {/* 1. Big Header Image (Curved) */}
      <div className="relative h-[420px] w-full rounded-b-[45px] overflow-hidden bg-[#222] shadow-md">
        {profile.avatar_url ? (
          <Image src={profile.avatar_url} alt={profile.full_name} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#222] to-[#111]">
            <span className="text-8xl text-white/30 font-bold">{profile.full_name[0]?.toUpperCase()}</span>
          </div>
        )}
        
        {/* Pencil Edit Icon (Top Right) */}
        <Link href="/profile/edit" className="absolute top-6 right-6 h-10 w-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors z-10">
          <Pencil className="h-4 w-4" />
        </Link>

        {/* Overlay Gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-brand-dark/20 to-transparent"></div>

        {/* Name and Title Overlay (Bottom Left) */}
        <div className="absolute bottom-20 left-6 text-white">
          <div className="bg-[#1a1d24]/60 backdrop-blur-md px-3 py-1 rounded-full w-fit flex items-center gap-1 mb-2 border border-[#333]">
            <span className="text-xs font-bold text-brand-gold">★ 5.0</span>
          </div>
          <h1 className="text-3xl font-bold leading-tight">{profile.full_name}</h1>
          <p className="text-sm text-brand-light mt-1 font-medium">Alumni Priskat {city}</p>
          <p className="text-xs text-brand-muted">Angkatan {angkatan}</p>
        </div>
      </div>

      {/* 2. Floating Action Row */}
      <div className="relative -mt-10 px-6 z-20 flex items-center justify-between">
        <button className="bg-brand-gold/10 text-brand-gold border border-brand-gold/20 px-5 py-3.5 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg shadow-black/50 backdrop-blur-md">
          <Info className="h-4 w-4" />
          Details
        </button>
        <div className="flex gap-3">
          <a href={`tel:${mobile}`} className="h-12 w-12 bg-[#1a1d24] border border-[#333] rounded-full flex items-center justify-center text-brand-gold shadow-lg shadow-black/50 hover:bg-[#2a2d35] transition-colors">
            <Phone className="h-5 w-5 fill-current" />
          </a>
          <button className="h-12 w-12 bg-[#1a1d24] border border-[#333] rounded-full flex items-center justify-center text-brand-gold shadow-lg shadow-black/50 hover:bg-[#2a2d35] transition-colors">
            <Video className="h-5 w-5 fill-current" />
          </button>
          <a href={waLink} target="_blank" rel="noreferrer" className="h-12 w-12 bg-[#1a1d24] border border-[#333] rounded-full flex items-center justify-center text-brand-gold shadow-lg shadow-black/50 hover:bg-[#2a2d35] transition-colors">
            <MessageSquare className="h-5 w-5 fill-current" />
          </a>
        </div>
      </div>

      {/* 3. Stats Card (Camp | Devotion only) */}
      <div className="px-6 mt-6">
        <div className="bg-[#1a1d24] rounded-[30px] p-5 flex justify-evenly items-center shadow-sm border border-[#333]">
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-brand-dark flex items-center justify-center text-brand-gold border border-[#333]">
              <Tent className="h-5 w-5" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-brand-gold">2</p>
              <p className="text-[10px] text-brand-muted font-medium uppercase tracking-wider">Ongoing Camp</p>
            </div>
          </div>
          
          <div className="w-px h-12 bg-[#2a2d35]"></div>
          
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-brand-dark flex items-center justify-center text-brand-gold border border-[#333]">
              <Heart className="h-5 w-5" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-brand-gold">1</p>
              <p className="text-[10px] text-brand-muted font-medium uppercase tracking-wider">Devotion</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Sticky Tabs Row */}
      <div className="sticky top-0 z-40 bg-brand-dark/95 backdrop-blur-md pt-6 pb-4 px-6 mt-2">
        <div className="bg-[#1a1d24] p-1.5 rounded-full shadow-lg flex items-center gap-1 border border-[#333] w-full max-w-[240px] mx-auto">
          <button 
            onClick={() => setActiveTab("Profile")}
            className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${activeTab === "Profile" ? "bg-brand-gold text-brand-dark shadow-md" : "text-brand-muted hover:text-white"}`}
          >
            Profile
          </button>
          <button 
            onClick={() => setActiveTab("Though")}
            className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${activeTab === "Though" ? "bg-brand-gold text-brand-dark shadow-md" : "text-brand-muted hover:text-white"}`}
          >
            Though
          </button>
        </div>
      </div>

      {/* 5. Content Area */}
      <div className="px-6 mt-4 space-y-8">
        
        {activeTab === "Profile" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            
            {/* Ongoing Row (Camp and Devotion side by side) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1a1d24] border border-[#333] p-4 rounded-3xl flex flex-col items-center text-center gap-2">
                <div className="h-10 w-10 bg-brand-dark rounded-full flex items-center justify-center text-brand-gold">
                  <Tent className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-brand-light">Pria Sejati 45</h4>
                  <p className="text-[10px] text-brand-muted">Fasilitator • Ongoing</p>
                </div>
              </div>
              <div className="bg-[#1a1d24] border border-[#333] p-4 rounded-3xl flex flex-col items-center text-center gap-2">
                <div className="h-10 w-10 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500">
                  <Heart className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-brand-light">Gospel of John</h4>
                  <p className="text-[10px] text-brand-muted">Day 12 of 30</p>
                </div>
              </div>
            </div>

            {/* My Gallery */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-brand-gold uppercase tracking-wider">My Gallery</h3>
                <button className="text-xs text-brand-muted font-bold hover:text-brand-light">See All</button>
              </div>
              <div className="flex overflow-x-auto gap-3 pb-4 hide-scrollbar -mx-6 px-6">
                {gallery.map((item) => (
                  <div key={item} className="h-32 w-32 shrink-0 rounded-3xl bg-[#1a1d24] border border-[#333] overflow-hidden relative flex items-center justify-center text-[#333]">
                    <Camera className="h-8 w-8" />
                  </div>
                ))}
              </div>
            </div>

            {/* Share a Tought */}
            <div>
              <h3 className="text-sm font-bold text-brand-gold uppercase tracking-wider mb-4">My Thoughs</h3>
              <FeedClient userId={userId} userName={profile.full_name || "User"} userAvatar={profile.avatar_url} />
              
              {/* My Own Posts List */}
              <div className="mt-6 space-y-4">
                {myPosts.length > 0 ? (
                  myPosts.map((post) => (
                    <div key={post.id} className="bg-[#1a1d24] border border-[#333] rounded-2xl p-5 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 rounded-full bg-brand-dark overflow-hidden flex-shrink-0 flex items-center justify-center border border-[#333]">
                            {profile.avatar_url ? (
                              <Image src={profile.avatar_url} alt={profile.full_name} fill className="object-cover" />
                            ) : (
                              <span className="text-brand-gold font-bold">{profile.full_name[0]?.toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-brand-light text-sm">{profile.full_name}</h3>
                            <p className="text-[10px] text-brand-muted">
                              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-brand-light text-sm leading-relaxed whitespace-pre-wrap">
                        {post.content}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-[#1a1d24] rounded-2xl border border-[#333]">
                    <p className="text-brand-muted text-sm">You haven't shared any thoughs yet.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {activeTab === "Though" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id} className="bg-[#1a1d24] border border-[#333] rounded-3xl p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <Link href={post.author_id === userId ? "/profile" : `/friends/${post.author_id}`} className="flex items-center gap-3 group">
                      <div className="relative h-10 w-10 rounded-full border border-[#333] bg-brand-dark overflow-hidden flex-shrink-0 flex items-center justify-center">
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
                        <p className="text-[10px] text-brand-muted">
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </Link>
                  </div>
                  <div className="mt-3 text-brand-light text-sm leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-[#1a1d24] rounded-3xl border border-[#333]">
                <p className="text-brand-muted mb-2">No thoughs yet.</p>
                <p className="text-sm text-gray-500">Switch to your Profile to share the first one!</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
