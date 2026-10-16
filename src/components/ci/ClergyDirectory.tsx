"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Plus, Search, Trash2, X, Loader2, MapPin, Church } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const GOLD = "#D6B072";
const serif = { fontFamily: "'Lora', Georgia, serif" };

export const CLERGY_TITLES: Record<string, string> = {
  romo: "Romo", uskup: "Uskup", diakon: "Diakon", frater: "Frater", suster: "Suster", bruder: "Bruder",
};

export type ClergyRow = {
  user_id: string;
  title: string;
  congregation: string | null;
  parish: string | null;
  profile: { id: string; full_name: string | null; nama_panggilan: string | null; avatar_url: string | null; kota: string | null } | null;
  diocese: { name: string } | null;
};

export function ClergyBadge({ title }: { title: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
      style={{ background: `${GOLD}22`, color: GOLD, border: `1px solid ${GOLD}55` }}
    >
      <BadgeCheck className="h-3 w-3" />
      {CLERGY_TITLES[title] ?? title}
    </span>
  );
}

export default function ClergyDirectory({
  clergy, canEdit, dioceses,
}: { clergy: ClergyRow[]; canEdit: boolean; dioceses: { id: string; name: string }[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return clergy.filter((c) =>
      !s || [c.profile?.full_name, c.parish, c.congregation, c.diocese?.name].some((v) => (v ?? "").toLowerCase().includes(s))
    );
  }, [clergy, q]);

  const remove = async (c: ClergyRow) => {
    if (!confirm(`Hapus gelar ${CLERGY_TITLES[c.title] ?? c.title} dari ${c.profile?.full_name}?`)) return;
    const { error } = await createClient().from("clergy" as any).delete().eq("user_id", c.user_id);
    if (error) alert(error.message);
    else router.refresh();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama, paroki, tarekat, atau keuskupan…"
            className="w-full rounded-2xl border border-[#333] bg-[#111] py-3 pl-11 pr-4 text-sm text-white placeholder-brand-muted focus:border-[#D6B072]/60 focus:outline-none"
          />
        </div>
        {canEdit && (
          <button onClick={() => setAdding(true)} className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-[#121417]" style={{ background: GOLD }}>
            <Plus className="h-4 w-4" />Tambah Romo
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <div className="rounded-3xl border border-white/5 bg-[#1a1d24] py-14 text-center">
          <BadgeCheck className="mx-auto h-10 w-10 opacity-30" style={{ color: GOLD }} />
          <p className="mt-3 text-white">Belum ada romo terdaftar</p>
          <p className="text-sm text-brand-muted">{canEdit ? "Tambahkan romo dari anggota Ruang Iman." : "Para romo akan tampil di sini."}</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => (
            <article key={c.user_id} className="relative flex gap-3 rounded-2xl bg-[#1a1d24] p-4" style={{ border: `1px solid ${GOLD}26` }}>
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full" style={{ border: `2px solid ${GOLD}` , boxShadow: `0 0 14px ${GOLD}44` }}>
                {c.profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.profile.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#121417] text-lg font-semibold" style={{ color: GOLD }}>
                    {(c.profile?.full_name ?? "?")[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <ClergyBadge title={c.title} />
                <h4 className="mt-1 font-semibold leading-snug text-white" style={serif}>
                  {c.profile?.full_name ?? "—"}{c.congregation ? `, ${c.congregation}` : ""}
                </h4>
                <div className="mt-1 space-y-0.5 text-xs text-brand-muted">
                  {c.parish && <p className="flex items-center gap-1.5"><Church className="h-3.5 w-3.5" />{c.parish}</p>}
                  {(c.diocese?.name || c.profile?.kota) && (
                    <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{c.diocese?.name ?? c.profile?.kota}</p>
                  )}
                </div>
              </div>
              {canEdit && (
                <button onClick={() => remove(c)} aria-label="Hapus" className="absolute right-3 top-3 rounded-full p-1.5 text-brand-muted hover:bg-white/5 hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </article>
          ))}
        </div>
      )}

      {adding && <AddClergy dioceses={dioceses} onClose={() => setAdding(false)} />}
    </div>
  );
}

function AddClergy({ dioceses, onClose }: { dioceses: { id: string; name: string }[]; onClose: () => void }) {
  const router = useRouter();
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<{ id: string; full_name: string | null; avatar_url: string | null }[]>([]);
  const [picked, setPicked] = useState<{ id: string; full_name: string | null } | null>(null);
  const [form, setForm] = useState({ title: "romo", congregation: "", parish: "", diocese_id: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = term.trim();
    if (t.length < 2) { setResults([]); return; }
    const h = setTimeout(async () => {
      const { data } = await createClient().from("profiles").select("id, full_name, avatar_url").ilike("full_name", `%${t}%`).limit(8);
      setResults((data as any[]) ?? []);
    }, 250);
    return () => clearTimeout(h);
  }, [term]);

  const save = async () => {
    if (!picked) return;
    setSaving(true);
    setError("");
    const { error } = await createClient().from("clergy" as any).upsert({
      user_id: picked.id,
      title: form.title,
      congregation: form.congregation.trim() || null,
      parish: form.parish.trim() || null,
      diocese_id: form.diocese_id || null,
    });
    setSaving(false);
    if (error) return setError(error.message);
    onClose();
    router.refresh();
  };

  const input = "mt-1 w-full rounded-xl border border-[#333] bg-black/30 px-3 py-2 text-sm text-white focus:border-[#D6B072]/60 focus:outline-none";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-[#1a1d24] p-5 sm:rounded-3xl" style={{ border: `1px solid ${GOLD}40` }}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-white" style={serif}>Tambah Romo</h3>
          <button onClick={onClose} aria-label="Tutup" className="rounded-full p-1.5 text-brand-muted hover:text-white"><X className="h-4 w-4" /></button>
        </div>

        {!picked ? (
          <>
            <label className="block text-xs text-brand-muted">Cari anggota
              <input autoFocus value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Ketik nama…" className={input} />
            </label>
            <ul className="mt-3 space-y-1">
              {results.map((r) => (
                <li key={r.id}>
                  <button onClick={() => setPicked(r)} className="w-full rounded-xl px-3 py-2 text-left text-sm text-white hover:bg-white/5">{r.full_name}</button>
                </li>
              ))}
              {term.trim().length >= 2 && results.length === 0 && <li className="px-3 py-2 text-sm text-brand-muted">Tidak ditemukan. Anggota harus punya akun Ruang Iman.</li>}
            </ul>
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-black/30 px-3 py-2 text-sm text-white">
              {picked.full_name}
              <button onClick={() => setPicked(null)} className="text-xs text-brand-muted hover:text-white">Ganti</button>
            </div>
            <label className="block text-xs text-brand-muted">Gelar
              <select value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={input}>
                {Object.entries(CLERGY_TITLES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
            <label className="block text-xs text-brand-muted">Tarekat / Projo
              <input value={form.congregation} onChange={(e) => setForm((f) => ({ ...f, congregation: e.target.value }))} placeholder="SJ, OFM, Pr, …" className={input} />
            </label>
            <label className="block text-xs text-brand-muted">Paroki / tempat tugas
              <input value={form.parish} onChange={(e) => setForm((f) => ({ ...f, parish: e.target.value }))} className={input} />
            </label>
            <label className="block text-xs text-brand-muted">Keuskupan
              <select value={form.diocese_id} onChange={(e) => setForm((f) => ({ ...f, diocese_id: e.target.value }))} className={input}>
                <option value="">—</option>
                {dioceses.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </label>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button onClick={save} disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold text-[#121417] disabled:opacity-50" style={{ background: GOLD }}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}Simpan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
