"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Pencil, X, Church, MapPin, Globe, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { KIND_LABEL, PROVINCE_COLORS, PROVINCE_ORDER, type Diocese } from "@/lib/catholicIndonesia";
import { findBishopProfile } from "@/lib/bishops";
import BishopProfileSheet from "./BishopProfileSheet";

const GOLD = "#D6B072";
const serif = { fontFamily: "'Lora', Georgia, serif" };

export default function DioceseDirectory({ dioceses, canEdit, initialOpen }: { dioceses: Diocese[]; canEdit: boolean; initialOpen?: string }) {
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Diocese | null>(null);
  const [viewing, setViewing] = useState<Diocese | null>(
    () => (initialOpen ? dioceses.find((d) => d.name.toLowerCase() === initialOpen.toLowerCase()) ?? null : null)
  );

  const groups = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = dioceses.filter((d) =>
      !s || [d.name, d.city, d.bishop_name, d.cathedral, d.province].some((v) => (v ?? "").toLowerCase().includes(s))
    );
    return PROVINCE_ORDER.map((p) => ({ province: p, items: list.filter((d) => d.province === p) })).filter((g) => g.items.length);
  }, [dioceses, q]);

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari keuskupan, kota, atau nama uskup…"
          className="w-full rounded-2xl border border-[#333] bg-[#111] py-3 pl-11 pr-4 text-sm text-white placeholder-brand-muted focus:border-[#D6B072]/60 focus:outline-none"
        />
      </div>

      {groups.map((g) => (
        <section key={g.province}>
          <h3 className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-brand-muted">
            <span className="h-2 w-2 rounded-full" style={{ background: PROVINCE_COLORS[g.province] }} />
            {g.province === "—" ? "Ordinariat" : `Provinsi Gerejawi ${g.province}`}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map((d) => (
              <article
                key={d.name}
                role="button"
                tabIndex={0}
                onClick={() => setViewing(d)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setViewing(d); } }}
                aria-label={`Profil ${d.bishop_name ?? d.name}`}
                className="relative cursor-pointer rounded-2xl bg-[#1a1d24] p-4 transition-colors hover:bg-[#20242c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D6B072]/60"
                style={{ border: `1px solid ${d.kind === "keuskupan_agung" ? `${GOLD}55` : "rgba(255,255,255,0.07)"}` }}
              >
                <div className="flex gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full" style={{ background: `${GOLD}14`, border: `1px solid ${GOLD}40` }}>
                    {(d.bishop_photo_url || findBishopProfile(d.bishop_name)?.photo?.url) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={d.bishop_photo_url || findBishopProfile(d.bishop_name)!.photo!.url} alt={d.bishop_name ?? ""} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover object-top" />
                    ) : (
                      <Church className="h-5 w-5" style={{ color: GOLD }} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] uppercase tracking-widest" style={{ color: d.kind === "keuskupan_agung" ? GOLD : "#9CA3AF" }}>
                      {KIND_LABEL[d.kind]}
                    </div>
                    <h4 className="font-semibold leading-snug text-white" style={serif}>{d.name}</h4>
                    <p className="mt-1 text-sm text-[#EAE5D9]">
                      {d.bishop_name || <span className="italic text-brand-muted">Belum diisi</span>}
                    </p>
                    {d.bishop_note && <p className="text-xs text-brand-muted">{d.bishop_note}</p>}
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-xs text-brand-muted">
                  <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{d.city}</p>
                  {d.cathedral && <p className="flex items-center gap-1.5"><Church className="h-3.5 w-3.5" />{d.cathedral}</p>}
                  {d.website && (
                    <a href={d.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white">
                      <Globe className="h-3.5 w-3.5" />Situs resmi
                    </a>
                  )}
                </div>
                {canEdit && d.id && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditing(d); }}
                    aria-label={`Ubah ${d.name}`}
                    className="absolute right-3 top-3 rounded-full p-1.5 text-brand-muted hover:bg-white/5 hover:text-white"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}

      {groups.length === 0 && <p className="py-10 text-center text-brand-muted">Tidak ada hasil.</p>}

      {viewing && <BishopProfileSheet diocese={viewing} onClose={() => setViewing(null)} />}
      {editing && <DioceseEditor diocese={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function DioceseEditor({ diocese, onClose }: { diocese: Diocese; onClose: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState({
    bishop_name: diocese.bishop_name ?? "",
    bishop_note: diocese.bishop_note ?? "",
    bishop_photo_url: diocese.bishop_photo_url ?? "",
    cathedral: diocese.cathedral ?? "",
    website: diocese.website ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setSaving(true);
    setError("");
    const clean = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim() || null]));
    const { error } = await createClient()
      .from("dioceses" as any)
      .update({ ...clean, updated_at: new Date().toISOString() })
      .eq("id", diocese.id!);
    setSaving(false);
    if (error) return setError(error.message);
    onClose();
    router.refresh();
  };

  const field = (key: keyof typeof form, label: string, placeholder = "") => (
    <label className="block">
      <span className="text-xs text-brand-muted">{label}</span>
      <input
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-[#333] bg-black/30 px-3 py-2 text-sm text-white focus:border-[#D6B072]/60 focus:outline-none"
      />
    </label>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-t-3xl bg-[#1a1d24] p-5 sm:rounded-3xl" style={{ border: `1px solid ${GOLD}40` }}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-white" style={serif}>{diocese.name}</h3>
          <button onClick={onClose} aria-label="Tutup" className="rounded-full p-1.5 text-brand-muted hover:text-white"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3">
          {field("bishop_name", "Nama uskup", "Mgr. …")}
          {field("bishop_note", "Keterangan", "Uskup / Uskup Agung / Administrator Apostolik")}
          {field("bishop_photo_url", "URL foto uskup (opsional)", "https://…")}
          {field("cathedral", "Katedral")}
          {field("website", "Situs resmi (opsional)", "https://…")}
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <button
          onClick={save}
          disabled={saving}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold text-[#121417] disabled:opacity-50"
          style={{ background: GOLD }}
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}Simpan
        </button>
      </div>
    </div>
  );
}
