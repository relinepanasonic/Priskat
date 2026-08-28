"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

export default function CampCrewPage() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data: crewData, error } = await supabase
        .from("camp_crew")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setData(crewData || []);
      }
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const handleSort = (key: string) => {
    if (sortConfig && sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        setSortConfig({ key, direction: 'desc' });
      } else {
        setSortConfig(null);
      }
    } else {
      setSortConfig({ key, direction: 'asc' });
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0;
    
    let valA = a[sortConfig.key] || "";
    let valB = b[sortConfig.key] || "";

    if (sortConfig.key === 'angkatan') {
       const numA = Number(valA);
       const numB = Number(valB);
       if (!isNaN(numA) && !isNaN(numB)) {
          return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
       }
    }

    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig?.key !== columnKey) return <ChevronsUpDown className="w-3 h-3 text-gray-600" />;
    return sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-brand-gold" /> : <ChevronDown className="w-3 h-3 text-brand-gold" />;
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-5 pt-4">
        <div>
          <h2 className="text-xl font-bold text-white">Camp Crew</h2>
          <p className="text-sm text-brand-muted mt-1">Directory of all camp crew members.</p>
        </div>
      </div>

      <div className="bg-[#1a1d24] border border-[#333] rounded-xl overflow-hidden mx-5 mb-5">
        <div className="px-5 py-4 border-b border-[#333] bg-[#111]">
          <h2 className="text-sm font-bold text-white">Records Found: {data.length}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs uppercase bg-[#111] text-gray-400 border-b border-[#333]">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-[#222]" onClick={() => handleSort('branch')}>
                  <div className="flex items-center gap-1">Branch <SortIcon columnKey="branch" /></div>
                </th>
                <th className="px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-[#222]" onClick={() => handleSort('camp')}>
                  <div className="flex items-center gap-1">Camp <SortIcon columnKey="camp" /></div>
                </th>
                <th className="px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-[#222]" onClick={() => handleSort('angkatan')}>
                  <div className="flex items-center gap-1">Angkatan <SortIcon columnKey="angkatan" /></div>
                </th>
                <th className="px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-[#222]" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">Nama <SortIcon columnKey="name" /></div>
                </th>
                <th className="px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-[#222]" onClick={() => handleSort('position')}>
                  <div className="flex items-center gap-1">Posisi <SortIcon columnKey="position" /></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-500">Loading records...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-500">No records found.</td>
                </tr>
              ) : (
                sortedData.map((row) => (
                  <tr key={row.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-2.5 whitespace-nowrap font-bold text-brand-gold">{row.branch || "-"}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">{row.camp || "-"}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">{row.angkatan || "-"}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap font-semibold text-white">{row.name || "-"}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">{row.position || "-"}</td>
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
