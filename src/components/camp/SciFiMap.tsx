"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { ChevronRight, Users, Shield, Zap, Heart, Star, Activity } from "lucide-react";

const BRANCHES = [
  { id: 'jabodetabek', name: 'Jabodetabek', region: 'Jawa Barat', x: 20, y: 65, p_sejati: 120, patriot: 45, ym: 80, waberkat: 95, yw: 60, bapa: 20 },
  { id: 'bandung', name: 'Bandung', region: 'Jawa Barat', x: 23, y: 68, p_sejati: 85, patriot: 30, ym: 55, waberkat: 70, yw: 40, bapa: 15 },
  { id: 'semarang', name: 'Semarang', region: 'Jawa Tengah', x: 30, y: 67, p_sejati: 40, patriot: 15, ym: 30, waberkat: 35, yw: 20, bapa: 5 },
  { id: 'jogja', name: 'Jogja', region: 'Jawa Tengah', x: 31, y: 70, p_sejati: 50, patriot: 20, ym: 45, waberkat: 40, yw: 30, bapa: 8 },
  { id: 'solo', name: 'Solo', region: 'Jawa Tengah', x: 33, y: 69, p_sejati: 30, patriot: 10, ym: 25, waberkat: 25, yw: 15, bapa: 4 },
  { id: 'surabaya', name: 'Surabaya', region: 'Jawa Timur', x: 40, y: 67, p_sejati: 90, patriot: 35, ym: 60, waberkat: 80, yw: 50, bapa: 25 },
  { id: 'kediri', name: 'Kediri', region: 'Jawa Timur', x: 37, y: 69, p_sejati: 25, patriot: 5, ym: 15, waberkat: 20, yw: 10, bapa: 2 },
  { id: 'malang', name: 'Malang', region: 'Jawa Timur', x: 39, y: 71, p_sejati: 40, patriot: 12, ym: 25, waberkat: 30, yw: 15, bapa: 6 },
  { id: 'palembang', name: 'Palembang', region: 'Sumatra', x: 12, y: 45, p_sejati: 60, patriot: 20, ym: 40, waberkat: 55, yw: 35, bapa: 10 },
  { id: 'manado', name: 'Manado', region: 'Sulawesi', x: 75, y: 25, p_sejati: 70, patriot: 25, ym: 45, waberkat: 60, yw: 40, bapa: 12 },
  { id: 'makasar', name: 'Makasar', region: 'Sulawesi', x: 65, y: 60, p_sejati: 55, patriot: 15, ym: 35, waberkat: 45, yw: 25, bapa: 8 },
  { id: 'banjarmasin', name: 'Banjarmasin', region: 'Kalimantan', x: 50, y: 55, p_sejati: 45, patriot: 15, ym: 30, waberkat: 40, yw: 20, bapa: 5 },
  { id: 'kasri', name: 'Kasri', region: 'Kalimantan', x: 55, y: 50, p_sejati: 20, patriot: 5, ym: 15, waberkat: 15, yw: 10, bapa: 2 },
  { id: 'atambua', name: 'Atambua', region: 'Timor Leste', x: 75, y: 80, p_sejati: 30, patriot: 10, ym: 20, waberkat: 25, yw: 15, bapa: 3 },
  { id: 'keningau', name: 'Keningau', region: 'Malaysia', x: 62, y: 15, p_sejati: 25, patriot: 8, ym: 15, waberkat: 20, yw: 10, bapa: 4 },
  { id: 'sabah', name: 'Sabah', region: 'Malaysia', x: 65, y: 12, p_sejati: 35, patriot: 12, ym: 25, waberkat: 30, yw: 15, bapa: 5 },
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
  const [selectedBranch, setSelectedBranch] = useState<any>(BRANCHES[0]);

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
      <div className="relative w-full aspect-[4/3] md:aspect-[2/1] bg-[#050810] rounded-2xl border border-blue-900/50 shadow-[0_0_50px_rgba(0,100,255,0.1)] overflow-hidden p-4">
        {/* Abstract Grid Background */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,150,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,150,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
        
        {/* Radar Ping Overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-blue-500/10 rounded-full animate-[spin_10s_linear_infinite] pointer-events-none flex items-center justify-center">
          <div className="w-[600px] h-[600px] border border-blue-500/10 rounded-full"></div>
          <div className="w-[400px] h-[400px] border border-blue-500/20 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
          <div className="absolute top-1/2 left-1/2 w-[1px] h-full bg-gradient-to-b from-transparent via-blue-500/30 to-transparent"></div>
        </div>

        {/* The Nodes & Connections */}
        <div className="relative w-full h-full">
          
          {/* Draw Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {CONNECTIONS.map(([b1, b2], i) => {
              const node1 = BRANCHES.find(b => b.id === b1);
              const node2 = BRANCHES.find(b => b.id === b2);
              if (!node1 || !node2) return null;
              return (
                <line 
                  key={i}
                  x1={`${node1.x}%`} 
                  y1={`${node1.y}%`} 
                  x2={`${node2.x}%`} 
                  y2={`${node2.y}%`} 
                  stroke="rgba(0, 150, 255, 0.3)" 
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  className="animate-[pulse_3s_ease-in-out_infinite]"
                />
              );
            })}
          </svg>

          {/* Draw Nodes */}
          {BRANCHES.map(branch => {
            const isSelected = selectedBranch?.id === branch.id;
            return (
              <div 
                key={branch.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group"
                style={{ left: `${branch.x}%`, top: `${branch.y}%` }}
                onMouseEnter={() => setHoveredBranch(branch)}
                onMouseLeave={() => setHoveredBranch(null)}
                onClick={() => setSelectedBranch(branch)}
              >
                {/* Node Ring */}
                <div className={`absolute -inset-3 rounded-full border border-cyan-400/50 animate-ping opacity-20 ${isSelected ? 'block' : 'hidden group-hover:block'}`}></div>
                
                {/* Node Core */}
                <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,255,255,0.8)] transition-all ${isSelected ? 'bg-cyan-300 scale-125' : 'bg-blue-500 group-hover:bg-cyan-400'}`}></div>
                
                {/* City Label */}
                <div className={`absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] md:text-xs font-bold tracking-wider transition-colors ${isSelected ? 'text-cyan-300' : 'text-blue-200/60 group-hover:text-cyan-100'}`}>
                  {branch.name}
                </div>

                {/* Hover Tooltip inside Map */}
                {hoveredBranch?.id === branch.id && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 bg-[#0a0f18]/90 backdrop-blur-md border border-cyan-500/30 rounded-lg p-3 shadow-[0_0_20px_rgba(0,255,255,0.2)] pointer-events-none z-50">
                    <h4 className="text-cyan-300 font-bold mb-2 border-b border-cyan-900 pb-1">{branch.name}</h4>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
                      <div className="text-gray-400">Pria Sejati:</div><div className="text-right text-white font-mono">{branch.p_sejati}</div>
                      <div className="text-gray-400">Patriot:</div><div className="text-right text-white font-mono">{branch.patriot}</div>
                      <div className="text-gray-400">Waberkat:</div><div className="text-right text-white font-mono">{branch.waberkat}</div>
                      <div className="text-gray-400">YM / YW:</div><div className="text-right text-white font-mono">{branch.ym} / {branch.yw}</div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Global Stats Overlay */}
        <div className="absolute top-4 left-4 border border-blue-500/20 bg-blue-950/40 backdrop-blur-md rounded-lg p-3 pointer-events-none">
          <div className="text-xs text-blue-300 font-bold uppercase tracking-wider mb-1">Total Branches</div>
          <div className="text-2xl font-mono text-cyan-400 font-bold">{BRANCHES.length}</div>
        </div>
      </div>

      {/* Dashboard Metrics for Selected Branch */}
      {selectedBranch && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Key Metrics */}
          <div className="md:col-span-1 flex flex-col gap-4">
            <div className="bg-[#050810] border border-blue-900/50 rounded-2xl p-5 shadow-[0_0_30px_rgba(0,100,255,0.05)] relative overflow-hidden">
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
            <div className="flex justify-between items-center mb-6">
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
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mt-[-18px]">
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
