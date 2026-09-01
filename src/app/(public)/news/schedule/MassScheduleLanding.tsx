"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Church, Search, MapPin, ChevronRight } from "lucide-react";

type Item = { slug: string; name: string; count: number };

export default function MassScheduleLanding({
  provinces,
  regenciesByProvince,
  totalChurches,
  lang,
}: {
  provinces: Item[];
  regenciesByProvince: Record<string, Item[]>;
  totalChurches: number;
  lang: "id" | "en";
}) {
  const isId = lang !== "en";
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [province, setProvince] = useState("");
  const [regency, setRegency] = useState("");

  const regencies = useMemo(
    () => (province ? regenciesByProvince[province] || [] : []),
    [province, regenciesByProvince]
  );

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 2) return;
    router.push(`/news/schedule/search?q=${encodeURIComponent(q)}`);
  };

  const go = () => {
    if (!province || !regency) return;
    router.push(`/news/schedule/${province}/${regency}`);
  };

  return (
    <div className="p-4 md:p-8">
      {/* Hero */}
      <div className="text-center max-w-lg mx-auto mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gold/10 border border-brand-gold/30 text-brand-gold mb-3">
          <Church className="h-6 w-6" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white">
          {isId ? "Jadwal Misa" : "Mass Schedule"}
        </h2>
        <p className="text-sm text-brand-muted mt-1">
          {isId
            ? "Temukan jadwal Misa Kudus di paroki terdekat."
            : "Find Holy Mass times at a parish near you."}
        </p>
        <p className="text-xs text-brand-gold/80 font-medium mt-2">
          {totalChurches.toLocaleString("id-ID")}{" "}
          {isId ? "gereja terdaftar" : "churches listed"}
        </p>
      </div>

      {/* Search by name */}
      <form onSubmit={submitSearch} className="max-w-lg mx-auto">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isId ? "Cari nama gereja / paroki..." : "Search church / parish name..."
            }
            className="w-full bg-brand-bg border border-[#333] rounded-xl pl-10 pr-24 py-3 text-sm text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-gold transition-colors"
          />
          <button
            type="submit"
            disabled={query.trim().length < 2}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-lg bg-brand-gold text-brand-dark text-xs font-bold hover:bg-yellow-400 transition-colors disabled:opacity-40"
          >
            {isId ? "Cari" : "Search"}
          </button>
        </div>
      </form>

      {/* Divider */}
      <div className="max-w-lg mx-auto flex items-center gap-3 my-7">
        <div className="h-px flex-1 bg-[#333]" />
        <span className="text-[11px] uppercase tracking-wider text-brand-muted">
          {isId ? "atau pilih wilayah" : "or browse by region"}
        </span>
        <div className="h-px flex-1 bg-[#333]" />
      </div>

      {/* Province -> City -> Go */}
      <div className="max-w-lg mx-auto space-y-3">
        <div>
          <label className="block text-xs font-medium text-brand-light mb-1.5">
            {isId ? "Provinsi" : "Province"}
          </label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted pointer-events-none" />
            <select
              value={province}
              onChange={(e) => {
                setProvince(e.target.value);
                setRegency("");
              }}
              className="w-full appearance-none bg-brand-bg border border-[#333] rounded-xl pl-10 pr-9 py-3 text-sm text-white focus:outline-none focus:border-brand-gold transition-colors"
            >
              <option value="">{isId ? "Pilih provinsi" : "Select province"}</option>
              {provinces.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name} ({p.count})
                </option>
              ))}
            </select>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted rotate-90 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-brand-light mb-1.5">
            {isId ? "Kota / Kabupaten" : "City / Regency"}
          </label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted pointer-events-none" />
            <select
              value={regency}
              onChange={(e) => setRegency(e.target.value)}
              disabled={!province}
              className="w-full appearance-none bg-brand-bg border border-[#333] rounded-xl pl-10 pr-9 py-3 text-sm text-white focus:outline-none focus:border-brand-gold transition-colors disabled:opacity-50"
            >
              <option value="">
                {isId ? "Pilih kota / kabupaten" : "Select city / regency"}
              </option>
              {regencies.map((r) => (
                <option key={r.slug} value={r.slug}>
                  {r.name} ({r.count})
                </option>
              ))}
            </select>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted rotate-90 pointer-events-none" />
          </div>
        </div>

        <button
          onClick={go}
          disabled={!province || !regency}
          className="w-full mt-1 py-3 rounded-xl bg-brand-gold text-brand-dark font-bold text-sm hover:bg-yellow-400 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <Church className="h-4 w-4" />
          {isId ? "Cari Gereja" : "Find Churches"}
        </button>
      </div>

      <p className="text-center text-[10px] text-brand-muted mt-8">
        {isId ? "Sumber data: " : "Data source: "}
        <a
          href="https://jadwalmisa.id"
          target="_blank"
          rel="noreferrer"
          className="text-brand-gold/70 hover:text-brand-gold underline"
        >
          jadwalmisa.id
        </a>
      </p>
    </div>
  );
}
