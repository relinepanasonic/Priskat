"use client";

import { Church, RefreshCw } from "lucide-react";

export default function ChurchSchedulePage() {
  return (
    <div className="flex flex-col h-[700px] bg-[#111]">
      <div className="p-4 border-b border-[#333] flex justify-between items-center bg-[#1a1d24]">
        <div>
          <h2 className="text-lg font-bold text-white">Church Schedule</h2>
          <p className="text-xs text-gray-400">Live data provided by JadwalMisa.id</p>
        </div>
        <button 
          onClick={() => {
            const iframe = document.getElementById('jadwalmisa-iframe') as HTMLIFrameElement;
            if (iframe) iframe.src = iframe.src;
          }}
          className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-brand-dark rounded-lg text-sm font-bold hover:bg-yellow-500 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh / Scrape Latest
        </button>
      </div>
      
      <div className="flex-1 relative bg-white">
        <iframe 
          id="jadwalmisa-iframe"
          src="https://jadwalmisa.id/" 
          className="w-full h-full border-0"
          title="Jadwal Misa"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
}
