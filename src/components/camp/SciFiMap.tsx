"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { ComposableMap, Geographies, Geography, Marker, Line, ZoomableGroup } from "react-simple-maps";
import { Shield, Star, Zap, Heart, Users, Activity, Maximize2, X } from "lucide-react";

// TopoJSON for Indonesia
const geoUrl = "/indonesia.json";

function getIsland(provinceName: string | undefined) {
  if (!provinceName) return 'Other';
  const name = provinceName.toLowerCase();
  if (name.includes('jawa') || name.includes('banten') || name.includes('jakarta') || name.includes('yogyakarta')) return 'Java';
  if (name.includes('sumatera') || name.includes('sumatra') || name.includes('aceh') || name.includes('riau') || name.includes('jambi') || name.includes('bengkulu') || name.includes('lampung') || name.includes('bangka')) return 'Sumatra';
  if (name.includes('kalimantan')) return 'Kalimantan';
  if (name.includes('sulawesi') || name.includes('gorontalo')) return 'Sulawesi';
  if (name.includes('bali') || name.includes('nusa')) return 'Bali & Nusa Tenggara';
  if (name.includes('maluku') || name.includes('papua')) return 'Maluku & Papua';
  if (name.includes('sabah') || name.includes('sarawak') || name.includes('malaysia') || name.includes('keningau')) return 'Malaysia';
  if (name.includes('timor') || name.includes('atambua')) return 'Timor Leste';
  return 'Other';
}

const BRANCHES = [
  { id: 'jabodetabek', name: 'Jabodetabek', region: 'Java', coordinates: [106.8229, -6.1944], p_sejati: 120, patriot: 45, ym: 80, waberkat: 95, yw: 60, bapa: 20 },
  { id: 'bandung', name: 'Bandung', region: 'Java', coordinates: [107.6191, -6.9175], p_sejati: 85, patriot: 30, ym: 55, waberkat: 70, yw: 40, bapa: 15 },
  { id: 'semarang', name: 'Semarang', region: 'Java', coordinates: [110.4225, -6.9697], p_sejati: 40, patriot: 15, ym: 30, waberkat: 35, yw: 20, bapa: 5 },
  { id: 'jogja', name: 'Jogja', region: 'Java', coordinates: [110.3695, -7.7956], p_sejati: 50, patriot: 20, ym: 45, waberkat: 40, yw: 30, bapa: 8 },
  { id: 'solo', name: 'Solo', region: 'Java', coordinates: [110.8243, -7.5666], p_sejati: 30, patriot: 10, ym: 25, waberkat: 25, yw: 15, bapa: 4 },
  { id: 'surabaya', name: 'Surabaya', region: 'Java', coordinates: [112.7521, -7.2504], p_sejati: 90, patriot: 35, ym: 60, waberkat: 80, yw: 50, bapa: 25 },
  { id: 'kediri', name: 'Kediri', region: 'Java', coordinates: [112.0118, -7.8166], p_sejati: 25, patriot: 5, ym: 15, waberkat: 20, yw: 10, bapa: 2 },
  { id: 'malang', name: 'Malang', region: 'Java', coordinates: [112.6326, -7.9797], p_sejati: 40, patriot: 12, ym: 25, waberkat: 30, yw: 15, bapa: 6 },
  { id: 'palembang', name: 'Palembang', region: 'Sumatra', coordinates: [104.7566, -2.9909], p_sejati: 60, patriot: 20, ym: 40, waberkat: 55, yw: 35, bapa: 10 },
  { id: 'manado', name: 'Manado', region: 'Sulawesi', coordinates: [124.8421, 1.4931], p_sejati: 70, patriot: 25, ym: 45, waberkat: 60, yw: 40, bapa: 12 },
  { id: 'makasar', name: 'Makasar', region: 'Sulawesi', coordinates: [119.4327, -5.1476], p_sejati: 55, patriot: 15, ym: 35, waberkat: 45, yw: 25, bapa: 8 },
  { id: 'banjarmasin', name: 'Banjarmasin', region: 'Kalimantan', coordinates: [114.5901, -3.3194], p_sejati: 45, patriot: 15, ym: 30, waberkat: 40, yw: 20, bapa: 5 },
  { id: 'kasri', name: 'Kasri', region: 'Kalimantan', coordinates: [114.0, -2.0], p_sejati: 20, patriot: 5, ym: 15, waberkat: 15, yw: 10, bapa: 2 },
  { id: 'atambua', name: 'Atambua', region: 'Timor Leste', coordinates: [124.8923, -9.1061], p_sejati: 30, patriot: 10, ym: 20, waberkat: 25, yw: 15, bapa: 3 },
  { id: 'keningau', name: 'Keningau', region: 'Malaysia', coordinates: [116.1601, 5.3377], p_sejati: 25, patriot: 8, ym: 15, waberkat: 20, yw: 10, bapa: 4 },
  { id: 'sabah', name: 'Sabah', region: 'Malaysia', coordinates: [116.0753, 5.9749], p_sejati: 35, patriot: 12, ym: 25, waberkat: 30, yw: 15, bapa: 5 },
];

const CONNECTIONS = [
  ['jabodetabek', 'bandung'],
  ['bandung', 'semarang'],
  ['semarang', 'jogja'],
  ['jogja', 'solo'],
  ['solo', 'surabaya'],
  ['surabaya', 'malang'],
  ['kediri', 'surabaya'],
  ['jabodetabek', 'palembang'],
  ['surabaya', 'makasar'],
  ['makasar', 'manado'],
  ['surabaya', 'banjarmasin'],
  ['banjarmasin', 'kasri'],
  ['surabaya', 'atambua'],
  ['manado', 'sabah'],
  ['sabah', 'keningau']
];

const COLORS = ['#8b6b22', '#c9a96e', '#e8decd', '#614915', '#a3843e', '#d4be94'];

export default function SciFiMap() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Aggregate stats by region instead of by branch
  let aggregatedStats = null;
  if (selectedRegion) {
    const regionBranches = BRANCHES.filter(b => b.region === selectedRegion);
    if (regionBranches.length > 0) {
      aggregatedStats = regionBranches.reduce((acc, curr) => ({
        p_sejati: acc.p_sejati + curr.p_sejati,
        patriot: acc.patriot + curr.patriot,
        waberkat: acc.waberkat + curr.waberkat,
        ym: acc.ym + curr.ym,
        yw: acc.yw + curr.yw,
        bapa: acc.bapa + curr.bapa,
      }), { p_sejati: 0, patriot: 0, waberkat: 0, ym: 0, yw: 0, bapa: 0 });
    }
  }

  const chartData = aggregatedStats ? [
    { name: 'Pria Sejati', value: aggregatedStats.p_sejati, icon: Shield },
    { name: 'Patriot', value: aggregatedStats.patriot, icon: Star },
    { name: 'Waberkat', value: aggregatedStats.waberkat, icon: Heart },
    { name: 'Young Man', value: aggregatedStats.ym, icon: Zap },
    { name: 'Young Woman', value: aggregatedStats.yw, icon: Users },
    { name: 'Bapa Sejati', value: aggregatedStats.bapa, icon: Activity },
  ] : [];

  const totalAlumni = aggregatedStats 
    ? aggregatedStats.p_sejati + aggregatedStats.patriot + aggregatedStats.waberkat + aggregatedStats.ym + aggregatedStats.yw + aggregatedStats.bapa 
    : 0;

  const mapContainerClasses = isFullscreen 
    ? "fixed inset-0 z-50 bg-[#050505] flex flex-col p-4" 
    : "relative w-full h-[400px] md:h-[600px] bg-[#050505] rounded-2xl border border-[#222] shadow-inner-dark overflow-hidden flex items-center justify-center group";

  return (
    <div className="flex flex-col gap-6 p-0 md:p-2 w-full max-w-7xl mx-auto">
      
      {/* Map Container */}
      <div className={mapContainerClasses}>
        
        {/* Fullscreen Toggle Button */}
        <button 
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="absolute top-4 right-4 z-[100] bg-brand-gold/10 hover:bg-brand-gold/20 border border-brand-gold/30 text-brand-gold p-2 rounded-lg transition-all animate-pulse"
        >
          {isFullscreen ? <X className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>

        {/* Decorative Grid Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M54.627 0l.83.676-5.115 5.115-4.49-4.49L46.68 0h7.947zM42.484 0l4.49 4.49-5.32 5.32-4.49-4.49 5.32-5.32zM33.003 0l4.49 4.49-5.32 5.32-4.49-4.49 5.32-5.32zM23.522 0l4.49 4.49-5.32 5.32-4.49-4.49 5.32-5.32zM14.04 0l4.49 4.49-5.32 5.32-4.49-4.49 5.32-5.32zM4.56 0l4.49 4.49-5.32 5.32-4.49-4.49 5.32-5.32zM0 3.73l.83-.676 5.32 5.32-4.49 4.49L0 7.544V3.73zM0 13.21l4.49-4.49 5.32 5.32-4.49 4.49L0 14.04v-.83zM0 22.693l4.49-4.49 5.32 5.32-4.49 4.49L0 23.522v-.83zM0 32.174l4.49-4.49 5.32 5.32-4.49 4.49L0 33.003v-.83zM0 41.656l4.49-4.49 5.32 5.32-4.49 4.49L0 42.484v-.83zM0 51.137l4.49-4.49 5.32 5.32-4.49 4.49L0 51.966v-.83zM0 59.8l.83.676-5.115 5.115-4.49-4.49L-7.947 59.8H0z\' fill=\'%238b6b22\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }}></div>
        
        {/* Circular Radar Sweep */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 md:opacity-30">
          <div className="w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full border border-brand-gold/10 relative">
            <div className="absolute inset-0 rounded-full border border-brand-gold/5 scale-75"></div>
            <div className="absolute inset-0 rounded-full border border-brand-gold/5 scale-50"></div>
            <div className="absolute top-1/2 left-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent to-brand-gold/50 origin-left animate-[spin_4s_linear_infinite]"></div>
          </div>
        </div>

        <div className="w-full h-full relative" 
          onMouseMove={(e) => {
            setTooltipPos({ x: e.clientX, y: e.clientY });
          }}
        >
          <div className={`w-full h-full ${isFullscreen ? 'transform-none' : 'transform-style-3d md:rotate-x-[45deg] md:rotate-z-[-5deg] md:scale-125 origin-center transition-transform duration-1000 ease-out md:mt-12'}`}>
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                scale: 1300,
                center: [116, -2]
              }}
              style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
            >
              <ZoomableGroup 
                zoom={1} 
                minZoom={1} 
                maxZoom={6}
                center={[116, -2]}
                filterZoomEvent={(evt: any) => {
                  if (evt.type === 'wheel') return true;
                  return true;
                }}
              >
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const islandName = getIsland(geo.properties?.name || geo.properties?.NAME);
                      const isHovered = hoveredRegion === islandName;
                      const isSelected = selectedRegion === islandName;

                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onMouseEnter={() => setHoveredRegion(islandName)}
                          onMouseLeave={() => setHoveredRegion(null)}
                          onClick={() => setSelectedRegion(islandName)}
                          className="cursor-pointer transition-colors duration-300"
                          style={{
                            default: { 
                              fill: isSelected ? "rgba(139, 107, 34, 0.6)" : isHovered ? "rgba(139, 107, 34, 0.3)" : "rgba(30, 30, 30, 1)", 
                              outline: "none",
                              stroke: isSelected ? "rgba(139, 107, 34, 1)" : "rgba(139, 107, 34, 0.4)",
                              strokeWidth: isSelected ? 1 : 0.5
                            },
                            hover: { 
                              fill: "rgba(139, 107, 34, 0.4)", 
                              outline: "none", 
                              stroke: "rgba(139, 107, 34, 0.8)", 
                              strokeWidth: 1 
                            },
                            pressed: { outline: "none" },
                          }}
                        />
                      );
                    })
                  }
                </Geographies>

                {/* Connection Lines */}
                {CONNECTIONS.map(([id1, id2]) => {
                  const b1 = BRANCHES.find(b => b.id === id1);
                  const b2 = BRANCHES.find(b => b.id === id2);
                  if (!b1 || !b2) return null;
                  
                  return (
                    <Line
                      key={`${id1}-${id2}`}
                      from={b1.coordinates as [number, number]}
                      to={b2.coordinates as [number, number]}
                      stroke="rgba(139, 107, 34, 0.2)"
                      strokeWidth={1}
                      strokeDasharray="4 4"
                    />
                  );
                })}

                {/* Branch Markers */}
                {BRANCHES.map((branch) => {
                  const isSelected = selectedRegion === branch.region;
                  return (
                    <Marker 
                      key={branch.id} 
                      coordinates={branch.coordinates as [number, number]}
                      className="pointer-events-none" // Map click handles selection now
                    >
                      <g>
                        <circle 
                          r={isSelected ? 6 : 3} 
                          fill={isSelected ? "#e8decd" : "#8b6b22"} 
                          stroke="#0a0a0a" 
                          strokeWidth={1.5}
                          className="transition-all duration-300"
                        />
                        {isSelected && (
                          <circle r={12} fill="none" stroke="#8b6b22" strokeWidth={1} className="animate-ping" />
                        )}
                      </g>
                    </Marker>
                  )
                })}
              </ZoomableGroup>
            </ComposableMap>
          </div>
        </div>

        {/* Hover Tooltip (Island Level) */}
        {hoveredRegion && hoveredRegion !== 'Other' && !isFullscreen && (
          <div 
            className="fixed bg-[#1a1d24]/95 backdrop-blur-md border border-brand-gold/30 rounded px-3 py-1.5 shadow-[0_0_20px_rgba(139,107,34,0.15)] pointer-events-none z-[100]"
            style={{ left: tooltipPos.x + 15, top: tooltipPos.y + 15 }}
          >
            <h4 className="text-brand-gold font-bold font-serif text-sm">{hoveredRegion}</h4>
            <p className="text-[9px] text-gray-400">Click to view region data</p>
          </div>
        )}

        {/* Mobile Hint Overlay */}
        <div className="absolute bottom-4 left-4 md:hidden text-[9px] text-brand-gold/60 uppercase tracking-widest bg-black/60 px-2 py-1 rounded border border-brand-gold/20 pointer-events-none">
          Pinch to zoom / Tap region
        </div>
      </div>

      {/* Dashboard Metrics for Selected Region (The bottom panels) */}
      {selectedRegion && aggregatedStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Key Metrics */}
          <div className="md:col-span-1 flex flex-col gap-4">
            <div className="bg-[#1a1d24] border border-[#333] rounded-2xl p-5 shadow-inner-dark relative overflow-hidden h-full flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full blur-2xl"></div>
              <h3 className="text-brand-gold text-sm font-bold uppercase tracking-widest mb-1">Region Overview</h3>
              <h2 className="text-2xl font-serif font-bold text-white mb-6">{selectedRegion}</h2>
              
              <div className="flex items-end gap-3 mb-8">
                <div className="text-5xl font-mono font-bold text-white tracking-tighter">{totalAlumni}</div>
                <div className="text-brand-muted text-sm pb-1 font-serif italic">Total Alumni</div>
              </div>

              <div className="space-y-3">
                {chartData.map((d, i) => {
                  const Icon = d.icon;
                  return (
                    <div key={d.name} className="flex items-center justify-between bg-[#22252d] border border-[#333] rounded-lg p-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-[#1a1d24] flex items-center justify-center border border-[#333]" style={{ color: COLORS[i % COLORS.length] }}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-gray-300">{d.name}</span>
                      </div>
                      <span className="text-sm font-mono font-bold text-brand-gold">{d.value}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="md:col-span-2 bg-[#1a1d24] border border-[#333] rounded-2xl p-5 shadow-inner-dark flex flex-col relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl"></div>
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-brand-gold text-sm font-bold uppercase tracking-widest">Alumni Distribution</h3>
              <div className="px-3 py-1 bg-[#22252d] border border-[#333] rounded-full text-xs text-brand-light font-serif">
                {selectedRegion}
              </div>
            </div>
            
            <div className="flex-1 min-h-[300px] relative z-10 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="rgba(0,0,0,0)"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1a1d24', borderColor: '#333', borderRadius: '8px', color: '#e8decd' }}
                    itemStyle={{ color: '#e8decd' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Center Label for Donut Chart */}
              <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <div className="text-3xl font-mono font-bold text-white">{totalAlumni}</div>
                <div className="text-[10px] text-brand-gold uppercase tracking-widest">Alumni</div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}



