"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Database, Filter, Search, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function DatabaseViewerPage() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [filterGroup, setFilterGroup] = useState("");
  const [filterCamp, setFilterCamp] = useState("");
  const [filterAngkatan, setFilterAngkatan] = useState("");
  const [filterKota, setFilterKota] = useState("");

  const fetchAlumni = async () => {
    setIsLoading(true);
    const supabase = createClient();
    let query = supabase.from("alumni_database").select("*");

    if (filterGroup) query = query.ilike("group", `%${filterGroup}%`);
    if (filterCamp) query = query.ilike("camp", `%${filterCamp}%`);
    if (filterAngkatan) query = query.ilike("angkatan", `%${filterAngkatan}%`);
    if (filterKota) query = query.ilike("city", `%${filterKota}%`);

    query = query.order("created_at", { ascending: false }).limit(200);

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
      <div>
        <Link href="/admin/database" className="inline-flex items-center text-sm font-semibold text-brand-gold hover:opacity-80 transition-opacity mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Upload
        </Link>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Database className="h-6 w-6 text-brand-gold" />
          Alumni Database
        </h1>
        <p className="mt-1 text-sm text-brand-muted">
          View and filter the alumni directory.
        </p>
      </div>

      <div className="bg-[#1a1d24] border border-[#333] rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="h-4 w-4 text-brand-gold" />
          <h2 className="text-sm font-bold text-white">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Group</label>
            <input 
              type="text"
              placeholder="e.g. Jabodetabek"
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold placeholder-gray-600"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Camp</label>
            <input 
              type="text"
              placeholder="e.g. Pria Sejati"
              value={filterCamp}
              onChange={(e) => setFilterCamp(e.target.value)}
              className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold placeholder-gray-600"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Angkatan</label>
            <input 
              type="text"
              placeholder="e.g. 1"
              value={filterAngkatan}
              onChange={(e) => setFilterAngkatan(e.target.value)}
              className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold placeholder-gray-600"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Kota</label>
            <input 
              type="text"
              placeholder="e.g. Jakarta"
              value={filterKota}
              onChange={(e) => setFilterKota(e.target.value)}
              className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold placeholder-gray-600"
            />
          </div>
        </div>
      </div>

      <div className="bg-[#1a1d24] border border-[#333] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#333] bg-[#111] flex justify-between items-center">
          <h2 className="text-sm font-bold text-white">Records Found: {data.length} {data.length === 200 ? "(Max 200 shown)" : ""}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs uppercase bg-[#111] text-gray-400 border-b border-[#333]">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">Group</th>
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
                  <td colSpan={7} className="text-center py-10 text-gray-500">Loading records...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-500">No records found.</td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-2.5 whitespace-nowrap">{row.group}</td>
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
    </div>
  );
}

