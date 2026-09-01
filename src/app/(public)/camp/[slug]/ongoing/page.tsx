"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Tent, Calendar, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { resolveCommunity } from "@/lib/community";

import { use } from "react";

export default function MyOngoingCampPage({ params }: { params: Promise<{ slug: string }> }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;
  const [camps, setCamps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMyCamps() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const community = await resolveCommunity(supabase, slug);

      // Fetch crew assignments for this user, joining with cohort data
      const { data, error } = await supabase
        .from("camp_crew")
        .select("*, camp_cohorts(*)")
        .eq("user_id", user.id);

      if (!error && data) {
        // Group by cohort in case they have multiple roles in the same camp
        const uniqueCohorts = new Map();
        for (const item of data) {
          if (!item.camp_cohorts) continue;
          if (community && item.camp_cohorts.community_id !== community.id)
            continue;
          if (!uniqueCohorts.has(item.cohort_id)) {
            uniqueCohorts.set(item.cohort_id, {
              ...item.camp_cohorts,
              myRole: item.position
            });
          }
        }
        setCamps(Array.from(uniqueCohorts.values()));
      }
      setIsLoading(false);
    }

    fetchMyCamps();
  }, [slug]);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading your services...</div>;
  }

  if (camps.length === 0) {
    return (
      <div className="p-8 pb-28 md:pb-8 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 bg-[#222] rounded-full flex items-center justify-center mb-4">
          <Tent className="w-8 h-8 text-gray-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No Ongoing Services</h2>
        <p className="text-gray-400">You are not currently assigned to any active services.</p>
      </div>
    );
  }

  return (
    <div className="p-5 md:p-8 pb-28 md:pb-8 space-y-6 w-full">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">My Ongoing Services</h2>
        <p className="text-brand-muted mt-1">Select a service to view its productivity dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {camps.map((camp) => (
          <Link href={`/camp/${slug}/ongoing/${camp.id}`} key={camp.id}>
            <div className="bg-[#111] border border-[#333] hover:border-brand-gold/50 rounded-2xl p-6 transition-all hover:bg-[#15181e] group h-full flex flex-col cursor-pointer shadow-lg hover:shadow-brand-gold/10">
              
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
              <p className="text-brand-muted font-medium mb-6">
                {camp.camp_name !== "Other Event" ? `Angkatan ${camp.angkatan}` : "Custom Event"}
              </p>
              
              <div className="mt-auto pt-4 border-t border-[#222] flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>Role: <span className="text-white font-semibold">{camp.myRole}</span></span>
                </div>
                <ArrowRight className="w-5 h-5 text-[#555] group-hover:text-brand-gold transition-colors" />
              </div>

            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
