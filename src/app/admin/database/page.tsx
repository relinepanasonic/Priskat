"use client";

import { useState } from "react";
import Papa from "papaparse";
import { UploadCloud, Database } from "lucide-react";

const GROUP_OPTIONS = ["Jabodetabek", "Bandung"];
const CAMP_OPTIONS = [
  "Pria Sejati",
  "Youngman",
  "Bapa Sejati",
  "Patriot",
  "Wanita Berhikmat",
  "Young Woman"
];

export default function DatabasePage() {
  const [selectedGroup, setSelectedGroup] = useState(GROUP_OPTIONS[0]);
  const [selectedCamp, setSelectedCamp] = useState(CAMP_OPTIONS[0]);
  
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<any[][]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) return;
        
        // results.meta.fields contains the original headers
        const originalHeaders = results.meta.fields || [];
        
        // Define new headers: Group, Camp, [original headers]
        const newHeaders = ["Group", "Camp", ...originalHeaders];
        
        // Transform rows
        const newRows = results.data.map((row: any) => {
          const newRow = [selectedGroup, selectedCamp];
          // Add all original column values
          originalHeaders.forEach((col) => {
            newRow.push(row[col]);
          });
          return newRow;
        });

        setHeaders(newHeaders);
        setRows(newRows);
      }
    });
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Database className="h-6 w-6 text-brand-gold" />
          Database Upload
        </h1>
        <p className="mt-1 text-sm text-brand-muted">
          Filter and upload CSV data to the database.
        </p>
      </div>

      <div className="bg-[#1a1d24] border border-[#333] rounded-xl p-5 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Group</label>
            <select 
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold"
            >
              {GROUP_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Camp</label>
            <select 
              value={selectedCamp}
              onChange={(e) => setSelectedCamp(e.target.value)}
              className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold"
            >
              {CAMP_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>

        <div className="pt-2">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#333] border-dashed rounded-xl cursor-pointer bg-[#111] hover:bg-[#1a1d24] hover:border-brand-gold transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-8 h-8 mb-2 text-brand-gold" />
              <p className="text-sm text-gray-400 font-semibold">Click to upload CSV</p>
            </div>
            <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      {headers.length > 0 && (
        <div className="bg-[#1a1d24] border border-[#333] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#333] bg-[#111] flex justify-between items-center">
            <h2 className="text-sm font-bold text-white">Preview Data ({rows.length} rows)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="text-xs uppercase bg-[#111] text-gray-400 border-b border-[#333]">
                <tr>
                  {headers.map((h, i) => (
                    <th key={i} className="px-4 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333]">
                {rows.slice(0, 50).map((row, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    {row.map((cell, j) => (
                      <td key={j} className="px-4 py-2.5 whitespace-nowrap">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 50 && (
              <div className="p-3 text-center text-xs text-gray-500 bg-[#111]">
                Showing first 50 rows only...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
