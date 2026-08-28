"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Check } from "lucide-react";

export default function AddBranchModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [branch, setBranch] = useState("");
  const [kota, setKota] = useState("");
  const [provinsi, setProvinsi] = useState("");
  const [negara, setNegara] = useState("Indonesia");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = async () => {
    if (!branch || !kota || !provinsi || !negara) {
      setErrorMsg("All fields are required");
      return;
    }
    
    setIsSaving(true);
    setErrorMsg(null);
    const supabase = createClient();
    
    const { error } = await supabase
      .from("branches")
      .insert({ branch, kota, provinsi, negara });

    if (error) {
      setErrorMsg(error.message);
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1a1d24] border border-[#333] rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
        <div className="px-6 py-4 border-b border-[#333] flex justify-between items-center bg-[#111]">
          <h2 className="text-lg font-bold text-white">Add New Branch</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Branch Name</label>
            <input value={branch} onChange={e => setBranch(e.target.value)} type="text" placeholder="e.g. Jabodetabek" className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Kota (City)</label>
            <input value={kota} onChange={e => setKota(e.target.value)} type="text" placeholder="e.g. Jakarta Selatan" className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Provinsi</label>
            <input value={provinsi} onChange={e => setProvinsi(e.target.value)} type="text" placeholder="e.g. DKI Jakarta" className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Negara</label>
            <input value={negara} onChange={e => setNegara(e.target.value)} type="text" className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold" />
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
            {isSaving ? "Saving..." : <><Check className="w-4 h-4" /> Save Branch</>}
          </button>
        </div>
      </div>
    </div>
  );
}
