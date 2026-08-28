"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { ComposableMap, Geographies, Geography, Marker, Line, ZoomableGroup } from "react-simple-maps";
import { Shield, Star, Zap, Heart, Users, Activity } from "lucide-react";

// TopoJSON for Indonesia
const geoUrl = "/indonesia.json";

const BRANCHES = [
  { id: 'jabodetabek', name: 'Jabodetabek', region: 'Jawa Barat', coordinates: [106.8229, -6.1944], p_sejati: 120, patriot: 45, ym: 80, waberkat: 95, yw: 60, bapa: 20 },
  { id: 'bandung', name: 'Bandung', region: 'Jawa Barat', coordinates: [107.6191, -6.9175], p_sejati: 85, patriot: 30, ym: 55, waberkat: 70, yw: 40, bapa: 15 },
  { id: 'semarang', name: 'Semarang', region: 'Jawa Tengah', coordinates: [110.4225, -6.9697], p_sejati: 40, patriot: 15, ym: 30, waberkat: 35, yw: 20, bapa: 5 },
  { id: 'jogja', name: 'Jogja', region: 'Jawa Tengah', coordinates: [110.3695, -7.7956], p_sejati: 50, patriot: 20, ym: 45, waberkat: 40, yw: 30, bapa: 8 },
  { id: 'solo', name: 'Solo', region: 'Jawa Tengah', coordinates: [110.8243, -7.5666], p_sejati: 30, patriot: 10, ym: 25, waberkat: 25, yw: 15, bapa: 4 },
  { id: 'surabaya', name: 'Surabaya', region: 'Jawa Timur', coordinates: [112.7521, -7.2504], p_sejati: 90, patriot: 35, ym: 60, waberkat: 80, yw: 50, bapa: 25 },
  { id: 'kediri', name: 'Kediri', region: 'Jawa Timur', coordinates: [112.0118, -7.8166], p_sejati: 25, patriot: 5, ym: 15, waberkat: 20, yw: 10, bapa: 2 },
  { id: 'malang', name: 'Malang', region: 'Jawa Timur', coordinates: [112.6326, -7.9797], p_sejati: 40, patriot: 12, ym: 25, waberkat: 30, yw: 15, bapa: 6 },
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

// Replaced neon cyan with our brand gold palette
const COLORS = ['#8b6b22', '#c9a96e', '#e8decd', '#614915', '#a3843e', '#d4be94'];

export default function SciFiMap() {
  const [selectedBranch, setSelectedBranch] = useState<typeof BRANCHES[0] | null>(null);
  const [hoveredBranch, setHoveredBranch] = useState<typeof BRANCHES[0] | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const chartData = selectedBranch ? [
    { name: 'Pria Sejati', value: selectedBranch.p_sejati, icon: Shield },
    { name: 'Patriot', value: selectedBranch.patriot, icon: Star },
    { name: 'Waberkat', value: selectedBranch.waberkat, icon: Heart },
    { name: 'Young Man', value: selectedBranch.ym, icon: Zap },
    { name: 'Young Woman', value: selectedBranch.yw, icon: Users },
    { name: 'Bapa Sejati', value: selectedBranch.bapa, icon: Activity },
  ] : [];

  const totalAlumni = selectedBranch 
    ? selectedBranch.p_sejati + selectedBranch.patriot + selectedBranch.waberkat + selectedBranch.ym + selectedBranch.yw + selectedBranch.bapa 
    : 0;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 w-full max-w-7xl mx-auto">
      
      {/* Map Container */}
      <div className="relative w-full h-[400px] md:h-[600px] bg-[#1a1d24] rounded-2xl border border-[#333] shadow-inner-dark overflow-hidden flex items-center justify-center group">
        
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
          {/* 
            On Mobile: Flat top-down map inside ZoomableGroup for pinch-to-zoom and panning.
            On Desktop: Tilted 3D view, still zoomable/pannable.
          */}
          <div className="w-full h-full transform-style-3d md:rotate-x-[45deg] md:rotate-z-[-5deg] md:scale-125 origin-center transition-transform duration-1000 ease-out md:mt-12">
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                scale: 1300, // Reduced from 1600 to prevent bottom clipping
                center: [116, -2] // Focus tightly on Indonesia
              }}
              style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
            >
              <ZoomableGroup 
                zoom={1} 
                minZoom={1} 
                maxZoom={6}
                center={[116, -2]}
                filterZoomEvent={(evt: any) => {
                  // Only allow zooming with scroll/pinch, avoid double-click zoom if desired
                  if (evt.type === 'wheel') return true;
                  return true;
                }}
              >
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill="rgba(42, 45, 54, 1)" // Solid dark gray for islands
                        stroke="rgba(139, 107, 34, 0.4)" // Brand gold stroke
                        strokeWidth={0.5}
                        style={{
                          default: { outline: "none" },
                          hover: { fill: "rgba(139, 107, 34, 0.4)", outline: "none", stroke: "rgba(139, 107, 34, 0.8)", strokeWidth: 1 },
                          pressed: { outline: "none" },
                        }}
                      />
                    ))
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
                      stroke="rgba(139, 107, 34, 0.3)"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      className="animate-[pulse_2s_ease-in-out_infinite]"
                    />
                  );
                })}

                {/* Branch Markers */}
                {BRANCHES.map((branch) => {
                  const isSelected = selectedBranch?.id === branch.id;
                  return (
                    <Marker 
                      key={branch.id} 
                      coordinates={branch.coordinates as [number, number]}
                      onMouseEnter={() => setHoveredBranch(branch)}
                      onMouseLeave={() => setHoveredBranch(null)}
                      onClick={() => setSelectedBranch(branch)}
                    >
                      <g className="cursor-pointer">
                        <circle 
                          r={isSelected ? 6 : 4} 
                          fill={isSelected ? "#e8decd" : "#8b6b22"} 
                          stroke="#1a1d24" 
                          strokeWidth={2}
                          className="transition-colors hover:fill-[#e8decd]"
                        />
                        {isSelected && (
                          <circle r={12} fill="none" stroke="#8b6b22" strokeWidth={1} className="animate-ping" />
                        )}
                        
                        {/* Name Label */}
                        <text
                          textAnchor="middle"
                          y={15}
                          style={{
                            fontFamily: "serif",
                            fontSize: "6px",
                            fontWeight: "bold",
                            fill: isSelected ? "#e8decd" : "rgba(232, 222, 205, 0.7)",
                            textShadow: "0px 0px 4px rgba(0,0,0,1)",
                            pointerEvents: "none"
                          }}
                        >
                          {branch.name}
                        </text>
                      </g>
                    </Marker>
                  )
                })}
              </ZoomableGroup>
            </ComposableMap>
          </div>
        </div>

        {/* Floating Tooltip outside 3D space to prevent distortion */}
        {hoveredBranch && (
          <div 
            className="fixed w-48 bg-[#1a1d24]/95 backdrop-blur-md border border-brand-gold/30 rounded-lg p-3 shadow-[0_0_20px_rgba(139,107,34,0.15)] pointer-events-none z-[100]"
            style={{ left: tooltipPos.x + 15, top: tooltipPos.y + 15 }}
          >
            <h4 className="text-brand-gold font-bold mb-2 border-b border-[#333] pb-1">{hoveredBranch.name}</h4>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
              <div className="text-gray-400">Pria Sejati:</div><div className="text-right text-white font-mono">{hoveredBranch.p_sejati}</div>
              <div className="text-gray-400">Patriot:</div><div className="text-right text-white font-mono">{hoveredBranch.patriot}</div>
              <div className="text-gray-400">Waberkat:</div><div className="text-right text-white font-mono">{hoveredBranch.waberkat}</div>
              <div className="text-gray-400">YM / YW:</div><div className="text-right text-white font-mono">{hoveredBranch.ym} / {hoveredBranch.yw}</div>
            </div>
          </div>
        )}

        {/* Global Stats Overlay */}
        <div className="absolute top-4 left-4 border border-brand-gold/20 bg-[#22252d]/80 backdrop-blur-md rounded-lg p-3 pointer-events-none z-20">
          <div className="text-[10px] text-brand-gold font-bold uppercase tracking-wider mb-1">Total Branches</div>
          <div className="text-2xl font-mono text-white font-bold">{BRANCHES.length}</div>
        </div>
        
        {/* Mobile Hint Overlay */}
        <div className="absolute bottom-4 right-4 md:hidden text-[9px] text-brand-gold/60 uppercase tracking-widest bg-black/40 px-2 py-1 rounded-sm pointer-events-none">
          Pinch to zoom / Pan
        </div>
      </div>

      {/* Dashboard Metrics for Selected Branch */}
      {selectedBranch && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Key Metrics */}
          <div className="md:col-span-1 flex flex-col gap-4">
            <div className="bg-[#1a1d24] border border-[#333] rounded-2xl p-5 shadow-inner-dark relative overflow-hidden h-full flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full blur-2xl"></div>
              <h3 className="text-brand-gold text-sm font-bold uppercase tracking-widest mb-1">Branch Overview</h3>
              <h2 className="text-2xl font-serif font-bold text-white mb-6">{selectedBranch.name}</h2>
              
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
                {selectedBranch.region}
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
