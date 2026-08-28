"use client";

import { Tent } from "lucide-react";

export default function OngoingCampPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] text-center px-4">
      <div className="bg-[#22252d] p-6 rounded-full border border-[#333] mb-6">
        <Tent className="w-16 h-16 text-brand-gold opacity-80" />
      </div>
      <h2 className="text-3xl font-serif font-bold text-white mb-3">My Ongoing Camp</h2>
      <p className="text-gray-400 max-w-md">
        You are not currently enrolled in any active camps. When you join a camp, your progress, schedule, and materials will appear here.
      </p>
    </div>
  );
}
