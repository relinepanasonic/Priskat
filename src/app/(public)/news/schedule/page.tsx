"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Church, Plus, RefreshCw, Trash2, MapPin, Clock } from "lucide-react";

export default function ChurchSchedulePage() {
  const [churches, setChurches] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    checkAdmin();
    fetchChurches();
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
    if (data?.role?.toLowerCase() === "superadmin") {
      setIsAdmin(true);
    }
  };

  const fetchChurches = async () => {
    const { data, error } = await supabase.from("news_churches").select("*").order("created_at", { ascending: false });
    if (!error && data) {
      setChurches(data);
    }
  };

  const handleAddChurch = async () => {
    if (!newUrl) return;
    
    setIsScraping(true);
    try {
      const res = await fetch("/api/scrape-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newUrl })
      });
      const json = await res.json();
      
      if (!res.ok) {
        alert(json.error || "Failed to scrape");
        setIsScraping(false);
        return;
      }

      const cd = json.data;
      const imageUrl = cd.image?.file ? `https://jadwalmisa.id/api/file?name=${cd.image.file}` : null;

      const { error } = await supabase.from("news_churches").insert({
        url: newUrl,
        name: cd.name,
        address: cd.address,
        image_url: imageUrl,
        schedules: cd.schedules,
      });

      if (error) {
        alert("Error saving: " + error.message);
      } else {
        setNewUrl("");
        fetchChurches();
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
    setIsScraping(false);
  };

  const handleRefresh = async (id: string, url: string) => {
    try {
      const res = await fetch("/api/scrape-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      const json = await res.json();
      if (!res.ok) return alert(json.error);
      
      const cd = json.data;
      const imageUrl = cd.image?.file ? `https://jadwalmisa.id/api/file?name=${cd.image.file}` : null;

      await supabase.from("news_churches").update({
        name: cd.name,
        address: cd.address,
        image_url: imageUrl,
        schedules: cd.schedules,
        updated_at: new Date().toISOString()
      }).eq("id", id);
      
      fetchChurches();
    } catch (e: any) {
      alert("Error refreshing: " + e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this church schedule?")) return;
    await supabase.from("news_churches").delete().eq("id", id);
    fetchChurches();
  };

  return (
    <div className="flex flex-col min-h-[500px] p-4 md:p-6 text-white space-y-6">
      
      {isAdmin && (
        <div className="bg-[#111] border border-[#333] rounded-xl p-5 space-y-4">
          <div>
            <h3 className="font-bold text-brand-gold text-sm mb-1">Add Church (Superadmin Only)</h3>
            <p className="text-xs text-gray-400">Paste the URL of a church from jadwalmisa.id (e.g. https://jadwalmisa.id/cari/dki-jakarta/kota-jakarta-pusat/gereja-katedral...)</p>
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              placeholder="https://jadwalmisa.id/cari/..." 
              className="flex-1 bg-[#1a1d24] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold"
            />
            <button 
              onClick={handleAddChurch}
              disabled={isScraping || !newUrl}
              className="bg-brand-gold text-brand-dark px-4 py-2 rounded-lg font-bold text-sm hover:bg-yellow-500 transition-colors disabled:opacity-50 whitespace-nowrap flex items-center gap-2"
            >
              {isScraping ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {isScraping ? "Scraping..." : "Add Church"}
            </button>
          </div>
        </div>
      )}

      {churches.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Church className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No church schedules added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {churches.map((church) => (
            <div key={church.id} className="bg-[#1a1d24] border border-[#333] rounded-xl overflow-hidden shadow-lg flex flex-col">
              {church.image_url && (
                <div className="w-full h-40 bg-[#111] relative">
                  <img src={church.image_url} alt={church.name} className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1d24] to-transparent"></div>
                </div>
              )}
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h3 className="font-bold text-lg text-brand-gold leading-tight">{church.name}</h3>
                  {isAdmin && (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => handleRefresh(church.id, church.url)} className="p-1.5 bg-[#222] text-gray-400 hover:text-white rounded-md transition-colors" title="Scrape latest">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(church.id)} className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-md transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-gray-400 flex items-start gap-1.5 mb-6">
                  <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{church.address}</span>
                </p>

                <div className="space-y-4">
                  {church.schedules?.map((sched: any, idx: number) => (
                    <div key={idx} className="bg-[#111] rounded-lg p-3 border border-[#333]">
                      <h4 className="font-bold text-sm text-gray-300 mb-2">{sched.title}</h4>
                      <div className="flex flex-wrap gap-2">
                        {sched.time?.map((t: any, i: number) => (
                          <span key={i} className="inline-flex items-center gap-1 bg-[#222] px-2 py-1 rounded-md text-xs font-mono text-brand-light border border-[#444]">
                            <Clock className="w-3 h-3 text-brand-gold" />
                            {t.start}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-[#333] text-[10px] text-gray-500 flex justify-between">
                  <span>Schedules from jadwalmisa.id</span>
                  <span>Last scraped: {new Date(church.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
