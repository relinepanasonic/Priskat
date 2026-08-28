"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Database, Filter, Plus, ChevronUp, ChevronDown, ChevronsUpDown, Download } from "lucide-react";
import DatabaseUploadDialog from "@/components/admin/DatabaseUploadDialog";


export default function DatabasePage() {
  const [data, setData] = useState<any[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  

  // Filters
  const [filterBranch, setFilterBranch] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [filterCamp, setFilterCamp] = useState("");
  const [filterAngkatan, setFilterAngkatan] = useState("");
  const [filterKota, setFilterKota] = useState("");
  const [filterAgama, setFilterAgama] = useState("");
  const [filterParoki, setFilterParoki] = useState("");

  const [branchOptions, setBranchOptions] = useState<string[]>([]);
  const [groupOptions, setGroupOptions] = useState<string[]>([]);
  const [campOptions, setCampOptions] = useState<string[]>([]);
  const [angkatanOptions, setAngkatanOptions] = useState<string[]>([]);
  const [kotaOptions, setKotaOptions] = useState<string[]>([]);
  const [agamaOptions, setAgamaOptions] = useState<string[]>([]);
  const [parokiOptions, setParokiOptions] = useState<string[]>([]);

  const fetchFilterOptions = async () => {
    const supabase = await import("@/lib/supabase/client").then(m => m.createClient());
    const { data } = await supabase.from("alumni_database").select("branch, cabang, Cabang, group, camp, angkatan, city, agama, parish");
    if (data) {
      setBranchOptions(Array.from(new Set(data.map(d => d.branch || d.cabang || d.Cabang || "Bandung").filter(Boolean))).sort());
      setGroupOptions(Array.from(new Set(data.map(d => d.group).filter(Boolean))).sort());
      setCampOptions(Array.from(new Set(data.map(d => d.camp).filter(Boolean))).sort());
      setAngkatanOptions(Array.from(new Set(data.map(d => String(d.angkatan)).filter(Boolean))).sort((a, b) => Number(a) - Number(b)));
      setKotaOptions(Array.from(new Set(data.map(d => d.city).filter(Boolean))).sort());
      setAgamaOptions(Array.from(new Set(data.map(d => d.agama).filter(Boolean))).sort());
      setParokiOptions(Array.from(new Set(data.map(d => d.parish).filter(Boolean))).sort());
    }
  };

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchAlumni = async () => {
    setIsLoading(true);
    const supabase = createClient();
    let query = supabase.from("alumni_database").select("*");

    if (filterBranch) {
      if (filterBranch === "Bandung") {
        query = query.or(`branch.ilike.%${filterBranch}%,cabang.ilike.%${filterBranch}%,Cabang.ilike.%${filterBranch}%,branch.is.null,cabang.is.null`);
      } else {
        query = query.or(`branch.ilike.%${filterBranch}%,cabang.ilike.%${filterBranch}%,Cabang.ilike.%${filterBranch}%`);
      }
    }
    if (filterGroup) query = query.ilike("group", `%${filterGroup}%`);
    if (filterCamp) query = query.ilike("camp", `%${filterCamp}%`);
    if (filterAngkatan) query = query.eq("angkatan", filterAngkatan);
    if (filterKota) query = query.ilike("city", `%${filterKota}%`);
    if (filterAgama) query = query.ilike("agama", `%${filterAgama}%`);
    if (filterParoki) query = query.ilike("parish", `%${filterParoki}%`);

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
  }, [filterBranch, filterGroup, filterCamp, filterAngkatan, filterKota, filterAgama, filterParoki]);

  
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

  const getSortedData = () => {
    let sortableData = [...data];
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        
        // Special case for branch fallback
        if (sortConfig.key === 'branch') {
           valA = a.branch || a.cabang || a.Cabang || "Bandung";
           valB = b.branch || b.cabang || b.Cabang || "Bandung";
        }

        if (valA === null || valA === undefined) valA = '';
        if (valB === null || valB === undefined) valB = '';
        
        // Number comparison for angkatan if possible
        if (sortConfig.key === 'angkatan') {
           const numA = Number(valA);
           const numB = Number(valB);
           if (!isNaN(numA) && !isNaN(numB)) {
              return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
           }
        }
        
        if (valA < valB) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  };

  const sortedData = getSortedData();

  const handleExportCSV = () => {
    if (sortedData.length === 0) return;
    
    const headers = ["Branch", "Group", "Camp", "Angkatan", "Nama", "Nama Panggilan", "City / Kota", "No Handphone", "Paroki", "Agama"];
    const csvRows = [headers.join(",")];
    
    for (const row of sortedData) {
      const branch = row.branch || row.cabang || row.Cabang || "Bandung";
      const values = [
        `"${branch}"`,
        `"${row.group || ''}"`,
        `"${row.camp || ''}"`,
        `"${row.angkatan || ''}"`,
        `"${row.name || ''}"`,
        `"${row.nickname || ''}"`,
        `"${row.city || ''}"`,
        `"${row.mobile || row.phone || ''}"`,
        `"${row.parish_grouping || row.parish_Cabang || row.parish || ''}"`,
        `"${row.agama || ''}"`
      ];
      csvRows.push(values.join(","));
    }
    
    const csvData = new Blob([csvRows.join("\n")], { type: 'text/csv' });
    const csvUrl = URL.createObjectURL(csvData);
    const link = document.createElement('a');
    link.href = csvUrl;
    link.download = `alumni_data_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">Alumni Directory</h2>
          
        </div>
        
      </div>

        <div className="bg-[#1a1d24] border border-[#333] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="h-4 w-4 text-brand-gold" />
            <h2 className="text-sm font-bold text-white">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Branch</label>
              <select 
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
                className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold"
              >
                <option value="">All Branches</option>
                {branchOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Group</label>
              <select 
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
                className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold"
              >
                <option value="">All Groups</option>
                {groupOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
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
                {campOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
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
                {angkatanOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
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
                {kotaOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Agama</label>
              <select 
                value={filterAgama}
                onChange={(e) => setFilterAgama(e.target.value)}
                className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold"
              >
                <option value="">All Agama</option>
                {agamaOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Paroki</label>
              <select 
                value={filterParoki}
                onChange={(e) => setFilterParoki(e.target.value)}
                className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold"
              >
                <option value="">All Paroki</option>
                {parokiOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
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
                <th 
                  className="px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-[#222] transition-colors"
                  onClick={() => handleSort('branch')}
                >
                  <div className="flex items-center gap-1">
                    Branch
                    {sortConfig?.key === 'branch' ? (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-brand-gold" /> : <ChevronDown className="w-3 h-3 text-brand-gold" />
                    ) : (
                      <ChevronsUpDown className="w-3 h-3 text-gray-600" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-[#222] transition-colors"
                  onClick={() => handleSort('group')}
                >
                  <div className="flex items-center gap-1">
                    Group
                    {sortConfig?.key === 'group' ? (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-brand-gold" /> : <ChevronDown className="w-3 h-3 text-brand-gold" />
                    ) : (
                      <ChevronsUpDown className="w-3 h-3 text-gray-600" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-[#222] transition-colors"
                  onClick={() => handleSort('camp')}
                >
                  <div className="flex items-center gap-1">
                    Camp
                    {sortConfig?.key === 'camp' ? (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-brand-gold" /> : <ChevronDown className="w-3 h-3 text-brand-gold" />
                    ) : (
                      <ChevronsUpDown className="w-3 h-3 text-gray-600" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-[#222] transition-colors"
                  onClick={() => handleSort('angkatan')}
                >
                  <div className="flex items-center gap-1">
                    Angkatan
                    {sortConfig?.key === 'angkatan' ? (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-brand-gold" /> : <ChevronDown className="w-3 h-3 text-brand-gold" />
                    ) : (
                      <ChevronsUpDown className="w-3 h-3 text-gray-600" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-[#222] transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Nama
                    {sortConfig?.key === 'name' ? (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-brand-gold" /> : <ChevronDown className="w-3 h-3 text-brand-gold" />
                    ) : (
                      <ChevronsUpDown className="w-3 h-3 text-gray-600" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-[#222] transition-colors"
                  onClick={() => handleSort('nickname')}
                >
                  <div className="flex items-center gap-1">
                    Nama Panggilan
                    {sortConfig?.key === 'nickname' ? (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-brand-gold" /> : <ChevronDown className="w-3 h-3 text-brand-gold" />
                    ) : (
                      <ChevronsUpDown className="w-3 h-3 text-gray-600" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-[#222] transition-colors"
                  onClick={() => handleSort('city')}
                >
                  <div className="flex items-center gap-1">
                    City / Kota
                    {sortConfig?.key === 'city' ? (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-brand-gold" /> : <ChevronDown className="w-3 h-3 text-brand-gold" />
                    ) : (
                      <ChevronsUpDown className="w-3 h-3 text-gray-600" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-[#222] transition-colors"
                  onClick={() => handleSort('mobile')}
                >
                  <div className="flex items-center gap-1">
                    No Handphone
                    {sortConfig?.key === 'mobile' ? (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-brand-gold" /> : <ChevronDown className="w-3 h-3 text-brand-gold" />
                    ) : (
                      <ChevronsUpDown className="w-3 h-3 text-gray-600" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-[#222] transition-colors"
                  onClick={() => handleSort('parish')}
                >
                  <div className="flex items-center gap-1">
                    Paroki
                    {sortConfig?.key === 'parish' ? (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-brand-gold" /> : <ChevronDown className="w-3 h-3 text-brand-gold" />
                    ) : (
                      <ChevronsUpDown className="w-3 h-3 text-gray-600" />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333]">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-gray-500">Loading records...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-gray-500">No records found.</td>
                </tr>
              ) : (
                sortedData.map((row) => (
                  <tr key={row.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-2.5 whitespace-nowrap font-bold text-brand-gold">{row.branch || row.cabang || row.Cabang || "Bandung"}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">{row.group}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">{row.camp}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">{row.angkatan}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap font-semibold text-white">{row.name}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">{row.nickname}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">{row.city}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">{row.mobile || row.phone}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">{row.parish_grouping || row.parish_Cabang || row.parish}</td>
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





