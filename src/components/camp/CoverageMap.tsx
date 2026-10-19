"use client";

import { useEffect, useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { MapPin, Minus, Plus, X, Tent } from "lucide-react";
import { branchPosition } from "@/lib/idGeo";
import type { BranchRow } from "@/components/admin/CoverageTable";

const GOLD = "#D6B072";
const serif = { fontFamily: "'Lora', Georgia, serif" };
const GEO = "/indonesia.json";

/** Indonesia map of a community's coverage: gold pins are branches that already run camps. */
export default function CoverageMap({ rows }: { rows: BranchRow[] }) {
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([118, -2.5]);
  const [selected, setSelected] = useState<string | null>(null);
  const [onlyCamps, setOnlyCamps] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const inIndonesia = useMemo(() => rows.filter((r) => /indonesia/i.test(r.negara)), [rows]);
  const abroad = useMemo(() => rows.filter((r) => !/indonesia/i.test(r.negara)), [rows]);
  const pins = useMemo(
    () =>
      inIndonesia
        .map((r) => ({ row: r, pos: branchPosition(r.kota, r.provinsi, r.branch) }))
        .filter((p): p is { row: BranchRow; pos: [number, number] } => !!p.pos && (!onlyCamps || p.row.camps > 0)),
    [inIndonesia, onlyCamps]
  );
  const sel = rows.find((r) => r.id === selected) ?? null;
  const withCamps = inIndonesia.filter((r) => r.camps > 0).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          onClick={() => setOnlyCamps(false)}
          className="rounded-full px-3 py-1.5 font-semibold"
          style={!onlyCamps ? { background: GOLD, color: "#121417" } : { background: "#1a1d24", color: "#9CA3AF" }}
        >
          Semua cabang ({inIndonesia.length})
        </button>
        <button
          onClick={() => setOnlyCamps(true)}
          className="rounded-full px-3 py-1.5 font-semibold"
          style={onlyCamps ? { background: GOLD, color: "#121417" } : { background: "#1a1d24", color: "#9CA3AF" }}
        >
          Sudah ada camp ({withCamps})
        </button>
        <span className="ml-auto flex items-center gap-3 text-[11px] text-brand-muted">
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full" style={{ background: GOLD }} /> ada camp</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full border border-white/50" /> cabang</span>
        </span>
      </div>

      <div className="relative overflow-hidden rounded-3xl" style={{ background: "radial-gradient(ellipse at 50% 40%, #16233d 0%, #0b0f17 75%)", border: `1px solid ${GOLD}26` }}>
        {!mounted ? (
          <div className="aspect-[980/460] w-full animate-pulse" />
        ) : (
          <ComposableMap projection="geoMercator" projectionConfig={{ scale: 1050, center: [0, 0] }} width={980} height={460} style={{ width: "100%", height: "auto" }}>
            <ZoomableGroup
              center={center}
              zoom={zoom}
              minZoom={1}
              maxZoom={8}
              onMoveEnd={({ coordinates, zoom: z }: { coordinates: [number, number]; zoom: number }) => { setCenter(coordinates); setZoom(z); }}
            >
              <Geographies geography={GEO}>
                {({ geographies }: { geographies: any[] }) =>
                  geographies.map((geo) => {
                    const isIndonesia = geo.properties?.ADM0_A3 === "IDN";
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={isIndonesia ? "rgba(214,176,114,0.16)" : "rgba(255,255,255,0.03)"}
                        stroke={isIndonesia ? "rgba(214,176,114,0.55)" : "rgba(255,255,255,0.08)"}
                        strokeWidth={0.5 / zoom}
                        style={{ default: { outline: "none" }, hover: { outline: "none" }, pressed: { outline: "none" } }}
                      />
                    );
                  })
                }
              </Geographies>

              {pins.map(({ row, pos }) => {
                const has = row.camps > 0;
                const active = selected === row.id;
                const r = (has ? 5.2 : 3.8) / Math.sqrt(zoom);
                return (
                  <Marker key={row.id} coordinates={pos} onClick={() => setSelected(row.id)} style={{ default: { cursor: "pointer" }, hover: { cursor: "pointer" }, pressed: {} }}>
                    <circle r={14 / Math.sqrt(zoom)} fill="transparent" />
                    {(has || active) && <circle r={r * 2.2} fill={GOLD} opacity={active ? 0.35 : 0.18} />}
                    <circle r={r} fill={has ? GOLD : "#0b0f17"} stroke={has ? "#0b0f17" : "rgba(255,255,255,0.7)"} strokeWidth={1.2 / Math.sqrt(zoom)} />
                    {zoom >= 2 && (
                      <text y={-r * 1.9} textAnchor="middle" style={{ fontSize: 9 / Math.sqrt(zoom), fill: "#EAE5D9", fontFamily: "Inter, sans-serif" }}>
                        {row.branch || row.kota}
                      </text>
                    )}
                  </Marker>
                );
              })}
            </ZoomableGroup>
          </ComposableMap>
        )}

        <div className="absolute right-3 top-3 flex flex-col gap-1.5">
          <button onClick={() => setZoom((z) => Math.min(8, z * 1.6))} aria-label="Perbesar" className="rounded-full bg-black/50 p-2 text-white backdrop-blur"><Plus className="h-4 w-4" /></button>
          <button onClick={() => { setZoom((z) => Math.max(1, z / 1.6)); if (zoom <= 1.6) setCenter([118, -2.5]); }} aria-label="Perkecil" className="rounded-full bg-black/50 p-2 text-white backdrop-blur"><Minus className="h-4 w-4" /></button>
        </div>
        <p className="absolute bottom-3 left-4 text-[10px] uppercase tracking-widest text-brand-muted">{pins.length} cabang · ketuk titik untuk detail</p>
      </div>

      {sel && (
        <div className="relative rounded-2xl bg-[#1a1d24] p-4 sm:max-w-md" style={{ border: `1px solid ${GOLD}66` }}>
          <button onClick={() => setSelected(null)} aria-label="Tutup" className="absolute right-2 top-2 rounded-full p-1.5 text-brand-muted hover:text-white"><X className="h-4 w-4" /></button>
          <div className="text-[10px] uppercase tracking-widest" style={{ color: GOLD }}>Provinsi {sel.provinsi}</div>
          <h3 className="mt-0.5 pr-6 font-semibold text-white" style={serif}>{sel.branch || sel.kota}</h3>
          <div className="mt-2 space-y-1 text-xs text-brand-muted">
            <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{sel.kota}, {sel.negara}</p>
            <p className="flex items-center gap-1.5"><Tent className="h-3.5 w-3.5" />{sel.camps > 0 ? `${sel.camps} camp` : "Belum ada camp"}</p>
          </div>
        </div>
      )}

      {abroad.length > 0 && (
        <p className="text-xs text-brand-muted">
          Di luar Indonesia: {abroad.map((r) => `${r.branch || r.kota} (${r.negara})`).join(", ")}
        </p>
      )}
    </div>
  );
}
