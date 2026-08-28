"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Plus, Search, Check } from "lucide-react";

export default function AddCampModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [branch, setBranch] = useState("Bandung");
  const [campName, setCampName] = useState("Pria Sejati");
  const [angkatan, setAngkatan] = useState("");
  const [crewMembers, setCrewMembers] = useState<{name: string; position: string; userId: string | null}[]>([]);
  
  const [searchUser, setSearchUser] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setBranch("Bandung");
      setCampName("Pria Sejati");
      setAngkatan("");
      setCrewMembers([]);
      setErrorMsg(null);
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    const supabase = createClient();
    const { data } = await supabase.from("profiles").select("id, full_name, email").limit(100);
    if (data) setUsers(data);
  };

  const addCrewField = () => {
    setCrewMembers([...crewMembers, { name: "", position: "", userId: null }]);
  };

  const updateCrew = (index: number, field: string, value: any) => {
    const updated = [...crewMembers];
    updated[index] = { ...updated[index], [field]: value };
    setCrewMembers(updated);
  };

  const removeCrew = (index: number) => {
    const updated = [...crewMembers];
    updated.splice(index, 1);
    setCrewMembers(updated);
  };

  const handleSave = async () => {
    if (!angkatan) {
      setErrorMsg("Angkatan is required");
      return;
    }
    
    setIsSaving(true);
    setErrorMsg(null);
    const supabase = createClient();
    
    // 1. Create cohort
    const { data: cohort, error: cohortError } = await supabase
      .from("camp_cohorts")
      .insert({ branch, camp_name: campName, angkatan })
      .select("id")
      .single();

    if (cohortError) {
      setErrorMsg(cohortError.message);
      setIsSaving(false);
      return;
    }

    // 2. Add crew members
    if (crewMembers.length > 0) {
      const crewPayload = crewMembers.map(c => ({
        cohort_id: cohort.id,
        branch,
        camp: campName,
        angkatan,
        name: c.name,
        position: c.position,
        user_id: c.userId
      }));

      const { error: crewError } = await supabase.from("camp_crew").insert(crewPayload);
      if (crewError) {
        setErrorMsg(crewError.message);
        setIsSaving(false);
        return;
      }
    }

    setIsSaving(false);
    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1a1d24] border border-[#333] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="px-6 py-4 border-b border-[#333] flex justify-between items-center bg-[#111]">
          <h2 className="text-lg font-bold text-white">Add New Camp & Crew</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Branch</label>
              <select value={branch} onChange={e => setBranch(e.target.value)} className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold">
                <option value="Bandung">Bandung</option>
                <option value="Jabodetabek">Jabodetabek</option>
                <option value="Surabaya">Surabaya</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Camp Name</label>
              <select value={campName} onChange={e => setCampName(e.target.value)} className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold">
                <option value="Pria Sejati">Pria Sejati</option>
                <option value="Wanita Berhikmat">Wanita Berhikmat</option>
                <option value="Youngman">Youngman</option>
                <option value="Youngwoman">Youngwoman</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Angkatan</label>
              <input value={angkatan} onChange={e => setAngkatan(e.target.value)} type="text" placeholder="e.g. 18" className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold" />
            </div>
          </div>

          <hr className="border-[#333]" />

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-white">Crew Members</h3>
              <button onClick={addCrewField} className="bg-[#222] border border-[#444] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#333] flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Crew
              </button>
            </div>

            <div className="space-y-4">
              {crewMembers.length === 0 && <p className="text-xs text-gray-500 italic">No crew members added yet.</p>}
              
              {crewMembers.map((crew, idx) => (
                <div key={idx} className="bg-[#111] border border-[#333] p-4 rounded-xl space-y-3 relative">
                  <button onClick={() => removeCrew(idx)} className="absolute top-2 right-2 text-red-500 hover:text-red-400">
                    <X className="w-4 h-4" />
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Nama</label>
                      <input value={crew.name} onChange={e => updateCrew(idx, 'name', e.target.value)} type="text" placeholder="Crew name" className="w-full bg-[#1a1d24] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Posisi</label>
                      <input value={crew.position} onChange={e => updateCrew(idx, 'position', e.target.value)} type="text" placeholder="e.g. Ketua" className="w-full bg-[#1a1d24] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Connect to Member Account (Optional)</label>
                    <select 
                      value={crew.userId || ""} 
                      onChange={e => updateCrew(idx, 'userId', e.target.value || null)}
                      className="w-full bg-[#1a1d24] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold"
                    >
                      <option value="">-- No Account Connected --</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#333] bg-[#111] flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-brand-gold text-brand-dark px-6 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : <><Check className="w-4 h-4" /> Save Camp</>}
          </button>
        </div>
      </div>
    </div>
  );
}
