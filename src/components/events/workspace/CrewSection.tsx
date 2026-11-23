"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CREW_ROLES, isKnownRole, roleOrder } from "@/lib/crewRoles";
import { inputCls } from "./ui";

type User = { id: string; full_name: string | null; username: string | null };
type CrewRow = { id: string; name: string | null; position: string | null; user_id: string | null; profiles?: { username: string | null } | null };
type Camp = { branch: string | null; camp_name: string | null; angkatan: string | null; custom_name: string | null };

const db = () => createClient() as any;

/** Panitia: add people at the top, then the committee as a table in the usual order (Ketua first). */
export default function CrewSection({ cohortId, camp, crew, onChanged }: { cohortId: string; camp: Camp; crew: CrewRow[]; onChanged: () => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [othersMode, setOthersMode] = useState(false);
  const [userId, setUserId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [focus, setFocus] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void db().from("profiles").select("id, full_name, username").order("full_name").limit(5000).then(({ data }: { data: User[] | null }) => { if (data) setUsers(data); });
  }, []);

  const sorted = useMemo(() => [...crew].sort((a, b) => roleOrder(a.position) - roleOrder(b.position) || String(a.name).localeCompare(String(b.name))), [crew]);
  const linked = users.find((u) => u.id === userId);
  const hits = useMemo(() => {
    const q = name.trim().toLowerCase();
    if (!focus || userId || q.length < 2) return [];
    return users.filter((u) => String(u.full_name ?? "").toLowerCase().includes(q) || String(u.username ?? "").toLowerCase().includes(q)).slice(0, 6);
  }, [users, name, focus, userId]);
  const isOthers = othersMode || (!!position && !isKnownRole(position));

  const reset = () => { setName(""); setPosition(""); setOthersMode(false); setUserId(""); setEditingId(null); setError(null); };

  async function save() {
    const finalName = name.trim() || linked?.full_name || "";
    if (!finalName || !position.trim()) { setError("Isi nama dan pilih jabatan."); return; }
    setBusy(true); setError(null);
    const row = { name: finalName, position: position.trim(), user_id: userId || null, profile_id: userId || null };
    const { error: err } = editingId
      ? await db().from("camp_crew").update(row).eq("id", editingId)
      : await db().from("camp_crew").insert({ cohort_id: cohortId, branch: camp.branch, camp: camp.camp_name, angkatan: camp.angkatan, ...row });
    setBusy(false);
    if (err) { setError(err.message); return; }
    reset();
    onChanged();
  }

  async function remove(c: CrewRow) {
    if (!confirm(`Hapus ${c.name} dari panitia?`)) return;
    const { error: err } = await db().from("camp_crew").delete().eq("id", c.id);
    if (err) { setError(err.message); return; }
    onChanged();
  }

  const invite = (c: CrewRow) =>
    `https://wa.me/?text=${encodeURIComponent(`Shalom ${c.name ?? ""}, kamu ditambahkan sebagai ${c.position ?? "panitia"} di ${camp.custom_name || camp.camp_name || "acara ini"}. Unduh aplikasi Ruang Iman dan daftar dengan email ini supaya bisa ikut bertugas: https://apps.ruangiman.com`)}`;

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-white">Panitia</h2>

      {/* add people at the top */}
      <section className="space-y-4 rounded-2xl border border-[#2a2d35] bg-[#14171c] p-4 md:p-5">
        <h3 className="flex items-center gap-2 text-sm font-bold text-white"><Plus className="h-4 w-4 text-brand-gold" /> {editingId ? "Ubah panitia" : "Tambah panitia"}</h3>
        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr_auto] md:items-start">
          <div className="relative space-y-1.5">
            <label className="block text-xs font-semibold text-brand-light">Nama</label>
            {linked && (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-200">
                <span className="truncate">Terhubung ke @{linked.username ?? "akun"}</span>
                <button type="button" onClick={() => setUserId("")} className="shrink-0 font-semibold hover:text-white">Lepas</button>
              </div>
            )}
            <input value={name} onChange={(e) => { setName(e.target.value); setUserId(""); }} onFocus={() => setFocus(true)} onBlur={() => setTimeout(() => setFocus(false), 150)}
              placeholder="Ketik nama, lalu pilih akunnya" autoComplete="off" className={inputCls} />
            {hits.length > 0 && (
              <ul className="absolute left-0 right-0 z-20 mt-1 max-h-64 overflow-y-auto rounded-xl border border-[#333] bg-[#14171c] p-1 shadow-xl">
                {hits.map((u) => (
                  <li key={u.id}>
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { setUserId(u.id); setName(u.full_name ?? ""); setFocus(false); }}
                      className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-200 hover:bg-white/5">
                      <span className="truncate">{u.full_name}</span><span className="shrink-0 text-xs text-brand-muted">@{u.username}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-[11px] text-brand-muted">Belum punya akun? Ketik namanya saja, lalu klik Ajak di tabel.</p>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-brand-light">Jabatan</label>
            <select value={isOthers ? "Others" : position} onChange={(e) => { if (e.target.value === "Others") { setOthersMode(true); setPosition(""); } else { setOthersMode(false); setPosition(e.target.value); } }} className={inputCls}>
              <option value="">-- Pilih jabatan --</option>
              {CREW_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            {isOthers && <input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Tulis jabatan" className={inputCls} />}
          </div>
          <div className="flex gap-2 md:pt-[22px]">
            {editingId && <button type="button" onClick={reset} className="rounded-lg border border-[#333] px-4 py-2.5 text-sm font-semibold text-brand-light hover:bg-white/5">Batal</button>}
            <button type="button" onClick={save} disabled={busy} className="rounded-lg bg-brand-gold px-5 py-2.5 text-sm font-bold text-brand-dark hover:opacity-90 disabled:opacity-50">{busy ? "Menyimpan..." : editingId ? "Simpan" : "Tambah"}</button>
          </div>
        </div>
        {error && <p className="text-xs text-red-300">{error}</p>}
      </section>

      {/* the committee as a table */}
      <div className="overflow-x-auto rounded-2xl border border-[#2a2d35] bg-[#14171c]">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#2a2d35] bg-black/20 text-[11px] font-bold uppercase tracking-wider text-brand-muted">
              <th className="w-12 px-4 py-3">No</th>
              <th className="px-4 py-3">Jabatan</th>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Akun Ruang Iman</th>
              <th className="w-24 px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2d35]">
            {sorted.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-brand-muted">Belum ada panitia. Tambahkan di atas.</td></tr>}
            {sorted.map((c, i) => (
              <tr key={c.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-xs text-brand-muted">{i + 1}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-brand-gold/10 px-2.5 py-1 text-xs font-bold text-brand-gold">{c.position}</span></td>
                <td className="px-4 py-3 font-semibold text-white">{c.name}</td>
                <td className="px-4 py-3">
                  {c.user_id || c.profiles?.username
                    ? <span className="rounded border border-[#444] bg-[#222] px-2 py-1 text-xs text-gray-300">@{c.profiles?.username ?? "akun"}</span>
                    : <a href={invite(c)} target="_blank" rel="noopener noreferrer" className="inline-block rounded-lg border border-emerald-500/50 px-2.5 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/10">Belum punya akun · Ajak</a>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => { setEditingId(c.id); setName(c.name ?? ""); setPosition(c.position ?? ""); setOthersMode(!isKnownRole(c.position)); setUserId(c.user_id ?? ""); window.scrollTo({ top: 0, behavior: "smooth" }); }} aria-label={`Ubah ${c.name}`} className="rounded p-1.5 text-[#777] hover:bg-[#222] hover:text-brand-gold"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => void remove(c)} aria-label={`Hapus ${c.name}`} className="rounded p-1.5 text-[#777] hover:bg-red-400/10 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
