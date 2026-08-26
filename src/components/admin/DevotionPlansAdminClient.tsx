"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Save, Trash, ChevronRight } from "lucide-react";

export default function FourColumnDevotionAdmin({
  initialCategories,
  initialPlans,
}: {
  initialCategories: any[];
  initialPlans: any[];
}) {
  const supabase = createClient();

  // Column 1: Categories
  const [categories, setCategories] = useState(initialCategories);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Column 2: Plans
  const [plans, setPlans] = useState(initialPlans);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [newPlanName, setNewPlanName] = useState("");

  // Column 3: Plan Details & Days
  const selectedPlan = plans.find(p => p.id === selectedPlanId);
  const [planTitle, setPlanTitle] = useState("");
  const [planCover, setPlanCover] = useState("");
  const [planDesc, setPlanDesc] = useState("");
  const [planDuration, setPlanDuration] = useState(7);
  const [selectedDayNum, setSelectedDayNum] = useState<number | null>(null);
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  // Column 4: Day Content
  const [dayData, setDayData] = useState<any>(null);
  const [dayTitle, setDayTitle] = useState("");
  const [dayContent, setDayContent] = useState("");
  const [dayVerses, setDayVerses] = useState<any[]>([]);
  
  const [newVerseRef, setNewVerseRef] = useState("");
  const [isSavingDay, setIsSavingDay] = useState(false);

  // --- Handlers for Col 1 ---
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;
    const { data, error } = await supabase.from("devotion_categories").insert({ name: newCategoryName }).select().single();
    if (data) {
      setCategories([data, ...categories]);
      setNewCategoryName("");
    }
  };

  // --- Handlers for Col 2 ---
  const filteredPlans = plans.filter(p => p.category_id === selectedCategoryId);
  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName || !selectedCategoryId) return;
    const { data, error } = await supabase.from("devotion_plans").insert({
      category_id: selectedCategoryId,
      title: newPlanName,
      duration_days: 7
    }).select().single();
    
    if (data) {
      setPlans([data, ...plans]);
      setNewPlanName("");
      selectPlan(data);
    }
  };

  const selectPlan = (plan: any) => {
    setSelectedPlanId(plan.id);
    setPlanTitle(plan.title || "");
    setPlanCover(plan.cover_image_url || "");
    setPlanDesc(plan.description || "");
    setPlanDuration(plan.duration_days || 7);
    setSelectedDayNum(null);
  };

  // --- Handlers for Col 3 ---
  const handleSavePlan = async () => {
    if (!selectedPlanId) return;
    setIsSavingPlan(true);
    const { data, error } = await supabase.from("devotion_plans").update({
      title: planTitle,
      cover_image_url: planCover,
      description: planDesc,
      duration_days: planDuration
    }).eq("id", selectedPlanId).select().single();
    
    if (data) {
      setPlans(plans.map(p => p.id === selectedPlanId ? data : p));
      alert("Plan saved!");
    }
    setIsSavingPlan(false);
  };

  const selectDay = async (num: number) => {
    setSelectedDayNum(num);
    setDayData(null);
    setDayTitle("");
    setDayContent("");
    setDayVerses([]);

    // Fetch day from DB
    const { data } = await supabase
      .from("devotion_plan_days")
      .select("*, verses:devotion_day_verses(*)")
      .eq("plan_id", selectedPlanId)
      .eq("day_number", num)
      .maybeSingle();

    if (data) {
      setDayData(data);
      setDayTitle(data.devotional_title || "");
      setDayContent(data.devotional_content || "");
      if (data.verses) {
        setDayVerses(data.verses.sort((a: any, b: any) => a.order_index - b.order_index));
      }
    }
  };

  // --- Handlers for Col 4 ---
  const handleSaveDay = async () => {
    if (!selectedPlanId || !selectedDayNum) return;
    setIsSavingDay(true);
    
    if (dayData) {
      // Update
      await supabase.from("devotion_plan_days").update({
        devotional_title: dayTitle,
        devotional_content: dayContent
      }).eq("id", dayData.id);
    } else {
      // Insert
      const { data } = await supabase.from("devotion_plan_days").insert({
        plan_id: selectedPlanId,
        day_number: selectedDayNum,
        devotional_title: dayTitle,
        devotional_content: dayContent
      }).select().single();
      if (data) setDayData(data);
    }
    setIsSavingDay(false);
    alert("Day content saved!");
  };

  const handleAddVerse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dayData || !newVerseRef) {
      alert("Please save the day content first before adding verses.");
      return;
    }
    const orderIndex = dayVerses.length;
    const { data } = await supabase.from("devotion_day_verses").insert({
      day_id: dayData.id,
      verse_reference: newVerseRef,
      translation: "TB",
      order_index: orderIndex
    }).select().single();

    if (data) {
      setDayVerses([...dayVerses, data]);
      setNewVerseRef("");
    }
  };

  return (
    <div className="flex h-[80vh] w-full bg-white text-black border border-gray-300 rounded-xl overflow-hidden shadow-2xl">
      
      {/* COLUMN 1: CATEGORIES */}
      <div className="w-1/4 border-r border-gray-300 bg-gray-50 flex flex-col">
        <div className="p-3 bg-gray-200 border-b border-gray-300 font-bold text-xs uppercase tracking-wider text-gray-600">
          1. Categories
        </div>
        <div className="flex-1 overflow-y-auto">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategoryId(cat.id); setSelectedPlanId(null); setSelectedDayNum(null); }}
              className={`w-full text-left px-4 py-3 border-b border-gray-200 flex justify-between items-center hover:bg-gray-100 transition-colors ${selectedCategoryId === cat.id ? "bg-blue-100 border-blue-200" : ""}`}
            >
              <span className="font-semibold text-sm">{cat.name}</span>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>
          ))}
        </div>
        <div className="p-3 border-t border-gray-300 bg-white">
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <input type="text" placeholder="New Category..." value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm" />
            <button type="submit" className="bg-black text-white p-1.5 rounded"><Plus className="h-4 w-4" /></button>
          </form>
        </div>
      </div>

      {/* COLUMN 2: PLANS */}
      <div className="w-1/4 border-r border-gray-300 bg-gray-50 flex flex-col">
        <div className="p-3 bg-gray-200 border-b border-gray-300 font-bold text-xs uppercase tracking-wider text-gray-600">
          2. Devotion Plans
        </div>
        {!selectedCategoryId ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-400 p-4 text-center">Select a category first</div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              {filteredPlans.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => selectPlan(plan)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-200 flex flex-col hover:bg-gray-100 transition-colors ${selectedPlanId === plan.id ? "bg-blue-100 border-blue-200" : ""}`}
                >
                  <span className="font-semibold text-sm truncate">{plan.title}</span>
                  <span className="text-xs text-gray-500">{plan.duration_days} Days</span>
                </button>
              ))}
            </div>
            <div className="p-3 border-t border-gray-300 bg-white">
              <form onSubmit={handleAddPlan} className="flex gap-2">
                <input type="text" placeholder="New Plan Title..." value={newPlanName} onChange={e => setNewPlanName(e.target.value)} className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm" />
                <button type="submit" className="bg-black text-white p-1.5 rounded"><Plus className="h-4 w-4" /></button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* COLUMN 3: PLAN DETAILS & DAYS */}
      <div className="w-1/4 border-r border-gray-300 bg-white flex flex-col">
        <div className="p-3 bg-gray-200 border-b border-gray-300 font-bold text-xs uppercase tracking-wider text-gray-600">
          3. Plan Cover & Days
        </div>
        {!selectedPlan ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-400 p-4 text-center">Select a plan first</div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            <div className="space-y-2 pb-4 border-b border-gray-200">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Title</label>
                <input type="text" value={planTitle} onChange={e => setPlanTitle(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Cover Image URL</label>
                <input type="text" value={planCover} onChange={e => setPlanCover(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
                <textarea rows={2} value={planDesc} onChange={e => setPlanDesc(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Duration (Days)</label>
                <input type="number" min="1" max="365" value={planDuration} onChange={e => setPlanDuration(parseInt(e.target.value))} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
              </div>
              <button onClick={handleSavePlan} disabled={isSavingPlan} className="w-full bg-blue-600 text-white font-bold text-xs py-2 rounded mt-2 hover:bg-blue-700">
                {isSavingPlan ? "Saving..." : "Save Details"}
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">Edit Days (1 - {planDuration})</label>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: planDuration }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => selectDay(i + 1)}
                    className={`aspect-square rounded flex items-center justify-center font-bold text-sm transition-colors border ${selectedDayNum === i + 1 ? "bg-black text-white border-black" : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* COLUMN 4: DAY BODY */}
      <div className="w-1/4 bg-white flex flex-col">
        <div className="p-3 bg-gray-200 border-b border-gray-300 font-bold text-xs uppercase tracking-wider text-gray-600 flex justify-between items-center">
          <span>4. The Body</span>
          {selectedDayNum && <span className="text-black bg-white px-2 py-0.5 rounded text-[10px]">Day {selectedDayNum}</span>}
        </div>
        {!selectedDayNum ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-400 p-4 text-center">Select a day first</div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Section Title</label>
                <input type="text" value={dayTitle} onChange={e => setDayTitle(e.target.value)} placeholder="e.g. Introduction" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm font-semibold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">The Prayer / Devotional</label>
                <textarea rows={10} value={dayContent} onChange={e => setDayContent(e.target.value)} placeholder="Write the devotion here..." className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"></textarea>
              </div>
              <button onClick={handleSaveDay} disabled={isSavingDay} className="w-full bg-blue-600 text-white font-bold text-xs py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2">
                <Save className="h-4 w-4" /> {isSavingDay ? "Saving..." : "Save Content"}
              </button>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <label className="block text-xs font-bold text-gray-500 mb-2">Bible Verses</label>
              
              <ul className="space-y-2 mb-3">
                {dayVerses.map(v => (
                  <li key={v.id} className="text-sm bg-gray-100 p-2 rounded flex justify-between items-center border border-gray-200">
                    <span className="font-semibold">{v.verse_reference}</span>
                  </li>
                ))}
                {dayVerses.length === 0 && <li className="text-xs text-gray-400 italic">No verses added.</li>}
              </ul>

              <form onSubmit={handleAddVerse} className="flex gap-2">
                <input type="text" placeholder="e.g. Yehezkiel 20:8" value={newVerseRef} onChange={e => setNewVerseRef(e.target.value)} className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm" />
                <button type="submit" className="bg-black text-white p-1.5 rounded"><Plus className="h-4 w-4" /></button>
              </form>
              {!dayData && <p className="text-[10px] text-red-500 mt-1">Save content first before adding verses.</p>}
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
