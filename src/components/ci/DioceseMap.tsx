"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { Church, MapPin, X, CalendarDays, Minus, Plus } from "lucide-react";
import { KIND_LABEL, PROVINCE_COLORS, PROVINCE_ORDER, type Diocese } from "@/lib/catholicIndonesia";

const GOLD = "#D6B072";
const serif = { fontFamily: "'Lora', Georgia, serif" };
const GEO = "/indonesia.json";

export default function DioceseMap({ dioceses, slug }: { dioceses: Diocese[]; slug: string }) {
  const [selected, setSelected] = useState<Diocese | null>(null);
  const [province, setProvince] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([118, -2.5]);
  // Draw the map in the browser only (keeps the page HTML small and avoids hydration rounding mismatches)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const pins = useMemo(
    () => dioceses.filter((d) => d.lat != null && d.lng != null && (!province || d.province === province)),
    [dioceses, province]
  );
  const provinces = PROVINCE_ORDER.filter((p) => p !== "—");

  return (
    <div className="space-y-4">
      {/* Province filter / legend */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <button
          onClick={() => setProvince(null)}
          className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold"
          style={province === null ? { background: GOLD, color: "#121417" } : { background: "#1a1d24", color: "#9CA3AF" }}
        >
          Semua
        </button>
        {provinces.map((p) => (
          <button
            key={p}
            onClick={() => setProvince(province === p ? null : p)}
            className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs"
            style={province === p ? { background: `${PROVINCE_COLORS[p]}33`, color: "#fff", border: `1px solid ${PROVINCE_COLORS[p]}` } : { background: "#1a1d24", color: "#9CA3AF", border: "1px solid transparent" }}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: PROVINCE_COLORS[p] }} />
            {p}
          </button>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-3xl" style={{ background: "radial-gradient(ellipse at 50% 40%, #16233d 0%, #0b0f17 75%)", border: `1px solid ${GOLD}26` }}>
        {!mounted ? (
          <div className="aspect-[980/460] w-full animate-pulse" />
        ) : (
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 1050, center: [0, 0] }}
          width={980}
          height={460}
          style={{ width: "100%", height: "auto" }}
        >
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

            {pins.map((d) => {
              const color = PROVINCE_COLORS[d.province] ?? GOLD;
              const isArch = d.kind === "keuskupan_agung";
              const active = selected?.name === d.name;
              const r = (isArch ? 6 : 4.2) / Math.sqrt(zoom);
              return (
                <Marker key={d.name} coordinates={[d.lng!, d.lat!]} onClick={() => setSelected(d)} style={{ default: { cursor: "pointer" }, hover: { cursor: "pointer" }, pressed: {} }}>
                  {/* Invisible, larger tap target so small pins are easy to hit on phones */}
                  <circle r={14 / Math.sqrt(zoom)} fill="transparent" />
                  {(isArch || active) && <circle r={r * 2.2} fill={color} opacity={active ? 0.35 : 0.18} />}
                  <circle r={r} fill={color} stroke="#0b0f17" strokeWidth={1.2 / Math.sqrt(zoom)} />
                  {isArch && zoom >= 1.6 && (
                    <text y={-r * 1.9} textAnchor="middle" style={{ fontSize: 9 / Math.sqrt(zoom), fill: "#EAE5D9", fontFamily: "Inter, sans-serif" }}>
                      {d.city}
                    </text>
                  )}
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>
        )}

        {/* Zoom controls */}
        <div className="absolute right-3 top-3 flex flex-col gap-1.5">
          <button onClick={() => setZoom((z) => Math.min(8, z * 1.6))} aria-label="Perbesar" className="rounded-full bg-black/50 p-2 text-white backdrop-blur"><Plus className="h-4 w-4" /></button>
          <button onClick={() => { setZoom((z) => Math.max(1, z / 1.6)); if (zoom <= 1.6) setCenter([118, -2.5]); }} aria-label="Perkecil" className="rounded-full bg-black/50 p-2 text-white backdrop-blur"><Minus className="h-4 w-4" /></button>
        </div>
        <p className="absolute bottom-3 left-4 text-[10px] uppercase tracking-widest text-brand-muted">
          {pins.length} keuskupan · ketuk titik untuk detail
        </p>

      </div>

      {/* Detail card */}
      {selected && (
        <div className="relative rounded-2xl bg-[#1a1d24] p-4 sm:max-w-md" style={{ border: `1px solid ${PROVINCE_COLORS[selected.province] ?? GOLD}66` }}>
          <button onClick={() => setSelected(null)} aria-label="Tutup" className="absolute right-2 top-2 rounded-full p-1.5 text-brand-muted hover:text-white"><X className="h-4 w-4" /></button>
          <div className="text-[10px] uppercase tracking-widest" style={{ color: PROVINCE_COLORS[selected.province] ?? GOLD }}>
            {KIND_LABEL[selected.kind]} · Provinsi {selected.province}
          </div>
          <h3 className="mt-0.5 pr-6 font-semibold text-white" style={serif}>{selected.name}</h3>
          <p className="mt-1 text-sm text-[#EAE5D9]">{selected.bishop_name ?? <span className="italic text-brand-muted">Uskup belum diisi</span>}</p>
          <div className="mt-2 space-y-1 text-xs text-brand-muted">
            <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{selected.city}</p>
            {selected.cathedral && <p className="flex items-center gap-1.5"><Church className="h-3.5 w-3.5" />{selected.cathedral}</p>}
          </div>
          <div className="mt-3 flex gap-2">
            <Link href={`/camp/${slug}/uskup?d=${encodeURIComponent(selected.name)}`} className="flex-1 rounded-full py-1.5 text-center text-xs font-semibold text-[#121417]" style={{ background: GOLD }}>Profil Uskup</Link>
            <Link href="/news/schedule" className="flex flex-1 items-center justify-center gap-1 rounded-full border border-white/15 py-1.5 text-xs text-white">
              <CalendarDays className="h-3.5 w-3.5" />Jadwal Misa
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
