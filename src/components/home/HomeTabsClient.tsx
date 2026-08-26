"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, MessageSquare, Tent, Heart, Pencil, Camera, X } from "lucide-react";
import FeedClient from "@/components/social/FeedClient";
import { formatDistanceToNow } from "date-fns";
import { uploadImage, storagePath } from "@/lib/upload";
import { createClient } from "@/lib/supabase/client";

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

  const angkatan = "44";
  const city = "Surabaya";
  const mobile = "+6281234567890";
  const waLink = `https://wa.me/${mobile.replace(/\D/g, '')}`;
  
  const defaultImage = profile.avatar_url || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop";
  const [userGallery, setUserGallery] = useState<string[]>(profile.gallery_urls || []);
  const galleryImages = [defaultImage, ...userGallery];
  
  const [activeImage, setActiveImage] = useState(defaultImage);
  const [uploading, setUploading] = useState(false);

  const [myServices, setMyServices] = useState([
    { name: "Pria Sejati Camp 45", status: "Ongoing - Fasilitator" }, 
    { name: "Patriot Camp 19", status: "Finished - Peserta" }
  ]);

  const handleAddService = () => {
    const name = window.prompt("Enter Service Name (e.g. Pria Sejati Camp 46):");
    if (name) {
      setMyServices([{ name, status: "Ongoing - Peserta" }, ...myServices]);
    }
  };

  const handleDeleteImage = async (indexToDelete: number) => {
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
        <Image src={activeImage} alt={profile.full_name} fill className="object-cover transition-all duration-300" />
        
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
                  <Image src={img} alt={`Gallery ${idx}`} fill className="object-cover" />
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
            onClick={() => setActiveTab("Though")}
            className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === "Though" ? "bg-brand-gold text-brand-dark shadow-md" : "text-brand-muted hover:text-white"}`}
          >
            Though
          </button>
        </div>
      </div>

      <div className="mt-4">
        
        {activeTab === "Profile" && (
          <div className="px-6 space-y-8 animate-in fade-in duration-300 pb-12">
            
            <div>
              <h3 className="text-sm font-bold text-brand-gold uppercase tracking-wider mb-4 flex items-center gap-2">
                <Tent className="h-4 w-4" /> My Services
              </h3>
              <div className="space-y-3">
                {myServices.map((svc, idx) => (
                  <div key={idx} className="bg-[#1a1d24] border border-[#333] p-4 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-brand-gold/50 transition-colors">
                    <div>
                      <h4 className="font-bold text-sm text-brand-light group-hover:text-white transition-colors">{svc.name}</h4>
                      <p className={`text-xs mt-1 ${svc.status.includes("Ongoing") ? "text-brand-gold" : "text-gray-500"}`}>{svc.status}</p>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-brand-dark flex items-center justify-center border border-[#333] group-hover:border-brand-gold/50 text-brand-muted">
                      <Pencil className="h-3 w-3" />
                    </div>
                  </div>
                ))}
                
                <button onClick={handleAddService} className="w-full py-3 border border-dashed border-[#333] rounded-2xl text-xs font-bold text-brand-muted hover:text-brand-gold hover:border-brand-gold/50 transition-colors">
                  + Add My Service
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-brand-gold uppercase tracking-wider mb-4 flex items-center gap-2">
                <Heart className="h-4 w-4" /> Ongoing Devotion
              </h3>
              <div className="space-y-3">
                <div className="bg-[#1a1d24] border border-[#333] p-4 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-brand-gold/50 transition-colors">
                  <div>
                    <h4 className="font-bold text-sm text-brand-light group-hover:text-white transition-colors">Gospel of John</h4>
                    <p className="text-xs text-rose-500 mt-2 font-medium bg-rose-500/10 px-2 py-1 rounded inline-flex">Reminder: Finish today&apos;s devotion!</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-brand-dark flex items-center justify-center border border-[#333] group-hover:border-brand-gold/50 text-brand-muted">
                    <Pencil className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {activeTab === "Though" && (
          <div className="animate-in fade-in duration-300">
            <FeedClient userId={userId} userName={profile.full_name || "User"} userAvatar={profile.avatar_url} />
            
            <div className="space-y-2 pb-12">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <div key={post.id} className="bg-[#1a1d24] border-b border-[#333] p-4 flex gap-3">
                    <Link href={post.author_id === userId ? "/profile" : `/friends/${post.author_id}`} className="flex-shrink-0">
                      <div className="relative h-10 w-10 rounded-full border border-[#333] bg-brand-dark overflow-hidden flex items-center justify-center z-10">
                        {post.profiles?.avatar_url ? (
                          <Image src={post.profiles.avatar_url} alt={post.profiles.full_name} fill className="object-cover" />
                        ) : (
                          <span className="text-brand-gold font-bold">{(post.profiles?.full_name || "U")[0]?.toUpperCase()}</span>
                        )}
                      </div>
                    </Link>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <Link href={post.author_id === userId ? "/profile" : `/friends/${post.author_id}`}>
                          <span className="font-bold text-white text-[15px] hover:underline">
                            {post.profiles?.full_name || "Unknown User"}
                          </span>
                        </Link>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <div className="text-brand-light text-[15px] leading-relaxed whitespace-pre-wrap">
                        {post.content}
                      </div>
                      
                      <div className="flex items-center gap-6 mt-4">
                        <button className="text-gray-500 hover:text-rose-500 transition-colors">
                          <Heart className="h-4 w-4" />
                        </button>
                        <button className="text-gray-500 hover:text-brand-light transition-colors">
                          <MessageSquare className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-brand-muted mb-2">No thoughs yet.</p>
                  <p className="text-sm text-gray-500">Share the first one!</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}


