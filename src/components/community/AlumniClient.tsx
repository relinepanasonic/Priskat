"use client";

import { useMemo, useState } from "react";
import { MessageCircle, Search } from "lucide-react";

export type Alumnus = {
  id: string; program: "WB" | "YW" | "YM" | "PS" | "PT"; angkatan: string | null; full_name: string; nickname: string | null;
  city: string | null; province: string | null; phone: string | null; phone2: string | null;
  paroki_group: string | null; paroki: string | null; claimed_user_id: string | null;
};

const PROGRAMS: { key: Alumnus["program"]; label: string }[] = [
  { key: "PS", label: "Priskat" },
  { key: "WB", label: "Waberkat" },
  { key: "YW", label: "Young Women" },
  { key: "YM", label: "Young Men" },
  { key: "PT", label: "Patriot" },
];
const th = "px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-brand-muted whitespace-nowrap";
const td = "px-3 py-3 text-sm text-brand-light";
const wa = (phone: string) => `https://wa.me/62${phone.replace(/^0/, "")}`;

/** Alumni of the camps of one community: a table per camp, with search and an angkatan filter. */
export default function AlumniClient({ rows, communityName }: { rows: Alumnus[]; communityName: string }) {
  const [program, setProgram] = useState<Alumnus["program"]>("PS");
  const [angkatan, setAngkatan] = useState("");
  const [q, setQ] = useState("");

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    rows.forEach((r) => { c[r.program] = (c[r.program] ?? 0) + 1; });
    return c;
  }, [rows]);

  const inProgram = useMemo(() => rows.filter((r) => r.program === program), [rows, program]);
  const angkatans = useMemo(
    () => [...new Set(inProgram.map((r) => r.angkatan).filter(Boolean) as string[])].sort((a, b) => Number(a) - Number(b)),
    [inProgram],
  );
  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return inProgram.filter((r) =>
      (!angkatan || r.angkatan === angkatan) &&
      (!term || [r.full_name, r.nickname, r.city, r.paroki, r.paroki_group, r.phone].some((v) => v?.toLowerCase().includes(term))));
  }, [inProgram, angkatan, q]);

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div>
        <h2 className="text-xl font-bold text-white">Alumni Camp</h2>
        <p className="mt-0.5 text-sm text-brand-muted">{communityName}: {rows.length} alumni. Data ini hanya bisa dilihat admin komunitas.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {PROGRAMS.map((p) => (
          <button
            key={p.key}
            onClick={() => { setProgram(p.key); setAngkatan(""); }}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${program === p.key ? "bg-brand-gold text-brand-dark" : "border border-[#333] text-brand-muted hover:text-white"}`}
          >
            {p.label} <span className="opacity-70">{counts[p.key] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama, kota, paroki, atau nomor HP" className="w-full rounded-lg border border-[#333] bg-[#14171c] py-2.5 pl-9 pr-3 text-sm text-white focus:border-brand-gold focus:outline-none" />
        </div>
        <select value={angkatan} onChange={(e) => setAngkatan(e.target.value)} className="rounded-lg border border-[#333] bg-[#14171c] px-3 py-2.5 text-sm text-white sm:w-48">
          <option value="">{program === "PT" ? "Semua P" : "Semua angkatan"}</option>
          {angkatans.map((a) => <option key={a} value={a}>{program === "PT" ? "P" : "Angkatan"} {a}</option>)}
        </select>
      </div>

      <p className="text-xs text-brand-muted">{shown.length} dari {inProgram.length}</p>

      {/* Phone: cards, no sideways scrolling */}
      <div className="space-y-2.5 md:hidden">
        {shown.length === 0 && <p className="rounded-2xl border border-[#2a2d35] px-3 py-10 text-center text-sm text-brand-muted">Tidak ada data.</p>}
        {shown.map((r) => (
          <div key={r.id} className="rounded-2xl border border-[#2a2d35] bg-[#14171c] p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-white">{r.full_name}{r.nickname ? <span className="font-normal text-brand-muted"> ({r.nickname})</span> : null}</p>
                <p className="text-xs text-brand-muted">{[r.angkatan ? `${program === "PT" ? "P" : "Angkatan"} ${r.angkatan}` : null, r.city].filter(Boolean).join(" · ")}</p>
              </div>
              {r.claimed_user_id && <span className="shrink-0 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">di Ruang Iman</span>}
            </div>
            {(r.paroki ?? r.paroki_group) && <p className="mt-1.5 text-xs text-brand-light">{r.paroki ?? r.paroki_group}</p>}
            {(r.phone || r.phone2) && (
              <div className="mt-2.5 border-t border-[#2a2d35] pt-2.5">
                {r.phone
                  ? <a href={wa(r.phone)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-gold"><MessageCircle className="h-4 w-4" /> {r.phone}</a>
                  : <span className="text-sm text-brand-muted">{r.phone2}</span>}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-[#2a2d35] md:block">
        <table className="w-full min-w-[760px]">
          <thead className="bg-[#14171c]">
            <tr>
              <th className={th}>Nama</th><th className={th}>Panggilan</th><th className={th}>{program === "PT" ? "P" : "Angkatan"}</th>
              <th className={th}>Kota</th><th className={th}>Paroki</th><th className={th}>No HP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2d35]">
            {shown.map((r) => (
              <tr key={r.id} className="hover:bg-white/[0.03]">
                <td className={`${td} font-semibold text-white`}>
                  {r.full_name}
                  {r.claimed_user_id && <span className="ml-2 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">di Ruang Iman</span>}
                </td>
                <td className={td}>{r.nickname ?? ""}</td>
                <td className={td}>{r.angkatan ?? ""}</td>
                <td className={td}>{r.city ?? ""}</td>
                <td className={`${td} max-w-[260px]`}>{r.paroki ?? r.paroki_group ?? ""}</td>
                <td className={`${td} whitespace-nowrap`}>
                  {r.phone ? (
                    <a href={wa(r.phone)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-brand-gold hover:underline">
                      <MessageCircle className="h-3.5 w-3.5" /> {r.phone}
                    </a>
                  ) : <span className="text-brand-muted">{r.phone2 ?? ""}</span>}
                </td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan={6} className="px-3 py-10 text-center text-sm text-brand-muted">Tidak ada data.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
