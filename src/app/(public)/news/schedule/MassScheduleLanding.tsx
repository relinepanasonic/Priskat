"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Church, Search, MapPin, ChevronDown, ArrowRight } from "lucide-react";

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
  const totalCities = useMemo(
    () =>
      Object.values(regenciesByProvince).reduce((a, l) => a + l.length, 0),
    [regenciesByProvince]
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

  const nf = (n: number) => n.toLocaleString(isId ? "id-ID" : "en-US");

  return (
    <div className="relative overflow-hidden">
      {/* ambient glow */}
      <div className="pointer-events-none absolute inset-x-0 -top-24 h-72 bg-[radial-gradient(ellipse_at_top,rgba(214,176,114,0.16),transparent_65%)]" />

      <div className="relative px-5 py-10 md:px-8 md:py-14">
        {/* Hero */}
        <div className="mx-auto mb-9 max-w-xl text-center">
          <div className="relative mx-auto mb-4 grid h-16 w-16 place-items-center">
            <span className="absolute inset-0 rounded-2xl bg-brand-gold/15 blur-lg" />
            <span className="relative grid h-16 w-16 place-items-center rounded-2xl border border-brand-gold/30 bg-gradient-to-b from-brand-gold/15 to-brand-gold/5 text-brand-gold shadow-glow-gold">
              <Church className="h-7 w-7" />
            </span>
          </div>

          <h2 className="bg-gradient-to-r from-brand-gold via-brand-gold-hover to-brand-gold bg-clip-text font-serif text-2xl font-bold tracking-tight text-transparent md:text-3xl">
            {isId ? "Jadwal Misa Kudus" : "Holy Mass Schedule"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-brand-muted">
            {isId
              ? "Temukan waktu Misa di paroki, gereja, dan kapel Katolik di seluruh Indonesia."
              : "Find Mass times at Catholic parishes, churches, and chapels across Indonesia."}
          </p>

          <div className="mt-4 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-[11px] font-medium text-brand-light">
            <span>
              <span className="text-brand-gold">{nf(totalChurches)}</span>{" "}
              {isId ? "gereja" : "churches"}
            </span>
            <span className="h-3 w-px bg-white/15" />
            <span>
              <span className="text-brand-gold">{nf(totalCities)}</span>{" "}
              {isId ? "kota" : "cities"}
            </span>
            <span className="h-3 w-px bg-white/15" />
            <span>
              <span className="text-brand-gold">{provinces.length}</span>{" "}
              {isId ? "provinsi" : "provinces"}
            </span>
          </div>
        </div>

        {/* Search by name */}
        <form onSubmit={submitSearch} className="mx-auto max-w-lg">
          <div className="group relative rounded-2xl border border-brand-border bg-gradient-to-b from-[#2b2f37] to-[#212429] p-1 transition-colors focus-within:border-brand-gold/50">
            <div className="relative flex items-center">
              <Search className="ml-3 h-4 w-4 shrink-0 text-brand-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  isId
                    ? "Cari nama gereja atau paroki…"
                    : "Search a church or parish name…"
                }
                className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-brand-muted focus:outline-none"
              />
              <button
                type="submit"
                disabled={query.trim().length < 2}
                className="mr-1 inline-flex items-center gap-1.5 rounded-xl bg-brand-gold px-4 py-2 text-xs font-bold text-brand-dark transition-colors hover:bg-brand-gold-hover disabled:opacity-40"
              >
                {isId ? "Cari" : "Search"}
              </button>
            </div>
          </div>
        </form>

        {/* Divider */}
        <div className="mx-auto my-8 flex max-w-lg items-center gap-4">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/15" />
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-brand-muted">
            {isId ? "atau telusuri wilayah" : "or browse by region"}
          </span>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/15" />
        </div>

        {/* Region picker card */}
        <div className="mx-auto max-w-lg rounded-2xl border border-brand-border bg-gradient-to-b from-[#2b2f37] to-[#212429] p-5">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
                {isId ? "Provinsi" : "Province"}
              </label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gold/70" />
                <select
                  value={province}
                  onChange={(e) => {
                    setProvince(e.target.value);
                    setRegency("");
                  }}
                  className="w-full appearance-none rounded-xl border border-white/10 bg-brand-dark/60 py-3 pl-10 pr-9 text-sm text-white transition-colors focus:border-brand-gold focus:outline-none"
                >
                  <option value="">
                    {isId ? "Pilih provinsi" : "Select province"}
                  </option>
                  {provinces.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.name} · {p.count}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
                {isId ? "Kota / Kabupaten" : "City / Regency"}
              </label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gold/70" />
                <select
                  value={regency}
                  onChange={(e) => setRegency(e.target.value)}
                  disabled={!province}
                  className="w-full appearance-none rounded-xl border border-white/10 bg-brand-dark/60 py-3 pl-10 pr-9 text-sm text-white transition-colors focus:border-brand-gold focus:outline-none disabled:opacity-45"
                >
                  <option value="">
                    {province
                      ? isId
                        ? "Pilih kota / kabupaten"
                        : "Select city / regency"
                      : isId
                        ? "Pilih provinsi dulu"
                        : "Choose a province first"}
                  </option>
                  {regencies.map((r) => (
                    <option key={r.slug} value={r.slug}>
                      {r.name} · {r.count}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
              </div>
            </div>

            <button
              onClick={go}
              disabled={!province || !regency}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gold py-3 text-sm font-bold text-brand-dark transition-all hover:bg-brand-gold-hover hover:shadow-glow-gold disabled:opacity-40 disabled:hover:shadow-none"
            >
              {isId ? "Tampilkan Gereja" : "Show Churches"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] text-brand-muted">
          {isId ? "Sumber data: " : "Data source: "}
          <a
            href="https://jadwalmisa.id"
            target="_blank"
            rel="noreferrer"
            className="text-brand-gold/70 underline transition-colors hover:text-brand-gold"
          >
            jadwalmisa.id
          </a>
        </p>
      </div>
    </div>
  );
}
