"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Save, ChevronRight, Globe2 } from "lucide-react";

export default function DevotionPlansAdminClient({
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
  const [newCategoryNameId, setNewCategoryNameId] = useState("");

  // Column 2: Plans
  const [plans, setPlans] = useState(initialPlans);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanNameId, setNewPlanNameId] = useState("");

  // Column 3: Plan Details & Days
  const selectedPlan = plans.find(p => p.id === selectedPlanId);
  const [planTitle, setPlanTitle] = useState("");
  const [planTitleId, setPlanTitleId] = useState("");
  const [planCover, setPlanCover] = useState("");
  const [planDesc, setPlanDesc] = useState("");
  const [planDescId, setPlanDescId] = useState("");
  const [planDuration, setPlanDuration] = useState(7);
  const [selectedDayNum, setSelectedDayNum] = useState<number | null>(null);
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  // Column 4: Day Content
  const [dayData, setDayData] = useState<any>(null);
  const [dayTitle, setDayTitle] = useState("");
  const [dayTitleId, setDayTitleId] = useState("");
  const [dayContent, setDayContent] = useState("");
  const [dayContentId, setDayContentId] = useState("");
  const [dayVerses, setDayVerses] = useState<any[]>([]);
  
  const [newVerseRef, setNewVerseRef] = useState("");
  const [isSavingDay, setIsSavingDay] = useState(false);

  // UI state for dual columns
  const [showIdCol1, setShowIdCol1] = useState(false);
  const [showIdCol2, setShowIdCol2] = useState(false);

  // --- Handlers for Col 1 ---
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;
    const { data } = await supabase.from("devotion_categories").insert({ 
      name: newCategoryName,
      name_id: newCategoryNameId || newCategoryName
    }).select().single();
    if (data) {
      setCategories([data, ...categories]);
      setNewCategoryName("");
      setNewCategoryNameId("");
    }
  };

  // --- Handlers for Col 2 ---
  const filteredPlans = plans.filter(p => p.category_id === selectedCategoryId);
  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName || !selectedCategoryId) return;
    const { data } = await supabase.from("devotion_plans").insert({
      category_id: selectedCategoryId,
      title: newPlanName,
      title_id: newPlanNameId || newPlanName,
      duration_days: 7
    }).select().single();
    
    if (data) {
      setPlans([data, ...plans]);
      setNewPlanName("");
      setNewPlanNameId("");
      selectPlan(data);
    }
  };

  const selectPlan = (plan: any) => {
    setSelectedPlanId(plan.id);
    setPlanTitle(plan.title || "");
    setPlanTitleId(plan.title_id || plan.title || "");
    setPlanCover(plan.cover_image_url || "");
    setPlanDesc(plan.description || "");
    setPlanDescId(plan.description_id || plan.description || "");
    setPlanDuration(plan.duration_days || 7);
    setSelectedDayNum(null);
  };

  // --- Handlers for Col 3 ---
  const handleSavePlan = async () => {
    if (!selectedPlanId) return;
    setIsSavingPlan(true);
    const { data } = await supabase.from("devotion_plans").update({
      title: planTitle,
      title_id: planTitleId,
      cover_image_url: planCover,
      description: planDesc,
      description_id: planDescId,
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
    setDayTitleId("");
    setDayContent("");
    setDayContentId("");
    setDayVerses([]);

    const { data } = await supabase
      .from("devotion_plan_days")
      .select("*, verses:devotion_day_verses(*)")
      .eq("plan_id", selectedPlanId)
      .eq("day_number", num)
      .maybeSingle();

    if (data) {
      setDayData(data);
      setDayTitle(data.devotional_title || "");
      setDayTitleId(data.devotional_title_id || data.devotional_title || "");
      setDayContent(data.devotional_content || "");
      setDayContentId(data.devotional_content_id || data.devotional_content || "");
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
      await supabase.from("devotion_plan_days").update({
        devotional_title: dayTitle,
        devotional_title_id: dayTitleId,
        devotional_content: dayContent,
        devotional_content_id: dayContentId
      }).eq("id", dayData.id);
    } else {
      const { data } = await supabase.from("devotion_plan_days").insert({
        plan_id: selectedPlanId,
        day_number: selectedDayNum,
        devotional_title: dayTitle,
        devotional_title_id: dayTitleId,
        devotional_content: dayContent,
        devotional_content_id: dayContentId
      }).select().single();
      if (data) setDayData(data);
    }
    setIsSavingDay(false);
    alert("Day content saved!");
  };

  const handleAddVerse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dayData || !newVerseRef) return;
    const { data } = await supabase.from("devotion_day_verses").insert({
      day_id: dayData.id,
      verse_reference: newVerseRef,
      translation: "TB",
      order_index: dayVerses.length
    }).select().single();

    if (data) {
      setDayVerses([...dayVerses, data]);
      setNewVerseRef("");
    }
  };

  return (
    <div className="flex h-[85vh] w-full bg-white text-black border border-gray-300 rounded-xl overflow-hidden shadow-2xl">
      
      {/* COLUMN 1: CATEGORIES */}
      <div className="w-1/4 border-r border-gray-300 bg-gray-50 flex flex-col">
        <div className="p-3 bg-gray-200 border-b border-gray-300 font-bold text-xs uppercase tracking-wider text-gray-600 flex justify-between items-center">
          <span>1. Categories</span>
          <button onClick={() => setShowIdCol1(!showIdCol1)} title="Toggle Indonesian Form" className="text-gray-500 hover:text-black">
            <Globe2 className={`h-4 w-4 ${showIdCol1 ? "text-blue-500" : ""}`} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategoryId(cat.id); setSelectedPlanId(null); setSelectedDayNum(null); }}
              className={`w-full text-left px-4 py-3 border-b border-gray-200 flex justify-between items-center hover:bg-gray-100 transition-colors ${selectedCategoryId === cat.id ? "bg-blue-100 border-blue-200" : ""}`}
            >
              <div>
                <span className="font-semibold text-sm block">{cat.name}</span>
                {cat.name_id && <span className="text-xs text-gray-500 italic block">{cat.name_id}</span>}
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>
          ))}
        </div>
        <div className="p-3 border-t border-gray-300 bg-white">
          <form onSubmit={handleAddCategory} className="flex flex-col gap-2">
            <input type="text" placeholder="Category Name (EN)" required value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
            {showIdCol1 && (
              <input type="text" placeholder="Category Name (ID)" value={newCategoryNameId} onChange={e => setNewCategoryNameId(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
            )}
            <button type="submit" className="w-full bg-black text-white p-1.5 rounded flex items-center justify-center gap-1 text-xs font-bold"><Plus className="h-3 w-3" /> Add Category</button>
          </form>
        </div>
      </div>

      {/* COLUMN 2: PLANS */}
      <div className="w-1/4 border-r border-gray-300 bg-gray-50 flex flex-col">
        <div className="p-3 bg-gray-200 border-b border-gray-300 font-bold text-xs uppercase tracking-wider text-gray-600 flex justify-between items-center">
          <span>2. Devotion Plans</span>
          <button onClick={() => setShowIdCol2(!showIdCol2)} title="Toggle Indonesian Form" className="text-gray-500 hover:text-black">
            <Globe2 className={`h-4 w-4 ${showIdCol2 ? "text-blue-500" : ""}`} />
          </button>
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
                  {plan.title_id && <span className="text-xs text-gray-500 truncate italic">{plan.title_id}</span>}
                  <span className="text-[10px] uppercase font-bold text-gray-400 mt-1">{plan.duration_days} Days</span>
                </button>
              ))}
            </div>
            <div className="p-3 border-t border-gray-300 bg-white">
              <form onSubmit={handleAddPlan} className="flex flex-col gap-2">
                <input type="text" placeholder="Plan Title (EN)" required value={newPlanName} onChange={e => setNewPlanName(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
                {showIdCol2 && (
                  <input type="text" placeholder="Plan Title (ID)" value={newPlanNameId} onChange={e => setNewPlanNameId(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
                )}
                <button type="submit" className="w-full bg-black text-white p-1.5 rounded flex justify-center items-center gap-1 text-xs font-bold"><Plus className="h-3 w-3" /> Add Plan</button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* COLUMN 3: PLAN DETAILS & DAYS */}
      <div className="w-1/4 border-r border-gray-300 bg-white flex flex-col">
        <div className="p-3 bg-gray-200 border-b border-gray-300 font-bold text-xs uppercase tracking-wider text-gray-600">
          3. Plan Cover & Details
        </div>
        {!selectedPlan ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-400 p-4 text-center">Select a plan first</div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            <div className="space-y-3 pb-4 border-b border-gray-200">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Title (EN)</label>
                  <input type="text" value={planTitle} onChange={e => setPlanTitle(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs font-semibold" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Title (ID)</label>
                  <input type="text" value={planTitleId} onChange={e => setPlanTitleId(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs font-semibold bg-gray-50" />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Cover Image URL</label>
                <input type="text" value={planCover} onChange={e => setPlanCover(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs" />
              </div>
              
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Description (EN)</label>
                <textarea rows={2} value={planDesc} onChange={e => setPlanDesc(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs"></textarea>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Description (ID)</label>
                <textarea rows={2} value={planDescId} onChange={e => setPlanDescId(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs bg-gray-50"></textarea>
              </div>
              
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Duration (Days)</label>
                <input type="number" min="1" max="365" value={planDuration} onChange={e => setPlanDuration(parseInt(e.target.value))} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
              </div>
              
              <button onClick={handleSavePlan} disabled={isSavingPlan} className="w-full bg-blue-600 text-white font-bold text-xs py-2 rounded mt-2 hover:bg-blue-700">
                {isSavingPlan ? "Saving..." : "Save Plan Details"}
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Edit Days (1 - {planDuration})</label>
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
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Section Title (EN)</label>
                  <input type="text" value={dayTitle} onChange={e => setDayTitle(e.target.value)} placeholder="e.g. Intro" className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs font-semibold" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Section Title (ID)</label>
                  <input type="text" value={dayTitleId} onChange={e => setDayTitleId(e.target.value)} placeholder="e.g. Intro" className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs font-semibold bg-gray-50" />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">The Prayer / Devotional (EN)</label>
                <textarea rows={6} value={dayContent} onChange={e => setDayContent(e.target.value)} placeholder="Write in English..." className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs leading-relaxed"></textarea>
              </div>
              
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">The Prayer / Devotional (ID)</label>
                <textarea rows={6} value={dayContentId} onChange={e => setDayContentId(e.target.value)} placeholder="Write in Indonesian..." className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs leading-relaxed bg-gray-50"></textarea>
              </div>
              
              <button onClick={handleSaveDay} disabled={isSavingDay} className="w-full bg-blue-600 text-white font-bold text-xs py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2">
                <Save className="h-4 w-4" /> {isSavingDay ? "Saving..." : "Save Body Content"}
              </button>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <label className="block text-xs font-bold text-gray-700 mb-2">Bible Verses</label>
              
              <ul className="space-y-1.5 mb-3">
                {dayVerses.map(v => (
                  <li key={v.id} className="text-xs bg-gray-100 p-2 rounded flex justify-between items-center border border-gray-200">
                    <span className="font-semibold">{v.verse_reference}</span>
                  </li>
                ))}
                {dayVerses.length === 0 && <li className="text-[10px] text-gray-400 italic">No verses added.</li>}
              </ul>

              <form onSubmit={handleAddVerse} className="flex gap-2">
                <input type="text" placeholder="e.g. Yehezkiel 20:8" value={newVerseRef} onChange={e => setNewVerseRef(e.target.value)} className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-xs" />
                <button type="submit" className="bg-black text-white p-1.5 rounded"><Plus className="h-3 w-3" /></button>
              </form>
              {!dayData && <p className="text-[10px] text-red-500 mt-1">Save content first before adding verses.</p>}
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
