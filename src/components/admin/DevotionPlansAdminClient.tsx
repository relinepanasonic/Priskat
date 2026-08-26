"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Save, ChevronRight, Globe2, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { uploadImage } from "@/lib/upload";
import Image from "next/image";

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
  const [planSubtitle, setPlanSubtitle] = useState("");
  const [planSubtitleId, setPlanSubtitleId] = useState("");
  const [planSummary, setPlanSummary] = useState("");
  const [planSummaryId, setPlanSummaryId] = useState("");
  const [planCover, setPlanCover] = useState("");
  const [planDuration, setPlanDuration] = useState(7);
  const [selectedDayNum, setSelectedDayNum] = useState<number | null>(null);
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Column 4: Day Content
  const [dayData, setDayData] = useState<any>(null);
  const [dayTitle, setDayTitle] = useState("");
  const [dayTitleId, setDayTitleId] = useState("");
  
  const [dayDevotion, setDayDevotion] = useState("");
  const [dayDevotionId, setDayDevotionId] = useState("");
  
  const [dayReflection, setDayReflection] = useState("");
  const [dayReflectionId, setDayReflectionId] = useState("");
  
  const [dayPrayer, setDayPrayer] = useState("");
  const [dayPrayerId, setDayPrayerId] = useState("");
  
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
    setPlanSubtitle(plan.subtitle || "");
    setPlanSubtitleId(plan.subtitle_id || "");
    setPlanSummary(plan.summary || plan.description || ""); // fallback to old description
    setPlanSummaryId(plan.summary_id || plan.description_id || "");
    setPlanCover(plan.cover_image_url || "");
    setPlanDuration(plan.duration_days || 7);
    setSelectedDayNum(null);
  };

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedPlanId) return;

    try {
      setIsUploading(true);
      const timestamp = Date.now();
      const path = `cover_${selectedPlanId}_${timestamp}.webp`;
      const url = await uploadImage(file, "devotion-covers", path);
      setPlanCover(url);
    } catch (err: any) {
      alert(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  // --- Handlers for Col 3 ---
  const handleSavePlan = async () => {
    if (!selectedPlanId) return;
    setIsSavingPlan(true);
    const { data } = await supabase.from("devotion_plans").update({
      title: planTitle,
      title_id: planTitleId,
      subtitle: planSubtitle,
      subtitle_id: planSubtitleId,
      summary: planSummary,
      summary_id: planSummaryId,
      cover_image_url: planCover,
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
    setDayTitle(""); setDayTitleId("");
    setDayDevotion(""); setDayDevotionId("");
    setDayReflection(""); setDayReflectionId("");
    setDayPrayer(""); setDayPrayerId("");
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
      
      setDayDevotion(data.devotional_content || "");
      setDayDevotionId(data.devotional_content_id || data.devotional_content || "");
      
      setDayReflection(data.reflection || "");
      setDayReflectionId(data.reflection_id || "");
      
      setDayPrayer(data.prayer || "");
      setDayPrayerId(data.prayer_id || "");

      if (data.verses) {
        setDayVerses(data.verses.sort((a: any, b: any) => a.order_index - b.order_index));
      }
    }
  };

  // --- Handlers for Col 4 ---
  const handleSaveDay = async () => {
    if (!selectedPlanId || !selectedDayNum) return;
    setIsSavingDay(true);
    
    const payload = {
      devotional_title: dayTitle,
      devotional_title_id: dayTitleId,
      devotional_content: dayDevotion,
      devotional_content_id: dayDevotionId,
      reflection: dayReflection,
      reflection_id: dayReflectionId,
      prayer: dayPrayer,
      prayer_id: dayPrayerId
    };

    if (dayData) {
      await supabase.from("devotion_plan_days").update(payload).eq("id", dayData.id);
    } else {
      const { data } = await supabase.from("devotion_plan_days").insert({
        plan_id: selectedPlanId,
        day_number: selectedDayNum,
        ...payload
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
        <div className="p-3 bg-gray-200 border-b border-gray-300 font-bold text-xs uppercase tracking-wider text-gray-600 flex justify-between items-center shrink-0">
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
        <div className="p-3 border-t border-gray-300 bg-white shrink-0">
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
        <div className="p-3 bg-gray-200 border-b border-gray-300 font-bold text-xs uppercase tracking-wider text-gray-600 flex justify-between items-center shrink-0">
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
            <div className="p-3 border-t border-gray-300 bg-white shrink-0">
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
        <div className="p-3 bg-gray-200 border-b border-gray-300 font-bold text-xs uppercase tracking-wider text-gray-600 shrink-0">
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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Sub Title (EN)</label>
                  <input type="text" value={planSubtitle} onChange={e => setPlanSubtitle(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Sub Title (ID)</label>
                  <input type="text" value={planSubtitleId} onChange={e => setPlanSubtitleId(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs bg-gray-50" />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Cover Image</label>
                <div className="flex gap-2 items-center">
                  {planCover ? (
                    <div className="relative h-12 w-12 rounded overflow-hidden border border-gray-300 shrink-0">
                      <Image src={planCover} alt="Cover" fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded border border-gray-300 shrink-0 bg-gray-100 flex items-center justify-center text-gray-400">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                  )}
                  <div className="flex-1">
                    <label className={`w-full border border-gray-300 rounded px-2 py-2 text-xs flex justify-center items-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                      {isUploading ? 'Uploading...' : 'Upload Picture'}
                      <input type="file" accept="image/*" className="hidden" onChange={handleUploadCover} disabled={isUploading} />
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Summary (EN)</label>
                <textarea rows={2} value={planSummary} onChange={e => setPlanSummary(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs"></textarea>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Summary (ID)</label>
                <textarea rows={2} value={planSummaryId} onChange={e => setPlanSummaryId(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs bg-gray-50"></textarea>
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
        <div className="p-3 bg-gray-200 border-b border-gray-300 font-bold text-xs uppercase tracking-wider text-gray-600 flex justify-between items-center shrink-0">
          <span>4. The Body</span>
          {selectedDayNum && <span className="text-black bg-white px-2 py-0.5 rounded text-[10px]">Day {selectedDayNum}</span>}
        </div>
        {!selectedDayNum ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-400 p-4 text-center">Select a day first</div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            
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
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">The Devotion (EN)</label>
              <textarea rows={4} value={dayDevotion} onChange={e => setDayDevotion(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs leading-relaxed"></textarea>
              
              <label className="block text-[10px] uppercase font-bold text-gray-500 mt-2 mb-1">The Devotion (ID)</label>
              <textarea rows={4} value={dayDevotionId} onChange={e => setDayDevotionId(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs leading-relaxed bg-gray-50"></textarea>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-2">The Verses</label>
              <ul className="space-y-1.5 mb-3">
                {dayVerses.map(v => (
                  <li key={v.id} className="text-xs bg-white p-2 rounded flex justify-between items-center border border-gray-200">
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

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">The Reflection (EN)</label>
              <textarea rows={3} value={dayReflection} onChange={e => setDayReflection(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs leading-relaxed"></textarea>
              
              <label className="block text-[10px] uppercase font-bold text-gray-500 mt-2 mb-1">The Reflection (ID)</label>
              <textarea rows={3} value={dayReflectionId} onChange={e => setDayReflectionId(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs leading-relaxed bg-gray-50"></textarea>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">The Prayer (EN)</label>
              <textarea rows={3} value={dayPrayer} onChange={e => setDayPrayer(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs leading-relaxed"></textarea>
              
              <label className="block text-[10px] uppercase font-bold text-gray-500 mt-2 mb-1">The Prayer (ID)</label>
              <textarea rows={3} value={dayPrayerId} onChange={e => setDayPrayerId(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs leading-relaxed bg-gray-50"></textarea>
            </div>
            
            <button onClick={handleSaveDay} disabled={isSavingDay} className="w-full bg-blue-600 text-white font-bold text-xs py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2">
              <Save className="h-4 w-4" /> {isSavingDay ? "Saving..." : "Save Body Content"}
            </button>
            
          </div>
        )}
      </div>

    </div>
  );
}
