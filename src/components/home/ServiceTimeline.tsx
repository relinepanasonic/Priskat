"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarPlus, Check, Clock, MapPin, Pencil, Trash2, UserPlus, Users, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Vis = "tagged" | "friends" | "network";
type Person = { id: string; name: string; avatar: string | null };
type Part = { user_id: string; status: "invited" | "accepted" | "declined"; can_edit: boolean };
type Ev = {
  id: string; owner_id: string; title: string; starts_at: string; ends_at: string | null; place: string | null; notes: string | null;
  visibility: Vis; participants: Part[];
};

const input = "w-full rounded-lg border border-[#333] bg-[#14171c] px-3 py-2.5 text-sm text-white focus:border-brand-gold focus:outline-none";
const db = () => createClient() as any;
const VIS_LABEL: Record<Vis, string> = {
  tagged: "Hanya yang ditandai",
  friends: "Teman dan yang ditandai",
  network: "Teman, kolaborator, dan kolaborator teman",
};
const initials = (n: string) => n.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const pad = (n: number) => String(n).padStart(2, "0");
const toLocalInput = (iso: string) => { const d = new Date(iso); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const dayKey = (iso: string) => new Date(iso).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Jakarta" });
const timeOf = (iso: string) => new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });

function Avatar({ p, size = 24 }: { p: Person; size?: number }) {
  return p.avatar
    // eslint-disable-next-line @next/next/no-img-element
    ? <img src={p.avatar} alt={p.name} style={{ width: size, height: size }} className="rounded-full border-2 border-[#1a1d24] object-cover" />
    : <span style={{ width: size, height: size, fontSize: size * 0.4 }} className="flex items-center justify-center rounded-full border-2 border-[#1a1d24] bg-brand-gold font-bold text-brand-dark">{initials(p.name)}</span>;
}

/**
 * "Timeline pelayanan": your events and the ones you were tagged in, merged into one list by date.
 * Tag friends as collaborators; they accept or decline. Who sees an event is chosen per event.
 */
export default function ServiceTimeline({ userId, isEn }: { userId: string; isEn: boolean }) {
  const [events, setEvents] = useState<Ev[]>([]);
  const [people, setPeople] = useState<Record<string, Person>>({});
  const [friends, setFriends] = useState<Person[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [showOthers, setShowOthers] = useState(false);
  const [form, setForm] = useState<Ev | "new" | null>(null);

  const load = useCallback(async () => {
    const supabase = db();
    const from = new Date(Date.now() - 7 * 86400_000).toISOString();
    const { data: evs, error } = await supabase.from("timeline_events").select("*, participants:timeline_participants(user_id, status, can_edit)").gte("starts_at", from).order("starts_at", { ascending: true }).limit(200);
    if (error) { setFailed(true); setLoaded(true); return; }
    const list = (evs as Ev[]) ?? [];
    setEvents(list);

    const ids = new Set<string>([userId]);
    list.forEach((e) => { ids.add(e.owner_id); e.participants.forEach((p) => ids.add(p.user_id)); });
    const { data: fr } = await supabase.from("friendships").select("requester_id, receiver_id").eq("status", "accepted").or(`requester_id.eq.${userId},receiver_id.eq.${userId}`);
    const friendIds = ((fr as { requester_id: string; receiver_id: string }[]) ?? []).map((f) => (f.requester_id === userId ? f.receiver_id : f.requester_id));
    friendIds.forEach((i) => ids.add(i));
    const { data: profs } = await supabase.from("profiles").select("id, full_name, nama_panggilan, avatar_url").in("id", [...ids]);
    const map: Record<string, Person> = {};
    ((profs as { id: string; full_name: string | null; nama_panggilan: string | null; avatar_url: string | null }[]) ?? []).forEach((p) => { map[p.id] = { id: p.id, name: p.nama_panggilan || p.full_name || "Teman", avatar: p.avatar_url }; });
    setPeople(map);
    setFriends(friendIds.map((i) => map[i]).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name)));
    setLoaded(true);
  }, [userId]);

  useEffect(() => { void load(); }, [load]);

  const mine = (e: Ev) => e.owner_id === userId || e.participants.some((p) => p.user_id === userId && p.status !== "declined");
  const shown = useMemo(() => events.filter((e) => showOthers || mine(e)), [events, showOthers, userId]); // eslint-disable-line react-hooks/exhaustive-deps
  const groups = useMemo(() => {
    const g: { day: string; items: Ev[] }[] = [];
    shown.forEach((e) => { const k = dayKey(e.starts_at); const last = g[g.length - 1]; if (last?.day === k) last.items.push(e); else g.push({ day: k, items: [e] }); });
    return g;
  }, [shown]);

  async function respond(e: Ev, accept: boolean) {
    await db().rpc("timeline_respond", { p_event: e.id, p_accept: accept });
    if (accept) void fetch("/api/push/event", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "timeline_accepted", id: e.id }) }).catch(() => {});
    void load();
  }
  async function remove(e: Ev) {
    if (!window.confirm(`Hapus "${e.title}"?`)) return;
    await db().from("timeline_events").delete().eq("id", e.id);
    void load();
  }

  const noPeopleHint = friends.length === 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-gold"><Clock className="h-4 w-4" /> {isEn ? "Timeline" : "Timeline"}</h3>
        <button onClick={() => setForm("new")} className="inline-flex items-center gap-1.5 rounded-full bg-brand-gold px-3.5 py-2 text-xs font-bold text-brand-dark active:scale-95"><CalendarPlus className="h-3.5 w-3.5" /> {isEn ? "Add event" : "Tambah acara"}</button>
      </div>
      <label className="flex items-center gap-2 text-xs text-brand-muted">
        <input type="checkbox" checked={showOthers} onChange={(e) => setShowOthers(e.target.checked)} className="accent-[#D6B072]" />
        {isEn ? "Also show events of my friends and network" : "Tampilkan juga acara teman dan jaringanku"}
      </label>

      {!loaded && <p className="py-6 text-center text-sm text-brand-muted">Memuat…</p>}
      {loaded && failed && <p className="rounded-xl border border-[#333] bg-[#1a1d24] p-4 text-center text-xs text-brand-muted">Timeline belum aktif. Admin perlu menjalankan pembaruan database terlebih dahulu.</p>}
      {loaded && !failed && groups.length === 0 && (
        <div className="rounded-2xl border border-[#2a2d35] bg-[#14171c] px-5 py-8 text-center">
          <Clock className="mx-auto h-8 w-8 text-brand-muted/50" />
          <p className="mt-2 text-sm font-semibold text-white">Belum ada acara di timeline-mu</p>
          <p className="mt-1 text-xs text-brand-muted">Catat pelayanan atau kegiatanmu, lalu tandai teman untuk berkolaborasi.</p>
        </div>
      )}

      {groups.map((g) => (
        <div key={g.day}>
          <p className="mb-1.5 mt-3 text-[11px] font-bold uppercase tracking-[0.15em] text-brand-gold">{g.day}</p>
          <div className="space-y-2.5">
            {g.items.map((e) => {
              const owner = people[e.owner_id];
              const me = e.participants.find((p) => p.user_id === userId);
              const canEdit = e.owner_id === userId || (me?.status === "accepted" && me.can_edit);
              const crew = [owner, ...e.participants.filter((p) => p.status !== "declined").map((p) => people[p.user_id])].filter(Boolean) as Person[];
              return (
                <div key={e.id} className={`rounded-2xl border p-3.5 ${e.owner_id === userId ? "border-[#333] bg-[#1a1d24]" : "border-sky-500/30 bg-sky-500/[0.06]"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-white">{e.title}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-brand-muted"><Clock className="h-3 w-3" /> {timeOf(e.starts_at)}{e.ends_at ? ` – ${timeOf(e.ends_at)}` : ""}</p>
                      {e.place && <p className="mt-0.5 flex items-center gap-1.5 text-xs text-brand-muted"><MapPin className="h-3 w-3 shrink-0" /> {e.place}</p>}
                    </div>
                    {canEdit && (
                      <div className="flex shrink-0 gap-1">
                        <button aria-label="Ubah" onClick={() => setForm(e)} className="rounded-lg border border-[#333] p-1.5 text-brand-light"><Pencil className="h-3.5 w-3.5" /></button>
                        {e.owner_id === userId && <button aria-label="Hapus" onClick={() => remove(e)} className="rounded-lg border border-[#333] p-1.5 text-red-300"><Trash2 className="h-3.5 w-3.5" /></button>}
                      </div>
                    )}
                  </div>
                  {e.notes && <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-brand-light">{e.notes}</p>}
                  <div className="mt-2.5 flex items-center justify-between">
                    <div className="flex items-center">
                      {crew.slice(0, 6).map((p, i) => <span key={p.id} className={i ? "-ml-1.5" : ""}><Avatar p={p} /></span>)}
                      <span className="ml-2 text-[11px] text-brand-muted">
                        {e.owner_id === userId ? "Kamu" : owner?.name ?? "Teman"}{crew.length > 1 ? ` dan ${crew.length - 1} lainnya` : ""}
                      </span>
                    </div>
                    <span className="text-[10px] text-brand-muted">{e.visibility === "tagged" ? "Terbatas" : e.visibility === "friends" ? "Teman" : "Jaringan"}</span>
                  </div>
                  {me?.status === "invited" && (
                    <div className="mt-3 flex items-center gap-2 rounded-xl bg-sky-500/10 p-2.5">
                      <span className="flex-1 text-xs text-sky-100">{owner?.name ?? "Temanmu"} menandai kamu di acara ini.</span>
                      <button onClick={() => respond(e, true)} className="inline-flex items-center gap-1 rounded-lg bg-brand-gold px-3 py-1.5 text-xs font-bold text-brand-dark"><Check className="h-3.5 w-3.5" /> Terima</button>
                      <button onClick={() => respond(e, false)} className="rounded-lg border border-[#444] px-3 py-1.5 text-xs font-semibold text-brand-light">Tolak</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {form && (
        <EventForm
          userId={userId} friends={friends} people={people} editing={form === "new" ? null : form} noPeopleHint={noPeopleHint}
          onClose={() => setForm(null)} onSaved={() => { setForm(null); void load(); }}
        />
      )}
    </div>
  );
}

function EventForm({ userId, friends, people, editing, noPeopleHint, onClose, onSaved }: {
  userId: string; friends: Person[]; people: Record<string, Person>; editing: Ev | null; noPeopleHint: boolean; onClose: () => void; onSaved: () => void;
}) {
  const owner = !editing || editing.owner_id === userId;
  const [title, setTitle] = useState(editing?.title ?? "");
  const [starts, setStarts] = useState(editing ? toLocalInput(editing.starts_at) : "");
  const [ends, setEnds] = useState(editing?.ends_at ? toLocalInput(editing.ends_at) : "");
  const [place, setPlace] = useState(editing?.place ?? "");
  const [notes, setNotes] = useState(editing?.notes ?? "");
  const [vis, setVis] = useState<Vis>(editing?.visibility ?? "network");
  const [tagged, setTagged] = useState<Record<string, boolean>>(() => Object.fromEntries((editing?.participants ?? []).map((p) => [p.user_id, p.can_edit])));
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const candidates = friends.filter((f) => !(f.id in tagged) && f.name.toLowerCase().includes(search.trim().toLowerCase())).slice(0, 8);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!starts) { setError("Isi tanggal dan jam mulai."); return; }
    setBusy(true); setError(null);
    const supabase = db();
    const row = {
      title: title.trim(), starts_at: new Date(starts).toISOString(), ends_at: ends ? new Date(ends).toISOString() : null,
      place: place.trim() || null, notes: notes.trim() || null, ...(owner ? { visibility: vis } : {}),
    };
    let id = editing?.id ?? "";
    if (editing) {
      const { error: err } = await supabase.from("timeline_events").update(row).eq("id", editing.id);
      if (err) { setBusy(false); setError(err.message); return; }
    } else {
      const { data, error: err } = await supabase.from("timeline_events").insert({ ...row, owner_id: userId }).select("id").single();
      if (err || !data) { setBusy(false); setError(err?.message ?? "Belum bisa menyimpan."); return; }
      id = data.id as string;
    }

    // Tag the new people (and update edit rights); remove the ones taken out
    const before = new Map((editing?.participants ?? []).map((p) => [p.user_id, p.can_edit]));
    const newlyTagged: string[] = [];
    for (const [uid, canEdit] of Object.entries(tagged)) {
      if (!before.has(uid) || before.get(uid) !== canEdit) {
        const { error: err } = await supabase.rpc("timeline_tag", { p_event: id, p_user: uid, p_can_edit: owner ? canEdit : false });
        if (err) { setError(err.message); continue; }
        if (!before.has(uid)) newlyTagged.push(uid);
      }
    }
    if (owner) for (const uid of before.keys()) if (!(uid in tagged)) await supabase.from("timeline_participants").delete().eq("event_id", id).eq("user_id", uid);
    if (newlyTagged.length) void fetch("/api/push/event", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "timeline_tag", id }) }).catch(() => {});
    setBusy(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/70 md:items-center" onClick={onClose}>
      <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="max-h-[92vh] w-full max-w-md space-y-3 overflow-y-auto rounded-t-3xl border border-[#333] bg-[#1a1d24] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-white md:rounded-3xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">{editing ? "Ubah acara" : "Tambah acara"}</h3>
          <button type="button" onClick={onClose} aria-label="Tutup" className="rounded-full p-1.5 text-gray-400 hover:bg-white/10"><X className="h-5 w-5" /></button>
        </div>
        <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nama acara atau pelayanan" maxLength={120} className={input} />
        <div className="grid grid-cols-2 gap-2">
          <div><label className="mb-1 block text-[11px] text-brand-muted">Mulai</label><input required type="datetime-local" value={starts} onChange={(e) => setStarts(e.target.value)} className={input} /></div>
          <div><label className="mb-1 block text-[11px] text-brand-muted">Selesai (opsional)</label><input type="datetime-local" value={ends} onChange={(e) => setEnds(e.target.value)} className={input} /></div>
        </div>
        <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Tempat atau tautan" maxLength={200} className={input} />
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} maxLength={1000} placeholder="Catatan (opsional)" className={input} />

        <div>
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-brand-muted">Kolaborator</p>
          {Object.keys(tagged).length > 0 && (
            <div className="mb-2 space-y-1.5">
              {Object.entries(tagged).map(([uid, canEdit]) => {
                const p = people[uid];
                return (
                  <div key={uid} className="flex items-center gap-2 rounded-xl bg-[#14171c] p-2">
                    {p && <Avatar p={p} size={28} />}
                    <span className="min-w-0 flex-1 truncate text-sm">{p?.name ?? "Teman"}</span>
                    {owner && <label className="flex items-center gap-1 text-[11px] text-brand-light"><input type="checkbox" checked={canEdit} onChange={(e) => setTagged({ ...tagged, [uid]: e.target.checked })} className="accent-[#D6B072]" /> boleh edit</label>}
                    {owner && <button type="button" aria-label="Hapus" onClick={() => { const n = { ...tagged }; delete n[uid]; setTagged(n); }} className="text-gray-400"><X className="h-4 w-4" /></button>}
                  </div>
                );
              })}
            </div>
          )}
          {noPeopleHint ? (
            <p className="rounded-xl bg-white/5 p-3 text-xs text-brand-muted">Kamu belum punya teman di Ruang Iman. Tambah teman di menu Koneksi, lalu kamu bisa menandai mereka di sini.</p>
          ) : (
            <>
              <div className="relative"><UserPlus className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari temanmu untuk ditandai" className={`${input} pl-9`} /></div>
              {(search || candidates.length > 0) && (
                <div className="mt-1.5 max-h-40 space-y-1 overflow-y-auto">
                  {candidates.map((f) => (
                    <button key={f.id} type="button" onClick={() => { setTagged({ ...tagged, [f.id]: false }); setSearch(""); }} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-white/5"><Avatar p={f} size={24} /> {f.name}</button>
                  ))}
                  {candidates.length === 0 && <p className="px-2 py-1 text-xs text-brand-muted">Tidak ada teman dengan nama itu.</p>}
                </div>
              )}
            </>
          )}
        </div>

        {owner && (
          <div>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-brand-muted"><Users className="mr-1 inline h-3.5 w-3.5" />Siapa boleh melihat</p>
            <div className="space-y-1.5">
              {(Object.keys(VIS_LABEL) as Vis[]).map((v) => (
                <label key={v} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm ${vis === v ? "border-brand-gold/60 bg-brand-gold/10" : "border-[#333]"}`}>
                  <input type="radio" name="vis" checked={vis === v} onChange={() => setVis(v)} className="accent-[#D6B072]" /> {VIS_LABEL[v]}
                </label>
              ))}
            </div>
          </div>
        )}

        {error && <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}
        <button type="submit" disabled={busy} className="w-full rounded-xl bg-brand-gold py-3 text-sm font-bold text-brand-dark disabled:opacity-60">{busy ? "Menyimpan…" : editing ? "Simpan perubahan" : "Simpan acara"}</button>
      </form>
    </div>
  );
}
