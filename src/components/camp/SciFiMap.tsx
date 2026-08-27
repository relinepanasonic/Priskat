"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { ComposableMap, Geographies, Geography, Marker, Line } from "react-simple-maps";
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
  ['kasri', 'keningau'],
  ['keningau', 'sabah'],
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ec4899'];

export default function SciFiMap() {
  const [hoveredBranch, setHoveredBranch] = useState<any>(null);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const getChartData = (branch: any) => {
    if (!branch) return [];
    return [
      { name: 'Pria Sejati', value: branch.p_sejati, icon: Shield },
      { name: 'Patriot', value: branch.patriot, icon: Star },
      { name: 'Young Man', value: branch.ym, icon: Zap },
      { name: 'Wanita Berhikmat', value: branch.waberkat, icon: Heart },
      { name: 'Young Woman', value: branch.yw, icon: Users },
      { name: 'Bapa Sejati', value: branch.bapa, icon: Activity },
    ];
  };

  const chartData = getChartData(selectedBranch);
  const totalAlumni = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="flex flex-col gap-6">
      
      {/* Sci-Fi Map Section */}
      <div className="relative w-full aspect-[4/3] md:aspect-[2.2/1] bg-[#050810] rounded-2xl border border-blue-900/50 shadow-[0_0_50px_rgba(0,100,255,0.1)] overflow-hidden">
        {/* Abstract Grid Background */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none z-0"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,150,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,150,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none z-0"></div>
        
        {/* Radar Ping Overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-blue-500/10 rounded-full animate-[spin_10s_linear_infinite] pointer-events-none flex items-center justify-center z-0">
          <div className="w-[600px] h-[600px] border border-blue-500/10 rounded-full"></div>
          <div className="w-[400px] h-[400px] border border-blue-500/20 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
          <div className="absolute top-1/2 left-1/2 w-[1px] h-full bg-gradient-to-b from-transparent via-blue-500/30 to-transparent"></div>
        </div>

        {/* 3D Map Container (Helicopter View) */}
        <div 
          className="absolute inset-0 z-10 perspective-[1200px]"
          onMouseMove={(e) => {
            setTooltipPos({ x: e.clientX, y: e.clientY });
          }}
        >
          <div className="w-full h-full transform-style-3d rotate-x-[45deg] rotate-z-[-5deg] scale-125 md:scale-150 origin-center transition-transform duration-1000 ease-out mt-12 md:mt-24">
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                scale: 1600,
                center: [116, -2] // Focus tightly on Indonesia
              }}
              style={{ width: "100%", height: "100%" }}
            >
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="rgba(0, 50, 100, 0.4)"
                      stroke="rgba(0, 150, 255, 0.5)"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { fill: "rgba(0, 100, 200, 0.6)", outline: "none", stroke: "rgba(0, 255, 255, 0.8)" },
                        pressed: { outline: "none" },
                      }}
                    />
                  ))
                }
              </Geographies>

              {/* Connections */}
              {CONNECTIONS.map(([b1, b2], idx) => {
                const n1 = BRANCHES.find(b => b.id === b1);
                const n2 = BRANCHES.find(b => b.id === b2);
                if (!n1 || !n2) return null;
                return (
                  <Line
                    key={idx}
                    from={n1.coordinates as [number, number]}
                    to={n2.coordinates as [number, number]}
                    stroke="rgba(0, 255, 255, 0.4)"
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
                        r={6} 
                        fill={isSelected ? "#22d3ee" : "#3b82f6"} 
                        stroke="#083344" 
                        strokeWidth={2}
                        className="transition-colors hover:fill-cyan-300"
                      />
                      {isSelected && (
                        <circle r={12} fill="none" stroke="#22d3ee" strokeWidth={1} className="animate-ping" />
                      )}
                      
                      {/* Name Label */}
                      <text
                        textAnchor="middle"
                        y={15}
                        style={{
                          fontFamily: "monospace",
                          fontSize: "8px",
                          fontWeight: "bold",
                          fill: isSelected ? "#67e8f9" : "rgba(255,255,255,0.7)",
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
            </ComposableMap>
          </div>
        </div>

        {/* Floating Tooltip outside 3D space to prevent distortion */}
        {hoveredBranch && (
          <div 
            className="fixed w-48 bg-[#0a0f18]/90 backdrop-blur-md border border-cyan-500/30 rounded-lg p-3 shadow-[0_0_20px_rgba(0,255,255,0.2)] pointer-events-none z-[100]"
            style={{ left: tooltipPos.x + 15, top: tooltipPos.y + 15 }}
          >
            <h4 className="text-cyan-300 font-bold mb-2 border-b border-cyan-900 pb-1">{hoveredBranch.name}</h4>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
              <div className="text-gray-400">Pria Sejati:</div><div className="text-right text-white font-mono">{hoveredBranch.p_sejati}</div>
              <div className="text-gray-400">Patriot:</div><div className="text-right text-white font-mono">{hoveredBranch.patriot}</div>
              <div className="text-gray-400">Waberkat:</div><div className="text-right text-white font-mono">{hoveredBranch.waberkat}</div>
              <div className="text-gray-400">YM / YW:</div><div className="text-right text-white font-mono">{hoveredBranch.ym} / {hoveredBranch.yw}</div>
            </div>
          </div>
        )}

        {/* Global Stats Overlay */}
        <div className="absolute top-4 left-4 border border-blue-500/20 bg-blue-950/40 backdrop-blur-md rounded-lg p-3 pointer-events-none z-20">
          <div className="text-xs text-blue-300 font-bold uppercase tracking-wider mb-1">Total Branches</div>
          <div className="text-2xl font-mono text-cyan-400 font-bold">{BRANCHES.length}</div>
        </div>
      </div>

      {/* Dashboard Metrics for Selected Branch */}
      {selectedBranch && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Key Metrics */}
          <div className="md:col-span-1 flex flex-col gap-4">
            <div className="bg-[#050810] border border-blue-900/50 rounded-2xl p-5 shadow-[0_0_30px_rgba(0,100,255,0.05)] relative overflow-hidden h-full flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl"></div>
              <h3 className="text-cyan-400 text-sm font-bold uppercase tracking-widest mb-1">Branch Overview</h3>
              <h2 className="text-2xl font-serif font-bold text-white mb-6">{selectedBranch.name}</h2>
              
              <div className="flex items-end gap-3 mb-8">
                <div className="text-5xl font-mono font-bold text-white tracking-tighter">{totalAlumni}</div>
                <div className="text-blue-300 text-sm pb-1">Total Alumni</div>
              </div>

              <div className="space-y-3">
                {chartData.map((d, i) => {
                  const Icon = d.icon;
                  return (
                    <div key={d.name} className="flex items-center justify-between bg-blue-900/20 border border-blue-500/10 rounded-lg p-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-blue-950 flex items-center justify-center border border-blue-800/50" style={{ color: COLORS[i % COLORS.length] }}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-gray-300">{d.name}</span>
                      </div>
                      <span className="text-sm font-mono font-bold text-white">{d.value}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="md:col-span-2 bg-[#050810] border border-blue-900/50 rounded-2xl p-5 shadow-[0_0_30px_rgba(0,100,255,0.05)] flex flex-col relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-cyan-400 text-sm font-bold uppercase tracking-widest">Alumni Distribution</h3>
              <div className="px-3 py-1 bg-blue-900/30 border border-blue-500/30 rounded-full text-xs text-blue-200">
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
                    contentStyle={{ backgroundColor: '#0a0f18', borderColor: '#1e3a8a', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Center Label for Donut Chart */}
              <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <div className="text-3xl font-mono font-bold text-white">{totalAlumni}</div>
                <div className="text-[10px] text-blue-300 uppercase tracking-widest">Alumni</div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
