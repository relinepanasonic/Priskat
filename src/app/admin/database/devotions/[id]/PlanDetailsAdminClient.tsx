"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PlanDetailsAdminClient({ plan, initialDays }: { plan: any, initialDays: any[] }) {
  const [days, setDays] = useState(initialDays);
  const router = useRouter();

  // New Day Form
  const [dayNumber, setDayNumber] = useState(days.length + 1);
  const [devotionalTitle, setDevotionalTitle] = useState("");
  const [devotionalContent, setDevotionalContent] = useState("");
  const [loadingDay, setLoadingDay] = useState(false);

  // New Verse Form
  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const [verseRef, setVerseRef] = useState("");
  const [verseTrans, setVerseTrans] = useState("TB");
  const [loadingVerse, setLoadingVerse] = useState(false);

  const handleAddDay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingDay(true);
    const supabase = createClient();
    
    const { data, error } = await supabase.from("devotion_plan_days").insert({
      plan_id: plan.id,
      day_number: dayNumber,
      devotional_title: devotionalTitle,
      devotional_content: devotionalContent
    }).select().single();

    if (error) {
      alert("Error adding day: " + error.message);
    } else {
      setDays([...days, { ...data, verses: [] }].sort((a, b) => a.day_number - b.day_number));
      setDayNumber(dayNumber + 1);
      setDevotionalTitle("");
      setDevotionalContent("");
    }
    setLoadingDay(false);
  };

  const handleAddVerse = async (e: React.FormEvent, dayId: string) => {
    e.preventDefault();
    setLoadingVerse(true);
    const supabase = createClient();
    
    const targetDay = days.find(d => d.id === dayId);
    const orderIndex = targetDay?.verses?.length || 0;

    const { data, error } = await supabase.from("devotion_day_verses").insert({
      day_id: dayId,
      verse_reference: verseRef,
      translation: verseTrans,
      order_index: orderIndex
    }).select().single();

    if (error) {
      alert("Error adding verse: " + error.message);
    } else {
      setDays(days.map(d => {
        if (d.id === dayId) {
          return { ...d, verses: [...(d.verses || []), data] };
        }
        return d;
      }));
      setVerseRef("");
      setActiveDayId(null);
    }
    setLoadingVerse(false);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link href="/admin/database/devotions" className="text-blue-500 hover:underline mb-4 inline-block">&larr; Back to Plans</Link>
      <h1 className="text-3xl font-bold mb-2">{plan.title}</h1>
      <p className="text-gray-600 mb-8">Manage days and verses for this plan. Duration: {plan.duration_days} days.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Add Day</h2>
            <form onSubmit={handleAddDay} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Day Number</label>
                <input type="number" required value={dayNumber} onChange={e => setDayNumber(parseInt(e.target.value))} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Devotional Title</label>
                <input type="text" required value={devotionalTitle} onChange={e => setDevotionalTitle(e.target.value)} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Devotional Content</label>
                <textarea required rows={10} value={devotionalContent} onChange={e => setDevotionalContent(e.target.value)} className="w-full border p-2 rounded"></textarea>
              </div>
              <button disabled={loadingDay} className="w-full bg-black text-white py-2 rounded font-bold hover:bg-gray-800 disabled:opacity-50">
                {loadingDay ? "Adding..." : "Add Day"}
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <h2 className="text-xl font-bold">Days in Plan ({days.length})</h2>
          
          {days.length === 0 && <p className="text-gray-500">No days added yet.</p>}

          {days.map((day) => (
            <div key={day.id} className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold">Day {day.day_number}: {day.devotional_title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{day.devotional_content}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-700 mb-2">Verses ({day.verses?.length || 0})</h4>
                
                <ul className="list-disc pl-5 mb-4 text-sm">
                  {day.verses?.map((v: any) => (
                    <li key={v.id}>{v.verse_reference} ({v.translation})</li>
                  ))}
                </ul>

                {activeDayId === day.id ? (
                  <form onSubmit={(e) => handleAddVerse(e, day.id)} className="flex gap-2">
                    <input type="text" placeholder="e.g. Yehezkiel 20:8" required value={verseRef} onChange={e => setVerseRef(e.target.value)} className="flex-1 border p-1.5 text-sm rounded" />
                    <input type="text" placeholder="TB" required value={verseTrans} onChange={e => setVerseTrans(e.target.value)} className="w-16 border p-1.5 text-sm rounded" />
                    <button type="submit" disabled={loadingVerse} className="bg-blue-600 text-white px-3 py-1.5 text-sm rounded hover:bg-blue-700">Add</button>
                    <button type="button" onClick={() => setActiveDayId(null)} className="text-gray-500 px-2 text-sm">Cancel</button>
                  </form>
                ) : (
                  <button onClick={() => setActiveDayId(day.id)} className="text-blue-600 text-sm hover:underline">+ Add Verse</button>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

