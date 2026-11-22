"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Check, Clock, MapPin, Pencil, Plus, Trash2, UserPlus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Vis = "tagged" | "friends";
type Person = { id: string; name: string; avatar: string | null };
type Part = { user_id: string; status: "invited" | "accepted" | "declined" };
type Ev = { id: string; owner_id: string; title: string; starts_at: string; place: string | null; notes: string | null; visibility: Vis; participants: Part[] };

const input = "w-full rounded-lg border border-[#333] bg-[#14171c] px-3 py-2.5 text-sm text-white focus:border-brand-gold focus:outline-none";
const db = () => createClient() as any;
const VIS: { key: Vis; label: string }[] = [
  { key: "tagged", label: "Hanya yang ditandai" },
  { key: "friends", label: "Teman dan yang ditandai" },
];
const initials = (n: string) => n.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const pad = (n: number) => String(n).padStart(2, "0");
const toLocalInput = (iso: string) => { const d = new Date(iso); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const dateOf = (iso: string) => new Date(iso).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Jakarta" });
const timeOf = (iso: string) => new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });

function Avatar({ p, size = 24 }: { p: Person; size?: number }) {
  return p.avatar
    // eslint-disable-next-line @next/next/no-img-element
    ? <img src={p.avatar} alt={p.name} style={{ width: size, height: size }} className="rounded-full border-2 border-[#1a1d24] object-cover" />
    : <span style={{ width: size, height: size, fontSize: size * 0.4 }} className="flex items-center justify-center rounded-full border-2 border-[#1a1d24] bg-brand-gold font-bold text-brand-dark">{initials(p.name)}</span>;
}

/**
 * Your events as cards in "Pelayanan Saya", in the same look as the service cards.
 * Yours, the ones you were tagged in, and your friends' events share one list, soonest first.
 */
export default function ServiceTimeline({ userId }: { userId: string }) {
  const [events, setEvents] = useState<Ev[]>([]);
  const [people, setPeople] = useState<Record<string, Person>>({});
  const [friends, setFriends] = useState<Person[]>([]);
  const [failed, setFailed] = useState(false);
  const [form, setForm] = useState<Ev | "new" | null>(null);

  const load = useCallback(async () => {
    const supabase = db();
    const from = new Date(Date.now() - 24 * 3600_000).toISOString();
    const { data: evs, error } = await supabase.from("timeline_events").select("*, participants:timeline_participants(user_id, status)").gte("starts_at", from).order("starts_at", { ascending: true }).limit(100);
    if (error) { setFailed(true); return; }
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
  }, [userId]);

  useEffect(() => { void load(); }, [load]);

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

  if (failed) return null; // the 109 SQL has not been run yet: the page simply shows the services as before

  return (
    <div className="space-y-3">
      <button onClick={() => setForm("new")} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-brand-gold/50 py-3.5 text-sm font-semibold text-brand-gold transition-colors hover:bg-brand-gold/10">
        <Plus className="h-4 w-4" /> Tambah acara
      </button>

      {events.map((e) => {
        const mine = e.owner_id === userId;
        const me = e.participants.find((p) => p.user_id === userId);
        const owner = people[e.owner_id];
        const crew = [owner, ...e.participants.filter((p) => p.status !== "declined").map((p) => people[p.user_id])].filter(Boolean) as Person[];
        const role = mine ? "Pemilik" : me ? "Kolaborator" : `Teman: ${owner?.name ?? ""}`;
        return (
          <div key={e.id} className={`relative overflow-hidden rounded-2xl border p-4 shadow-sm ${me?.status === "invited" ? "border-sky-500/40 bg-sky-500/[0.06]" : "border-[#333] bg-[#1a1d24]"}`}>
            <div className="mb-3 flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold/10 text-brand-gold"><CalendarDays className="h-5 w-5" /></div>
              <span className="rounded-full border border-brand-gold/30 bg-brand-gold/10 px-2.5 py-1 text-[10px] font-bold text-brand-gold">{dateOf(e.starts_at)}</span>
            </div>
            <h4 className="text-sm font-bold text-white">{e.title}</h4>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-brand-muted">
              <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {timeOf(e.starts_at)}</span>
              {e.place && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {e.place}</span>}
            </p>
            {e.notes && <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-brand-light">{e.notes}</p>}

            {me?.status === "invited" && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-sky-500/10 p-2.5">
                <span className="flex-1 text-xs text-sky-100">{owner?.name ?? "Temanmu"} mengajakmu ikut.</span>
                <button onClick={() => respond(e, true)} className="inline-flex items-center gap-1 rounded-lg bg-brand-gold px-3 py-1.5 text-xs font-bold text-brand-dark"><Check className="h-3.5 w-3.5" /> Ikut</button>
                <button onClick={() => respond(e, false)} className="rounded-lg border border-[#444] px-3 py-1.5 text-xs font-semibold text-brand-light">Tidak</button>
              </div>
            )}

            <div className="mt-3 flex items-center justify-between border-t border-[#222] pt-3">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="flex items-center">{crew.slice(0, 4).map((p, i) => <span key={p.id} className={i ? "-ml-1.5" : ""}><Avatar p={p} /></span>)}</span>
                <span>Peran: <span className="font-semibold text-white">{role}</span></span>
              </div>
              {mine && (
                <div className="flex gap-1">
                  <button aria-label="Ubah" onClick={() => setForm(e)} className="rounded-lg border border-[#333] p-1.5 text-brand-light"><Pencil className="h-3.5 w-3.5" /></button>
                  <button aria-label="Hapus" onClick={() => remove(e)} className="rounded-lg border border-[#333] p-1.5 text-red-300"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {form && (
        <EventForm userId={userId} friends={friends} people={people} editing={form === "new" ? null : form} onClose={() => setForm(null)} onSaved={() => { setForm(null); void load(); }} />
      )}
    </div>
  );
}

function EventForm({ userId, friends, people, editing, onClose, onSaved }: {
  userId: string; friends: Person[]; people: Record<string, Person>; editing: Ev | null; onClose: () => void; onSaved: () => void;
}) {
  const [title, setTitle] = useState(editing?.title ?? "");
  const [starts, setStarts] = useState(editing ? toLocalInput(editing.starts_at) : "");
  const [place, setPlace] = useState(editing?.place ?? "");
  const [vis, setVis] = useState<Vis>(editing?.visibility ?? "friends");
  const [tagged, setTagged] = useState<string[]>(() => (editing?.participants ?? []).map((p) => p.user_id));
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const candidates = friends.filter((f) => !tagged.includes(f.id) && f.name.toLowerCase().includes(search.trim().toLowerCase())).slice(0, 6);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    const supabase = db();
    const row = { title: title.trim(), starts_at: new Date(starts).toISOString(), place: place.trim() || null, visibility: vis };
    let id = editing?.id ?? "";
    if (editing) {
      const { error: err } = await supabase.from("timeline_events").update(row).eq("id", editing.id);
      if (err) { setBusy(false); setError(err.message); return; }
    } else {
      // The id is made here, so the insert does not have to read the new row back (the read policy cannot see a row of the same statement)
      id = crypto.randomUUID();
      const { error: err } = await supabase.from("timeline_events").insert({ ...row, id, owner_id: userId });
      if (err) { setBusy(false); setError(err.message); return; }
    }
    const before = new Set((editing?.participants ?? []).map((p) => p.user_id));
    let added = 0;
    for (const uid of tagged) {
      if (before.has(uid)) continue;
      const { error: err } = await supabase.rpc("timeline_tag", { p_event: id, p_user: uid, p_can_edit: false });
      if (err) setError(err.message); else added += 1;
    }
    for (const uid of before) if (!tagged.includes(uid)) await supabase.from("timeline_participants").delete().eq("event_id", id).eq("user_id", uid);
    if (added) void fetch("/api/push/event", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "timeline_tag", id }) }).catch(() => {});
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
        <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nama acara" maxLength={120} className={input} />
        <input required type="datetime-local" value={starts} onChange={(e) => setStarts(e.target.value)} className={input} />
        <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Tempat (opsional)" maxLength={200} className={input} />

        <div>
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-brand-muted">Ajak teman</p>
          {tagged.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {tagged.map((uid) => (
                <span key={uid} className="inline-flex items-center gap-1.5 rounded-full bg-[#14171c] py-1 pl-1 pr-2 text-xs">
                  {people[uid] && <Avatar p={people[uid]} size={20} />} {people[uid]?.name ?? "Teman"}
                  <button type="button" aria-label="Hapus" onClick={() => setTagged(tagged.filter((x) => x !== uid))} className="text-gray-400"><X className="h-3.5 w-3.5" /></button>
                </span>
              ))}
            </div>
          )}
          {friends.length === 0 ? (
            <p className="rounded-xl bg-white/5 p-3 text-xs text-brand-muted">Belum ada teman. Tambah teman di menu Koneksi dulu.</p>
          ) : (
            <>
              <div className="relative"><UserPlus className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama teman" className={`${input} pl-9`} /></div>
              {candidates.length > 0 && (
                <div className="mt-1.5 space-y-1">
                  {candidates.map((f) => (
                    <button key={f.id} type="button" onClick={() => { setTagged([...tagged, f.id]); setSearch(""); }} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-white/5"><Avatar p={f} size={24} /> {f.name}</button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div>
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-brand-muted">Siapa boleh melihat</p>
          <div className="grid grid-cols-2 gap-2">
            {VIS.map((v) => (
              <button key={v.key} type="button" onClick={() => setVis(v.key)} className={`rounded-xl border px-3 py-2.5 text-xs font-semibold ${vis === v.key ? "border-brand-gold bg-brand-gold/10 text-brand-gold" : "border-[#333] text-brand-light"}`}>{v.label}</button>
            ))}
          </div>
        </div>

        {error && <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}
        <button type="submit" disabled={busy} className="w-full rounded-xl bg-brand-gold py-3 text-sm font-bold text-brand-dark disabled:opacity-60">{busy ? "Menyimpan…" : "Simpan"}</button>
      </form>
    </div>
  );
}
