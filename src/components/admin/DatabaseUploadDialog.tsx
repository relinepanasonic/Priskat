"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import { UploadCloud, AlertCircle, X } from "lucide-react";

const GROUP_OPTIONS = ["Jabodetabek", "Bandung"];
const CAMP_OPTIONS = [
  "Pria Sejati",
  "Youngman",
  "Bapa Sejati",
  "Patriot",
  "Wanita Berhikmat",
  "Young Woman"
];

export default function DatabaseUploadDialog({
  isOpen,
  onClose,
  onSuccess
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selectedGroup, setSelectedGroup] = useState(GROUP_OPTIONS[0]);
  const [selectedCamp, setSelectedCamp] = useState(CAMP_OPTIONS[0]);
  
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<any[][]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveToDatabase = async () => {
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    
    try {
       const { createClient } = await import("@/lib/supabase/client");
       const supabase = createClient();
       
       const payload = rows.map(row => {
          const obj: any = {};
          headers.forEach((h, i) => {
             obj[h] = row[i];
          });
          return {
             group: obj["Group"],
             camp: obj["Camp"],
             registration_no: obj["No Registrasi"],
             angkatan: obj["Angkatan Camp"],
             alumni: obj["Alumni Camp"],
             name: obj["Nama"],
             nickname: obj["Panggilan"],
             city: obj["Kota"],
             province: obj["Provinsi"],
             phone: obj["No Telephone"],
             mobile: obj["No Handphone 1"],
             religion: obj["Agama"],
             parish_group: obj["Paroki (grouping)"],
             parish: obj["Paroki"]
          };
       });
       
       const { error } = await supabase.from("alumni_database").insert(payload);
       if (error) throw error;
       
       setSuccessMsg(`Successfully saved ${payload.length} records to the database!`);
       setRows([]);
       setHeaders([]);
       onSuccess();
    } catch (err: any) {
       console.error("Save error:", err);
       setErrorMsg("Failed to save to database: " + err.message);
    } finally {
       setIsSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }

          if (results.errors.length > 0 && results.errors[0].code !== "UndetectableDelimiter") {
            console.warn("PapaParse errors:", results.errors);
            setErrorMsg("Warning: " + results.errors[0].message);
          }

          if (!results.data || results.data.length === 0) {
            setErrorMsg("File is empty or could not be parsed.");
            return;
          }
          
          const originalHeaders = (results.meta.fields || []).filter((h: string) => h.trim().toUpperCase() !== "NO");
          const newHeaders = ["Group", "Camp", ...originalHeaders];
          
          const newRows = results.data.map((row: any) => {
            const newRow = [selectedGroup, selectedCamp];
            originalHeaders.forEach((col: string) => {
              newRow.push(row[col]);
            });
            return newRow;
          });

          setHeaders(newHeaders);
          setRows(newRows);
        },
        error: (error) => {
          console.error("PapaParse error:", error);
          setErrorMsg("Failed to read the file: " + error.message);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      });
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMsg("An unexpected error occurred: " + err.message);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1e2128] border border-[#333] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white bg-[#111] hover:bg-[#333] rounded-full p-1.5 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-6">Upload Database</h2>
          
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

            <div className="pt-2 relative">
              <input 
                type="file" 
                id="csv-upload-dialog"
                ref={fileInputRef}
                className="sr-only" 
                accept=".csv" 
                onChange={handleFileUpload} 
              />
              <label 
                htmlFor="csv-upload-dialog"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#333] border-dashed rounded-xl cursor-pointer bg-[#111] hover:bg-[#1a1d24] hover:border-brand-gold transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 mb-2 text-brand-gold" />
                  <p className="text-sm text-gray-400 font-semibold">Click to upload CSV</p>
                </div>
              </label>
            </div>

            {successMsg && (
              <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl mt-4">
                <AlertCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                <p className="text-xs text-green-400">{successMsg}</p>
              </div>
            )}
            {errorMsg && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl mt-4">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-400">{errorMsg}</p>
              </div>
            )}
          </div>

          {headers.length > 0 && (
            <div className="bg-[#1a1d24] border border-[#333] rounded-xl overflow-hidden mt-6">
              <div className="px-5 py-4 border-b border-[#333] bg-[#111] flex justify-between items-center">
                <h2 className="text-sm font-bold text-white">Preview Data ({rows.length} rows)</h2>
                <button 
                    className="bg-brand-gold text-brand-dark px-4 py-2 rounded-lg font-bold text-xs hover:opacity-90 transition-opacity flex items-center gap-2"
                    onClick={handleSaveToDatabase}
                    disabled={isSaving}
                 >
                    {isSaving ? "Saving..." : "Save to Database"}
                 </button>
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
                    {rows.slice(0, 10).map((row, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        {row.map((cell, j) => (
                          <td key={j} className="px-4 py-2.5 whitespace-nowrap">
                            {String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.length > 10 && (
                  <div className="p-3 text-center text-xs text-gray-500 bg-[#111]">
                    Showing first 10 rows only (out of {rows.length} total rows)
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
