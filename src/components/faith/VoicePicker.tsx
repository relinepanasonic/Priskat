"use client";

import { useEffect, useState } from "react";
import { AudioLines, Check, X } from "lucide-react";
import { getChosenVoice, listDeviceVoices, previewVoice, setChosenVoice, type DeviceVoice } from "@/lib/readAloud";

/** Button + sheet to choose which voice installed on the phone reads the Bible. */
export default function VoicePicker({ lang, isId, className = "", dark = false }: { lang: "id" | "en"; isId: boolean; className?: string; dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const [voices, setVoices] = useState<DeviceVoice[]>([]);
  const [chosen, setChosen] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setChosen(getChosenVoice(lang));
    void listDeviceVoices(lang).then((v) => { setVoices(v); setLoading(false); });
  }, [open, lang]);

  const pick = (id: string | null) => {
    setChosen(id);
    setChosenVoice(lang, id);
    void previewVoice(lang);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={isId ? "Pilih suara" : "Choose voice"}
        className={className || `flex items-center gap-1 rounded-full px-2.5 py-2 ${dark ? "text-white hover:bg-white/10" : "text-gray-600 active:bg-black/5"}`}
      >
        <AudioLines className="h-4 w-4" />
        <span className="font-sans text-[10px] font-bold">{isId ? "Suara" : "Voice"}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 md:items-center" onClick={() => setOpen(false)}>
          <div
            className="flex max-h-[80vh] w-full max-w-md flex-col rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)] font-sans text-gray-900 shadow-2xl md:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
              <h3 className="text-base font-bold">{isId ? "Pilih suara pembaca" : "Choose reading voice"}</h3>
              <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-full p-1.5 active:bg-black/5"><X className="h-5 w-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              <button onClick={() => pick(null)} className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left active:bg-black/5">
                <span className="text-sm font-semibold">{isId ? "Bawaan perangkat" : "Device default"}</span>
                {!chosen && <Check className="h-4 w-4 text-amber-600" />}
              </button>

              {loading && <p className="px-3 py-4 text-sm text-gray-500">{isId ? "Memuat suara…" : "Loading voices…"}</p>}
              {!loading && voices.map((v, i) => (
                <button key={v.id} onClick={() => pick(v.id)} className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left active:bg-black/5">
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{isId ? "Suara" : "Voice"} {i + 1}</span>
                    <span className="block truncate text-[11px] text-gray-500">{v.name} · {v.local ? (isId ? "offline" : "offline") : "online"}</span>
                  </span>
                  {chosen === v.id && <Check className="h-4 w-4 shrink-0 text-amber-600" />}
                </button>
              ))}
              {!loading && voices.length < 2 && (
                <p className="mt-2 rounded-xl bg-amber-50 px-3 py-3 text-xs leading-relaxed text-amber-900">
                  {isId
                    ? "Hanya ada sedikit suara di perangkat ini. Untuk suara yang lebih natural (termasuk suara pria): Pengaturan → Sistem → Bahasa & input → Output teks-ke-ucapan → Layanan Ucapan Google → Instal data suara → Bahasa Indonesia, lalu pilih varian lain."
                    : "Only a few voices are installed on this device. For more natural voices: Settings → System → Languages & input → Text-to-speech output → Speech Services by Google → Install voice data."}
                </p>
              )}
              <p className="px-3 pt-3 text-[11px] text-gray-400">{isId ? "Ketuk sebuah suara untuk mendengar contohnya." : "Tap a voice to hear a sample."}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
