"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Database, Filter, Plus } from "lucide-react";
import DatabaseUploadDialog from "@/components/admin/DatabaseUploadDialog";

export default function DatabasePage() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Filters
  const [filterGroup, setFilterGroup] = useState("");
  const [filterCamp, setFilterCamp] = useState("");
  const [filterAngkatan, setFilterAngkatan] = useState("");
  const [filterKota, setFilterKota] = useState("");

  const [groupOptions, setGroupOptions] = useState<string[]>([]);
  const [campOptions, setCampOptions] = useState<string[]>([]);
  const [angkatanOptions, setAngkatanOptions] = useState<string[]>([]);
  const [kotaOptions, setKotaOptions] = useState<string[]>([]);

  const fetchFilterOptions = async () => {
    const supabase = await import("@/lib/supabase/client").then(m => m.createClient());
    const { data } = await supabase.from("alumni_database").select("group, camp, angkatan, city");
    if (data) {
      setGroupOptions(Array.from(new Set(data.map(d => d.group).filter(Boolean))).sort());
      setCampOptions(Array.from(new Set(data.map(d => d.camp).filter(Boolean))).sort());
      setAngkatanOptions(Array.from(new Set(data.map(d => String(d.angkatan)).filter(Boolean))).sort((a, b) => Number(a) - Number(b)));
      setKotaOptions(Array.from(new Set(data.map(d => d.city).filter(Boolean))).sort());
    }
  };

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchAlumni = async () => {
    setIsLoading(true);
    const supabase = createClient();
    let query = supabase.from("alumni_database").select("*");

    if (filterGroup) query = query.ilike("group", `%${filterGroup}%`);
    if (filterCamp) query = query.ilike("camp", `%${filterCamp}%`);
    if (filterAngkatan) query = query.ilike("angkatan", `%${filterAngkatan}%`);
    if (filterKota) query = query.ilike("city", `%${filterKota}%`);

    query = query.order("created_at", { ascending: false }).limit(2000);

    const { data: alumniData, error } = await query;
    if (error) {
      console.error(error);
    } else {
      setData(alumniData || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAlumni();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterGroup, filterCamp, filterAngkatan, filterKota]);

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Database className="h-6 w-6 text-brand-gold" />
            Database
          </h1>
          <p className="mt-1 text-sm text-brand-muted">
            View and filter the alumni directory.
          </p>
        </div>
        <button 
          onClick={() => setIsUploadOpen(true)}
          className="bg-brand-gold text-brand-dark px-4 py-2.5 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          Add New Database
        </button>
      </div>

      <div className="bg-[#1a1d24] border border-[#333] rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="h-4 w-4 text-brand-gold" />
          <h2 className="text-sm font-bold text-white">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Group</label>
            <select 
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold"
            >
              <option value="">All Groups</option>
              {groupOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Camp</label>
            <select 
              value={filterCamp}
              onChange={(e) => setFilterCamp(e.target.value)}
              className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold"
            >
              <option value="">All Camps</option>
              {campOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Angkatan</label>
            <select 
              value={filterAngkatan}
              onChange={(e) => setFilterAngkatan(e.target.value)}
              className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold"
            >
              <option value="">All Angkatan</option>
              {angkatanOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Kota</label>
            <select 
              value={filterKota}
              onChange={(e) => setFilterKota(e.target.value)}
              className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold"
            >
              <option value="">All Kota</option>
              {kotaOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1d24] border border-[#333] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#333] bg-[#111] flex justify-between items-center">
          <h2 className="text-sm font-bold text-white">Records Found: {data.length} {data.length === 2000 ? "(Max 2000 shown)" : ""}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs uppercase bg-[#111] text-gray-400 border-b border-[#333]">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">Branch</th>`n                <th className="px-4 py-3 whitespace-nowrap">Group</th>
                <th className="px-4 py-3 whitespace-nowrap">Camp</th>
                <th className="px-4 py-3 whitespace-nowrap">Angkatan</th>
                <th className="px-4 py-3 whitespace-nowrap">Nama</th>
                <th className="px-4 py-3 whitespace-nowrap">Kota</th>
                <th className="px-4 py-3 whitespace-nowrap">No Handphone</th>
                <th className="px-4 py-3 whitespace-nowrap">Paroki</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333]">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-500">Loading records...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-500">No records found.</td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-2.5 whitespace-nowrap font-bold text-brand-gold">{row.branch || row.cabang || row.Cabang || "Bandung"}</td>`n                    <td className="px-4 py-2.5 whitespace-nowrap">{row.group}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">{row.camp}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">{row.angkatan}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap font-semibold text-white">{row.name}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">{row.city}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">{row.mobile || row.phone}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">{row.parish}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DatabaseUploadDialog 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onSuccess={() => {
           // Optionally refresh data when upload succeeds
           fetchAlumni();
        }}
      />
    </div>
  );
}

