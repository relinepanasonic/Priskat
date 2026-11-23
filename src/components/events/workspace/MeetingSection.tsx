"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, CalendarPlus, MessageCircle, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { audienceLabel, PETINGGI_ROLES } from "@/lib/crewRoles";
import { formatDateTime, fromJakartaInput } from "@/lib/utils";
import { Field, inputCls } from "./ui";

type Meeting = { id: string; title: string; date_time: string | null; mom_text: string | null; audience: string | null; notified_at: string | null };
type Crew = { position: string | null };

const db = () => createClient() as any;

/** Meeting: schedule it for everybody, the leaders (Petinggi) or one team; push it and share it by WhatsApp. */
export default function MeetingSection({ cohortId, campTitle, crew }: { cohortId: string; campTitle: string; crew: Crew[] }) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [when, setWhen] = useState("");
  const [mom, setMom] = useState("");
  const [audience, setAudience] = useState("all");
  const [push, setPush] = useState(true);
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // "Group Doa", "Group Perlengkapan" ... one for every position that exists in the committee (leaders are Petinggi)
  const groups = useMemo(() => {
    const seen = new Map<string, string>();
    crew.forEach((c) => { const p = String(c.position ?? "").trim(); if (p && !PETINGGI_ROLES.includes(p.toLowerCase())) seen.set(p.toLowerCase(), p); });
    return [...seen.values()].sort((a, b) => a.localeCompare(b));
  }, [crew]);
  const options = useMemo(() => [{ id: "all", label: "Semua panitia" }, { id: "petinggi", label: "Petinggi" }, ...groups.map((g) => ({ id: `role:${g}`, label: `Group ${g}` }))], [groups]);

  const load = useCallback(async () => {
    const { data } = await db().from("camp_meetings").select("id, title, date_time, mom_text, audience, notified_at").eq("cohort_id", cohortId).order("date_time", { ascending: true });
    setMeetings((data as Meeting[]) ?? []);
  }, [cohortId]);
  useEffect(() => { void load(); }, [load]);

  async function notify(id: string): Promise<string> {
    try {
      const res = await fetch("/api/camp/meeting-notify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ meeting: id }) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) return j.error ?? "Notifikasi belum terkirim.";
      return j.people ? `Notifikasi dikirim ke ${j.people} panitia.` : "Tidak ada panitia dengan akun Ruang Iman di kelompok ini. Bagikan lewat WhatsApp.";
    } catch {
      return "Notifikasi belum terkirim.";
    }
  }

  async function save() {
    if (!title.trim()) return;
    setBusy("save"); setMsg(null);
    const { data, error } = await db().from("camp_meetings").insert({
      cohort_id: cohortId, title: title.trim(), date_time: when ? fromJakartaInput(when) : null, mom_text: mom.trim() || null, audience,
    }).select("id").single();
    if (error || !data) { setBusy(null); setMsg({ ok: false, text: error?.message ?? "Rapat belum tersimpan." }); return; }
    const note = push ? await notify(data.id as string) : "";
    setBusy(null);
    setTitle(""); setWhen(""); setMom(""); setAudience("all"); setAdding(false);
    setMsg({ ok: true, text: `Rapat tersimpan. ${note}`.trim() });
    await load();
  }

  async function resend(m: Meeting) {
    setBusy(m.id); setMsg(null);
    const note = await notify(m.id);
    setBusy(null);
    setMsg({ ok: true, text: note });
    await load();
  }

  const shareText = (m: Meeting) =>
    [`*Rapat: ${m.title}*`, `Untuk: ${audienceLabel(m.audience)}`, m.date_time ? `📅 ${formatDateTime(m.date_time)} WIB` : "", m.mom_text ? `\n${m.mom_text}` : "", `\n${campTitle}`].filter(Boolean).join("\n");

  function calendar(m: Meeting) {
    const start = m.date_time ? new Date(m.date_time) : new Date();
    const end = new Date(start.getTime() + 3600_000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const url = new URL("https://calendar.google.com/calendar/render");
    url.searchParams.set("action", "TEMPLATE");
    url.searchParams.set("text", m.title);
    url.searchParams.set("dates", `${fmt(start)}/${fmt(end)}`);
    if (m.mom_text) url.searchParams.set("details", m.mom_text);
    window.open(url.toString(), "_blank", "noopener");
  }

  const shown = meetings.filter((m) => filter === "all" || (m.audience || "all") === filter);
  const usedFilters = options.filter((o) => o.id === "all" || meetings.some((m) => (m.audience || "all") === o.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-white">Meeting</h2>
        <button onClick={() => setAdding((v) => !v)} className="flex items-center gap-2 rounded-lg bg-brand-gold px-4 py-2 text-sm font-bold text-brand-dark hover:opacity-90"><Plus className="h-4 w-4" /> Jadwalkan rapat</button>
      </div>

      {msg && <p className={`rounded-lg px-3 py-2 text-xs ${msg.ok ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>{msg.text}</p>}

      {adding && (
        <section className="space-y-4 rounded-2xl border border-[#2a2d35] bg-[#14171c] p-4 md:p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Judul rapat"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Mis. Rapat persiapan" className={inputCls} /></Field>
            <Field label="Tanggal dan jam (WIB)"><input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className={`${inputCls} [color-scheme:dark]`} /></Field>
          </div>
          <Field label="Untuk siapa" hint="Pilih Petinggi atau satu group supaya hanya mereka yang diberi tahu.">
            <select value={audience} onChange={(e) => setAudience(e.target.value)} className={inputCls}>
              {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Catatan / MoM (opsional)"><textarea value={mom} onChange={(e) => setMom(e.target.value)} rows={3} className={`${inputCls} rounded-2xl`} placeholder="Agenda atau catatan rapat" /></Field>
          <label className="flex items-center gap-2.5 text-sm text-brand-light"><input type="checkbox" checked={push} onChange={(e) => setPush(e.target.checked)} className="h-4 w-4 accent-[#D6B072]" /> Kirim notifikasi ke {audienceLabel(audience)} sekarang</label>
          <div className="flex justify-end">
            <button onClick={save} disabled={!title.trim() || busy === "save"} className="rounded-lg bg-brand-gold px-6 py-2.5 text-sm font-bold text-brand-dark disabled:opacity-50">{busy === "save" ? "Menyimpan..." : "Simpan rapat"}</button>
          </div>
        </section>
      )}

      {usedFilters.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {usedFilters.map((o) => (
            <button key={o.id} onClick={() => setFilter(o.id)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold ${filter === o.id ? "bg-brand-gold text-brand-dark" : "border border-[#333] text-brand-muted hover:text-white"}`}>{o.label}</button>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <p className="rounded-2xl border border-[#2a2d35] bg-[#14171c] p-8 text-center text-sm text-brand-muted">Belum ada rapat.</p>
      ) : (
        <div className="space-y-3">
          {shown.map((m) => (
            <article key={m.id} className="space-y-3 rounded-2xl border border-[#2a2d35] bg-[#14171c] p-4 md:p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-bold text-white">{m.title}</h3>
                  <p className="mt-0.5 text-sm font-semibold text-brand-gold">{m.date_time ? `${formatDateTime(m.date_time)} WIB` : "Jadwal menyusul"}</p>
                </div>
                <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-brand-light">{audienceLabel(m.audience)}</span>
              </div>
              {m.mom_text && <p className="whitespace-pre-wrap rounded-xl bg-black/30 p-3.5 text-sm text-gray-300">{m.mom_text}</p>}
              <div className="flex flex-wrap gap-2">
                <a href={`https://wa.me/?text=${encodeURIComponent(shareText(m))}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-emerald-950"><MessageCircle className="h-3.5 w-3.5" /> Bagikan ke WhatsApp</a>
                <button disabled={busy === m.id} onClick={() => void resend(m)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#333] px-3 py-2 text-xs font-semibold text-brand-light hover:bg-white/5 disabled:opacity-50"><Bell className="h-3.5 w-3.5" /> {m.notified_at ? "Kirim notifikasi lagi" : "Kirim notifikasi"}</button>
                <button onClick={() => calendar(m)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#333] px-3 py-2 text-xs font-semibold text-brand-light hover:bg-white/5"><CalendarPlus className="h-3.5 w-3.5" /> Kalender</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
