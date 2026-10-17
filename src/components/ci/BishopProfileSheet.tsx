"use client";

import { useEffect } from "react";
import { X, Church, MapPin, Globe, Cake, Cross, Quote, ExternalLink, UserRound } from "lucide-react";
import { KIND_LABEL, PROVINCE_COLORS, isCardinal, type Diocese } from "@/lib/catholicIndonesia";
import { findBishopProfile } from "@/lib/bishops";

const GOLD = "#D6B072";
const serif = { fontFamily: "'Lora', Georgia, serif" };

function Fact({ icon: Icon, label, value }: { icon: typeof Cake; label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: GOLD }} />
      <div>
        <div className="text-[10px] uppercase tracking-widest text-brand-muted">{label}</div>
        <div className="text-sm text-[#EAE5D9]">{value}</div>
      </div>
    </div>
  );
}

export default function BishopProfileSheet({ diocese, onClose }: { diocese: Diocese; onClose: () => void }) {
  const profile = findBishopProfile(diocese.bishop_name);
  const photo = diocese.bishop_photo_url || profile?.photo?.url || null;
  const color = PROVINCE_COLORS[diocese.province] ?? GOLD;
  const isAdministrator = /administrator/i.test(diocese.bishop_note ?? "");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={diocese.bishop_name ?? diocese.name}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-[#14171d] sm:max-w-xl sm:rounded-3xl"
        style={{ border: `1px solid ${GOLD}40`, boxShadow: `0 -10px 60px ${color}22` }}
      >
        <button onClick={onClose} aria-label="Tutup" className="absolute right-3 top-3 z-10 rounded-full bg-black/50 p-2 text-white backdrop-blur"><X className="h-4 w-4" /></button>

        {/* Header with photo */}
        <div className="relative px-5 pb-5 pt-6" style={{ background: `linear-gradient(170deg, ${color}26, transparent 70%)` }}>
          <div className="flex items-end gap-4">
            <div className="h-36 w-28 shrink-0 overflow-hidden rounded-2xl bg-[#1a1d24]" style={{ border: `2px solid ${GOLD}`, boxShadow: `0 0 24px ${GOLD}33` }}>
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt={diocese.bishop_name ?? ""} className="h-full w-full object-cover object-top" referrerPolicy="no-referrer" />
              ) : (
                <div className="flex h-full w-full items-center justify-center"><UserRound className="h-10 w-10 opacity-40" style={{ color: GOLD }} /></div>
              )}
            </div>
            <div className="min-w-0 pb-1">
              <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color }}>
                {isAdministrator ? "Administrator Apostolik" : `${isCardinal(diocese.bishop_name) ? "Kardinal · " : ""}${diocese.bishop_note || KIND_LABEL[diocese.kind]}`}
              </div>
              <h2 className="mt-1 text-xl font-semibold leading-snug text-white" style={serif}>
                {diocese.bishop_name ?? "Uskup belum diisi"}
              </h2>
              <p className="mt-1 text-sm text-[#EAE5D9]/80">{diocese.name}</p>
            </div>
          </div>
        </div>

        <div className="space-y-5 px-5 pb-8">
          {isAdministrator && (
            <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-100">
              {diocese.name} saat ini dalam keadaan takhta lowong (sede vacante) dan dipimpin sementara oleh Administrator Apostolik.
            </p>
          )}

          {profile ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Fact icon={Cake} label="Lahir" value={[profile.born, profile.birthPlace].filter(Boolean).join(" · ") || null} />
                <Fact icon={Cross} label="Tahbisan imam" value={profile.priest} />
                <Fact icon={Church} label="Tahbisan uskup" value={profile.bishop} />
                <Fact icon={MapPin} label="Keuskupan" value={`${KIND_LABEL[diocese.kind]} · ${diocese.city}`} />
              </div>

              {profile.motto && (
                <div className="rounded-2xl p-4" style={{ background: `${GOLD}10`, border: `1px solid ${GOLD}30` }}>
                  <Quote className="h-4 w-4" style={{ color: GOLD }} />
                  <p className="mt-1 italic leading-relaxed text-[#EAE5D9]" style={serif}>{profile.motto}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-widest text-brand-muted">Semboyan tahbisan</p>
                </div>
              )}

              <div>
                <h3 className="mb-2 text-xs uppercase tracking-[0.2em]" style={{ color: GOLD }}>Kisah &amp; Riwayat</h3>
                <div className="space-y-3 leading-relaxed text-[#EAE5D9]/90">
                  {profile.story.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)}
                </div>
              </div>

              <div className="space-y-1 border-t border-white/10 pt-4 text-[11px] leading-relaxed text-brand-muted">
                <a href={profile.source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-white">
                  Sumber teks: Wikipedia &ldquo;{profile.source.title}&rdquo; (CC BY-SA 4.0) <ExternalLink className="h-3 w-3" />
                </a>
                {profile.photo && !diocese.bishop_photo_url && (
                  <div>
                    Foto: {profile.photo.credit} · {profile.photo.license} ·{" "}
                    <a href={profile.photo.pageUrl} target="_blank" rel="noreferrer" className="underline hover:text-white">Wikimedia</a>
                  </div>
                )}
                <div>Data dapat berubah; mohon laporkan jika ada yang perlu diperbarui.</div>
              </div>
            </>
          ) : (
            <p className="rounded-xl bg-white/5 p-4 text-sm text-brand-muted">Profil lengkap uskup ini belum tersedia.</p>
          )}

          <div className="space-y-1.5 border-t border-white/10 pt-4 text-sm text-brand-muted">
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{diocese.city}</p>
            {diocese.cathedral && <p className="flex items-center gap-2"><Church className="h-4 w-4" />{diocese.cathedral}</p>}
            {diocese.website && (
              <a href={diocese.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white"><Globe className="h-4 w-4" />Situs resmi keuskupan</a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
