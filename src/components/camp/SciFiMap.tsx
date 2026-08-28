"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { ComposableMap, Geographies, Geography, Marker, Line, ZoomableGroup } from "react-simple-maps";
import { Shield, Star, Zap, Heart, Users, Activity, Maximize2, X } from "lucide-react";

const geoUrl = "/indonesia-combined.json";

function getIsland(provinceName?: string) {
  if (!provinceName) return 'Other';
  const name = String(provinceName).toLowerCase();
  if (name.includes('jawa') || name.includes('banten') || name.includes('jakarta') || name.includes('yogyakarta')) return 'Java';
  if (name.includes('sumatera') || name.includes('sumatra') || name.includes('aceh') || name.includes('riau') || name.includes('jambi') || name.includes('bengkulu') || name.includes('lampung') || name.includes('bangka')) return 'Sumatra';
  if (name.includes('kalimantan')) return 'Kalimantan';
  if (name.includes('sulawesi') || name.includes('gorontalo')) return 'Sulawesi';
  if (name.includes('bali') || name.includes('nusa')) return 'Bali & Nusa Tenggara';
  if (name.includes('maluku') || name.includes('papua') || name.includes('irian')) return 'Maluku & Papua';
  if (name.includes('sabah') || name.includes('sarawak') || name.includes('malaysia') || name.includes('keningau')) return 'Malaysia';
  if (name.includes('timor') || name.includes('atambua')) return 'Timor Leste';
  return 'Other';
}

const BRANCHES = [
  { id: 'jabodetabek', name: 'Jabodetabek', province: 'Jakarta Raya', coordinates: [106.8229, -6.1944], p_sejati: 120, patriot: 45, ym: 80, waberkat: 95, yw: 60, bapa: 20 },
  { id: 'bandung', name: 'Bandung', province: 'Jawa Barat', coordinates: [107.6191, -6.9175], p_sejati: 85, patriot: 30, ym: 55, waberkat: 70, yw: 40, bapa: 15 },
  { id: 'semarang', name: 'Semarang', province: 'Jawa Tengah', coordinates: [110.4225, -6.9697], p_sejati: 40, patriot: 15, ym: 30, waberkat: 35, yw: 20, bapa: 5 },
  { id: 'jogja', name: 'Jogja', province: 'Yogyakarta', coordinates: [110.3695, -7.7956], p_sejati: 50, patriot: 20, ym: 45, waberkat: 40, yw: 30, bapa: 8 },
  { id: 'solo', name: 'Solo', province: 'Jawa Tengah', coordinates: [110.8243, -7.5666], p_sejati: 30, patriot: 10, ym: 25, waberkat: 25, yw: 15, bapa: 4 },
  { id: 'surabaya', name: 'Surabaya', province: 'Jawa Timur', coordinates: [112.7521, -7.2504], p_sejati: 90, patriot: 35, ym: 60, waberkat: 80, yw: 50, bapa: 25 },
  { id: 'kediri', name: 'Kediri', province: 'Jawa Timur', coordinates: [112.0118, -7.8166], p_sejati: 25, patriot: 5, ym: 15, waberkat: 20, yw: 10, bapa: 2 },
  { id: 'malang', name: 'Malang', province: 'Jawa Timur', coordinates: [112.6326, -7.9797], p_sejati: 40, patriot: 12, ym: 25, waberkat: 30, yw: 15, bapa: 6 },
  { id: 'palembang', name: 'Palembang', province: 'Sumatera Selatan', coordinates: [104.7566, -2.9909], p_sejati: 60, patriot: 20, ym: 40, waberkat: 55, yw: 35, bapa: 10 },
  { id: 'manado', name: 'Manado', province: 'Sulawesi Utara', coordinates: [124.8421, 1.4931], p_sejati: 70, patriot: 25, ym: 45, waberkat: 60, yw: 40, bapa: 12 },
  { id: 'makasar', name: 'Makasar', province: 'Sulawesi Selatan', coordinates: [119.4327, -5.1476], p_sejati: 55, patriot: 15, ym: 35, waberkat: 45, yw: 25, bapa: 8 },
  { id: 'banjarmasin', name: 'Banjarmasin', province: 'Kalimantan Selatan', coordinates: [114.5901, -3.3194], p_sejati: 45, patriot: 15, ym: 30, waberkat: 40, yw: 20, bapa: 5 },
  { id: 'kasri', name: 'Kasri', province: 'Kalimantan Selatan', coordinates: [114.0, -2.0], p_sejati: 20, patriot: 5, ym: 15, waberkat: 15, yw: 10, bapa: 2 },
  { id: 'atambua', name: 'Atambua', province: 'Nusa Tenggara Timur', coordinates: [124.8923, -9.1061], p_sejati: 30, patriot: 10, ym: 20, waberkat: 25, yw: 15, bapa: 3 },
  { id: 'keningau', name: 'Keningau', province: 'Malaysia', coordinates: [116.1601, 5.3377], p_sejati: 25, patriot: 8, ym: 15, waberkat: 20, yw: 10, bapa: 4 },
  { id: 'sabah', name: 'Sabah', province: 'Malaysia', coordinates: [116.0753, 5.9749], p_sejati: 35, patriot: 12, ym: 25, waberkat: 30, yw: 15, bapa: 5 },
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
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<typeof BRANCHES[0] | null>(null);
  
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [hoveredBranch, setHoveredBranch] = useState<typeof BRANCHES[0] | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  let statsTarget = null;
  let statsTitle = "";
  let statsSubtitle = "";

  if (selectedBranch) {
    statsTarget = selectedBranch;
    statsTitle = "Branch Overview";
    statsSubtitle = selectedBranch.name;
  } else if (selectedProvince) {
    const island = getIsland(selectedProvince);
    const regionBranches = BRANCHES.filter(b => getIsland(b.province) === island);
    if (regionBranches.length > 0) {
      statsTarget = regionBranches.reduce((acc, curr) => ({
        p_sejati: acc.p_sejati + curr.p_sejati,
        patriot: acc.patriot + curr.patriot,
        waberkat: acc.waberkat + curr.waberkat,
        ym: acc.ym + curr.ym,
        yw: acc.yw + curr.yw,
        bapa: acc.bapa + curr.bapa,
      }), { p_sejati: 0, patriot: 0, waberkat: 0, ym: 0, yw: 0, bapa: 0 });
      statsTitle = "Region Overview";
      statsSubtitle = island;
    }
  }

  const chartData = statsTarget ? [
    { name: 'Pria Sejati', value: statsTarget.p_sejati, icon: Shield },
    { name: 'Patriot', value: statsTarget.patriot, icon: Star },
    { name: 'Waberkat', value: statsTarget.waberkat, icon: Heart },
    { name: 'Young Man', value: statsTarget.ym, icon: Zap },
    { name: 'Young Woman', value: statsTarget.yw, icon: Users },
    { name: 'Bapa Sejati', value: statsTarget.bapa, icon: Activity },
  ] : [];

  const totalAlumni = statsTarget 
    ? statsTarget.p_sejati + statsTarget.patriot + statsTarget.waberkat + statsTarget.ym + statsTarget.yw + statsTarget.bapa 
    : 0;

  // Clean container styling to blend into layout
  const mapContainerClasses = isFullscreen 
    ? "fixed inset-0 z-50 bg-[#1a1d24] flex flex-col p-4" 
    : "relative w-full h-[400px] md:h-[500px] bg-transparent overflow-hidden flex items-center justify-center group flex-shrink-0";

  return (
    <div className="flex flex-col h-full w-full">
      <div className={mapContainerClasses}>
        <button 
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="absolute top-4 right-4 z-[100] bg-brand-gold/10 hover:bg-brand-gold/20 border border-brand-gold/30 text-brand-gold p-2 rounded-lg transition-all animate-pulse"
        >
          {isFullscreen ? <X className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>

        {/* Decorative Grid Background matching spiritual UI */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M54.627 0l.83.676-5.115 5.115-4.49-4.49L46.68 0h7.947zM42.484 0l4.49 4.49-5.32 5.32-4.49-4.49 5.32-5.32zM33.003 0l4.49 4.49-5.32 5.32-4.49-4.49 5.32-5.32zM23.522 0l4.49 4.49-5.32 5.32-4.49-4.49 5.32-5.32zM14.04 0l4.49 4.49-5.32 5.32-4.49-4.49 5.32-5.32zM4.56 0l4.49 4.49-5.32 5.32-4.49-4.49 5.32-5.32zM0 3.73l.83-.676 5.32 5.32-4.49 4.49L0 7.544V3.73zM0 13.21l4.49-4.49 5.32 5.32-4.49 4.49L0 14.04v-.83zM0 22.693l4.49-4.49 5.32 5.32-4.49 4.49L0 23.522v-.83zM0 32.174l4.49-4.49 5.32 5.32-4.49 4.49L0 33.003v-.83zM0 41.656l4.49-4.49 5.32 5.32-4.49 4.49L0 42.484v-.83zM0 51.137l4.49-4.49 5.32 5.32-4.49 4.49L0 51.966v-.83zM0 59.8l.83.676-5.115 5.115-4.49-4.49L-7.947 59.8H0z\' fill=\'%238b6b22\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }}></div>
        
        {/* Radar lines */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full border border-brand-gold/10 relative">
            <div className="absolute inset-0 rounded-full border border-brand-gold/5 scale-75"></div>
            <div className="absolute inset-0 rounded-full border border-brand-gold/5 scale-50"></div>
            <div className="absolute top-1/2 left-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent to-brand-gold/50 origin-left animate-[spin_6s_linear_infinite]"></div>
          </div>
        </div>

        <div className="w-full h-full relative z-10" onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}>
          <div className={`w-full h-full ${isFullscreen ? 'transform-none' : 'transform-style-3d md:rotate-x-[45deg] md:rotate-z-[-5deg] md:scale-125 origin-center transition-transform duration-1000 ease-out md:mt-12'}`}>
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ scale: 1300, center: [116, -2] }}
              style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
            >
              <ZoomableGroup zoom={1} minZoom={1} maxZoom={6} center={[116, -2]}>
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const provinceName = geo.properties?.name || geo.properties?.NAME;
                      const islandName = getIsland(provinceName);
                      
                      const isActiveBranchProvince = selectedBranch && selectedBranch.province === provinceName;
                      const isClickedProvince = !selectedBranch && selectedProvince === provinceName;
                      
                      const isActiveIsland = selectedBranch 
                        ? getIsland(selectedBranch.province) === islandName
                        : selectedProvince && getIsland(selectedProvince) === islandName;

                      let fillColor = "rgba(30, 30, 30, 1)"; // Grey default
                      let strokeColor = "rgba(139, 107, 34, 0.2)";
                      
                      if (isActiveBranchProvince || isClickedProvince) {
                        // The specific province they clicked (or branch province) is Bright Gold
                        fillColor = "rgba(180, 140, 50, 0.7)"; 
                        strokeColor = "rgba(232, 222, 205, 1)";
                      } else if (isActiveIsland) {
                        // Rest of the island is Darker Gold
                        fillColor = "rgba(139, 107, 34, 0.3)";
                        strokeColor = "rgba(139, 107, 34, 0.6)";
                      } else if (hoveredRegion === islandName) {
                        fillColor = "rgba(139, 107, 34, 0.15)";
                      }

                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onMouseEnter={() => setHoveredRegion(islandName)}
                          onMouseLeave={() => setHoveredRegion(null)}
                          onClick={() => {
                            setSelectedProvince(provinceName);
                            setSelectedBranch(null);
                          }}
                          className="cursor-pointer transition-colors duration-300"
                          style={{
                            default: { fill: fillColor, outline: "none", stroke: strokeColor, strokeWidth: 0.5 },
                            hover: { fill: "rgba(180, 140, 50, 0.5)", outline: "none", stroke: "rgba(232, 222, 205, 1)", strokeWidth: 1 },
                            pressed: { outline: "none" },
                          }}
                        />
                      );
                    })
                  }
                </Geographies>

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
                      className="pointer-events-none"
                    />
                  );
                })}

                {BRANCHES.map((branch) => {
                  const isBranchSelected = selectedBranch?.id === branch.id;
                  const isRegionSelected = !selectedBranch && selectedProvince && getIsland(selectedProvince) === getIsland(branch.province);
                  
                  let markerFill = isBranchSelected ? "#e8decd" : isRegionSelected ? "#c9a96e" : "#8b6b22";

                  return (
                    <Marker 
                      key={branch.id} 
                      coordinates={branch.coordinates as [number, number]}
                      onMouseEnter={() => setHoveredBranch(branch)}
                      onMouseLeave={() => setHoveredBranch(null)}
                      onClick={() => {
                        setSelectedBranch(branch);
                        setSelectedProvince(branch.province);
                      }}
                    >
                      <g className="cursor-pointer" transform="translate(-12, -12)">
                        {/* Custom SVG Icon based on Pic 2 (Spiritual Cross/Person design) */}
                        <circle cx="12" cy="12" r="10" stroke={markerFill} strokeWidth="1" strokeDasharray="2 2" opacity={isBranchSelected ? 1 : 0.5} className="transition-all duration-300" />
                        <circle cx="12" cy="8" r="2.5" stroke={markerFill} strokeWidth="1" fill={isBranchSelected ? markerFill : "none"} className="transition-all" />
                        {/* Abstract cross/person arms */}
                        <path d="M12 11V20 M7 11C7 11 10 11 12 11C14 11 17 11 17 11 M9 14.5L12 11L15 14.5" stroke={markerFill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-all" />
                        
                        {isBranchSelected && (
                          <circle cx="12" cy="12" r="14" fill="none" stroke="#e8decd" strokeWidth={1} className="animate-ping" />
                        )}
                      </g>
                      
                      <text
                        textAnchor="middle"
                        y={15}
                        style={{
                          fontFamily: "serif",
                          fontSize: "6px",
                          fontWeight: "bold",
                          fill: isBranchSelected ? "#ffffff" : isRegionSelected ? "#e8decd" : "rgba(232, 222, 205, 0.7)",
                          textShadow: "0px 0px 4px rgba(0,0,0,1)",
                          pointerEvents: "none",
                          transition: "all 0.3s ease"
                        }}
                      >
                        {branch.name}
                      </text>
                    </Marker>
                  )
                })}
              </ZoomableGroup>
            </ComposableMap>
          </div>
        </div>

        {!isFullscreen && hoveredBranch ? (
          <div 
            className="fixed w-48 bg-[#1a1d24]/95 backdrop-blur-md border border-brand-gold/30 rounded-lg p-3 shadow-[0_0_20px_rgba(139,107,34,0.15)] pointer-events-none z-[100]"
            style={{ left: tooltipPos.x + 15, top: tooltipPos.y + 15 }}
          >
            <h4 className="text-brand-gold font-bold mb-2 border-b border-[#333] pb-1">{hoveredBranch.name}</h4>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
              <div className="text-gray-400">Total:</div>
              <div className="text-right text-white font-mono">
                {hoveredBranch.p_sejati + hoveredBranch.patriot + hoveredBranch.waberkat + hoveredBranch.ym + hoveredBranch.yw + hoveredBranch.bapa}
              </div>
            </div>
          </div>
        ) : !isFullscreen && hoveredRegion && hoveredRegion !== 'Other' ? (
          <div 
            className="fixed bg-[#1a1d24]/95 backdrop-blur-md border border-brand-gold/30 rounded px-3 py-1.5 shadow-[0_0_20px_rgba(139,107,34,0.15)] pointer-events-none z-[100]"
            style={{ left: tooltipPos.x + 15, top: tooltipPos.y + 15 }}
          >
            <h4 className="text-brand-gold font-bold font-serif text-sm">{hoveredRegion}</h4>
          </div>
        ) : null}

        <div className="absolute bottom-4 left-4 md:hidden text-[9px] text-brand-gold/60 uppercase tracking-widest bg-black/60 px-2 py-1 rounded border border-brand-gold/20 pointer-events-none z-50">
          Pinch to zoom
        </div>
      </div>

      {statsTarget && (
        <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-[#15181e] border-t border-[#333]">
          
          <div className="md:col-span-1 flex flex-col gap-4">
            <div className="bg-[#1a1d24] border border-[#333] rounded-2xl p-5 shadow-inner-dark relative overflow-hidden h-full flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full blur-2xl"></div>
              <h3 className="text-brand-gold text-sm font-bold uppercase tracking-widest mb-1">{statsTitle}</h3>
              <h2 className="text-2xl font-serif font-bold text-white mb-6">{statsSubtitle}</h2>
              
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

          <div className="md:col-span-2 bg-[#1a1d24] border border-[#333] rounded-2xl p-5 shadow-inner-dark flex flex-col relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl"></div>
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-brand-gold text-sm font-bold uppercase tracking-widest">Alumni Distribution</h3>
              <div className="px-3 py-1 bg-[#22252d] border border-[#333] rounded-full text-xs text-brand-light font-serif">
                {statsSubtitle}
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
