"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Tent, Users, ArrowRight, Trash2 } from "lucide-react";
import AddCampModal from "@/components/camp/AddCampModal";
import Link from "next/link";
import { useParams } from "next/navigation";
import { resolveCommunity } from "@/lib/community";

export default function CampCrewPage() {
  const params = useParams();
  const slug = (params.slug as string) || "";
  const [camps, setCamps] = useState<any[]>([]);
  const [communityId, setCommunityId] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchCamps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchCamps = async () => {
    setIsLoading(true);
    const supabase = createClient();

    // Check role
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (profile && (profile.role === "founder" || profile.role === "superadmin" || profile.role === "admin")) {
        setIsSuperadmin(true);
      }
    }

    // This workspace = one community
    const community = await resolveCommunity(supabase, slug);
    if (!community) {
      setNotFound(true);
      setCamps([]);
      setIsLoading(false);
      return;
    }
    setNotFound(false);
    setCommunityId(community.id);

    const { data } = await supabase
      .from("camp_cohorts")
      .select("*, camp_crew(count)")
      .eq("community_id", community.id)
      .order("created_at", { ascending: false });

    if (data) setCamps(data);
    setIsLoading(false);
  };

  const handleDeleteCamp = async (e: any, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this camp? This will also delete all tasks, meetings, chats, and crew assignments associated with it.")) return;
    
    const supabase = createClient();
    await supabase.from("camp_cohorts").delete().eq("id", id);
    fetchCamps();
  };

  return (
    <div className="p-5 md:p-8 space-y-6 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Camp Directory</h2>
          <p className="text-brand-muted mt-1">Directory of all camps and their crew members.</p>
        </div>
        {isSuperadmin && (
          <button onClick={() => setIsAddModalOpen(true)} className="bg-brand-gold text-brand-dark px-4 py-2.5 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap">
            <Plus className="h-4 w-4" /> Add New Camp
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="p-10 text-center text-gray-500">Loading camps...</div>
      ) : notFound ? (
        <div className="bg-[#1a1d24] border border-[#333] rounded-xl p-10 text-center flex flex-col items-center">
          <Tent className="w-10 h-10 text-gray-500 mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">Community not found</h3>
          <p className="text-sm text-gray-400">
            This link is broken. Open the community from the list again.
          </p>
        </div>
      ) : camps.length === 0 ? (
        <div className="bg-[#1a1d24] border border-[#333] rounded-xl p-10 text-center flex flex-col items-center">
          <Tent className="w-10 h-10 text-gray-500 mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">No Camps Found</h3>
          <p className="text-sm text-gray-400 mb-6">There are currently no camps in the directory.</p>
          {isSuperadmin && (
            <button onClick={() => setIsAddModalOpen(true)} className="bg-brand-gold text-brand-dark px-4 py-2 rounded-lg font-bold text-sm">
              Create the first Camp
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {camps.map((camp) => (
            <Link href={`/camp/${slug}/ongoing/${camp.id}`} key={camp.id}>
              <div className="bg-[#111] border border-[#333] hover:border-brand-gold/50 rounded-2xl p-6 transition-all hover:bg-[#15181e] group h-full flex flex-col cursor-pointer shadow-lg hover:shadow-brand-gold/10 relative">

                <div className="flex justify-between items-start mb-4">
                  <div className="bg-brand-gold/10 p-3 rounded-xl text-brand-gold">
                    <Tent className="w-6 h-6" />
                  </div>
                  <span className="bg-[#222] text-xs font-bold px-3 py-1 rounded-full text-gray-300 border border-[#333]">
                    {camp.branch}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-brand-gold transition-colors">
                  {camp.camp_name === "Other Event" ? camp.custom_name : camp.camp_name}
                </h3>
                <p className="text-brand-muted font-medium mb-2">
                  {camp.camp_name !== "Other Event" ? `Angkatan ${camp.angkatan}` : "Custom Event"}
                </p>
                <p className="text-xs text-gray-500 mb-6 flex items-center gap-1">
                  Start Date: {camp.start_date ? new Date(camp.start_date).toLocaleDateString() : "Not set"}
                </p>
                
                <div className="mt-auto pt-4 border-t border-[#222] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>Crew: <span className="text-white font-semibold">{camp.camp_crew?.[0]?.count || 0} members</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSuperadmin && (
                      <button 
                        onClick={(e) => handleDeleteCamp(e, camp.id)}
                        className="p-1.5 text-[#555] hover:text-brand-gold hover:bg-[#222] transition-colors rounded"
                        title="Delete Camp"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <ArrowRight className="w-5 h-5 text-[#555] group-hover:text-brand-gold transition-colors" />
                  </div>
                </div>

              </div>
            </Link>
          ))}
        </div>
      )}

      <AddCampModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={fetchCamps} communityId={communityId} />
    </div>
  );
}
