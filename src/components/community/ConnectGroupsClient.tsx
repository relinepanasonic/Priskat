"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, Palette, Pencil, Plus, Trash2, Users, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const GOLD = "#D6B072";
const DAYS = ["", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
const PRESETS = ["#D6B072", "#38BDF8", "#34D399", "#F472B6", "#A78BFA", "#FB923C", "#F87171", "#FACC15"];

type Role = "pic" | "pengurus" | "anggota";
type CG = { id: string; name: string; address: string | null; event_day: number | null; event_time: string | null };
type Member = { id: string; cg_id: string; user_id: string | null; role: Role; name: string; baptism_name: string | null; priskat_ke: string | null; phone: string | null; address: string | null; joined_at: string };
type Log = { id: string; cg_id: string; event_date: string; attendees: number; title: string; memo: string | null };
type Colors = { pic_color: string; pengurus_color: string };
type Account = { user_id: string; name: string };

const input = "w-full rounded-lg border border-[#333] bg-[#14171c] px-3 py-2.5 text-sm text-white focus:border-brand-gold focus:outline-none";
const th = "px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-brand-muted whitespace-nowrap";
const td = "px-3 py-3 text-sm text-brand-light";
const hhmm = (t: string | null) => (t ? t.slice(0, 5) : "");
const fmtDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
const db = () => createClient() as any;

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/70 md:items-center" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="relative max-h-[90vh] w-full max-w-md space-y-3 overflow-y-auto rounded-t-3xl border border-[#333] bg-[#1a1d24] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:rounded-3xl">
        <button onClick={onClose} aria-label="Tutup" className="absolute right-3 top-3 rounded-full p-1.5 text-gray-400 hover:bg-white/10"><X className="h-5 w-5" /></button>
        <h3 className="pr-8 text-lg font-bold text-white">{title}</h3>
        {children}
      </div>
    </div>
  );
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div><label className="mb-1 block text-xs text-brand-muted">{label}</label>{children}</div>
);

/**
 * Connect Groups of one community: the list, a group's anggota, and its event log.
 * Community admins manage everything; the PIC and pengurus of a group manage its anggota and log.
 * The database (RLS) decides what each person may see, this screen only hides what they cannot use.
 */
export default function ConnectGroupsClient({ communityId, communityName, isAdmin }: { communityId: string; communityName: string; isAdmin: boolean }) {
  const [groups, setGroups] = useState<CG[] | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [colors, setColors] = useState<Colors>({ pic_color: PRESETS[0], pengurus_color: PRESETS[1] });
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [view, setView] = useState<"anggota" | "log">("anggota");
  const [modal, setModal] = useState<null | { kind: "cg"; cg?: CG } | { kind: "member"; member?: Member } | { kind: "log"; log?: Log } | { kind: "colors" }>(null);

  const load = useCallback(async () => {
    setError(null);
    const g = await db().from("connect_groups").select("id, name, address, event_day, event_time").eq("community_id", communityId).order("name");
    if (g.error) {
      setGroups([]);
      setError(g.error.message.includes("does not exist") || g.error.code === "42P01" ? "Fitur ini belum aktif. Jalankan supabase/105_connect_groups.sql di Supabase." : g.error.message);
      return;
    }
    const list = (g.data ?? []) as CG[];
    setGroups(list);
    const ids = list.map((x) => x.id);
    if (ids.length) {
      const [m, l] = await Promise.all([
        db().from("connect_group_members").select("id, cg_id, user_id, role, name, baptism_name, priskat_ke, phone, address, joined_at").in("cg_id", ids).order("joined_at"),
        db().from("connect_group_logs").select("id, cg_id, event_date, attendees, title, memo").in("cg_id", ids).order("event_date", { ascending: false }),
      ]);
      setMembers((m.data ?? []) as Member[]);
      setLogs((l.data ?? []) as Log[]);
    } else {
      setMembers([]);
      setLogs([]);
    }
    const c = await db().from("connect_group_colors").select("pic_color, pengurus_color").eq("community_id", communityId).maybeSingle();
    if (c.data) setColors(c.data as Colors);
  }, [communityId]);

  useEffect(() => { void load(); }, [load]);

  const open = groups?.find((x) => x.id === openId) ?? null;
  const roleColor = (r: Role) => (r === "pic" ? colors.pic_color : r === "pengurus" ? colors.pengurus_color : null);
  const picNames = (cgId: string) => members.filter((m) => m.cg_id === cgId && m.role === "pic").map((m) => m.name).join(", ") || "-";

  async function removeRow(table: string, id: string, what: string) {
    if (!confirm(`Hapus ${what}?`)) return;
    const { error: e } = await db().from(table).delete().eq("id", id);
    if (e) { setError(e.message); return; }
    if (table === "connect_groups") setOpenId(null);
    void load();
  }

  if (groups === null) return <p className="p-6 text-sm text-brand-muted">Memuat…</p>;

  // ───────────────────────── detail of one group ─────────────────────────
  if (open) {
    const mine = members.filter((m) => m.cg_id === open.id);
    const myLogs = logs.filter((l) => l.cg_id === open.id);
    return (
      <div className="space-y-4 p-4 md:p-6">
        <button onClick={() => setOpenId(null)} className="flex items-center gap-1 text-sm text-brand-muted hover:text-white"><ChevronLeft className="h-4 w-4" /> Semua Connect Group</button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white">{open.name}</h2>
            <p className="mt-0.5 text-sm text-brand-muted">
              {[open.event_day ? DAYS[open.event_day] : null, hhmm(open.event_time) || null].filter(Boolean).join(" · ") || "Jadwal belum diisi"}
              {open.address ? ` · ${open.address}` : ""}
            </p>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <button onClick={() => setModal({ kind: "cg", cg: open })} className="flex items-center gap-1.5 rounded-lg border border-[#333] px-3 py-2 text-xs font-semibold text-brand-light hover:bg-white/5"><Pencil className="h-3.5 w-3.5" /> Ubah</button>
              <button onClick={() => removeRow("connect_groups", open.id, `CG ${open.name} beserta anggota dan lognya`)} className="flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/10"><Trash2 className="h-3.5 w-3.5" /> Hapus</button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-xl border border-[#333] bg-[#14171c] p-1">
            {(["anggota", "log"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} className={`rounded-lg px-4 py-2 text-xs font-bold transition ${view === v ? "bg-brand-gold text-brand-dark" : "text-brand-muted hover:text-white"}`}>
                {v === "anggota" ? `Anggota (${mine.length})` : `Log Event (${myLogs.length})`}
              </button>
            ))}
          </div>
          <button
            onClick={() => setModal(view === "anggota" ? { kind: "member" } : { kind: "log" })}
            className="flex items-center gap-1.5 rounded-lg bg-brand-gold px-3.5 py-2 text-xs font-bold text-brand-dark active:scale-95"
          >
            <Plus className="h-4 w-4" /> {view === "anggota" ? "Tambah anggota" : "Tambah log event"}
          </button>
        </div>

        {error && <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}

        {view === "anggota" ? (
          <div className="overflow-x-auto rounded-xl border border-[#2a2d35]">
            <table className="w-full min-w-[760px]">
              <thead className="bg-[#14171c]"><tr>
                <th className={th}>Nama</th><th className={th}>Nama Baptis</th><th className={th}>Priskat ke</th><th className={th}>No HP</th><th className={th}>Alamat</th><th className={th}>Join Since</th><th className={th} />
              </tr></thead>
              <tbody>
                {mine.length === 0 && <tr><td colSpan={7} className="px-3 py-8 text-center text-sm text-brand-muted">Belum ada anggota.</td></tr>}
                {mine.map((m) => {
                  const c = roleColor(m.role);
                  return (
                    <tr key={m.id} className="border-t border-[#2a2d35]" style={c ? { boxShadow: `inset 3px 0 0 ${c}`, background: `${c}12` } : undefined}>
                      <td className={td}>
                        <span className="font-semibold text-white">{m.name}</span>
                        {c && <span className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase" style={{ background: `${c}2e`, color: c }}>{m.role === "pic" ? "PIC" : "Pengurus"}</span>}
                      </td>
                      <td className={td}>{m.baptism_name || "-"}</td>
                      <td className={td}>{m.priskat_ke || "-"}</td>
                      <td className={td}>{m.phone || "-"}</td>
                      <td className={`${td} max-w-[220px] truncate`}>{m.address || "-"}</td>
                      <td className={`${td} whitespace-nowrap`}>{fmtDate(m.joined_at)}</td>
                      <td className={`${td} whitespace-nowrap text-right`}>
                        {(isAdmin || m.role === "anggota") && (
                          <>
                            <button aria-label="Ubah" onClick={() => setModal({ kind: "member", member: m })} className="rounded-full p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"><Pencil className="h-4 w-4" /></button>
                            <button aria-label="Hapus" onClick={() => removeRow("connect_group_members", m.id, m.name)} className="rounded-full p-1.5 text-gray-400 hover:bg-white/10 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#2a2d35]">
            <table className="w-full min-w-[640px]">
              <thead className="bg-[#14171c]"><tr>
                <th className={th}>Nama CG</th><th className={th}>Date</th><th className={th}>Qtt Datang</th><th className={th}>Event Title</th><th className={th}>Memo CG</th><th className={th} />
              </tr></thead>
              <tbody>
                {myLogs.length === 0 && <tr><td colSpan={6} className="px-3 py-8 text-center text-sm text-brand-muted">Belum ada log event.</td></tr>}
                {myLogs.map((l) => (
                  <tr key={l.id} className="border-t border-[#2a2d35]">
                    <td className={`${td} font-semibold text-white`}>{open.name}</td>
                    <td className={`${td} whitespace-nowrap`}>{fmtDate(l.event_date)}</td>
                    <td className={td}>{l.attendees}</td>
                    <td className={td}>{l.title}</td>
                    <td className={`${td} max-w-[260px]`}>{l.memo || "-"}</td>
                    <td className={`${td} whitespace-nowrap text-right`}>
                      <button aria-label="Ubah" onClick={() => setModal({ kind: "log", log: l })} className="rounded-full p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"><Pencil className="h-4 w-4" /></button>
                      <button aria-label="Hapus" onClick={() => removeRow("connect_group_logs", l.id, "log ini")} className="rounded-full p-1.5 text-gray-400 hover:bg-white/10 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {modal?.kind === "member" && <MemberForm cg={open} communityId={communityId} isAdmin={isAdmin} member={modal.member} onClose={() => setModal(null)} onSaved={() => { setModal(null); void load(); }} />}
        {modal?.kind === "log" && <LogForm cg={open} log={modal.log} onClose={() => setModal(null)} onSaved={() => { setModal(null); void load(); }} />}
        {modal?.kind === "cg" && <CGForm communityId={communityId} cg={modal.cg} onClose={() => setModal(null)} onSaved={() => { setModal(null); void load(); }} />}
      </div>
    );
  }

  // ───────────────────────── list of groups ─────────────────────────
  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Connect Group</h2>
          <p className="text-sm text-brand-muted">{communityName} · {groups.length} CG</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <button onClick={() => setModal({ kind: "colors" })} className="flex items-center gap-1.5 rounded-lg border border-[#333] px-3 py-2 text-xs font-semibold text-brand-light hover:bg-white/5"><Palette className="h-3.5 w-3.5" /> Warna PIC dan Pengurus</button>
            <button onClick={() => setModal({ kind: "cg" })} className="flex items-center gap-1.5 rounded-lg bg-brand-gold px-3.5 py-2 text-xs font-bold text-brand-dark active:scale-95"><Plus className="h-4 w-4" /> Tambah CG</button>
          </div>
        )}
      </div>

      {error && <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}

      <div className="overflow-x-auto rounded-xl border border-[#2a2d35]">
        <table className="w-full min-w-[720px]">
          <thead className="bg-[#14171c]"><tr>
            <th className={th}>No</th><th className={th}>CG Name</th><th className={th}>PIC</th><th className={th}>Qtt Anggota</th><th className={th}>Alamat</th><th className={th}>Day Event</th><th className={th}>Time Event</th>
          </tr></thead>
          <tbody>
            {groups.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-10 text-center text-sm text-brand-muted"><Users className="mx-auto mb-2 h-6 w-6" />{isAdmin ? "Belum ada Connect Group. Tekan Tambah CG." : "Kamu belum menjadi PIC atau pengurus Connect Group."}</td></tr>
            )}
            {groups.map((g, i) => (
              <tr key={g.id} onClick={() => { setOpenId(g.id); setView("anggota"); setError(null); }} className="cursor-pointer border-t border-[#2a2d35] transition-colors hover:bg-white/5">
                <td className={td}>{i + 1}</td>
                <td className={`${td} font-semibold text-white`}>{g.name}</td>
                <td className={td}>{picNames(g.id)}</td>
                <td className={td}>{members.filter((m) => m.cg_id === g.id).length}</td>
                <td className={`${td} max-w-[240px] truncate`}>{g.address || "-"}</td>
                <td className={td}>{g.event_day ? DAYS[g.event_day] : "-"}</td>
                <td className={td}>{hhmm(g.event_time) || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {groups.length > 0 && <p className="text-[11px] text-brand-muted">Ketuk satu CG untuk melihat anggota dan log event.</p>}

      {modal?.kind === "cg" && <CGForm communityId={communityId} cg={modal.cg} onClose={() => setModal(null)} onSaved={() => { setModal(null); void load(); }} />}
      {modal?.kind === "colors" && <ColorsForm communityId={communityId} colors={colors} onClose={() => setModal(null)} onSaved={(c) => { setColors(c); setModal(null); }} />}
    </div>
  );
}

// ───────────────────────── forms ─────────────────────────

function CGForm({ communityId, cg, onClose, onSaved }: { communityId: string; cg?: CG; onClose: () => void; onSaved: () => void }) {
  const [v, setV] = useState({ name: cg?.name ?? "", address: cg?.address ?? "", day: cg?.event_day ? String(cg.event_day) : "", time: hhmm(cg?.event_time ?? null) });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setBusy(true); setErr(null);
    const row = { community_id: communityId, name: v.name.trim(), address: v.address.trim() || null, event_day: v.day ? Number(v.day) : null, event_time: v.time || null };
    const { error } = cg ? await db().from("connect_groups").update(row).eq("id", cg.id) : await db().from("connect_groups").insert(row);
    setBusy(false);
    if (error) { setErr(error.message); return; }
    onSaved();
  }

  return (
    <Modal title={cg ? "Ubah Connect Group" : "Tambah Connect Group"} onClose={onClose}>
      <Field label="Nama CG"><input className={input} value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></Field>
      <Field label="Alamat"><textarea className={input} rows={2} value={v.address} onChange={(e) => setV({ ...v, address: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Hari event">
          <select className={input} value={v.day} onChange={(e) => setV({ ...v, day: e.target.value })}>
            <option value="">-</option>
            {DAYS.slice(1).map((d, i) => <option key={d} value={i + 1}>{d}</option>)}
          </select>
        </Field>
        <Field label="Jam event"><input type="time" className={input} value={v.time} onChange={(e) => setV({ ...v, time: e.target.value })} /></Field>
      </div>
      {err && <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{err}</p>}
      <button onClick={save} disabled={busy || v.name.trim().length < 2} className="w-full rounded-xl bg-brand-gold py-3 text-sm font-bold text-brand-dark disabled:opacity-50">{busy ? "Menyimpan…" : "Simpan"}</button>
    </Modal>
  );
}

function MemberForm({ cg, communityId, isAdmin, member, onClose, onSaved }: { cg: CG; communityId: string; isAdmin: boolean; member?: Member; onClose: () => void; onSaved: () => void }) {
  const [v, setV] = useState({
    name: member?.name ?? "", baptism_name: member?.baptism_name ?? "", priskat_ke: member?.priskat_ke ?? "", phone: member?.phone ?? "",
    address: member?.address ?? "", joined_at: member?.joined_at ?? new Date().toISOString().slice(0, 10), role: (member?.role ?? "anggota") as Role, user_id: member?.user_id ?? "",
  });
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Admins link a PIC or pengurus to their Ruang Iman account (that account is what lets them manage the group)
  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const { data } = await db().from("community_memberships").select("user_id, profile:profiles!user_id(full_name, nama_panggilan)").eq("community_id", communityId);
      setAccounts(((data ?? []) as any[]).map((r) => ({ user_id: r.user_id, name: r.profile?.nama_panggilan || r.profile?.full_name || "Tanpa nama" })));
    })();
  }, [isAdmin, communityId]);

  const shown = useMemo(() => accounts.filter((a) => !q || a.name.toLowerCase().includes(q.toLowerCase())).slice(0, 8), [accounts, q]);
  const linked = accounts.find((a) => a.user_id === v.user_id);

  async function save() {
    setBusy(true); setErr(null);
    const row: Record<string, unknown> = {
      cg_id: cg.id, name: v.name.trim(), baptism_name: v.baptism_name.trim() || null, priskat_ke: v.priskat_ke.trim() || null,
      phone: v.phone.trim() || null, address: v.address.trim() || null, joined_at: v.joined_at || new Date().toISOString().slice(0, 10),
    };
    if (isAdmin) { row.role = v.role; row.user_id = v.user_id || null; }
    if (isAdmin && v.role !== "anggota" && !v.user_id) { setBusy(false); setErr("PIC dan pengurus harus dihubungkan ke akun Ruang Iman, supaya bisa mengelola CG."); return; }
    const { error } = member ? await db().from("connect_group_members").update(row).eq("id", member.id) : await db().from("connect_group_members").insert(row);
    setBusy(false);
    if (error) { setErr(error.message.includes("row-level security") ? "Kamu tidak punya izin untuk ini." : error.message); return; }
    onSaved();
  }

  return (
    <Modal title={member ? "Ubah anggota" : `Tambah anggota ${cg.name}`} onClose={onClose}>
      <Field label="Nama"><input className={input} value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nama Baptis"><input className={input} value={v.baptism_name} onChange={(e) => setV({ ...v, baptism_name: e.target.value })} /></Field>
        <Field label="Priskat ke"><input className={input} value={v.priskat_ke} onChange={(e) => setV({ ...v, priskat_ke: e.target.value })} inputMode="numeric" /></Field>
      </div>
      <Field label="No HP"><input className={input} value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} inputMode="tel" /></Field>
      <Field label="Alamat"><textarea className={input} rows={2} value={v.address} onChange={(e) => setV({ ...v, address: e.target.value })} /></Field>
      <Field label="Join since"><input type="date" className={input} value={v.joined_at} onChange={(e) => setV({ ...v, joined_at: e.target.value })} /></Field>

      {isAdmin && (
        <div className="space-y-3 rounded-xl border border-brand-gold/30 bg-brand-gold/5 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: GOLD }}>Hanya admin komunitas</p>
          <Field label="Peran">
            <select className={input} value={v.role} onChange={(e) => setV({ ...v, role: e.target.value as Role })}>
              <option value="anggota">Anggota</option>
              <option value="pengurus">Pengurus CG</option>
              <option value="pic">PIC</option>
            </select>
          </Field>
          <Field label={`Akun Ruang Iman${v.role === "anggota" ? " (opsional)" : ""}`}>
            {linked ? (
              <div className="flex items-center justify-between rounded-lg border border-[#333] bg-[#14171c] px-3 py-2.5 text-sm text-white">
                {linked.name}
                <button type="button" onClick={() => setV({ ...v, user_id: "" })} className="text-xs text-brand-muted hover:text-white">Lepas</button>
              </div>
            ) : (
              <>
                <input className={input} placeholder="Cari nama anggota komunitas" value={q} onChange={(e) => setQ(e.target.value)} />
                {q && (
                  <div className="mt-1 overflow-hidden rounded-lg border border-[#333]">
                    {shown.length === 0 && <p className="px-3 py-2 text-xs text-brand-muted">Tidak ada yang cocok.</p>}
                    {shown.map((a) => (
                      <button key={a.user_id} type="button" onClick={() => { setV({ ...v, user_id: a.user_id, name: v.name || a.name }); setQ(""); }} className="block w-full px-3 py-2 text-left text-sm text-brand-light hover:bg-white/5">{a.name}</button>
                    ))}
                  </div>
                )}
              </>
            )}
          </Field>
        </div>
      )}

      {err && <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{err}</p>}
      <button onClick={save} disabled={busy || v.name.trim().length < 2} className="w-full rounded-xl bg-brand-gold py-3 text-sm font-bold text-brand-dark disabled:opacity-50">{busy ? "Menyimpan…" : "Simpan"}</button>
    </Modal>
  );
}

function LogForm({ cg, log, onClose, onSaved }: { cg: CG; log?: Log; onClose: () => void; onSaved: () => void }) {
  const [v, setV] = useState({ event_date: log?.event_date ?? new Date().toISOString().slice(0, 10), attendees: String(log?.attendees ?? ""), title: log?.title ?? "", memo: log?.memo ?? "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setBusy(true); setErr(null);
    const row = { cg_id: cg.id, event_date: v.event_date, attendees: Math.max(0, Number(v.attendees) || 0), title: v.title.trim(), memo: v.memo.trim() || null };
    const { error } = log ? await db().from("connect_group_logs").update(row).eq("id", log.id) : await db().from("connect_group_logs").insert(row);
    setBusy(false);
    if (error) { setErr(error.message); return; }
    onSaved();
  }

  return (
    <Modal title={log ? "Ubah log event" : `Log event ${cg.name}`} onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tanggal"><input type="date" className={input} value={v.event_date} onChange={(e) => setV({ ...v, event_date: e.target.value })} /></Field>
        <Field label="Qtt datang"><input className={input} value={v.attendees} onChange={(e) => setV({ ...v, attendees: e.target.value.replace(/\D/g, "") })} inputMode="numeric" /></Field>
      </div>
      <Field label="Event title"><input className={input} value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} /></Field>
      <Field label="Memo CG"><textarea className={input} rows={4} value={v.memo} onChange={(e) => setV({ ...v, memo: e.target.value })} /></Field>
      {err && <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{err}</p>}
      <button onClick={save} disabled={busy || v.title.trim().length < 2} className="w-full rounded-xl bg-brand-gold py-3 text-sm font-bold text-brand-dark disabled:opacity-50">{busy ? "Menyimpan…" : "Simpan"}</button>
    </Modal>
  );
}

function ColorsForm({ communityId, colors, onClose, onSaved }: { communityId: string; colors: Colors; onClose: () => void; onSaved: (c: Colors) => void }) {
  const [c, setC] = useState(colors);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setBusy(true); setErr(null);
    const { error } = await db().from("connect_group_colors").upsert({ community_id: communityId, ...c, updated_at: new Date().toISOString() });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    onSaved(c);
  }

  const Picker = ({ label, k }: { label: string; k: keyof Colors }) => (
    <div>
      <p className="mb-1.5 text-xs text-brand-muted">{label}</p>
      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map((p) => (
          <button key={p} type="button" aria-label={p} onClick={() => setC({ ...c, [k]: p })} className="h-8 w-8 rounded-full border-2 transition" style={{ background: p, borderColor: c[k].toLowerCase() === p.toLowerCase() ? "#fff" : "transparent" }} />
        ))}
        <input type="color" value={c[k]} onChange={(e) => setC({ ...c, [k]: e.target.value })} className="h-8 w-8 cursor-pointer rounded-full border border-[#333] bg-transparent p-0" aria-label="Warna lain" />
      </div>
    </div>
  );

  return (
    <Modal title="Warna PIC dan Pengurus" onClose={onClose}>
      <p className="text-xs text-brand-muted">Warna ini dipakai pada baris PIC dan pengurus di daftar anggota CG, di semua CG komunitas ini.</p>
      <Picker label="PIC" k="pic_color" />
      <Picker label="Pengurus CG" k="pengurus_color" />
      <div className="space-y-1.5 rounded-xl border border-[#2a2d35] p-2">
        {([["PIC", c.pic_color], ["Pengurus", c.pengurus_color]] as const).map(([label, col]) => (
          <div key={label} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-white" style={{ boxShadow: `inset 3px 0 0 ${col}`, background: `${col}12` }}>
            Contoh nama
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase" style={{ background: `${col}2e`, color: col }}>{label}</span>
          </div>
        ))}
      </div>
      {err && <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{err}</p>}
      <button onClick={save} disabled={busy} className="w-full rounded-xl bg-brand-gold py-3 text-sm font-bold text-brand-dark disabled:opacity-50">{busy ? "Menyimpan…" : "Simpan"}</button>
    </Modal>
  );
}
