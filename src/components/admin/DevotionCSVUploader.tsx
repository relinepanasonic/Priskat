"use client";

import { useState } from "react";
import Papa from "papaparse";
import { importDevotionCSV } from "@/app/actions/devotion_plans";

export default function DevotionCSVUploader() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const res = await importDevotionCSV(results.data);
          if (res?.error) {
            setError(res.error);
          } else {
            alert("Devotion Plan successfully imported!");
            window.location.reload(); // Refresh to show new plan
          }
        } catch (err: any) {
          setError(err.message || "Something went wrong during import.");
        } finally {
          setIsUploading(false);
        }
      },
      error: (err) => {
        setError("Failed to parse CSV: " + err.message);
        setIsUploading(false);
      }
    });
  };

  return (
    <div className="relative overflow-hidden">
      <input 
        type="file" 
        accept=".csv" 
        onChange={handleFileUpload} 
        disabled={isUploading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <button 
        disabled={isUploading}
        className="bg-brand-gold text-brand-dark px-4 py-2 rounded-lg font-bold shadow-md hover:bg-brand-gold/80 transition-colors pointer-events-none relative z-0"
      >
        {isUploading ? "Importing..." : "Import CSV"}
      </button>
      {error && <div className="text-red-500 text-xs mt-2 absolute whitespace-nowrap">{error}</div>}
    </div>
  );
}
