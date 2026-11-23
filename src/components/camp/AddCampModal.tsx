"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { uploadImage, storagePath } from "@/lib/upload";
import { CAMP_EVENT_TYPES, isCampSeries } from "@/lib/campTypes";
import { X, Check, ImagePlus } from "lucide-react";

export default function AddCampModal({ isOpen, onClose, onSuccess, communityId = null }: { isOpen: boolean; onClose: () => void; onSuccess: () => void; communityId?: string | null }) {
  const [branches, setBranches] = useState<string[]>([]);
  const [branch, setBranch] = useState("");
  const [campType, setCampType] = useState<string>("Pria Sejati");
  const [angkatan, setAngkatan] = useState("");
  const [startDate, setStartDate] = useState("");
  const [customName, setCustomName] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const series = isCampSeries(campType);

  const [ketuaUserId, setKetuaUserId] = useState<string | null>(null);

  const [users, setUsers] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCampType("Pria Sejati");
      setAngkatan("");
      setStartDate("");
      setCustomName("");
      setBannerUrl("");
      setKetuaUserId(null);
      setErrorMsg(null);
      fetchBranches();
      fetchUsers();
    }
  }, [isOpen]);

  const fetchBranches = async () => {
    const supabase = createClient();
    const { data } = await supabase.from("branches").select("branch, kota");
    if (data) {
      const opts = Array.from(new Set(data.map(d => d.branch || d.kota).filter(Boolean))).sort();
      setBranches(opts as string[]);
      if (opts.length > 0) setBranch(opts[0] as string);
    }
  };

  const fetchUsers = async () => {
    const supabase = createClient();
    const { data } = await supabase.from("profiles").select("id, full_name, username").limit(500);
    if (data) setUsers(data);
  };

  const generatedTitle = series
    ? `${campType} ${angkatan} - ${branch}`
    : customName;

  const handleBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      setBannerUrl(await uploadImage(file, "event-banners", storagePath(user.id, file.name)));
    } catch {
      setErrorMsg("Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!branch || (series && !angkatan) || !startDate || !ketuaUserId) {
      setErrorMsg("Please fill in all required fields (Branch, Type, Angkatan, Date, and Ketua)");
      return;
    }
    if (!series && !customName) {
      setErrorMsg("Please provide an Event Title");
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    const supabase = createClient();

    // 1. Create cohort
    const { data: cohort, error: cohortError } = await supabase
      .from("camp_cohorts")
      .insert({
        branch,
        camp_name: campType,
        angkatan: series ? angkatan : "0",
        start_date: startDate,
        custom_name: generatedTitle,
        community_id: communityId,
        banner_url: bannerUrl || null,
      })
      .select("id")
      .single();

    if (cohortError) {
      setErrorMsg(cohortError.message);
      setIsSaving(false);
      return;
    }

    // 2. Add Ketua to crew
    const ketuaUser = users.find(u => u.id === ketuaUserId);
    if (ketuaUser) {
      const { error: crewError } = await supabase.from("camp_crew").insert({
        cohort_id: cohort.id,
        branch,
        camp: campType,
        angkatan: series ? angkatan : "0",
        name: ketuaUser.full_name,
        position: "Ketua",
        user_id: ketuaUserId,
        profile_id: ketuaUserId
      });

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
      <div className="bg-[#1a1d24] border border-[#333] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="px-6 py-4 border-b border-[#333] flex justify-between items-center bg-[#111]">
          <h2 className="text-lg font-bold text-white">Add New Camp</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Branch</label>
              <select value={branch} onChange={e => setBranch(e.target.value)} className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold">
                {branches.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Camp / Event Type</label>
              <select value={campType} onChange={e => setCampType(e.target.value)} className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold">
                {CAMP_EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {series ? (
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Angkatan</label>
                <input value={angkatan} onChange={e => setAngkatan(e.target.value)} type="text" placeholder="e.g. 18" className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold" />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-brand-gold mb-1.5">Event Title</label>
                <input value={customName} onChange={e => setCustomName(e.target.value)} type="text" placeholder={`e.g. ${campType} Jabodetabek`} className="w-full bg-[#111] border border-brand-gold/50 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold" />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Start Date</label>
              <input value={startDate} onChange={e => setStartDate(e.target.value)} type="date" className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold [color-scheme:dark]" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-400">Banner (optional)</label>
            {bannerUrl ? (
              <div className="relative h-32 overflow-hidden rounded-xl border border-[#333]">
                <Image src={bannerUrl} alt="Banner" fill className="object-cover" />
                <button type="button" onClick={() => setBannerUrl("")} className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex h-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#333] hover:border-brand-gold/60">
                {uploading ? <p className="text-sm text-gray-500">Uploading…</p> : (
                  <>
                    <ImagePlus className="mb-1 h-6 w-6 text-gray-500" />
                    <p className="text-xs text-gray-500">Click to add a banner</p>
                  </>
                )}
                <input type="file" accept="image/*" className="sr-only" onChange={handleBanner} />
              </label>
            )}
          </div>

          <div className="bg-[#111] p-4 rounded-xl border border-[#333]">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Generated Title</label>
            <div className="text-white font-bold text-lg flex items-center gap-2">
              {generatedTitle || <span className="text-gray-600 italic">Title will appear here</span>}
            </div>
          </div>

          <hr className="border-[#333]" />

          <div>
            <label className="block text-xs font-semibold text-brand-gold mb-1.5">Assign Ketua</label>
            <select
              value={ketuaUserId || ""}
              onChange={e => setKetuaUserId(e.target.value || null)}
              className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold"
            >
              <option value="">-- Select Member --</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.full_name} (@{u.username})</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">The selected member will automatically be added to the crew as "Ketua" and will gain access to the camp dashboard to add the rest of the crew.</p>
          </div>

        </div>

        <div className="px-6 py-4 border-t border-[#333] bg-[#111] flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || uploading}
            className="bg-brand-gold text-brand-dark px-6 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : <><Check className="w-4 h-4" /> Save Camp</>}
          </button>
        </div>
      </div>
    </div>
  );
}
