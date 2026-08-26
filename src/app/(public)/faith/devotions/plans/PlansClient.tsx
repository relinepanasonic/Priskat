"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { DevotionCategory, DevotionPlan, UserDevotionProgress } from "@/lib/types/database.types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function PlansClient({ 
  categories, 
  plans, 
  userProgress,
  userId 
}: { 
  categories: DevotionCategory[], 
  plans: DevotionPlan[],
  userProgress: any[],
  userId?: string
}) {
  const [activeTab, setActiveTab] = useState<"My Plans" | "Find Plans" | "Completed">("Find Plans");
  const router = useRouter();

  const handleStartPlan = async (planId: string) => {
    if (!userId) {
      alert("Please login first");
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.from("user_devotion_progress").insert({
      user_id: userId,
      plan_id: planId,
      current_day: 1,
      completed_days: [],
      is_finished: false
    });
    
    if (error) {
      if (error.code === '23505') {
        // Already started
        router.push(`/faith/devotions/plans/${planId}/day/1`);
      } else {
        console.error(error);
        alert("Error starting plan");
      }
    } else {
      router.push(`/faith/devotions/plans/${planId}/day/1`);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white text-black font-sans pb-24">
      
      {/* Header */}
      <div className="px-6 pt-8 pb-4 flex justify-between items-center">
        <h1 className="text-4xl font-bold tracking-tight">Plans</h1>
        <button className="p-2">
          <Search className="h-6 w-6 text-black" />
        </button>
      </div>

      {/* Tabs */}
      <div className="px-4 overflow-x-auto hide-scrollbar">
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab("My Plans")}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeTab === "My Plans" ? "bg-black text-white" : "bg-gray-100 text-gray-500"}`}
          >
            My Plans
          </button>
          <button 
            onClick={() => setActiveTab("Find Plans")}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeTab === "Find Plans" ? "bg-black text-white" : "bg-gray-100 text-gray-500"}`}
          >
            Find Plans
          </button>
          <button 
            onClick={() => setActiveTab("Completed")}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeTab === "Completed" ? "bg-black text-white" : "bg-gray-100 text-gray-500"}`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 mt-8 space-y-10">
        
        {activeTab === "Find Plans" && (
          categories.map((cat) => {
            const catPlans = plans.filter(p => p.category_id === cat.id);
            if (catPlans.length === 0) return null;
            return (
              <div key={cat.id}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">{cat.name}</h2>
                  <button className="text-sm font-bold text-gray-500 flex items-center gap-1">
                    See all <span className="text-lg">›</span>
                  </button>
                </div>
                
                <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 snap-x">
                  {catPlans.map(plan => (
                    <div key={plan.id} className="min-w-[85%] sm:min-w-[300px] flex gap-4 snap-center">
                      <div className="relative h-28 w-28 rounded-2xl overflow-hidden shrink-0 bg-gray-200">
                        {plan.cover_image_url ? (
                          <Image src={plan.cover_image_url} alt={plan.title} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold p-2 text-center text-xs">No Cover</div>
                        )}
                      </div>
                      <div className="flex flex-col justify-center flex-1">
                        <p className="text-gray-500 text-xs font-medium uppercase mb-1">{plan.duration_days} Days</p>
                        <h3 className="font-bold text-[17px] leading-tight line-clamp-2">{plan.title}</h3>
                        <button 
                          onClick={() => handleStartPlan(plan.id)}
                          className="mt-3 bg-gray-100 text-black font-bold text-xs px-5 py-2 rounded-full self-start hover:bg-gray-200 transition-colors"
                        >
                          Start
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}

        {activeTab === "My Plans" && (
          <div>
            {userProgress.filter(p => !p.is_finished).length === 0 ? (
              <p className="text-gray-500">No active plans.</p>
            ) : (
              userProgress.filter(p => !p.is_finished).map(prog => (
                <div key={prog.id} className="flex gap-4 mb-6">
                  <div className="relative h-28 w-28 rounded-2xl overflow-hidden shrink-0 bg-gray-200">
                    {prog.plans?.cover_image_url ? (
                      <Image src={prog.plans.cover_image_url} alt={prog.plans.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold p-2 text-center text-xs">No Cover</div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center flex-1">
                    <p className="text-gray-500 text-xs font-medium uppercase mb-1">Day {prog.current_day} of {prog.plans?.duration_days}</p>
                    <h3 className="font-bold text-[17px] leading-tight line-clamp-2">{prog.plans?.title}</h3>
                    <Link 
                      href={`/faith/devotions/plans/${prog.plan_id}/day/${prog.current_day}`}
                      className="mt-3 bg-black text-white font-bold text-xs px-5 py-2 rounded-full self-start hover:bg-gray-800 transition-colors"
                    >
                      Continue
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}
