"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, MessageSquare, Tent, Heart, Pencil, Camera, X } from "lucide-react";
import FeedClient from "@/components/social/FeedClient";
import { formatDistanceToNow } from "date-fns";
import { uploadImage, storagePath } from "@/lib/upload";
import MiniPlayer from "./MiniPlayer";
import { createClient } from "@/lib/supabase/client";

export default function HomeTabsClient({ 
  profile, 
  posts, 
  userId,
  activeDevotion
}: { 
  profile: any, 
  posts: any[], 
  userId: string,
  activeDevotion?: any
}) {
  const [activeTab, setActiveTab] = useState<"Profile" | "Community">("Profile");

  const angkatan = profile.angkatan || "-";
  const city = profile.kota || "-";
  const mobile = profile.phone || "";
  const waLink = `https://wa.me/${mobile.replace(/\D/g, '')}`;
  
  const defaultImage = profile.avatar_url || "";
  const [userGallery, setUserGallery] = useState<string[]>(profile.gallery_urls || []);
  const galleryImages = [defaultImage, ...userGallery];
  
  const [activeImage, setActiveImage] = useState(defaultImage);
  const [uploading, setUploading] = useState(false);

  const myServices = profile.services_history || []; const myJourney = profile.camp_history || []; const handleDeleteImage = async (indexToDelete: number) => {
    const newGallery = userGallery.filter((_, idx) => idx !== indexToDelete);
    setUserGallery(newGallery);
    try {
      try { const supabase = createClient(); await supabase.from("profiles").update({ gallery_urls: newGallery } as any).eq("id", userId); } catch (e) {}
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
      
      try { const supabase = createClient(); await supabase.from("profiles").update({ gallery_urls: newGallery } as any).eq("id", userId); } catch (e) {}
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-brand-dark min-h-screen relative font-sans text-white pb-24 md:pb-12">
      
      <div className="relative h-[480px] w-full bg-[#222]">
        {activeImage ? <Image src={activeImage} alt={profile.full_name} fill className="object-cover transition-all duration-300" /> : <div className="w-full h-full bg-black"></div>}
        
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/30 to-transparent"></div>

        <Link href="/profile/edit" className="absolute top-6 right-6 h-10 w-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors z-10">
          <Pencil className="h-4 w-4" />
        </Link>

        <div className="absolute bottom-[90px] right-4 flex flex-col gap-3 z-20">
          <a href={`tel:${mobile}`} className="h-12 w-12 bg-[#1a1d24]/80 backdrop-blur-md border border-[#333] rounded-full flex items-center justify-center text-brand-gold shadow-lg shadow-black/50 hover:bg-[#2a2d35] transition-colors">
            <Phone className="h-5 w-5 fill-current" />
          </a>
          <a href={waLink} target="_blank" rel="noreferrer" className="h-12 w-12 bg-[#1a1d24]/80 backdrop-blur-md border border-[#333] rounded-full flex items-center justify-center text-brand-gold shadow-lg shadow-black/50 hover:bg-[#2a2d35] transition-colors">
            <MessageSquare className="h-5 w-5 fill-current" />
          </a>
        </div>

        <div className="absolute bottom-[100px] left-6 text-white max-w-[65%] z-10">
          <h1 className="text-3xl font-bold leading-tight drop-shadow-md">{profile.full_name}</h1>
          <p className="text-sm text-brand-light mt-1 font-medium drop-shadow-md">Alumni Priskat {city}</p>
          <p className="text-xs text-brand-muted drop-shadow-md">Angkatan {angkatan}</p>
        </div>

        <div className="absolute bottom-4 left-0 right-0 px-4 z-20">
          <div className="flex justify-between items-center bg-[#1a1d24]/60 backdrop-blur-md rounded-[20px] p-2 border border-[#333]">
            {galleryImages.slice(0, 5).map((img, idx) => (
              <div key={idx} className="relative h-14 w-[18%] shrink-0">
                <button 
                  onClick={() => setActiveImage(img)}
                  className={`relative h-full w-full rounded-xl overflow-hidden border-2 transition-all ${activeImage === img ? "border-brand-gold scale-105 shadow-[0_0_15px_rgba(212,175,55,0.3)]" : "border-transparent opacity-70 hover:opacity-100"}`}
                >
                  {img ? <Image src={img} alt={`Gallery ${idx}`} fill className="object-cover" /> : <div className="w-full h-full bg-black flex items-center justify-center text-[10px] text-gray-500">Empty</div>}
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
      
      {/* Mini Player */}
      <MiniPlayer />

      <div className="px-6 mt-6">
        <div className="bg-[#1a1d24] rounded-3xl p-5 flex justify-evenly items-center shadow-sm border border-[#333]">
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-brand-dark flex items-center justify-center text-brand-gold border border-[#333]">
              <Tent className="h-5 w-5" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-brand-gold">{myServices.length}</p>
              <p className="text-[10px] text-brand-muted font-medium uppercase tracking-wider">My Services</p>
            </div>
          </div>
          
          <div className="w-px h-12 bg-[#2a2d35]"></div>
          
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-brand-dark flex items-center justify-center text-brand-gold border border-[#333]">
              <Heart className="h-5 w-5" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-brand-gold">1</p>
              <p className="text-[10px] text-brand-muted font-medium uppercase tracking-wider">Ongoing Devotion</p>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-40 bg-brand-dark/95 backdrop-blur-md pt-6 pb-4 px-6 mt-2 border-b border-[#333]">
        <div className="bg-[#1a1d24] p-1.5 rounded-full shadow-lg flex items-center gap-1 border border-[#333] w-full max-w-[280px] mx-auto">
          <button 
            onClick={() => setActiveTab("Profile")}
            className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === "Profile" ? "bg-brand-gold text-brand-dark shadow-md" : "text-brand-muted hover:text-white"}`}
          >
            Profile
          </button>
          <button 
            onClick={() => setActiveTab("Community")}
            className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === "Community" ? "bg-brand-gold text-brand-dark shadow-md" : "text-brand-muted hover:text-white"}`}
          >
            Community
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
                  <Tent className="h-4 w-4" /> My Journey
                </h3>
              </div>
              
              <div className="relative pl-6 space-y-5 before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-gradient-to-b before:from-brand-gold/50 before:to-[#333]">
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
                  <p className="text-sm text-brand-muted italic">No camps added yet.</p>
                )}
              </div>
              
              <Link href="/profile/edit" className="mt-5 block text-center w-full py-2.5 border border-dashed border-[#444] rounded-xl text-xs font-bold text-gray-500 hover:text-brand-gold hover:border-brand-gold/50 transition-colors bg-[#1a1d24]/50 hover:bg-[#1a1d24]">
                Edit My Journey
              </Link>
            </div>

            {/* MY SERVICES */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-brand-gold uppercase tracking-wider flex items-center gap-2">
                  <Heart className="h-4 w-4" /> My Services
                </h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {myServices.length > 0 ? myServices.map((svc: any, idx: number) => (
                  <div key={idx} className="bg-[#1a1d24] border border-[#333] p-4 rounded-2xl flex flex-col items-center text-center group hover:border-brand-gold/40 transition-colors relative overflow-hidden shadow-sm">
                    {/* Subtle Gold Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-brand-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    {/* Badge Icon */}
                    <div className="h-10 w-10 mb-3 rounded-full bg-brand-dark border border-brand-gold/30 flex items-center justify-center text-brand-gold relative z-10 shadow-[0_0_15px_rgba(212,175,55,0.15)] group-hover:scale-110 transition-transform duration-300">
                      <Heart className="h-4 w-4 fill-brand-gold/20 group-hover:fill-brand-gold transition-all" />
                    </div>
                    
                    <h4 className="font-bold text-[11px] text-white uppercase tracking-wide relative z-10 leading-tight mb-1">{svc.position}</h4>
                    <p className="text-[10px] text-brand-gold relative z-10 font-medium">{svc.camp}</p>
                    <p className="text-[9px] text-gray-500 relative z-10 mt-0.5">Angkatan {svc.angkatan}</p>
                  </div>
                )) : (
                  <p className="text-sm text-brand-muted italic col-span-2">No services added yet.</p>
                )}
              </div>
              
              <Link href="/profile/edit" className="mt-4 block text-center w-full py-2.5 border border-dashed border-[#444] rounded-xl text-xs font-bold text-gray-500 hover:text-brand-gold hover:border-brand-gold/50 transition-colors bg-[#1a1d24]/50 hover:bg-[#1a1d24]">
                Edit My Services
              </Link>
            </div>

          </div>
        )}

        {activeTab === "Community" && (
          <div className="px-6 animate-in fade-in duration-300 pb-12">
            <FeedClient userAvatar={profile.avatar_url} userName={profile.full_name} userId={userId} />
          </div>
        )}
      </div>
    </div>
  );
}
