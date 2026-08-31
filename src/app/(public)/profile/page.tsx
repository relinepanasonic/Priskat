import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Phone, Video, Calendar, MapPin, Award, Book, Newspaper, Users, Tent, Settings, LogOut, Heart, Instagram } from "lucide-react";
import Badge from "@/components/ui/Badge";

export const revalidate = 0; // Dynamic route

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile
  const { data: profileData } = await supabase
    .from("profiles")
    .select("*, community:communities(name)")
    .eq("id", user.id).single();
    
  const profile = profileData as any;

  if (!profile) {
    redirect("/login");
  }

  // Try to find alumni data matching the user's name
  let alumniData = null;
  if (profile.full_name) {
    const { data } = await supabase
      .from("alumni_database")
      .select("*")
      .ilike("name", `%${profile.full_name || "User"}%`)
      .limit(1)
      
    
    if (data && data.length > 0) {
      alumniData = data[0];
    }
  }

  // Fallbacks if no alumni data
  const angkatan = alumniData?.angkatan || "44";
  const city = alumniData?.city || "Surabaya";
  const instagram = profile.instagram || "";
  const modules = profile.completed_modules?.length ? profile.completed_modules : ["Pria Sejati", "Patriot 19"];

  return (
    <div className="min-h-screen bg-brand-dark md:py-12 md:px-8 overflow-y-auto pb-24 md:pb-12">
      <div className="max-w-md mx-auto relative md:rounded-3xl md:shadow-2xl overflow-hidden bg-[#1a1d24]">
        
        {/* Header Curve & Background */}
        <div className="relative h-48 bg-gradient-to-b from-[#111] to-[#222] overflow-hidden">
          {/* Subtle gold accent at the bottom of the dark header */}
          <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[150%] h-48 bg-[#1a1d24] rounded-[100%] border-t-2 border-brand-gold/30"></div>
          
          {/* Settings Icon (Top Right) */}
          <Link href="/profile/edit" className="absolute top-4 right-4 h-10 w-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-brand-gold hover:bg-black/50 transition-colors z-10">
            <Settings className="h-5 w-5" />
          </Link>
        </div>

        {/* Profile Avatar & Info */}
        <div className="relative -mt-20 px-6 flex flex-col items-center">
          
          <div className="relative h-32 w-32 rounded-full border-4 border-[#1a1d24] bg-brand-bg shadow-xl overflow-hidden z-10 flex items-center justify-center">
            {profile.avatar_url ? (
              <Image src={profile.avatar_url} alt={profile.full_name || "User"} fill className="object-cover" />
            ) : (
              <span className="text-4xl font-bold text-brand-gold">{(profile.full_name || "U")[0].toUpperCase()}</span>
            )}
          </div>

          <h1 className="mt-4 text-2xl font-bold text-white text-center">
            {profile.nama_panggilan || profile.full_name || "User"}
          </h1>
          
          <p className="text-sm text-brand-gold mt-1 font-semibold text-center flex items-center gap-1.5">
            <Tent className="w-4 h-4" />
            {profile.community?.name || "Ruang Iman"}
          </p>

          {profile.favorite_verse && (
            <div className="mt-3 px-4 py-2 bg-brand-surface border border-brand-gold/20 rounded-lg text-center max-w-sm">
              <p className="text-xs text-brand-light italic">"{profile.favorite_verse}"</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mt-6">
            <a href={waLink} target="_blank" rel="noreferrer" className="h-12 w-12 rounded-full bg-brand-surface border border-[#333] flex items-center justify-center text-brand-light hover:text-brand-gold hover:border-brand-gold/50 transition-colors shadow-lg group">
              <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </a>
            <a href={`tel:${mobile}`} className="h-12 w-12 rounded-full bg-brand-surface border border-[#333] flex items-center justify-center text-brand-light hover:text-brand-gold hover:border-brand-gold/50 transition-colors shadow-lg group">
              <Phone className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </a>
            <button className="h-12 w-12 rounded-full bg-brand-surface border border-[#333] flex items-center justify-center text-brand-light hover:text-brand-gold hover:border-brand-gold/50 transition-colors shadow-lg group">
              <Video className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {/* Stats / Alumni Info Pill */}
        <div className="px-6 mt-8">
          <div className="bg-brand-surface/50 border border-[#333] rounded-2xl p-4 flex justify-around items-center">
            <div className="flex flex-col items-center gap-1">
              <div className="h-8 w-8 rounded-full bg-[#111] flex items-center justify-center text-brand-gold">
                <MapPin className="h-4 w-4" />
              </div>
              <span className="text-xs text-brand-muted">Regional</span>
              <span className="text-sm font-semibold text-white">{city}</span>
            </div>
            
            <div className="w-px h-10 bg-[#333]"></div>
            
            <div className="flex flex-col items-center gap-1">
              <div className="h-8 w-8 rounded-full bg-[#111] flex items-center justify-center text-brand-gold">
                <Award className="h-4 w-4" />
              </div>
              <span className="text-xs text-brand-muted">Angkatan</span>
              <span className="text-sm font-semibold text-white">{angkatan}</span>
            </div>

            <div className="w-px h-10 bg-[#333]"></div>
            
            <div className="flex flex-col items-center gap-1">
              <div className="h-8 w-8 rounded-full bg-[#111] flex items-center justify-center text-brand-gold">
                <Calendar className="h-4 w-4" />
              </div>
              <span className="text-xs text-brand-muted">Joined</span>
              <span className="text-sm font-semibold text-white">{new Date(profile.created_at).getFullYear()}</span>
            </div>
          </div>
        </div>

        {/* Biography & Phone Number */}
        <div className="px-6 mt-8 space-y-6">
          
          <div>
            <h3 className="text-sm font-semibold text-brand-gold mb-2 uppercase tracking-wider">Alumni</h3>
            <div className="flex flex-wrap gap-2">
              {modules.map((mod: string, idx: number) => (
                <Badge key={idx} variant="gold" className="px-3 py-1 text-sm bg-brand-gold/10 border-brand-gold/30">
                  {mod}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-brand-gold mb-2 uppercase tracking-wider">Handphone No</h3>
            <div className="bg-[#111] border border-[#333] rounded-xl p-4 flex items-center justify-between">
              <span className="text-white font-medium">{mobile}</span>
              <a href={waLink} target="_blank" rel="noreferrer" className="text-xs bg-[#25d366] text-white px-3 py-1.5 rounded-lg font-bold shadow-[0_0_15px_rgba(37,211,102,0.3)] hover:scale-105 transition-transform">
                Chat WA
              </a>
            </div>
          </div>

          {profile.birthdate && (
            <div>
              <h3 className="text-sm font-semibold text-brand-gold mb-2 uppercase tracking-wider">Birthdate</h3>
              <div className="bg-[#111] border border-[#333] rounded-xl p-4">
                <span className="text-white font-medium">
                  {new Date(profile.birthdate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-brand-gold mb-2 uppercase tracking-wider">Biography</h3>
            <div className="bg-[#111] border border-[#333] rounded-xl p-4">
              <p className="text-brand-light text-sm leading-relaxed">
                {profile.bio || "No biography provided. Click settings to add a bio."}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Links */}
        <div className="px-6 mt-8 mb-8 space-y-2">
          <Link href="/faith" className="flex items-center justify-between p-4 bg-brand-surface/30 hover:bg-brand-surface rounded-xl border border-transparent hover:border-[#333] transition-colors group">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-[#111] rounded-lg flex items-center justify-center text-brand-gold group-hover:scale-110 transition-transform">
                <Book className="h-5 w-5" />
              </div>
              <span className="font-semibold text-brand-light group-hover:text-white transition-colors">Spiritual & Faith</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-brand-gold transition-colors" />
          </Link>
          
          <Link href="/news" className="flex items-center justify-between p-4 bg-brand-surface/30 hover:bg-brand-surface rounded-xl border border-transparent hover:border-[#333] transition-colors group">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-[#111] rounded-lg flex items-center justify-center text-brand-gold group-hover:scale-110 transition-transform">
                <Newspaper className="h-5 w-5" />
              </div>
              <span className="font-semibold text-brand-light group-hover:text-white transition-colors">Community News</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-brand-gold transition-colors" />
          </Link>

          <Link href="/friends" className="flex items-center justify-between p-4 bg-brand-surface/30 hover:bg-brand-surface rounded-xl border border-transparent hover:border-[#333] transition-colors group">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-[#111] rounded-lg flex items-center justify-center text-brand-gold group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5" />
              </div>
              <span className="font-semibold text-brand-light group-hover:text-white transition-colors">Alumni Directory</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-brand-gold transition-colors" />
          </Link>
          
          <Link href="/camp" className="flex items-center justify-between p-4 bg-brand-surface/30 hover:bg-brand-surface rounded-xl border border-transparent hover:border-[#333] transition-colors group">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-[#111] rounded-lg flex items-center justify-center text-brand-gold group-hover:scale-110 transition-transform">
                <Tent className="h-5 w-5" />
              </div>
              <span className="font-semibold text-brand-light group-hover:text-white transition-colors">Camps & Events</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-brand-gold transition-colors" />
          </Link>


        </div>

      </div>
    </div>
  );
}

// Quick helper to avoid importing from lucide-react if not needed globally
function ChevronRight({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}




