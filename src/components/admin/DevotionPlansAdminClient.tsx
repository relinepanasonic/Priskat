"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Save, ChevronRight, Globe2, Upload, Loader2, Image as ImageIcon, Trash2 } from "lucide-react";
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
  const [searchCat, setSearchCat] = useState("");

  // Column 2: Plans
  const [plans, setPlans] = useState(initialPlans);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanNameId, setNewPlanNameId] = useState("");
  const [searchSub, setSearchSub] = useState("");

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
  
  const [verseBook, setVerseBook] = useState("Genesis");
  const [verseChapter, setVerseChapter] = useState("");
  const [verseNumber, setVerseNumber] = useState("");
  const BIBLE_BOOKS = ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Tobit", "Judith", "Esther", "1 Maccabees", "2 Maccabees", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Wisdom", "Sirach", "Isaiah", "Jeremiah", "Lamentations", "Baruch", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"];
  const [isSavingDay, setIsSavingDay] = useState(false);

  // UI state for dual columns
  const [showIdCol1, setShowIdCol1] = useState(false);
  const [showIdCol2, setShowIdCol2] = useState(false);

  // --- Handlers for Col 1 ---
  const handleDeleteCategory = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    
    const { error } = await supabase.from("devotion_categories").delete().eq("id", id);
    if (!error) {
      setCategories(categories.filter(c => c.id !== id));
      if (selectedCategoryId === id) setSelectedCategoryId(null);
    }
  };

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
  const handleDeletePlan = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    
    const { error } = await supabase.from("devotion_plans").delete().eq("id", id);
    if (!error) {
      setPlans(plans.filter(p => p.id !== id));
      if (selectedPlanId === id) setSelectedPlanId(null);
    }
  };

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

  const handleDeleteVerse = async (verseId: string) => {
    
    const { error } = await supabase.from("devotion_day_verses").delete().eq("id", verseId);
    if (!error) {
      setDayVerses(dayVerses.filter(v => v.id !== verseId));
    }
  };

  const handleAddVerse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dayData || !verseBook || !verseChapter || !verseNumber) return;
    const { data } = await supabase.from("devotion_day_verses").insert({
      day_id: dayData.id,
      verse_reference: `${verseBook} ${verseChapter}:${verseNumber}`,
      translation: "TB",
      order_index: dayVerses.length
    }).select().single();

    if (data) {
      setDayVerses([...dayVerses, data]);
      setVerseChapter(""); setVerseNumber("");
    }
  };

  return (
    <div className="flex h-[85vh] w-full bg-brand-surface text-white border border-[#333] rounded-xl overflow-hidden shadow-2xl">
      
      {/* COLUMN 1: CATEGORIES */}
      <div className="w-1/4 border-r border-[#333] bg-[#14151a] flex flex-col">
        <div className="p-3 bg-[#2a2d35] border-b border-[#333] font-bold text-xs uppercase tracking-wider text-brand-light flex justify-between items-center shrink-0">
          <span>1. Categories</span>
          <button onClick={() => setShowIdCol1(!showIdCol1)} title="Toggle Indonesian Form" className="text-brand-muted hover:text-white">
            <Globe2 className={`h-4 w-4 ${showIdCol1 ? "text-blue-500" : ""}`} />
          </button>
        </div>
        <div className="p-2 border-b border-[#333] bg-[#1a1d24]"><input type="text" placeholder="Search categories..." value={searchCat} onChange={e => setSearchCat(e.target.value)} className="w-full bg-[#14151a] border border-[#333] rounded px-2 py-1.5 text-xs text-white" /></div><div className="flex-1 overflow-y-auto">{categories.filter(c => c.name.toLowerCase().includes(searchCat.toLowerCase()) || (c.name_id && c.name_id.toLowerCase().includes(searchCat.toLowerCase()))).map(cat => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategoryId(cat.id); setSelectedPlanId(null); setSelectedDayNum(null); }}
              className={`w-full text-left px-4 py-3 border-b border-[#333] flex justify-between items-center hover:bg-[#2a2d35] transition-colors ${selectedCategoryId === cat.id ? "bg-brand-gold text-brand-dark shadow-[inset_4px_0_0_0_#000]" : "text-brand-light"}`}
            >
              <div>
                <span className="font-semibold text-sm block">{cat.name}</span>{cat.name_id && <span className={`text-xs italic block ${selectedCategoryId === cat.id ? "text-brand-dark/70" : "text-brand-muted"}`}>{cat.name_id}</span>}
              </div>
              <div className="flex items-center gap-2"><button onClick={(e) => handleDeleteCategory(e, cat.id)} className="p-1.5 text-brand-muted hover:text-red-500 hover:bg-red-500/10 rounded transition-colors" title="Delete Category"><Trash2 className="h-4 w-4" /></button><ChevronRight className="h-4 w-4 text-gray-500" /></div>
            </button>
          ))}
        </div>
        <div className="p-3 border-t border-[#333] bg-brand-surface shrink-0">
          <form onSubmit={handleAddCategory} className="flex flex-col gap-2">
            <input type="text" placeholder="Category Name (EN)" required value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="w-full border border-[#333] rounded px-2 py-1 text-sm" />
            {showIdCol1 && (
              <input type="text" placeholder="Category Name (ID)" value={newCategoryNameId} onChange={e => setNewCategoryNameId(e.target.value)} className="w-full border border-[#333] rounded px-2 py-1 text-sm" />
            )}
            <button type="submit" className="w-full bg-brand-gold text-brand-dark p-1.5 rounded flex items-center justify-center gap-1 text-xs font-bold"><Plus className="h-3 w-3" /> Add Category</button>
          </form>
        </div>
      </div>

      {/* COLUMN 2: PLANS */}
      <div className="w-1/4 border-r border-[#333] bg-[#14151a] flex flex-col">
        <div className="p-3 bg-[#2a2d35] border-b border-[#333] font-bold text-xs uppercase tracking-wider text-brand-light flex justify-between items-center shrink-0">
          <span>2. Sub-Categories</span>
          <button onClick={() => setShowIdCol2(!showIdCol2)} title="Toggle Indonesian Form" className="text-brand-muted hover:text-white">
            <Globe2 className={`h-4 w-4 ${showIdCol2 ? "text-blue-500" : ""}`} />
          </button>
        </div>
        {!selectedCategoryId ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-500 p-4 text-center">Select a category first</div>
        ) : (
          <>
            <div className="p-2 border-b border-[#333] bg-[#1a1d24]"><input type="text" placeholder="Search sub-categories..." value={searchSub} onChange={e => setSearchSub(e.target.value)} className="w-full bg-[#14151a] border border-[#333] rounded px-2 py-1.5 text-xs text-white" /></div><div className="flex-1 overflow-y-auto">{filteredPlans.filter(p => p.title.toLowerCase().includes(searchSub.toLowerCase()) || (p.title_id && p.title_id.toLowerCase().includes(searchSub.toLowerCase()))).map(plan => (
                <button key={plan.id} onClick={() => selectPlan(plan)} className={`group relative w-full text-left px-4 py-3 border-b border-[#333] flex flex-col hover:bg-[#2a2d35] transition-colors ${selectedPlanId === plan.id ? "bg-brand-gold text-brand-dark shadow-[inset_4px_0_0_0_#000]" : "text-brand-light"}`}
                >
                  <button onClick={(e) => handleDeletePlan(e, plan.id)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-brand-muted hover:text-red-500 hover:bg-red-500/10 rounded transition-colors opacity-0 group-hover:opacity-100" title="Delete Sub-Category"><Trash2 className="h-4 w-4" /></button>
                    <span className="font-semibold text-sm truncate pr-8">{plan.title}</span>{plan.title_id && <span className={`text-xs truncate italic ${selectedPlanId === plan.id ? "text-brand-dark/70" : "text-brand-muted"}`}>{plan.title_id}</span>}
                  <span className={`text-[10px] uppercase font-bold mt-1 ${selectedPlanId === plan.id ? "text-brand-dark" : "text-gray-500"}`}>{plan.duration_days} Days</span>
                </button>
              ))}
            </div>
            <div className="p-3 border-t border-[#333] bg-brand-surface shrink-0">
              <form onSubmit={handleAddPlan} className="flex flex-col gap-2">
                <input type="text" placeholder="Sub-Category Title (EN)" required value={newPlanName} onChange={e => setNewPlanName(e.target.value)} className="w-full border border-[#333] rounded px-2 py-1 text-sm" />
                {showIdCol2 && (
                  <input type="text" placeholder="Sub-Category Title (ID)" value={newPlanNameId} onChange={e => setNewPlanNameId(e.target.value)} className="w-full border border-[#333] rounded px-2 py-1 text-sm" />
                )}
                <button type="submit" className="w-full bg-brand-gold text-brand-dark p-1.5 rounded flex justify-center items-center gap-1 text-xs font-bold"><Plus className="h-3 w-3" /> Add Plan</button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* COLUMN 3: PLAN DETAILS & DAYS */}
      <div className="w-1/4 border-r border-[#333] bg-brand-surface flex flex-col">
        <div className="p-3 bg-[#2a2d35] border-b border-[#333] font-bold text-xs uppercase tracking-wider text-brand-light shrink-0">
          3. Plan Cover & Details
        </div>
        {!selectedPlan ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-500 p-4 text-center">Select a plan first</div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            <div className="space-y-3 pb-4 border-b border-[#333]">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-brand-muted mb-1">Title (EN)</label>
                  <input type="text" value={planTitle} onChange={e => setPlanTitle(e.target.value)} className="w-full border border-[#333] rounded px-2 py-1.5 text-xs font-semibold" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-brand-muted mb-1">Title (ID)</label>
                  <input type="text" value={planTitleId} onChange={e => setPlanTitleId(e.target.value)} className="w-full border border-[#333] rounded px-2 py-1.5 text-xs font-semibold bg-[#14151a]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-brand-muted mb-1">Sub Title (EN)</label>
                  <input type="text" value={planSubtitle} onChange={e => setPlanSubtitle(e.target.value)} className="w-full border border-[#333] rounded px-2 py-1.5 text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-brand-muted mb-1">Sub Title (ID)</label>
                  <input type="text" value={planSubtitleId} onChange={e => setPlanSubtitleId(e.target.value)} className="w-full border border-[#333] rounded px-2 py-1.5 text-xs bg-[#14151a]" />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] uppercase font-bold text-brand-muted mb-1">Cover Image</label>
                <div className="flex gap-2 items-center">
                  {planCover ? (
                    <div className="relative h-12 w-12 rounded overflow-hidden border border-[#333] shrink-0">
                      <Image src={planCover} alt="Cover" fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded border border-[#333] shrink-0 bg-[#2a2d35] flex items-center justify-center text-gray-500">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                  )}
                  <div className="flex-1">
                    <label className={`w-full border border-[#333] rounded px-2 py-2 text-xs flex justify-center items-center gap-2 cursor-pointer hover:bg-[#14151a] transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                      {isUploading ? 'Uploading...' : 'Upload Picture'}
                      <input type="file" accept="image/*" className="hidden" onChange={handleUploadCover} disabled={isUploading} />
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] uppercase font-bold text-brand-muted mb-1">Summary (EN)</label>
                <textarea rows={2} value={planSummary} onChange={e => setPlanSummary(e.target.value)} className="w-full border border-[#333] rounded px-2 py-1.5 text-xs"></textarea>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-brand-muted mb-1">Summary (ID)</label>
                <textarea rows={2} value={planSummaryId} onChange={e => setPlanSummaryId(e.target.value)} className="w-full border border-[#333] rounded px-2 py-1.5 text-xs bg-[#14151a]"></textarea>
              </div>
              
              <div>
                <label className="block text-[10px] uppercase font-bold text-brand-muted mb-1">Duration (Days)</label>
                <input type="number" min="1" max="365" value={planDuration} onChange={e => setPlanDuration(parseInt(e.target.value))} className="w-full border border-[#333] rounded px-2 py-1.5 text-sm" />
              </div>
              
              <button onClick={handleSavePlan} disabled={isSavingPlan} className="w-full bg-brand-gold text-brand-dark font-bold text-xs py-2 rounded mt-2 hover:bg-brand-gold-500">
                {isSavingPlan ? "Saving..." : "Save Plan Details"}
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-light mb-2">Edit Days (1 - {planDuration})</label>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: planDuration }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => selectDay(i + 1)}
                    className={`aspect-square rounded flex items-center justify-center font-bold text-sm transition-colors border ${selectedDayNum === i + 1 ? "bg-brand-gold text-brand-dark border-brand-gold" : "bg-[#2a2d35] text-brand-light border-[#333] hover:bg-[#2a2d35]"}`}
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
      <div className="w-1/4 bg-brand-surface flex flex-col">
        <div className="p-3 bg-[#2a2d35] border-b border-[#333] font-bold text-xs uppercase tracking-wider text-brand-light flex justify-between items-center shrink-0">
          <span>4. The Body</span>
          {selectedDayNum && <span className="text-white bg-brand-surface px-2 py-0.5 rounded text-[10px]">Day {selectedDayNum}</span>}
        </div>
        {!selectedDayNum ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-500 p-4 text-center">Select a day first</div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] uppercase font-bold text-brand-muted mb-1">Section Title (EN)</label>
                <input type="text" value={dayTitle} onChange={e => setDayTitle(e.target.value)} placeholder="e.g. Intro" className="w-full border border-[#333] rounded px-2 py-1.5 text-xs font-semibold" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-brand-muted mb-1">Section Title (ID)</label>
                <input type="text" value={dayTitleId} onChange={e => setDayTitleId(e.target.value)} placeholder="e.g. Intro" className="w-full border border-[#333] rounded px-2 py-1.5 text-xs font-semibold bg-[#14151a]" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-brand-muted mb-1">The Devotion (EN)</label>
              <textarea rows={4} value={dayDevotion} onChange={e => setDayDevotion(e.target.value)} className="w-full border border-[#333] rounded px-2 py-1.5 text-xs leading-relaxed"></textarea>
              
              <label className="block text-[10px] uppercase font-bold text-brand-muted mt-2 mb-1">The Devotion (ID)</label>
              <textarea rows={4} value={dayDevotionId} onChange={e => setDayDevotionId(e.target.value)} className="w-full border border-[#333] rounded px-2 py-1.5 text-xs leading-relaxed bg-[#14151a]"></textarea>
            </div>

            <div className="bg-[#14151a] p-3 rounded-lg border border-[#333]">
              <label className="block text-[10px] uppercase font-bold text-brand-muted mb-2">The Verses</label>
              <ul className="space-y-1.5 mb-3">
                {dayVerses.map(v => (
                  <li key={v.id} className="text-xs bg-brand-surface p-2 rounded flex justify-between items-center border border-[#333]">
                    <span className="font-semibold">{v.verse_reference}</span><button onClick={() => handleDeleteVerse(v.id)} className="p-1 text-brand-muted hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"><Trash2 className="h-3 w-3" /></button>
                  </li>
                ))}
                {dayVerses.length === 0 && <li className="text-[10px] text-gray-500 italic">No verses added.</li>}
              </ul>
              <form onSubmit={handleAddVerse} className="flex flex-col gap-2">
                <select value={verseBook} onChange={e => setVerseBook(e.target.value)} className="w-full border border-[#333] rounded px-2 py-1.5 text-xs bg-[#1a1d24] text-white">
                  {BIBLE_BOOKS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <div className="flex gap-2">
                  <input type="number" placeholder="Ch" value={verseChapter} onChange={e => setVerseChapter(e.target.value)} className="w-1/3 border border-[#333] rounded px-2 py-1.5 text-xs bg-[#1a1d24] text-white" />
                  <input type="text" placeholder="Vs (e.g. 1-3)" value={verseNumber} onChange={e => setVerseNumber(e.target.value)} className="flex-1 border border-[#333] rounded px-2 py-1.5 text-xs bg-[#1a1d24] text-white" />
                  <button type="submit" className="bg-brand-gold text-brand-dark p-1.5 rounded font-bold"><Plus className="h-4 w-4" /></button>
                </div>
              </form>
              {!dayData && <p className="text-[10px] text-red-500 mt-1">Save content first before adding verses.</p>}
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-brand-muted mb-1">The Reflection (EN)</label>
              <textarea rows={3} value={dayReflection} onChange={e => setDayReflection(e.target.value)} className="w-full border border-[#333] rounded px-2 py-1.5 text-xs leading-relaxed"></textarea>
              
              <label className="block text-[10px] uppercase font-bold text-brand-muted mt-2 mb-1">The Reflection (ID)</label>
              <textarea rows={3} value={dayReflectionId} onChange={e => setDayReflectionId(e.target.value)} className="w-full border border-[#333] rounded px-2 py-1.5 text-xs leading-relaxed bg-[#14151a]"></textarea>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-brand-muted mb-1">The Prayer (EN)</label>
              <textarea rows={3} value={dayPrayer} onChange={e => setDayPrayer(e.target.value)} className="w-full border border-[#333] rounded px-2 py-1.5 text-xs leading-relaxed"></textarea>
              
              <label className="block text-[10px] uppercase font-bold text-brand-muted mt-2 mb-1">The Prayer (ID)</label>
              <textarea rows={3} value={dayPrayerId} onChange={e => setDayPrayerId(e.target.value)} className="w-full border border-[#333] rounded px-2 py-1.5 text-xs leading-relaxed bg-[#14151a]"></textarea>
            </div>
            
            <button onClick={handleSaveDay} disabled={isSavingDay} className="w-full bg-brand-gold text-brand-dark font-bold text-xs py-2 rounded hover:bg-brand-gold-500 flex items-center justify-center gap-2">
              <Save className="h-4 w-4" /> {isSavingDay ? "Saving..." : "Save Body Content"}
            </button>
            
          </div>
        )}
      </div>

    </div>
  );
}








