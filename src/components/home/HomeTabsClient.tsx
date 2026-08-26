"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Phone, Video, Calendar, MapPin, Award, Heart, Camera, Settings, Star, Info, MessageSquare, Tent } from "lucide-react";
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
  const achievements = profile.completed_achievements?.length ? profile.completed_achievements : ["Pria Sejati", "Patriot 19"];

  return (
    <div className="min-h-screen bg-brand-dark text-white pb-24 md:pb-12 font-sans relative">
      
      {/* Top Tab Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-safe bg-transparent pointer-events-none mt-4 md:mt-8">
        <div className="bg-[#1a1d24]/80 backdrop-blur-md p-1 rounded-full shadow-lg flex items-center gap-1 pointer-events-auto border border-white/40">
          <button 
            onClick={() => setActiveTab("Profile")}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === "Profile" ? "bg-brand-gold text-white shadow-md" : "text-brand-muted hover:bg-[#2a2d35]"}`}
          >
            Profile
          </button>
          <button 
            onClick={() => setActiveTab("Though")}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === "Though" ? "bg-brand-gold text-white shadow-md" : "text-brand-muted hover:bg-[#2a2d35]"}`}
          >
            Though
          </button>
        </div>
      </div>

      {activeTab === "Profile" && (
        <div className="w-full max-w-md mx-auto bg-brand-dark min-h-screen relative">
          
          {/* Big Header Image (Curved) */}
          <div className="relative h-[420px] w-full rounded-b-[45px] overflow-hidden bg-[#222] shadow-md">
            {profile.avatar_url ? (
              <Image src={profile.avatar_url} alt={profile.full_name} fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#222] to-[#111]">
                <span className="text-8xl text-white/30 font-bold">{profile.full_name[0]?.toUpperCase()}</span>
              </div>
            )}
            
            {/* Top right settings button */}
            <Link href="/profile/edit" className="absolute top-6 right-6 h-10 w-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/40 transition-colors z-10">
              <Settings className="h-5 w-5" />
            </Link>

            {/* Overlay Gradient for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-brand-dark/20 to-transparent"></div>

            {/* Name and Title Overlay (Bottom Left) */}
            <div className="absolute bottom-20 left-6 text-white">
              <div className="bg-[#1a1d24]/20 backdrop-blur-md px-3 py-1 rounded-full w-fit flex items-center gap-1 mb-2">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-bold">5.0</span>
              </div>
              <h1 className="text-3xl font-bold leading-tight">{profile.full_name}</h1>
              <p className="text-sm text-white/80 mt-1 font-medium">Alumni Priskat {city}</p>
              <p className="text-xs text-white/60">Angkatan {angkatan}</p>
            </div>
          </div>

          {/* Floating Action Row (Overlaps the image bottom edge) */}
          <div className="relative -mt-10 px-6 z-20 flex items-center justify-between">
            <button className="bg-brand-gold/10 text-brand-gold px-5 py-3.5 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg shadow-black/50">
              <Info className="h-4 w-4" />
              Details
            </button>
            <div className="flex gap-3">
              <a href={`tel:${mobile}`} className="h-12 w-12 bg-[#1a1d24] rounded-full flex items-center justify-center text-brand-gold shadow-lg shadow-black/50 hover:bg-gray-50 transition-colors">
                <Phone className="h-5 w-5 fill-current" />
              </a>
              <button className="h-12 w-12 bg-[#1a1d24] rounded-full flex items-center justify-center text-brand-gold shadow-lg shadow-black/50 hover:bg-gray-50 transition-colors">
                <Video className="h-5 w-5 fill-current" />
              </button>
              <a href={waLink} target="_blank" rel="noreferrer" className="h-12 w-12 bg-[#1a1d24] rounded-full flex items-center justify-center text-brand-gold shadow-lg shadow-black/50 hover:bg-gray-50 transition-colors">
                <MessageSquare className="h-5 w-5 fill-current" />
              </a>
            </div>
          </div>

          {/* Stats Card */}
          <div className="px-6 mt-6">
            <div className="bg-[#1a1d24] rounded-[30px] p-5 flex justify-between items-center shadow-sm border border-[#333]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-brand-dark flex items-center justify-center text-brand-light">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-brand-gold">{achievements.length}</p>
                  <p className="text-[10px] text-brand-muted font-medium">Achievements</p>
                </div>
              </div>
              <div className="w-px h-8 bg-[#2a2d35]"></div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-brand-dark flex items-center justify-center text-brand-light">
                  <Tent className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-brand-gold">2</p>
                  <p className="text-[10px] text-brand-muted font-medium">Ongoing Camp</p>
                </div>
              </div>
              <div className="w-px h-8 bg-[#2a2d35]"></div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-brand-dark flex items-center justify-center text-brand-light">
                  <Heart className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-brand-gold">1</p>
                  <p className="text-[10px] text-brand-muted font-medium">Devotion</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="px-6 mt-8 space-y-8 bg-[#1a1d24] pt-8 pb-12 rounded-t-[40px] shadow-sm min-h-[500px]">
            
            {/* Share a Tought */}
            <div>
              <h3 className="text-lg font-bold text-brand-gold mb-4">Share your Tought</h3>
              {/* Note: FeedClient handles post insertion to community_posts */}
              <FeedClient userId={userId} userName={profile.full_name || "User"} userAvatar={profile.avatar_url} />
            </div>

            {/* Achievements */}
            <div>
              <h3 className="text-lg font-bold text-brand-gold mb-3">My Achievements</h3>
              <div className="space-y-3">
                {achievements.map((mod: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-4 p-3 bg-brand-dark rounded-2xl">
                    <div className="h-12 w-12 bg-brand-gold rounded-xl flex items-center justify-center text-white shrink-0">
                      <Award className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{mod}</p>
                      <p className="text-xs text-brand-muted">Completed Camp</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Camp Crew Ongoing */}
            <div>
              <h3 className="text-lg font-bold text-brand-gold mb-3">Camp Crew Ongoing</h3>
              <div className="flex items-center gap-4 p-3 border border-[#333] rounded-2xl">
                <div className="h-12 w-12 bg-[#222] rounded-xl flex items-center justify-center text-white shrink-0">
                  <Tent className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Pria Sejati Camp 45</p>
                  <p className="text-xs text-brand-muted">Fasilitator • Ongoing</p>
                </div>
              </div>
            </div>

            {/* Devotion Commit */}
            <div>
              <h3 className="text-lg font-bold text-brand-gold mb-3">Devotion Commitment</h3>
              <div className="flex items-center gap-4 p-3 border border-[#333] rounded-2xl">
                <div className="h-12 w-12 bg-rose-500 rounded-xl flex items-center justify-center text-white shrink-0">
                  <Heart className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Gospel of John</p>
                  <p className="text-xs text-brand-muted">Day 12 of 30</p>
                </div>
              </div>
            </div>

            {/* Gallery */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-brand-gold">My Gallery</h3>
                <button className="text-sm text-[#88a5af] font-bold">See All</button>
              </div>
              <div className="flex overflow-x-auto gap-3 pb-4 hide-scrollbar -mx-6 px-6">
                {gallery.map((item) => (
                  <div key={item} className="h-32 w-32 shrink-0 rounded-2xl bg-[#2a2d35] overflow-hidden relative flex items-center justify-center text-gray-400">
                    <Camera className="h-8 w-8" />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {activeTab === "Though" && (
        <div className="w-full max-w-xl mx-auto pt-24 px-4 min-h-screen">
          <h2 className="text-2xl font-bold text-brand-gold mb-6">Recent Thoughs</h2>
          <div className="space-y-4">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id} className="bg-[#1a1d24] rounded-3xl p-5 shadow-sm border border-[#333]">
                  <div className="flex items-start justify-between">
                    <Link href={post.author_id === userId ? "/profile" : `/friends/${post.author_id}`} className="flex items-center gap-3 group">
                      <div className="relative h-12 w-12 rounded-full bg-[#2a2d35] overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {post.profiles?.avatar_url ? (
                          <Image src={post.profiles.avatar_url} alt={post.profiles.full_name} fill className="object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <span className="text-brand-gold font-bold">{(post.profiles?.full_name || "U")[0]?.toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-brand-gold group-hover:text-brand-light transition-colors text-sm">
                          {post.profiles?.full_name || "Unknown User"}
                        </h3>
                        <p className="text-xs text-brand-muted">
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </Link>
                  </div>
                  <div className="mt-4 text-brand-light text-sm leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-[#1a1d24] rounded-3xl border border-[#333]">
                <p className="text-brand-muted mb-2">No thoughs yet.</p>
                <p className="text-sm text-gray-400">Switch to your Profile to share the first one!</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}


