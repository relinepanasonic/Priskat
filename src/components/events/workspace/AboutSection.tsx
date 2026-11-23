"use client";

import { useState } from "react";
import { DoorClosed, DoorOpen, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fromJakartaInput, toJakartaInput } from "@/lib/utils";
import { useEventData, type WorkspaceEvent } from "./useEventData";
import { Collapse, Field, inputCls } from "./ui";
import RegistrationSettings from "./RegistrationSettings";
import { LinkPesertaButton, getRegisterLink } from "./LinkPeserta";
import WaTemplate from "./WaTemplate";
import { DEFAULT_WA_INVITE, DEFAULT_WA_TEMPLATE, renderWaTemplate } from "@/lib/eventReg";
import { formatDate } from "@/lib/utils";

const db = () => createClient() as any;

/** Tentang Event: three boxes that open and close. Tentang Event, Pengaturan Pendaftaran, and Buka / Tutup Pendaftaran. */
export default function AboutSection({ eventId }: { eventId: string }) {
  const { event, settings, loading, reload } = useEventData(eventId);
  if (loading) return <p className="py-10 text-center text-sm text-gray-500">Memuat...</p>;
  if (!event) return <p className="py-10 text-center text-sm text-gray-500">Event tidak ditemukan.</p>;
  // the form starts from what is saved; it is mounted again after every save so it always shows the saved values
  return <AboutForm key={event.title + event.event_date + (event.end_date ?? "")} event={event} eventId={eventId} settings={settings} reload={reload} />;
}

function AboutForm({ event, eventId, settings, reload }: { event: WorkspaceEvent; eventId: string; settings: ReturnType<typeof useEventData>["settings"]; reload: () => Promise<void> }) {
  const [title, setTitle] = useState(event.title);
  const [tagline, setTagline] = useState(event.tagline ?? "");
  const [target, setTarget] = useState(event.capacity != null ? String(event.capacity) : "");
  const [location, setLocation] = useState(event.location ?? "");
  const [maps, setMaps] = useState(event.maps_url ?? "");
  const [start, setStart] = useState(toJakartaInput(event.event_date));
  const [end, setEnd] = useState(toJakartaInput(event.end_date));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [toggling, setToggling] = useState(false);
  const [openTentang, setOpenTentang] = useState(true);
  const [openSettings, setOpenSettings] = useState(false);
  const [openDaftar, setOpenDaftar] = useState(false);

  const isOpen = settings?.open ?? false;
  // the invitation text: the saved one, or ours, filled in with this event
  const shareText = (link: string) => renderWaTemplate(settings?.wa_invite_template ?? DEFAULT_WA_INVITE, {
    nama: "Saudara/i", event: event.title, tanggal: event.event_date ? formatDate(event.event_date) : "", lokasi: event.location ?? "", link,
  });

  async function save() {
    setMsg(null);
    if (title.trim().length < 3) { setMsg({ ok: false, text: "Nama event minimal 3 huruf." }); return; }
    if (!start) { setMsg({ ok: false, text: "Isi tanggal mulai." }); return; }
    if (end && end < start) { setMsg({ ok: false, text: "Tanggal selesai tidak boleh sebelum tanggal mulai." }); return; }
    if (maps.trim() && !/^https?:\/\//i.test(maps.trim())) { setMsg({ ok: false, text: "Link Google Maps harus diawali https://" }); return; }
    const cap = target.trim() ? Math.round(Number(target)) : null;
    if (cap != null && (!Number.isFinite(cap) || cap < 1)) { setMsg({ ok: false, text: "Target peserta harus angka, atau dikosongkan." }); return; }
    setBusy(true);
    const { error } = await db().from("events").update({
      title: title.trim(), tagline: tagline.trim() || null, capacity: cap, location: location.trim(), maps_url: maps.trim() || null,
      event_date: fromJakartaInput(start), end_date: end ? fromJakartaInput(end) : null,
    }).eq("id", eventId);
    // the workspace (camp record) shows the same name and date; only site admins may change it, so a refusal is fine
    if (!error && event.cohort_id) await db().from("camp_cohorts").update({ custom_name: title.trim(), start_date: start.slice(0, 10) }).eq("id", event.cohort_id);
    setBusy(false);
    if (error) { setMsg({ ok: false, text: `Belum bisa menyimpan: ${error.message}` }); return; }
    setMsg({ ok: true, text: "Tersimpan." });
    await reload();
  }

  async function toggleRegistration() {
    setToggling(true); setMsg(null);
    const { error } = await db().from("event_reg_settings").upsert({ event_id: eventId, open: !isOpen });
    setToggling(false);
    if (error) { setMsg({ ok: false, text: `Belum bisa mengubah: ${error.message}` }); return; }
    await reload();
  }

  return (
    <div className="space-y-3">
      {/* 1. Tentang Event */}
      <Collapse title="Tentang Event" subtitle={title || "Nama, tagline, tempat, dan tanggal"} open={openTentang} onToggle={() => setOpenTentang((v) => !v)}>
        <Field label="Nama event">
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} className={inputCls} />
        </Field>
        <Field label="Tagline event" hint="Satu kalimat singkat yang menggambarkan event.">
          <input value={tagline} onChange={(e) => setTagline(e.target.value)} maxLength={160} placeholder="Mis. Ayah yang mengenal Allah, keluarga yang diberkati" className={inputCls} />
        </Field>
        <Field label="Target peserta" hint="Jumlah peserta yang diharapkan. Kalau sudah penuh, pendaftaran otomatis tertutup. Kosongkan kalau tanpa batas.">
          <input type="number" min={1} value={target} onChange={(e) => setTarget(e.target.value)} inputMode="numeric" placeholder="Mis. 100" className={inputCls} />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Lokasi">
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Nama tempat dan alamat" className={inputCls} />
          </Field>
          <Field label="Link Google Maps">
            <div className="flex gap-2">
              <input value={maps} onChange={(e) => setMaps(e.target.value)} placeholder="https://maps.google.com/..." className={inputCls} />
              {maps.trim() && (
                <a href={maps.trim()} target="_blank" rel="noopener noreferrer" aria-label="Buka di Google Maps" className="flex shrink-0 items-center rounded-lg border border-[#333] px-3 text-brand-gold hover:bg-white/5"><ExternalLink className="h-4 w-4" /></a>
              )}
            </div>
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Mulai (WIB)">
            <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} className={`${inputCls} [color-scheme:dark]`} />
          </Field>
          <Field label="Selesai (WIB)" hint="Opsional.">
            <input type="datetime-local" value={end} min={start || undefined} onChange={(e) => setEnd(e.target.value)} className={`${inputCls} [color-scheme:dark]`} />
          </Field>
        </div>
        {msg && <p className={`rounded-lg px-3 py-2 text-xs ${msg.ok ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>{msg.text}</p>}
        <button onClick={save} disabled={busy} className="w-full rounded-xl bg-brand-gold py-3 text-sm font-bold text-brand-dark disabled:opacity-60">{busy ? "Menyimpan…" : "Simpan"}</button>
      </Collapse>

      {/* 2. Pengaturan Pendaftaran, with the WhatsApp message */}
      <Collapse title="Pengaturan Pendaftaran" subtitle="Biaya, rekening, batas tanggal, dan pertanyaan di formulir" open={openSettings} onToggle={() => setOpenSettings((v) => !v)}>
        <RegistrationSettings eventId={eventId} settings={settings} onSaved={() => void reload()} />
      </Collapse>

      {/* 3. Open and close the registration */}
      <Collapse title={isOpen ? "Pendaftaran dibuka" : "Pendaftaran ditutup"} subtitle={isOpen ? "Orang bisa mendaftar lewat Link Peserta" : "Buka pendaftaran supaya Link Peserta bisa dipakai"} open={openDaftar} onToggle={() => setOpenDaftar((v) => !v)}>
        <div className={`flex items-center gap-3 rounded-xl border p-3.5 ${isOpen ? "border-emerald-500/40 bg-emerald-500/10" : "border-[#333] bg-black/20"}`}>
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isOpen ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-gray-400"}`}>
            {isOpen ? <DoorOpen className="h-5 w-5" /> : <DoorClosed className="h-5 w-5" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white">{isOpen ? "Pendaftaran dibuka" : "Pendaftaran ditutup"}</p>
            <p className="text-xs text-brand-muted">{isOpen ? "Orang bisa mendaftar lewat Link Peserta." : "Buka pendaftaran supaya Link Peserta bisa dipakai."}</p>
          </div>
        </div>
        <button onClick={toggleRegistration} disabled={toggling}
          className={`w-full rounded-xl py-3.5 text-sm font-bold disabled:opacity-60 ${isOpen ? "border border-[#333] text-brand-light hover:bg-white/5" : "bg-brand-gold text-brand-dark hover:opacity-90"}`}>
          {toggling ? "Menyimpan…" : isOpen ? "Tutup pendaftaran" : "Buka pendaftaran"}
        </button>
        <LinkPesertaButton run={() => getRegisterLink(eventId)} title="Link pendaftaran untuk peserta" shareText={shareText} />

        <div className="space-y-3 border-t border-[#2a2d35] pt-5">
          <p className="text-sm font-bold text-white">Pesan ajakan mendaftar</p>
          <WaTemplate eventId={eventId} settings={settings} onSaved={() => void reload()} field="wa_invite_template" def={DEFAULT_WA_INVITE} hint="Dikirim bersama Link Peserta. {nama} menjadi Saudara/i kalau dibagikan ke banyak orang." />
        </div>
        <div className="space-y-3 border-t border-[#2a2d35] pt-5">
          <p className="text-sm font-bold text-white">Pesan QR untuk peserta lunas</p>
          <WaTemplate eventId={eventId} settings={settings} onSaved={() => void reload()} field="wa_template" def={DEFAULT_WA_TEMPLATE} hint="Dikirim ke peserta yang sudah lunas, berisi QR mereka." />
        </div>
      </Collapse>
    </div>
  );
}
