"use client";

import { useState, useMemo, useCallback } from "react";
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  Legend, XAxis, YAxis, CartesianGrid, LineChart, Line,
} from "recharts";
import {
  ComposableMap, Geographies, Geography, Marker,
  Line as RsmLine, ZoomableGroup,
} from "react-simple-maps";
import { Maximize2, X } from "lucide-react";

const geoUrl = "/indonesia-combined.json";

/* ─── Island helper ─── */
function getIsland(provinceName?: string) {
  if (!provinceName) return "Other";
  const n = String(provinceName).toLowerCase();
  if (n.includes("jawa") || n.includes("banten") || n.includes("jakarta") || n.includes("yogyakarta")) return "Java";
  if (n.includes("sumatera") || n.includes("sumatra") || n.includes("aceh") || n.includes("riau") || n.includes("jambi") || n.includes("bengkulu") || n.includes("lampung") || n.includes("bangka")) return "Sumatra";
  if (n.includes("kalimantan")) return "Kalimantan";
  if (n.includes("sulawesi") || n.includes("gorontalo")) return "Sulawesi";
  if (n.includes("bali") || n.includes("nusa")) return "Bali & Nusa Tenggara";
  if (n.includes("maluku") || n.includes("papua") || n.includes("irian")) return "Maluku & Papua";
  if (n.includes("sabah") || n.includes("sarawak") || n.includes("malaysia") || n.includes("keningau")) return "Malaysia";
  if (n.includes("timor") || n.includes("atambua")) return "Timor Leste";
  return "Other";
}

/* Island-specific projection configs for the detail map */
function getIslandProjection(island: string): { center: [number, number]; scale: number } {
  switch (island) {
    case "Java": return { center: [110.5, -7.4], scale: 5500 };
    case "Sumatra": return { center: [103, -1.5], scale: 2800 };
    case "Kalimantan": return { center: [115, -1.5], scale: 2800 };
    case "Sulawesi": return { center: [122, -2], scale: 3000 };
    case "Bali & Nusa Tenggara": return { center: [120, -8.5], scale: 4000 };
    case "Maluku & Papua": return { center: [135, -4], scale: 2500 };
    case "Malaysia": return { center: [116, 5.5], scale: 8000 };
    default: return { center: [116, -2], scale: 3000 };
  }
}

/* ─── Branch data ─── */
const BRANCHES = [
  { id: "jabodetabek", name: "Jabodetabek", province: "Jakarta Raya", coordinates: [106.8229, -6.1944] as [number, number], p_sejati: 120, patriot: 45, ym: 80, waberkat: 95, yw: 60, bapa: 20 },
  { id: "bandung", name: "Bandung", province: "Jawa Barat", coordinates: [107.6191, -6.9175] as [number, number], p_sejati: 85, patriot: 30, ym: 55, waberkat: 70, yw: 40, bapa: 15 },
  { id: "semarang", name: "Semarang", province: "Jawa Tengah", coordinates: [110.4225, -6.9697] as [number, number], p_sejati: 40, patriot: 15, ym: 30, waberkat: 35, yw: 20, bapa: 5 },
  { id: "jogja", name: "Jogja", province: "Yogyakarta", coordinates: [110.3695, -7.7956] as [number, number], p_sejati: 50, patriot: 20, ym: 45, waberkat: 40, yw: 30, bapa: 8 },
  { id: "solo", name: "Solo", province: "Jawa Tengah", coordinates: [110.8243, -7.5666] as [number, number], p_sejati: 30, patriot: 10, ym: 25, waberkat: 25, yw: 15, bapa: 4 },
  { id: "surabaya", name: "Surabaya", province: "Jawa Timur", coordinates: [112.7521, -7.2504] as [number, number], p_sejati: 90, patriot: 35, ym: 60, waberkat: 80, yw: 50, bapa: 25 },
  { id: "kediri", name: "Kediri", province: "Jawa Timur", coordinates: [112.0118, -7.8166] as [number, number], p_sejati: 25, patriot: 5, ym: 15, waberkat: 20, yw: 10, bapa: 2 },
  { id: "malang", name: "Malang", province: "Jawa Timur", coordinates: [112.6326, -7.9797] as [number, number], p_sejati: 40, patriot: 12, ym: 25, waberkat: 30, yw: 15, bapa: 6 },
  { id: "palembang", name: "Palembang", province: "Sumatera Selatan", coordinates: [104.7566, -2.9909] as [number, number], p_sejati: 60, patriot: 20, ym: 40, waberkat: 55, yw: 35, bapa: 10 },
  { id: "manado", name: "Manado", province: "Sulawesi Utara", coordinates: [124.8421, 1.4931] as [number, number], p_sejati: 70, patriot: 25, ym: 45, waberkat: 60, yw: 40, bapa: 12 },
  { id: "makasar", name: "Makasar", province: "Sulawesi Selatan", coordinates: [119.4327, -5.1476] as [number, number], p_sejati: 55, patriot: 15, ym: 35, waberkat: 45, yw: 25, bapa: 8 },
  { id: "banjarmasin", name: "Banjarmasin", province: "Kalimantan Selatan", coordinates: [114.5901, -3.3194] as [number, number], p_sejati: 45, patriot: 15, ym: 30, waberkat: 40, yw: 20, bapa: 5 },
  { id: "kasri", name: "Kasri", province: "Kalimantan Selatan", coordinates: [114.0, -2.0] as [number, number], p_sejati: 20, patriot: 5, ym: 15, waberkat: 15, yw: 10, bapa: 2 },
  { id: "atambua", name: "Atambua", province: "Nusa Tenggara Timur", coordinates: [124.8923, -9.1061] as [number, number], p_sejati: 30, patriot: 10, ym: 20, waberkat: 25, yw: 15, bapa: 3 },
  { id: "keningau", name: "Keningau", province: "Malaysia", coordinates: [116.1601, 5.3377] as [number, number], p_sejati: 25, patriot: 8, ym: 15, waberkat: 20, yw: 10, bapa: 4 },
  { id: "sabah", name: "Sabah", province: "Malaysia", coordinates: [116.0753, 5.9749] as [number, number], p_sejati: 35, patriot: 12, ym: 25, waberkat: 30, yw: 15, bapa: 5 },
];

const JABODETABEK_HISTORY = [
  { name: "Camp 1", p_sejati: 15, patriot: 5, waberkat: 10, ym: 8, yw: 5, bapa: 2 },
  { name: "Camp 2", p_sejati: 35, patriot: 12, waberkat: 25, ym: 18, yw: 15, bapa: 5 },
  { name: "Camp 3", p_sejati: 60, patriot: 22, waberkat: 45, ym: 35, yw: 28, bapa: 8 },
  { name: "Camp 4", p_sejati: 85, patriot: 30, waberkat: 65, ym: 55, yw: 40, bapa: 12 },
  { name: "Camp 5", p_sejati: 120, patriot: 45, waberkat: 95, ym: 80, yw: 60, bapa: 20 },
];

const CONNECTIONS = [
  ["jabodetabek", "bandung"], ["bandung", "semarang"], ["semarang", "jogja"],
  ["jogja", "solo"], ["solo", "surabaya"], ["surabaya", "malang"],
  ["kediri", "surabaya"], ["jabodetabek", "palembang"], ["surabaya", "makasar"],
  ["makasar", "manado"], ["surabaya", "banjarmasin"], ["banjarmasin", "kasri"],
  ["surabaya", "atambua"], ["manado", "sabah"], ["sabah", "keningau"],
];

const COLORS = ["#8b6b22", "#c9a96e", "#e8decd", "#614915", "#a3843e", "#d4be94"];
const DEPTH_PX = 8;

/* ================================================================ */
export default function SciFiMap() {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<(typeof BRANCHES)[0] | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [hoveredBranch, setHoveredBranch] = useState<(typeof BRANCHES)[0] | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const statsTarget = useMemo(() => {
    if (selectedBranch) return selectedBranch;
    if (selectedProvince) {
      const island = getIsland(selectedProvince);
      const rbs = BRANCHES.filter((b) => getIsland(b.province) === island);
      if (rbs.length === 0) return null;
      return rbs.reduce(
        (a, c) => ({ p_sejati: a.p_sejati + c.p_sejati, patriot: a.patriot + c.patriot, waberkat: a.waberkat + c.waberkat, ym: a.ym + c.ym, yw: a.yw + c.yw, bapa: a.bapa + c.bapa }),
        { p_sejati: 0, patriot: 0, waberkat: 0, ym: 0, yw: 0, bapa: 0 },
      );
    }
    return null;
  }, [selectedBranch, selectedProvince]);

  const pieData = statsTarget
    ? [
        { name: "Pria Sejati", value: statsTarget.p_sejati },
        { name: "Patriot", value: statsTarget.patriot },
        { name: "Waberkat", value: statsTarget.waberkat },
        { name: "Young Man", value: statsTarget.ym },
        { name: "Young Woman", value: statsTarget.yw },
        { name: "Bapa Sejati", value: statsTarget.bapa },
      ]
    : [];

  const totalAlumni = pieData.reduce((s, d) => s + d.value, 0);

  const historyData = useMemo(() => {
    if (selectedBranch?.id === "jabodetabek") return JABODETABEK_HISTORY;
    if (!statsTarget) return [];
    return [
      { name: "Camp 1", p_sejati: Math.floor(statsTarget.p_sejati * 0.1), patriot: Math.floor(statsTarget.patriot * 0.1), waberkat: Math.floor(statsTarget.waberkat * 0.1), ym: Math.floor(statsTarget.ym * 0.1), yw: Math.floor(statsTarget.yw * 0.1), bapa: Math.floor(statsTarget.bapa * 0.1) },
      { name: "Camp 2", p_sejati: Math.floor(statsTarget.p_sejati * 0.3), patriot: Math.floor(statsTarget.patriot * 0.3), waberkat: Math.floor(statsTarget.waberkat * 0.3), ym: Math.floor(statsTarget.ym * 0.3), yw: Math.floor(statsTarget.yw * 0.3), bapa: Math.floor(statsTarget.bapa * 0.3) },
      { name: "Camp 3", p_sejati: Math.floor(statsTarget.p_sejati * 0.5), patriot: Math.floor(statsTarget.patriot * 0.5), waberkat: Math.floor(statsTarget.waberkat * 0.5), ym: Math.floor(statsTarget.ym * 0.5), yw: Math.floor(statsTarget.yw * 0.5), bapa: Math.floor(statsTarget.bapa * 0.5) },
      { name: "Camp 4", p_sejati: Math.floor(statsTarget.p_sejati * 0.8), patriot: Math.floor(statsTarget.patriot * 0.8), waberkat: Math.floor(statsTarget.waberkat * 0.8), ym: Math.floor(statsTarget.ym * 0.8), yw: Math.floor(statsTarget.yw * 0.8), bapa: Math.floor(statsTarget.bapa * 0.8) },
      { name: "Camp 5", p_sejati: statsTarget.p_sejati, patriot: statsTarget.patriot, waberkat: statsTarget.waberkat, ym: statsTarget.ym, yw: statsTarget.yw, bapa: statsTarget.bapa },
    ];
  }, [selectedBranch, statsTarget]);

  const statsTitle = selectedBranch ? "Branch Dashboard" : "Island Overview";
  const statsSubtitle = selectedBranch ? selectedBranch.name : selectedProvince ? getIsland(selectedProvince) : "";

  const activeIsland = selectedBranch ? getIsland(selectedBranch.province) : selectedProvince ? getIsland(selectedProvince) : null;
  const detailBranches = activeIsland ? BRANCHES.filter((b) => getIsland(b.province) === activeIsland) : [];
  const detailProjection = activeIsland ? getIslandProjection(activeIsland) : { center: [116, -2] as [number, number], scale: 3000 };

  return (
    <div className="flex flex-col h-full w-full">
      {/* ═══ MAIN MAP ═══ */}
      <div className="relative w-full h-[350px] md:h-[450px] bg-transparent overflow-hidden flex items-center justify-center group flex-shrink-0">
        <button onClick={() => setIsFullscreen(!isFullscreen)} className="absolute top-4 right-4 z-[100] bg-brand-gold/10 hover:bg-brand-gold/20 border border-brand-gold/30 text-brand-gold p-2 rounded-lg transition-all animate-pulse">
          {isFullscreen ? <X className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full border border-brand-gold/10 relative">
            <div className="absolute inset-0 rounded-full border border-brand-gold/5 scale-75" />
            <div className="absolute inset-0 rounded-full border border-brand-gold/5 scale-50" />
            <div className="absolute top-1/2 left-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent to-brand-gold/50 origin-left animate-[spin_6s_linear_infinite]" />
          </div>
        </div>

        <div className="w-full h-full relative z-10 cursor-grab active:cursor-grabbing" onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}>
          <div className="w-full h-full transition-transform duration-1000 ease-out" style={isFullscreen ? { position: "fixed", inset: 0, zIndex: 50, backgroundColor: "#1a1d24" } : { transformStyle: "preserve-3d", transform: "rotateX(45deg) rotateZ(-5deg) scale(1.25)", marginTop: "3rem", filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.8))" }}>
            <ComposableMap projection="geoMercator" projectionConfig={{ scale: 1300, center: [116, -2] }} style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}>
              <ZoomableGroup zoom={1} minZoom={1} maxZoom={6} center={[116, -2]}>
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const pn = geo.properties?.name || geo.properties?.NAME;
                      const isl = getIsland(pn);
                      const isBranchProv = selectedBranch && selectedBranch.province === pn;
                      const isClickedProv = !selectedBranch && selectedProvince === pn;
                      const isActiveIsland = selectedBranch ? getIsland(selectedBranch.province) === isl : selectedProvince ? getIsland(selectedProvince) === isl : false;
                      let fill = "rgba(63,63,70,0.7)";
                      let stroke = "rgba(139,107,34,0.2)";
                      if (isBranchProv || isClickedProv) { fill = "rgba(180,140,50,0.8)"; stroke = "rgba(232,222,205,1)"; }
                      else if (isActiveIsland) { fill = "rgba(139,107,34,0.4)"; stroke = "rgba(139,107,34,0.8)"; }
                      else if (hoveredRegion === isl) { fill = "rgba(139,107,34,0.2)"; }
                      return (
                        <Geography key={geo.rsmKey} geography={geo} onMouseEnter={() => setHoveredRegion(isl)} onMouseLeave={() => setHoveredRegion(null)} onClick={() => { setSelectedProvince(pn); setSelectedBranch(null); }} className="cursor-pointer"
                          style={{ default: { fill, outline: "none", stroke, strokeWidth: 0.5 }, hover: { fill: "rgba(180,140,50,0.6)", outline: "none", stroke: "rgba(232,222,205,1)", strokeWidth: 1 }, pressed: { outline: "none" } }} />
                      );
                    })
                  }
                </Geographies>
                {CONNECTIONS.map(([a, b]) => { const ba = BRANCHES.find((x) => x.id === a); const bb = BRANCHES.find((x) => x.id === b); if (!ba || !bb) return null; return <RsmLine key={`${a}-${b}`} from={ba.coordinates} to={bb.coordinates} stroke="rgba(139,107,34,0.2)" strokeWidth={1} strokeDasharray="4 4" className="pointer-events-none" />; })}
                {BRANCHES.map((br) => {
                  const sel = selectedBranch?.id === br.id;
                  const hov = hoveredBranch?.id === br.id;
                  return (
                    <Marker key={br.id} coordinates={br.coordinates} onMouseEnter={() => setHoveredBranch(br)} onMouseLeave={() => setHoveredBranch(null)} onClick={(e) => { e.stopPropagation(); setSelectedBranch(br); setSelectedProvince(br.province); }}>
                      <g style={sel ? { filter: "drop-shadow(0 0 10px rgba(255,255,255,0.9))" } : {}}>
                        <image href="/cfm-marker.png" x={-12} y={-14} width={24} height={28} className="cursor-pointer" opacity={sel ? 1 : hov ? 0.9 : 0.7} />
                        {sel && <circle cx="0" cy="0" r="16" fill="none" stroke="#fff" strokeWidth="1" className="animate-ping" opacity="0.4" />}
                      </g>
                      <text textAnchor="middle" y={18} style={{ fontFamily: "serif", fontSize: "6px", fontWeight: "bold", fill: sel ? "#fff" : "rgba(232,222,205,0.8)", textShadow: sel ? "0 0 6px #fff" : "0 0 4px #000", pointerEvents: "none" }}>{br.name}</text>
                    </Marker>
                  );
                })}
              </ZoomableGroup>
            </ComposableMap>
          </div>
        </div>

        {!isFullscreen && hoveredBranch && (
          <div className="fixed w-48 bg-[#1a1d24]/95 backdrop-blur-md border border-brand-gold/30 rounded-lg p-3 pointer-events-none z-[100]" style={{ left: tooltipPos.x + 15, top: tooltipPos.y + 15 }}>
            <h4 className="text-brand-gold font-bold mb-1 border-b border-[#333] pb-1">{hoveredBranch.name}</h4>
            <div className="text-[10px] text-gray-400">Total: <span className="text-white font-mono">{hoveredBranch.p_sejati + hoveredBranch.patriot + hoveredBranch.waberkat + hoveredBranch.ym + hoveredBranch.yw + hoveredBranch.bapa}</span></div>
          </div>
        )}
        {!isFullscreen && !hoveredBranch && hoveredRegion && hoveredRegion !== "Other" && (
          <div className="fixed bg-[#1a1d24]/95 backdrop-blur-md border border-brand-gold/30 rounded px-3 py-1.5 pointer-events-none z-[100]" style={{ left: tooltipPos.x + 15, top: tooltipPos.y + 15 }}>
            <h4 className="text-brand-gold font-bold font-serif text-sm">{hoveredRegion}</h4>
          </div>
        )}
      </div>

      {/* ═══ BOTTOM DASHBOARD ═══ */}
      {statsTarget && (
        <div className="flex flex-col gap-4 p-4 md:p-6 bg-[#15181e] border-t border-[#333] flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* ── DETAIL MAP: dual-layer (tilted surface + flat upright markers) ── */}
          <div className="relative w-full h-[280px] md:h-[350px] bg-[#1a1d24] border border-[#333] rounded-2xl overflow-hidden">
            {/* header overlay */}
            <div className="absolute top-4 left-5 z-20 pointer-events-none">
              <h3 className="text-brand-gold text-xs font-bold uppercase tracking-widest">{statsTitle}</h3>
              <h2 className="text-xl font-serif font-bold text-white">{statsSubtitle}</h2>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-3xl font-mono font-bold text-white">{totalAlumni}</span>
                <span className="text-brand-muted text-xs pb-0.5 font-serif italic">Total Alumni</span>
              </div>
            </div>

            {/* LAYER 1: Tilted 3D map surface (geographies only, no markers) */}
            <div className="absolute inset-0" style={{ perspective: "800px" }}>
              <div className="w-full h-full" style={{ transformStyle: "preserve-3d", transform: "rotateX(50deg) rotateZ(-8deg) scale(1.6) translateY(10%)", filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.9))" }}>
                <ComposableMap projection="geoMercator" projectionConfig={{ scale: detailProjection.scale, center: detailProjection.center }} style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}>
                  {/* Extrusion depth layers */}
                  <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                      geographies.filter((geo) => getIsland(geo.properties?.name || geo.properties?.NAME) === activeIsland)
                        .map((geo) => {
                          const layers = [];
                          for (let i = DEPTH_PX; i > 0; i -= 2) {
                            layers.push(<Geography key={`ex-${geo.rsmKey}-${i}`} geography={geo} fill={`rgba(40,32,10,${0.6 - i * 0.05})`} stroke="rgba(60,48,16,0.3)" strokeWidth={0.5} style={{ default: { outline: "none", transform: `translateY(${i}px)` }, hover: { outline: "none", transform: `translateY(${i}px)` }, pressed: { outline: "none" } }} />);
                          }
                          return layers;
                        })
                    }
                  </Geographies>
                  {/* Top surface */}
                  <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                      geographies.filter((geo) => getIsland(geo.properties?.name || geo.properties?.NAME) === activeIsland)
                        .map((geo) => (<Geography key={geo.rsmKey} geography={geo} fill="rgba(139,107,34,0.35)" stroke="rgba(232,222,205,0.6)" strokeWidth={1.5} style={{ default: { outline: "none" }, hover: { fill: "rgba(180,140,50,0.5)", outline: "none" }, pressed: { outline: "none" } }} />))
                    }
                  </Geographies>
                </ComposableMap>
              </div>
            </div>

            {/* LAYER 2: Flat overlay for UPRIGHT markers (same projection, NO 3D tilt) */}
            <div className="absolute inset-0 z-10 pointer-events-none">
              <ComposableMap projection="geoMercator" projectionConfig={{ scale: detailProjection.scale, center: detailProjection.center }} style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}>
                {detailBranches.map((br) => {
                  const sel = selectedBranch?.id === br.id;
                  const total = br.p_sejati + br.patriot + br.waberkat + br.ym + br.yw + br.bapa;
                  return (
                    <Marker key={`flat-${br.id}`} coordinates={br.coordinates}>
                      <g
                        className="cursor-pointer pointer-events-auto"
                        onClick={() => { setSelectedBranch(br); setSelectedProvince(br.province); }}
                        style={sel ? { filter: "drop-shadow(0 0 12px rgba(255,255,255,0.9))" } : {}}
                      >
                        {/* Pin line going UP from the marker base */}
                        <line x1="0" y1="0" x2="0" y2="-35" stroke={sel ? "#ffffff" : "rgba(232,222,205,0.5)"} strokeWidth="1" strokeDasharray="3 3" />
                        <circle cx="0" cy="0" r="3" fill={sel ? "#ffffff" : "rgba(232,222,205,0.6)"} />

                        {/* CFM icon floating above */}
                        <image href="/cfm-marker.png" x={-14} y={-63} width={28} height={32} opacity={sel ? 1 : 0.85} />
                        {sel && <circle cx="0" cy="-47" r="18" fill="none" stroke="#fff" strokeWidth="1" className="animate-ping" opacity="0.3" />}

                        {/* Number badge above icon */}
                        <text textAnchor="middle" y={-68} style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: "bold", fill: sel ? "#fff" : "#e8decd", textShadow: "0 2px 4px rgba(0,0,0,1)", pointerEvents: "none" }}>
                          {total}
                        </text>
                        {/* Name below base */}
                        <text textAnchor="middle" y={16} style={{ fontFamily: "serif", fontSize: "8px", fontWeight: "bold", fill: sel ? "#fff" : "rgba(232,222,205,0.9)", textShadow: "0 1px 3px #000", pointerEvents: "none" }}>
                          {br.name}
                        </text>
                      </g>
                    </Marker>
                  );
                })}
              </ComposableMap>
            </div>

            {/* Radar decoration */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
              <div className="w-[400px] h-[400px] rounded-full border border-brand-gold/20 relative">
                <div className="absolute inset-0 rounded-full border border-brand-gold/10 scale-75" />
              </div>
            </div>
          </div>

          {/* ── CHARTS ROW ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#1a1d24] border border-[#333] rounded-2xl p-5 flex flex-col relative overflow-hidden min-h-[280px]">
              <h3 className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-2">Alumni Distribution</h3>
              <div className="flex-1 relative w-full" style={{ filter: "drop-shadow(0 12px 20px rgba(0,0,0,0.6))" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" stroke="rgba(0,0,0,0.3)" strokeWidth={2}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: "#1a1d24", borderColor: "#333", borderRadius: "8px", color: "#e8decd" }} itemStyle={{ color: "#e8decd" }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "10px" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <div className="text-2xl font-mono font-bold text-white">{totalAlumni}</div>
                  <div className="text-[9px] text-brand-gold uppercase tracking-widest">Alumni</div>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1d24] border border-[#333] rounded-2xl p-5 flex flex-col relative overflow-hidden min-h-[280px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-brand-gold text-xs font-bold uppercase tracking-widest">{selectedBranch?.id === "jabodetabek" ? "Jabodetabek Camp History" : "Camp History"}</h3>
                <div className="px-2 py-0.5 bg-[#22252d] border border-[#333] rounded text-[10px] text-brand-light font-serif">Growth by Program</div>
              </div>
              <div className="flex-1 relative w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                    <RechartsTooltip contentStyle={{ backgroundColor: "#1a1d24", borderColor: "#333", borderRadius: "8px", color: "#e8decd" }} itemStyle={{ color: "#e8decd" }} />
                    <Legend verticalAlign="bottom" height={36} iconType="plainline" wrapperStyle={{ fontSize: "10px" }} />
                    <Line type="monotone" dataKey="p_sejati" name="Pria Sejati" stroke={COLORS[0]} strokeWidth={2} dot={{ r: 2, fill: COLORS[0], stroke: "#1a1d24" }} activeDot={{ r: 4, fill: "#fff", stroke: COLORS[0] }} />
                    <Line type="monotone" dataKey="patriot" name="Patriot" stroke={COLORS[1]} strokeWidth={2} dot={{ r: 2, fill: COLORS[1], stroke: "#1a1d24" }} activeDot={{ r: 4, fill: "#fff", stroke: COLORS[1] }} />
                    <Line type="monotone" dataKey="waberkat" name="Waberkat" stroke={COLORS[2]} strokeWidth={2} dot={{ r: 2, fill: COLORS[2], stroke: "#1a1d24" }} activeDot={{ r: 4, fill: "#fff", stroke: COLORS[2] }} />
                    <Line type="monotone" dataKey="ym" name="Young Man" stroke={COLORS[3]} strokeWidth={2} dot={{ r: 2, fill: COLORS[3], stroke: "#1a1d24" }} activeDot={{ r: 4, fill: "#fff", stroke: COLORS[3] }} />
                    <Line type="monotone" dataKey="yw" name="Young Woman" stroke={COLORS[4]} strokeWidth={2} dot={{ r: 2, fill: COLORS[4], stroke: "#1a1d24" }} activeDot={{ r: 4, fill: "#fff", stroke: COLORS[4] }} />
                    <Line type="monotone" dataKey="bapa" name="Bapa Sejati" stroke={COLORS[5]} strokeWidth={2} dot={{ r: 2, fill: COLORS[5], stroke: "#1a1d24" }} activeDot={{ r: 4, fill: "#fff", stroke: COLORS[5] }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
