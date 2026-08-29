"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Save, ChevronRight, ChevronDown, Globe2, Upload, Loader2, Image as ImageIcon, Trash2 } from "lucide-react";
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

  // All categories (both top-level and sub-categories)
  const [categories, setCategories] = useState(initialCategories);
  // Which top-level categories are expanded
  const [expandedCatIds, setExpandedCatIds] = useState<Set<string>>(new Set());
  // Which SUB-CATEGORY is selected (this drives Col 2)
  const [selectedSubCatId, setSelectedSubCatId] = useState<string | null>(null);
  const [showIdCol1, setShowIdCol1] = useState(false);

  // Add top-level category form
  const [newTopCatName, setNewTopCatName] = useState("");
  // Add sub-category form
  const [newSubCatName, setNewSubCatName] = useState("");
  const [addingSubToId, setAddingSubToId] = useState<string | null>(null);

  // Column 2: Plans
  const [plans, setPlans] = useState(initialPlans);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [newPlanName, setNewPlanName] = useState("");
  const [searchSub, setSearchSub] = useState("");
  const [showIdCol2, setShowIdCol2] = useState(false);

  // Column 3: Plan Details
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
  const [isSavingDay, setIsSavingDay] = useState(false);

  const BIBLE_BOOKS = ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Tobit", "Judith", "Esther", "1 Maccabees", "2 Maccabees", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Wisdom", "Sirach", "Isaiah", "Jeremiah", "Lamentations", "Baruch", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"];

  // Derived data
  const topLevelCats = categories.filter(c => !c.parent_id);
  const getSubCats = (parentId: string) => categories.filter(c => c.parent_id === parentId);
  const filteredPlans = plans.filter(p => p.category_id === selectedSubCatId);

  // --- Handlers ---
  const toggleExpand = (catId: string) => {
    setExpandedCatIds(prev => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const selectSubCat = (subCatId: string, parentId: string) => {
    setSelectedSubCatId(subCatId);
    setSelectedPlanId(null);
    setSelectedDayNum(null);
    // Also ensure the parent is expanded
    setExpandedCatIds(prev => new Set([...prev, parentId]));
  };

  const handleAddTopCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopCatName) return;
    const { data } = await supabase.from("devotion_categories").insert({
      name: newTopCatName,
      parent_id: null
    }).select().single();
    if (data) {
      setCategories([data, ...categories]);
      setNewTopCatName("");
    }
  };

  const handleAddSubCategory = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!newSubCatName) return;
    const { data } = await supabase.from("devotion_categories").insert({
      name: newSubCatName,
      parent_id: parentId
    }).select().single();
    if (data) {
      setCategories([...categories, data]);
      setNewSubCatName("");
      setAddingSubToId(null);
    }
  };

  const handleDeleteCategory = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Delete this category and all its contents?")) return;
    const { error } = await supabase.from("devotion_categories").delete().eq("id", id);
    if (!error) {
      setCategories(categories.filter(c => c.id !== id && c.parent_id !== id));
      if (selectedSubCatId === id) setSelectedSubCatId(null);
    }
  };

  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName || !selectedSubCatId) return;
    const { data } = await supabase.from("devotion_plans").insert({
      category_id: selectedSubCatId,
      title: newPlanName,
      duration_days: 7
    }).select().single();
    if (data) {
      setPlans([data, ...plans]);
      setNewPlanName("");
      selectPlan(data);
    }
  };

  const handleDeletePlan = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const { error } = await supabase.from("devotion_plans").delete().eq("id", id);
    if (!error) {
      setPlans(plans.filter(p => p.id !== id));
      if (selectedPlanId === id) setSelectedPlanId(null);
    }
  };

  const selectPlan = (plan: any) => {
    setSelectedPlanId(plan.id);
    setPlanTitle(plan.title || "");
    setPlanTitleId(plan.title_id || plan.title || "");
    setPlanSubtitle(plan.subtitle || "");
    setPlanSubtitleId(plan.subtitle_id || "");
    setPlanSummary(plan.summary || plan.description || "");
    setPlanSummaryId(plan.summary_id || "");
    setPlanCover(plan.cover_image_url || "");
    setPlanDuration(plan.duration_days || 7);
    setSelectedDayNum(null);
  };

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedPlanId) return;
    try {
      setIsUploading(true);
      const url = await uploadImage(file, "devotion-covers", `cover_${selectedPlanId}_${Date.now()}.webp`);
      setPlanCover(url);
    } catch (err: any) {
      alert(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!selectedPlanId) return;
    setIsSavingPlan(true);
    const { data } = await supabase.from("devotion_plans").update({
      title: planTitle, title_id: planTitleId,
      subtitle: planSubtitle, subtitle_id: planSubtitleId,
      summary: planSummary, summary_id: planSummaryId,
      cover_image_url: planCover, duration_days: planDuration
    }).eq("id", selectedPlanId).select().single();
    if (data) setPlans(plans.map(p => p.id === selectedPlanId ? data : p));
    setIsSavingPlan(false);
    alert("Plan saved!");
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
      setDayTitleId(data.devotional_title_id || "");
      setDayDevotion(data.devotional_content || "");
      setDayDevotionId(data.devotional_content_id || "");
      setDayReflection(data.reflection || "");
      setDayReflectionId(data.reflection_id || "");
      setDayPrayer(data.prayer || "");
      setDayPrayerId(data.prayer_id || "");
      if (data.verses) setDayVerses(data.verses.sort((a: any, b: any) => a.order_index - b.order_index));
    }
  };

  const handleSaveDay = async () => {
    if (!selectedPlanId || !selectedDayNum) return;
    setIsSavingDay(true);
    const payload = {
      devotional_title: dayTitle, devotional_title_id: dayTitleId,
      devotional_content: dayDevotion, devotional_content_id: dayDevotionId,
      reflection: dayReflection, reflection_id: dayReflectionId,
      prayer: dayPrayer, prayer_id: dayPrayerId
    };
    if (dayData) {
      await supabase.from("devotion_plan_days").update(payload).eq("id", dayData.id);
    } else {
      const { data } = await supabase.from("devotion_plan_days").insert({
        plan_id: selectedPlanId, day_number: selectedDayNum, ...payload
      }).select().single();
      if (data) setDayData(data);
    }
    setIsSavingDay(false);
    alert("Day saved!");
  };

  const handleDeleteVerse = async (verseId: string) => {
    await supabase.from("devotion_day_verses").delete().eq("id", verseId);
    setDayVerses(dayVerses.filter(v => v.id !== verseId));
  };

  const handleAddVerse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verseBook || !verseChapter || !verseNumber) return;
    let targetDayId = dayData?.id;
    if (!targetDayId) {
      if (!selectedPlanId || !selectedDayNum) return;
      const { data: newDay } = await supabase.from("devotion_plan_days").insert({
        plan_id: selectedPlanId, day_number: selectedDayNum,
        devotional_title: dayTitle, devotional_content: dayDevotion
      }).select().single();
      if (newDay) { setDayData(newDay); targetDayId = newDay.id; }
      else return;
    }
    const { data } = await supabase.from("devotion_day_verses").insert({
      day_id: targetDayId,
      verse_reference: `${verseBook} ${verseChapter}:${verseNumber}`,
      translation: "TB",
      order_index: dayVerses.length
    }).select().single();
    if (data) { setDayVerses([...dayVerses, data]); setVerseChapter(""); setVerseNumber(""); }
  };

  return (
    <div className="flex h-[85vh] w-full bg-brand-surface text-white border border-[#333] rounded-xl overflow-hidden shadow-2xl">

      {/* COLUMN 1: CATEGORY TREE */}
      <div className="w-1/4 border-r border-[#333] bg-[#14151a] flex flex-col">
        <div className="p-3 bg-[#2a2d35] border-b border-[#333] font-bold text-xs uppercase tracking-wider text-brand-light flex justify-between items-center shrink-0">
          <span>1. Categories</span>
          <button onClick={() => setShowIdCol1(!showIdCol1)} className="text-brand-muted hover:text-white">
            <Globe2 className={`h-4 w-4 ${showIdCol1 ? "text-blue-500" : ""}`} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {topLevelCats.map(cat => {
            const subCats = getSubCats(cat.id);
            const isExpanded = expandedCatIds.has(cat.id);
            return (
              <div key={cat.id}>
                {/* Top-level category row */}
                <div
                  className="flex items-center justify-between px-3 py-3 border-b border-[#333] hover:bg-[#2a2d35] cursor-pointer group"
                  onClick={() => toggleExpand(cat.id)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isExpanded
                      ? <ChevronDown className="h-3.5 w-3.5 text-brand-gold shrink-0" />
                      : <ChevronRight className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                    }
                    <span className="font-bold text-sm text-white truncate">{cat.name}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteCategory(e, cat.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-brand-muted hover:text-red-500 transition-all shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Sub-categories (expanded) */}
                {isExpanded && (
                  <div className="bg-[#111218]">
                    {subCats.map(sub => (
                      <div
                        key={sub.id}
                        onClick={() => selectSubCat(sub.id, cat.id)}
                        className={`flex items-center justify-between pl-8 pr-3 py-2.5 border-b border-[#2a2d35] cursor-pointer group hover:bg-[#1e2028] transition-colors ${selectedSubCatId === sub.id ? "bg-brand-gold/10 border-l-2 border-l-brand-gold" : ""}`}
                      >
                        <div className="min-w-0">
                          <span className={`text-sm block truncate ${selectedSubCatId === sub.id ? "text-brand-gold font-bold" : "text-gray-300"}`}>
                            {sub.name}
                          </span>
                          {showIdCol1 && sub.name_id && (
                            <span className="text-[10px] text-gray-500 italic truncate block">{sub.name_id}</span>
                          )}
                        </div>
                        <button
                          onClick={(e) => handleDeleteCategory(e, sub.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-brand-muted hover:text-red-500 transition-all shrink-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}

                    {/* Add sub-category inline */}
                    {addingSubToId === cat.id ? (
                      <form onSubmit={(e) => handleAddSubCategory(e, cat.id)} className="pl-8 pr-3 py-2 flex gap-2 border-b border-[#2a2d35]">
                        <input
                          autoFocus
                          type="text"
                          placeholder="Sub-category name..."
                          value={newSubCatName}
                          onChange={e => setNewSubCatName(e.target.value)}
                          className="flex-1 bg-[#14151a] border border-[#444] rounded px-2 py-1 text-xs text-white"
                        />
                        <button type="submit" className="bg-brand-gold text-brand-dark px-2 rounded text-xs font-bold">Add</button>
                        <button type="button" onClick={() => setAddingSubToId(null)} className="text-gray-500 hover:text-white text-xs px-1">✕</button>
                      </form>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setAddingSubToId(cat.id); setExpandedCatIds(prev => new Set([...prev, cat.id])); }}
                        className="w-full pl-8 pr-3 py-2 text-left text-[10px] text-gray-500 hover:text-brand-gold flex items-center gap-1 border-b border-[#2a2d35]"
                      >
                        <Plus className="h-3 w-3" /> Add Sub-category
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add top-level category */}
        <div className="p-3 border-t border-[#333] bg-brand-surface shrink-0">
          <form onSubmit={handleAddTopCategory} className="flex gap-2">
            <input
              type="text"
              placeholder="New category..."
              value={newTopCatName}
              onChange={e => setNewTopCatName(e.target.value)}
              className="flex-1 border border-[#333] rounded px-2 py-1 text-xs"
            />
            <button type="submit" className="bg-brand-gold text-brand-dark px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
              <Plus className="h-3 w-3" />
            </button>
          </form>
        </div>
      </div>

      {/* COLUMN 2: PLANS under selected sub-category */}
      <div className="w-1/4 border-r border-[#333] bg-[#14151a] flex flex-col">
        <div className="p-3 bg-[#2a2d35] border-b border-[#333] font-bold text-xs uppercase tracking-wider text-brand-light flex justify-between items-center shrink-0">
          <span>2. Devotional Plans</span>
          <button onClick={() => setShowIdCol2(!showIdCol2)} className="text-brand-muted hover:text-white">
            <Globe2 className={`h-4 w-4 ${showIdCol2 ? "text-blue-500" : ""}`} />
          </button>
        </div>
        {!selectedSubCatId ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-500 p-4 text-center">Select a sub-category first</div>
        ) : (
          <>
            <div className="p-2 border-b border-[#333] bg-[#1a1d24]">
              <input type="text" placeholder="Search plans..." value={searchSub} onChange={e => setSearchSub(e.target.value)} className="w-full bg-[#14151a] border border-[#333] rounded px-2 py-1.5 text-xs text-white" />
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredPlans.filter(p => p.title.toLowerCase().includes(searchSub.toLowerCase())).map(plan => (
                <button
                  key={plan.id}
                  onClick={() => selectPlan(plan)}
                  className={`group relative w-full text-left px-4 py-3 border-b border-[#333] flex flex-col hover:bg-[#2a2d35] transition-colors ${selectedPlanId === plan.id ? "bg-brand-gold text-brand-dark shadow-[inset_4px_0_0_0_#000]" : "text-brand-light"}`}
                >
                  <button onClick={(e) => handleDeletePlan(e, plan.id)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-brand-muted hover:text-red-500 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <span className="font-semibold text-sm truncate pr-8">{plan.title}</span>
                  {showIdCol2 && plan.title_id && <span className={`text-xs italic truncate ${selectedPlanId === plan.id ? "text-brand-dark/70" : "text-brand-muted"}`}>{plan.title_id}</span>}
                  <span className={`text-[10px] uppercase font-bold mt-1 ${selectedPlanId === plan.id ? "text-brand-dark" : "text-gray-500"}`}>{plan.duration_days} Days</span>
                </button>
              ))}
            </div>
            <div className="p-3 border-t border-[#333] bg-brand-surface shrink-0">
              <form onSubmit={handleAddPlan} className="flex gap-2">
                <input type="text" placeholder="New plan title..." required value={newPlanName} onChange={e => setNewPlanName(e.target.value)} className="flex-1 border border-[#333] rounded px-2 py-1 text-xs" />
                <button type="submit" className="bg-brand-gold text-brand-dark px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><Plus className="h-3 w-3" /></button>
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
                  <label className={`flex-1 border border-[#333] rounded px-2 py-2 text-xs flex justify-center items-center gap-2 cursor-pointer hover:bg-[#14151a] ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                    {isUploading ? 'Uploading...' : 'Upload Picture'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleUploadCover} disabled={isUploading} />
                  </label>
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
              <button onClick={handleSavePlan} disabled={isSavingPlan} className="w-full bg-brand-gold text-brand-dark font-bold text-xs py-2 rounded mt-2">
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
                    className={`aspect-square rounded flex items-center justify-center font-bold text-sm transition-colors border ${selectedDayNum === i + 1 ? "bg-brand-gold text-brand-dark border-brand-gold" : "bg-[#2a2d35] text-brand-light border-[#333]"}`}
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
                    <span className="font-semibold">{v.verse_reference}</span>
                    <button onClick={() => handleDeleteVerse(v.id)} className="p-1 text-brand-muted hover:text-red-500 rounded"><Trash2 className="h-3 w-3" /></button>
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

            <button onClick={handleSaveDay} disabled={isSavingDay} className="w-full bg-brand-gold text-brand-dark font-bold text-xs py-2 rounded flex items-center justify-center gap-2">
              <Save className="h-4 w-4" /> {isSavingDay ? "Saving..." : "Save Body Content"}
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
