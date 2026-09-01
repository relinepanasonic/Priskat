"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, MessageSquare, Tent, Heart, Pencil, Camera, X, Instagram, Users, ArrowRight } from "lucide-react";
import FeedClient from "@/components/social/FeedClient";
import { formatDistanceToNow } from "date-fns";
import { uploadImage, storagePath } from "@/lib/upload";
import VinylPlayer from "./VinylPlayer";
import { createClient } from "@/lib/supabase/client";

export default function HomeTabsClient({
  profile,
  posts,
  userId,
  activeDevotion,
  myCamps = [],
  lang = "id"
}: {
  profile: any,
  posts: any[],
  userId: string,
  activeDevotion?: any,
  myCamps?: any[],
  lang?: "id" | "en"
}) {
  const [activeTab, setActiveTab] = useState<"Thought" | "Profile" | "Service">("Thought");

  const angkatan = profile.angkatan || "-";
  const city = profile.kota || "-";
  const instagram = profile.instagram || "";
  
  const defaultImage = profile.avatar_url || "";
  const [userGallery, setUserGallery] = useState<string[]>(profile.gallery_urls || []);
  const galleryImages = [defaultImage, ...userGallery];
  
  const [activeImage, setActiveImage] = useState(defaultImage);
  const [uploading, setUploading] = useState(false);

  const myServices = profile.services_history || []; 
  const myJourney = profile.camp_history || []; 

  const handleDeleteImage = async (indexToDelete: number) => {
    const newGallery = userGallery.filter((_, idx) => idx !== indexToDelete);
    setUserGallery(newGallery);
    try {
      const supabase = createClient(); await supabase.from("profiles").update({ gallery_urls: newGallery } as any).eq("id", userId); 
    } catch (err) {}
  };

  const handleUploadGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, "avatars", storagePath(userId, "gallery_" + Date.now() + "_" + file.name));
      const newGallery = [...userGallery, url];
      setUserGallery(newGallery);
      setActiveImage(url);
      
      const supabase = createClient(); await supabase.from("profiles").update({ gallery_urls: newGallery } as any).eq("id", userId); 
    } catch (err) {
      console.error("Upload failed", err);
      alert(lang === "en" ? "Upload failed" : "Gagal mengunggah");
    } finally {
      setUploading(false);
    }
  };

  const isEn = lang === "en";

  return (
    <div className="w-full max-w-md mx-auto bg-brand-dark min-h-screen relative font-sans text-white pb-24 md:pb-12">
      
      <div className="relative h-[480px] w-full bg-[#222]">
        {activeImage ? <Image src={activeImage} alt={profile.full_name} fill className="object-cover transition-all duration-300" /> : <div className="w-full h-full bg-black"></div>}
        
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/30 to-transparent"></div>

        <Link href="/profile/edit" className="absolute top-6 right-6 h-10 w-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors z-10">
          <Pencil className="h-4 w-4" />
        </Link>

        <div className="absolute bottom-[90px] right-4 flex flex-col gap-3 z-20">
          
          {instagram && (
            <a href={`https://instagram.com/${instagram.replace(/^@/, '')}`} target="_blank" rel="noreferrer" className="h-12 w-12 bg-[#1a1d24]/80 backdrop-blur-md border border-[#333] rounded-full flex items-center justify-center text-brand-gold shadow-lg shadow-black/50 hover:bg-[#2a2d35] transition-colors">
              <Instagram className="h-5 w-5" />
            </a>
          )}
          <button onClick={() => alert("Private message feature coming soon!")} className="h-12 w-12 bg-[#1a1d24]/80 backdrop-blur-md border border-[#333] rounded-full flex items-center justify-center text-brand-gold shadow-lg shadow-black/50 hover:bg-[#2a2d35] transition-colors">
            <MessageSquare className="h-5 w-5 fill-current" />
          </button>
        </div>

        <div className="absolute bottom-[100px] left-6 text-white max-w-[65%] z-10">
          <h1 className="text-3xl font-bold leading-tight drop-shadow-md">{profile.nama_panggilan || profile.full_name}</h1>
          <p className="text-sm text-brand-light mt-1 font-medium drop-shadow-md flex items-center gap-1.5">
            <Tent className="w-4 h-4" />
            {profile.community?.name || "Ruang Iman"}
          </p>
          {profile.favorite_verse && (
            <p className="text-xs text-brand-gold mt-1 italic drop-shadow-md">
              "{profile.favorite_verse}"
            </p>
          )}
        </div>

        <div className="absolute bottom-4 left-0 right-0 px-4 z-20">
          <div className="flex justify-between items-center bg-[#1a1d24]/60 backdrop-blur-md rounded-[20px] p-2 border border-[#333]">
            {galleryImages.slice(0, 5).map((img, idx) => (
              <div key={idx} className="relative h-14 w-[18%] shrink-0">
                <button 
                  onClick={() => setActiveImage(img)}
                  className={`relative h-full w-full rounded-xl overflow-hidden border-2 transition-all ${activeImage === img ? "border-brand-gold scale-105 shadow-[0_0_15px_rgba(212,175,55,0.3)]" : "border-transparent opacity-70 hover:opacity-100"}`}
                >
                  {img ? <Image src={img} alt={`Gallery ${idx}`} fill className="object-cover" /> : <div className="w-full h-full bg-black flex items-center justify-center text-[10px] text-gray-500">{isEn ? "Empty" : "Kosong"}</div>}
                </button>
                {idx > 0 && activeImage === img && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteImage(idx - 1); }}
                    className="absolute -top-1.5 -right-1.5 bg-[#1a1d24] border border-[#333] text-white rounded-full p-0.5 hover:scale-110 transition-transform shadow-md z-10"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
            
            {galleryImages.length < 5 && (
              <label className="relative h-14 w-[18%] shrink-0 rounded-xl bg-[#1a1d24]/80 backdrop-blur-md border border-dashed border-[#555] flex items-center justify-center text-brand-light hover:text-brand-gold hover:border-brand-gold transition-colors cursor-pointer">
                {uploading ? <div className="h-4 w-4 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div> : <Camera className="h-5 w-5" />}
                <input type="file" accept="image/*" className="sr-only" onChange={handleUploadGallery} disabled={uploading} />
              </label>
            )}
            
            {Array.from({ length: 5 - galleryImages.length - (galleryImages.length < 5 ? 1 : 0) }).map((_, i) => (
               <div key={`empty-${i}`} className="h-14 w-[18%] shrink-0"></div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Vinyl Records & Mini Player */}
      <VinylPlayer initialSongs={profile.favorite_songs || []} userId={userId} />

      {/* Stats: My Services + Ongoing Devotion */}
      <div className="px-4 mt-6 flex flex-col gap-3">
        {/* Ongoing Devotion Premium Card */}
        <Link href="/faith/devotions/plans" className="relative overflow-hidden bg-gradient-to-br from-[#2a2415] to-[#14120b] border border-brand-gold/20 rounded-2xl p-4 flex flex-col hover:border-brand-gold/50 hover:shadow-[0_0_15px_rgba(212,175,55,0.15)] transition-all group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Heart className="w-16 h-16 text-brand-gold" />
          </div>
          <div className="relative z-10 flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-brand-gold/10 flex items-center justify-center border border-brand-gold/20">
                <Heart className="h-4 w-4 text-brand-gold" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-gold/90">{isEn ? "Ongoing Devotion" : "Renungan Berjalan"}</span>
            </div>
            {activeDevotion ? (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]">{isEn ? "Active" : "Aktif"}</span>
            ) : (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/40 text-brand-muted border border-[#333]">{isEn ? "None" : "Tidak ada"}</span>
            )}
          </div>
          
          <div className="relative z-10">
            {activeDevotion ? (
              <>
                <h3 className="text-sm font-serif font-bold text-white mb-2 leading-tight pr-8">{activeDevotion.plan?.[isEn ? "title_en" : "title_id"] || (isEn ? "Devotional" : "Renungan")}</h3>
                <div className="mt-2 bg-black/40 rounded-xl p-3 border border-white/5">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-semibold text-brand-light">{isEn ? "Day" : "Hari"} {activeDevotion.current_day} <span className="text-brand-muted font-normal">/ {activeDevotion.plan?.total_days || "?"}</span></span>
                    <span className="text-[10px] text-brand-gold font-bold">{Math.round(((activeDevotion.current_day - 1) / (activeDevotion.plan?.total_days || 1)) * 100)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#222] overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-[#d4af37] to-[#f3e5ab] rounded-full transition-all duration-1000 relative"
                      style={{width: `${Math.min(100, Math.max(2, Math.round(((activeDevotion.current_day - 1) / (activeDevotion.plan?.total_days || 1)) * 100)))}%`}}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-2">
                <h3 className="text-sm font-serif font-bold text-white/80">{isEn ? "Start a New Devotional" : "Mulai Renungan Baru"}</h3>
                <p className="text-xs text-brand-muted mt-1">{isEn ? "Tap to browse our collection of reading plans." : "Ketuk untuk melihat koleksi rencana bacaan kami."}</p>
              </div>
            )}
          </div>
        </Link>

        {/* My Services Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1d24] to-[#0f1115] border border-[#2a2d35] rounded-2xl p-4 flex items-center justify-between hover:border-[#3a3d45] transition-colors group">
          <div className="absolute left-0 bottom-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
            <Tent className="w-20 h-20 text-white" />
          </div>
          <div className="relative z-10 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-surface border border-[#333] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Tent className="h-5 w-5 text-brand-light" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{isEn ? "My Services" : "Pelayanan Saya"}</p>
              <p className="text-xs text-brand-muted mt-0.5 max-w-[180px] truncate">
                {myServices.length > 0 ? `${isEn ? "Latest:" : "Terakhir:"} ${myServices[myServices.length - 1]?.position || "?"}` : (isEn ? "No service records yet" : "Belum ada catatan pelayanan")}
              </p>
            </div>
          </div>
          <div className="relative z-10 flex flex-col items-end">
            <span className="text-2xl font-serif font-bold text-brand-gold leading-none">{myServices.length}</span>
            <span className="text-[9px] uppercase tracking-wider text-brand-muted mt-1">{isEn ? "Records" : "Catatan"}</span>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-40 bg-brand-dark/95 backdrop-blur-md pt-6 pb-4 px-4 mt-2 border-b border-[#333]">
        <div className="bg-[#1a1d24] p-1.5 rounded-full shadow-lg flex items-center gap-1 border border-[#333] w-full max-w-[360px] mx-auto">
          <button
            onClick={() => setActiveTab("Profile")}
            className={`flex-1 py-2.5 px-1 rounded-full text-xs font-bold transition-all ${activeTab === "Profile" ? "bg-brand-gold text-brand-dark shadow-md" : "text-brand-muted hover:text-white"}`}
          >
            {isEn ? "Profile" : "Profil"}
          </button>
          <button
            onClick={() => setActiveTab("Thought")}
            className={`flex-1 py-2.5 px-1 rounded-full text-xs font-bold transition-all ${activeTab === "Thought" ? "bg-brand-gold text-brand-dark shadow-md" : "text-brand-muted hover:text-white"}`}
          >
            {isEn ? "My Thought" : "Pikiran Saya"}
          </button>
          <button
            onClick={() => setActiveTab("Service")}
            className={`flex-1 py-2.5 px-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${activeTab === "Service" ? "bg-brand-gold text-brand-dark shadow-md" : "text-brand-muted hover:text-white"}`}
          >
            {isEn ? "My Service" : "Pelayanan Saya"}
          </button>
        </div>
      </div>

      <div className="mt-4">
        
        {activeTab === "Profile" && (
          <div className="px-6 space-y-8 animate-in fade-in duration-300 pb-12">
            
            {/* MY JOURNEY */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-brand-gold uppercase tracking-wider flex items-center gap-2">
                  <Tent className="h-4 w-4" /> {isEn ? "My Journey" : "Perjalanan Saya"}
                </h3>
                <Link href="/profile/edit" className="text-gray-500 hover:text-brand-gold transition-colors p-1">
                  <Pencil className="h-4 w-4" />
                </Link>
              </div>
              
              <div className="relative pl-6 space-y-5 before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-[#333]">
                {myJourney.length > 0 ? myJourney.map((camp: any, idx: number) => (
                  <div key={idx} className="relative">
                    {/* Timeline Dot */}
                    <div className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand-gold ring-4 ring-brand-dark shadow-[0_0_10px_rgba(212,175,55,0.5)]"></div>
                    
                    <div className="bg-[#1a1d24] border border-[#333] p-4 rounded-2xl group hover:border-brand-gold/30 transition-colors relative overflow-hidden shadow-sm">
                      <div className="absolute top-0 left-0 w-1 h-full bg-brand-gold/20 group-hover:bg-brand-gold transition-colors"></div>
                      <h4 className="font-bold text-sm text-white">{camp.camp}</h4>
                      <p className="text-xs mt-1 text-gray-400">Angkatan {camp.angkatan} <span className="mx-1 text-[#444]">•</span> {camp.kota}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-brand-muted italic">{isEn ? "No camps added yet." : "Belum ada camp."}</p>
                )}
              </div>
            </div>

            {/* MY SERVICES */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-brand-gold uppercase tracking-wider flex items-center gap-2">
                  <Heart className="h-4 w-4" /> {isEn ? "My Services" : "Pelayanan Saya"}
                </h3>
                <Link href="/profile/edit" className="text-gray-500 hover:text-brand-gold transition-colors p-1">
                  <Pencil className="h-4 w-4" />
                </Link>
              </div>
              
              <div className="relative pl-6 space-y-5 before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-gradient-to-b before:from-brand-gold/50 before:to-[#333]">
                {myServices.length > 0 ? myServices.map((svc: any, idx: number) => (
                  <div key={idx} className="relative">
                    {/* Timeline Dot */}
                    <div className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand-gold ring-4 ring-brand-dark shadow-[0_0_10px_rgba(212,175,55,0.5)]"></div>
                    
                    <div className="bg-[#1a1d24] border border-[#333] p-4 rounded-2xl group hover:border-brand-gold/30 transition-colors relative overflow-hidden shadow-sm">
                      <div className="absolute top-0 left-0 w-1 h-full bg-brand-gold/20 group-hover:bg-brand-gold transition-colors"></div>
                      <div className="flex items-center gap-2 mb-1">
                        <Heart className="h-3.5 w-3.5 text-brand-gold" />
                        <h4 className="font-bold text-sm text-white">{svc.position}</h4>
                      </div>
                      <p className="text-xs text-gray-400">{svc.camp} <span className="mx-1 text-[#444]">•</span> Angkatan {svc.angkatan}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-brand-muted italic">{isEn ? "No services added yet." : "Belum ada pelayanan."}</p>
                )}
              </div>
            </div>

          </div>
        )}

        {activeTab === "Thought" && (
          <div className="px-6 animate-in fade-in duration-300 pb-12">
            <FeedClient userAvatar={profile.avatar_url} userName={profile.full_name} userId={userId} posts={posts} lang={lang} />
          </div>
        )}

        {activeTab === "Service" && (
          <div className="px-6 space-y-4 animate-in fade-in duration-300 pb-12">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-brand-gold uppercase tracking-wider flex items-center gap-2">
                <Tent className="h-4 w-4" /> {isEn ? "My Service" : "Pelayanan Saya"}
              </h3>
            </div>
            <p className="text-xs text-brand-muted -mt-2">
              {isEn ? "Combined across all your communities." : "Digabung dari semua komunitasmu."}
            </p>

            {myCamps.length > 0 ? (
              <div className="space-y-3">
                {myCamps.map((camp: any) => {
                  const title = camp.camp_name === "Other Event" ? camp.custom_name : camp.camp_name;
                  const subtitle = camp.camp_name !== "Other Event"
                    ? `${isEn ? "Angkatan" : "Angkatan"} ${camp.angkatan}`
                    : (isEn ? "Custom Event" : "Acara Khusus");
                  const inner = (
                    <div className="bg-[#1a1d24] border border-[#333] rounded-2xl p-4 group hover:border-brand-gold/40 transition-colors relative overflow-hidden shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div className="h-10 w-10 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                          <Tent className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {camp.communityName && (
                            <span className="bg-brand-gold/10 text-[10px] font-bold px-2.5 py-1 rounded-full text-brand-gold border border-brand-gold/30">
                              {camp.communityName}
                            </span>
                          )}
                          {camp.branch && (
                            <span className="bg-[#222] text-[10px] font-bold px-2.5 py-1 rounded-full text-gray-300 border border-[#333]">
                              {camp.branch}
                            </span>
                          )}
                        </div>
                      </div>
                      <h4 className="font-bold text-sm text-white group-hover:text-brand-gold transition-colors">{title}</h4>
                      <p className="text-xs text-brand-muted mt-0.5">{subtitle}</p>
                      <div className="mt-3 pt-3 border-t border-[#222] flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Users className="h-3.5 w-3.5" />
                          <span>{isEn ? "Role:" : "Peran:"} <span className="text-white font-semibold">{camp.myRole}</span></span>
                        </div>
                        {camp.communitySlug && <ArrowRight className="h-4 w-4 text-[#555] group-hover:text-brand-gold transition-colors" />}
                      </div>
                    </div>
                  );
                  return camp.communitySlug ? (
                    <Link key={camp.id} href={`/camp/${camp.communitySlug}/ongoing/${camp.id}`}>{inner}</Link>
                  ) : (
                    <div key={camp.id}>{inner}</div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 bg-[#1a1d24] border border-[#333] rounded-full flex items-center justify-center mb-4">
                  <Tent className="w-7 h-7 text-brand-muted" />
                </div>
                <h4 className="text-base font-bold text-white mb-1">{isEn ? "No Service Yet" : "Belum Ada Pelayanan"}</h4>
                <p className="text-sm text-brand-muted max-w-[240px]">
                  {isEn ? "You are not currently assigned to any active camps." : "Kamu belum ditugaskan di camp aktif mana pun."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
