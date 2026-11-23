"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CREW_ROLES, PETINGGI_ROLES, isKnownRole, roleOrder } from "@/lib/crewRoles";
import { inputCls } from "./ui";

type User = { id: string; full_name: string | null; username: string | null };
type CrewRow = { id: string; name: string | null; position: string | null; user_id: string | null; is_pic?: boolean | null; profiles?: { username: string | null } | null };
type Camp = { branch: string | null; camp_name: string | null; angkatan: string | null; custom_name: string | null };
export type MyLevel = { role: "manager" | "ketua" | "tinggi" | "pic" | "crew" | null; division: string | null };

const db = () => createClient() as any;
const isTinggi = (p: string | null | undefined) => PETINGGI_ROLES.slice(0, 5).includes(String(p ?? "").trim().toLowerCase()) && String(p ?? "").trim().toLowerCase() !== "ketua bidang";

/**
 * Panitia: add people at the top, then the committee as a table in the usual order (Ketua first).
 * Who may change what: an admin of the community everything; the Ketua and Panitia Tinggi everything but the Ketua row;
 * the PIC of a division only their own team; the rest of the crew only reads.
 */
export default function CrewSection({ cohortId, eventId, camp, crew, level, onChanged }: { cohortId: string; eventId: string | null; camp: Camp; crew: CrewRow[]; level: MyLevel; onChanged: () => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [isPic, setIsPic] = useState(false);
  const [othersMode, setOthersMode] = useState(false);
  const [userId, setUserId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [focus, setFocus] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const role = level.role;
  const isLead = role === "manager" || role === "ketua" || role === "tinggi";
  const isPicRole = role === "pic";
  const canAdd = isLead || isPicRole;
  // a PIC only builds the team of their own division
  const myDivision = level.division ?? "";
  const roleChoices = isPicRole ? [myDivision] : role === "manager" ? [...CREW_ROLES] : CREW_ROLES.filter((r) => r !== "Ketua");

  useEffect(() => {
    void db().from("profiles").select("id, full_name, username").order("full_name").limit(5000).then(({ data }: { data: User[] | null }) => { if (data) setUsers(data); });
  }, []);
  useEffect(() => { if (isPicRole && !editingId) setPosition(myDivision); }, [isPicRole, myDivision, editingId]);

  const sorted = useMemo(() => [...crew].sort((a, b) => roleOrder(a.position) - roleOrder(b.position) || Number(!!b.is_pic) - Number(!!a.is_pic) || String(a.name).localeCompare(String(b.name))), [crew]);
  const linked = users.find((u) => u.id === userId);
  const hits = useMemo(() => {
    const q = name.trim().toLowerCase();
    if (!focus || userId || q.length < 2) return [];
    return users.filter((u) => String(u.full_name ?? "").toLowerCase().includes(q) || String(u.username ?? "").toLowerCase().includes(q)).slice(0, 6);
  }, [users, name, focus, userId]);
  const isOthers = !isPicRole && (othersMode || (!!position && !isKnownRole(position)));
  const tinggiPick = isTinggi(position);

  const reset = () => { setName(""); setPosition(isPicRole ? myDivision : ""); setIsPic(false); setOthersMode(false); setUserId(""); setEditingId(null); setError(null); };

  // may this person change this row?
  const canEditRow = (c: CrewRow) => {
    if (role === "manager") return true;
    const p = String(c.position ?? "").trim().toLowerCase();
    if (p === "ketua") return false;
    if (isLead) return true;
    return isPicRole && p === myDivision.trim().toLowerCase();
  };

  async function save() {
    const finalName = name.trim() || linked?.full_name || "";
    if (!finalName || !position.trim()) { setError("Isi nama dan pilih jabatan."); return; }
    setBusy(true); setError(null); setNote(null);
    const row = { name: finalName, position: position.trim(), user_id: userId || null, profile_id: userId || null, is_pic: isPicRole ? false : (isPic && !tinggiPick) };
    const { error: err } = editingId
      ? await db().from("camp_crew").update(row).eq("id", editingId)
      : await db().from("camp_crew").insert({ cohort_id: cohortId, branch: camp.branch, camp: camp.camp_name, angkatan: camp.angkatan, ...row });
    setBusy(false);
    if (err) { setError(/row-level security/i.test(err.message) ? "Kamu tidak punya izin untuk ini. Ketua hanya ditunjuk oleh admin komunitas, dan PIC hanya mengatur timnya sendiri." : err.message); return; }
    reset();
    onChanged();
  }

  async function remove(c: CrewRow) {
    if (!confirm(`Hapus ${c.name} dari panitia?`)) return;
    const { error: err } = await db().from("camp_crew").delete().eq("id", c.id);
    if (err) { setError(err.message); return; }
    onChanged();
  }

  // the Ketua (or an admin) brings an outsider into the community, only while the event runs
  async function addToCommunity(c: CrewRow) {
    if (!eventId || !c.user_id) return;
    if (!confirm(`Tambahkan ${c.name} sebagai anggota komunitas ini?`)) return;
    const { error: err } = await db().rpc("ketua_add_member", { p_event: eventId, p_user: c.user_id });
    if (err) { setError(err.message); return; }
    setNote(`${c.name} sekarang anggota komunitas.`);
  }

  const invite = (c: CrewRow) =>
    `https://wa.me/?text=${encodeURIComponent(`Shalom ${c.name ?? ""}, kamu ditambahkan sebagai ${c.is_pic ? "PIC " : ""}${c.position ?? "panitia"} di ${camp.custom_name || camp.camp_name || "acara ini"}. Unduh aplikasi Ruang Iman dan daftar dengan email ini supaya bisa ikut bertugas: https://apps.ruangiman.com`)}`;

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-white">Panitia</h2>

      {!canAdd && <p className="rounded-xl border border-[#2a2d35] bg-[#14171c] px-4 py-3 text-xs leading-relaxed text-brand-muted">Kamu bisa melihat susunan panitia. Yang menambah atau mengubah panitia adalah Ketua, Wakil Ketua, Sekretaris, Bendahara, dan PIC (untuk timnya).</p>}

      {canAdd && (
        <section className="space-y-4 rounded-2xl border border-[#2a2d35] bg-[#14171c] p-4 md:p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold text-white"><Plus className="h-4 w-4 text-brand-gold" /> {editingId ? "Ubah panitia" : isPicRole ? `Tambah anggota tim ${myDivision}` : "Tambah panitia"}</h3>
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
              <label className="block text-xs font-semibold text-brand-light">{isPicRole ? "Divisi" : "Jabatan / divisi"}</label>
              <select disabled={isPicRole} value={isOthers ? "Others" : position} onChange={(e) => { if (e.target.value === "Others") { setOthersMode(true); setPosition(""); } else { setOthersMode(false); setPosition(e.target.value); } }} className={`${inputCls} disabled:opacity-70`}>
                <option value="">-- Pilih --</option>
                {roleChoices.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              {isOthers && <input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Tulis jabatan" className={inputCls} />}
              {isLead && position && !tinggiPick && (
                <label className="flex items-center gap-2 pt-1 text-xs text-brand-light"><input type="checkbox" checked={isPic} onChange={(e) => setIsPic(e.target.checked)} className="accent-[#D6B072]" /> Jadikan PIC divisi ini (bisa membuat rapat dan to do)</label>
              )}
            </div>
            <div className="flex gap-2 md:pt-[22px]">
              {editingId && <button type="button" onClick={reset} className="rounded-lg border border-[#333] px-4 py-2.5 text-sm font-semibold text-brand-light hover:bg-white/5">Batal</button>}
              <button type="button" onClick={save} disabled={busy} className="rounded-lg bg-brand-gold px-5 py-2.5 text-sm font-bold text-brand-dark hover:opacity-90 disabled:opacity-50">{busy ? "Menyimpan..." : editingId ? "Simpan" : "Tambah"}</button>
            </div>
          </div>
          {error && <p className="text-xs text-red-300">{error}</p>}
        </section>
      )}
      {!canAdd && error && <p className="text-xs text-red-300">{error}</p>}
      {note && <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">{note}</p>}

      {/* the committee as a table */}
      <div className="overflow-x-auto rounded-2xl border border-[#2a2d35] bg-[#14171c]">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#2a2d35] bg-black/20 text-[11px] font-bold uppercase tracking-wider text-brand-muted">
              <th className="w-12 px-4 py-3">No</th>
              <th className="px-4 py-3">Jabatan</th>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Akun Ruang Iman</th>
              <th className="w-28 px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2d35]">
            {sorted.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-brand-muted">Belum ada panitia.</td></tr>}
            {sorted.map((c, i) => (
              <tr key={c.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-xs text-brand-muted">{i + 1}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-brand-gold/10 px-2.5 py-1 text-xs font-bold text-brand-gold">{c.is_pic ? `PIC ${c.position}` : c.position}</span></td>
                <td className="px-4 py-3 font-semibold text-white">{c.name}</td>
                <td className="px-4 py-3">
                  {c.user_id || c.profiles?.username
                    ? <span className="rounded border border-[#444] bg-[#222] px-2 py-1 text-xs text-gray-300">@{c.profiles?.username ?? "akun"}</span>
                    : canAdd
                      ? <a href={invite(c)} target="_blank" rel="noopener noreferrer" className="inline-block rounded-lg border border-emerald-500/50 px-2.5 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/10">Belum punya akun · Ajak</a>
                      : <span className="text-xs text-brand-muted">Belum punya akun</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {eventId && c.user_id && (role === "manager" || role === "ketua") && (
                      <button onClick={() => void addToCommunity(c)} aria-label={`Jadikan ${c.name} anggota komunitas`} title="Tambahkan ke komunitas" className="rounded p-1.5 text-[#777] hover:bg-[#222] hover:text-emerald-300"><UserPlus className="h-4 w-4" /></button>
                    )}
                    {canEditRow(c) && (
                      <>
                        <button onClick={() => { setEditingId(c.id); setName(c.name ?? ""); setPosition(c.position ?? ""); setIsPic(!!c.is_pic); setOthersMode(!isKnownRole(c.position)); setUserId(c.user_id ?? ""); window.scrollTo({ top: 0, behavior: "smooth" }); }} aria-label={`Ubah ${c.name}`} className="rounded p-1.5 text-[#777] hover:bg-[#222] hover:text-brand-gold"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => void remove(c)} aria-label={`Hapus ${c.name}`} className="rounded p-1.5 text-[#777] hover:bg-red-400/10 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                      </>
                    )}
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
