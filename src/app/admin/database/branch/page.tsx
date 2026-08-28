"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import AddBranchModal from "@/components/admin/AddBranchModal";

export default function BranchPage() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.from("branches").select("*").order("created_at", { ascending: false });
    
    if (error) {
      setError(error.message);
    } else {
      setData(data || []);
      setError(null);
    }
    setIsLoading(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Branch Data</h2>
        <button onClick={() => setIsAddOpen(true)} className="bg-brand-gold text-brand-dark px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-yellow-400">
          <Plus className="h-4 w-4" /> Add Branch
        </button>
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-500 font-semibold mb-1">Database Error</h3>
            <p className="text-red-400 text-sm">{error}</p>
            <p className="text-red-400 text-sm mt-2 font-mono bg-red-950/50 p-2 rounded">
              Please execute supabase/018_branch_collab.sql in your Supabase SQL Editor.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#333]">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs uppercase bg-[#111] text-gray-400 border-b border-[#333]">
              <tr>
                <th className="px-4 py-3">Negara</th>
                <th className="px-4 py-3">Provinsi</th>
                <th className="px-4 py-3">Kota (Branch)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333]">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="text-center py-10"><Loader2 className="w-5 h-5 animate-spin mx-auto text-brand-muted" /></td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-10 text-brand-muted">No branches found.</td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">{row.negara}</td>
                    <td className="px-4 py-3">{row.provinsi}</td>
                    <td className="px-4 py-3 font-semibold text-brand-gold">{row.kota}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      <AddBranchModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSuccess={() => window.location.reload()} />
    </div>
  );
}
