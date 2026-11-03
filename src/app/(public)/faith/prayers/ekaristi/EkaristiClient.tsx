"use client";

import { Fragment, useEffect, useState } from "react";
import { ChevronDown, Info, Pencil, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ActivityTimer from "@/components/home/ActivityTimer";
import { MASS, SEASONS, type Part, type SeasonId } from "@/lib/ekaristi";

const GOLD = "#D6B072";
const serif = { fontFamily: "'Lora', Georgia, serif" };

export type TodayReading = { label: string; display: string; verses: { verse: number; text: string }[] };
export type LiturgyTexts = {
  mazmur_ulangan: string | null; mazmur_text: string | null;
  bacaan1_text: string | null; bacaan2_text: string | null; injil_text: string | null; bait_text: string | null;
  source: string | null;
};
type Override = LiturgyTexts | null;

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

/** Who speaks: the priest and the people get their own colours. */
const SPEAKERS: Record<string, { label: string; text: string; badge: string }> = {
  Imam: { label: "Imam", text: "text-amber-200", badge: "bg-amber-400/20 text-amber-300" },
  Umat: { label: "Umat", text: "text-sky-200", badge: "bg-sky-400/20 text-sky-300" },
  Pembaca: { label: "Pembaca", text: "text-emerald-200", badge: "bg-emerald-400/20 text-emerald-300" },
  Pemazmur: { label: "Pemazmur", text: "text-violet-200", badge: "bg-violet-400/20 text-violet-300" },
  Diakon: { label: "Diakon", text: "text-amber-200", badge: "bg-amber-400/20 text-amber-300" },
};

function Dialogue({ text }: { text: string }) {
  return (
    <div className="space-y-1.5 text-[15px] leading-[1.75]" style={serif}>
      {text.split("\n").map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />;
        const m = line.match(/^(Imam|Umat|Pembaca|Pemazmur|Diakon)\s*:\s*(.*)$/);
        if (!m) return <p key={i} className="text-[#EAE5D9]">{line}</p>;
        const sp = SPEAKERS[m[1]];
        return (
          <p key={i} className={sp.text}>
            <span className={`mr-2 inline-block rounded px-1.5 py-0.5 align-middle font-sans text-[10px] font-bold uppercase tracking-wider ${sp.badge}`}>{sp.label}</span>
            {m[2]}
          </p>
        );
      })}
    </div>
  );
}

function Verses({ verses }: { verses: { verse: number; text: string }[] }) {
  return (
    <p className="text-[15px] leading-[1.85] text-[#EAE5D9]" style={serif}>
      {verses.map((v) => (
        <Fragment key={v.verse}>
          <sup className="mr-0.5 font-sans text-[10px] text-brand-muted">{v.verse}</sup>
          {v.text}{" "}
        </Fragment>
      ))}
    </p>
  );
}

export default function EkaristiClient({
  defaultSeason, celebration, readings, day, texts, isAdmin,
}: { defaultSeason: SeasonId; celebration: string | null; readings: TodayReading[]; day: string; texts: Override; isAdmin: boolean }) {
  const mazmurOverride = texts;
  const [seasonId, setSeasonId] = useState<SeasonId>(defaultSeason);
  const [open, setOpen] = useState<string | null>(null);
  const [dsa, setDsa] = useState<number>(1);
  const [dsaText, setDsaText] = useState<Record<number, string | "loading" | "none">>({});
  const [editing, setEditing] = useState(false);
  const season = SEASONS.find((s) => s.id === seasonId)!;

  // Doa Syukur Agung text, loaded when a number is chosen
  useEffect(() => {
    if (open === null || dsaText[dsa] !== undefined) return;
    const isDsaOpen = MASS.some((g) => g.parts.some((p) => p.dsa && `${g.title}-${p.title}` === open));
    if (!isDsaOpen) return;
    setDsaText((t) => ({ ...t, [dsa]: "loading" }));
    (async () => {
      const { data } = await createClient().from("prayers" as any).select("body_id").eq("slug", `doa-syukur-agung-${dsa}`).maybeSingle();
      const body = String((data as any)?.body_id ?? "").trim();
      setDsaText((t) => ({ ...t, [dsa]: !body || body.startsWith("[") ? "none" : body }));
    })();
  }, [open, dsa, dsaText]);

  let n = 0;

  const lectionary = (label: string | undefined) =>
    label === "Bacaan I" ? texts?.bacaan1_text : label === "Bacaan II" ? texts?.bacaan2_text : label === "Injil" ? texts?.injil_text : null;

  const editButton = isAdmin && (
    <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: GOLD }}>
      <Pencil className="h-3.5 w-3.5" /> Isi / ubah teks Misa hari ini
    </button>
  );

  const baitBlock = (p: Part) => (
    <div className="space-y-3">
      {p.text && <Dialogue text={p.text} />}
      {texts?.bait_text && (
        <p className="whitespace-pre-line rounded-xl bg-emerald-400/10 px-3 py-2 text-[15px] italic leading-[1.8] text-emerald-200" style={serif}>{texts.bait_text}</p>
      )}
      {editButton}
    </div>
  );

  const readingBlock = (p: Part) => {
    const r = readings.find((x) => x.label === p.reading);
    const own = lectionary(p.reading);
    if (own && r) {
      return (
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: GOLD }}>{r.display}</p>
          <p className="whitespace-pre-line text-[15px] leading-[1.85] text-[#EAE5D9]" style={serif}>{own}</p>
          {p.reading !== "Injil" && <Dialogue text={"Pembaca: Demikianlah sabda Tuhan.\nUmat: Syukur kepada Allah."} />}
          {editButton}
        </div>
      );
    }
    if (!r) {
      return <p className="text-sm text-brand-muted">{p.reading === "Bacaan II" ? "Hari ini tidak ada Bacaan II." : readings.length === 0 ? "Bacaan hari ini belum bisa dimuat." : "Bacaan ini tidak ada hari ini."}</p>;
    }
    if (p.reading === "Mazmur") {
      return (
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: GOLD }}>{r.display}</p>
          {mazmurOverride?.mazmur_ulangan && (
            <p className="rounded-xl bg-sky-400/10 px-3 py-2 text-[15px] italic text-sky-200" style={serif}>
              <span className="mr-2 inline-block rounded bg-sky-400/20 px-1.5 py-0.5 align-middle font-sans text-[10px] font-bold not-italic uppercase tracking-wider text-sky-300">Ulangan · Umat</span>
              {mazmurOverride.mazmur_ulangan}
            </p>
          )}
          {mazmurOverride?.mazmur_text ? (
            <p className="whitespace-pre-line text-[15px] leading-[1.85] text-violet-200" style={serif}>{mazmurOverride.mazmur_text}</p>
          ) : (
            <>
              <Verses verses={r.verses} />
              <p className="text-[11px] text-brand-muted">Teks dari Terjemahan Baru. Mazmur Tanggapan di Misa memakai teks lektionari dengan ulangan, jadi kata-katanya bisa sedikit berbeda.</p>
            </>
          )}
          {mazmurOverride?.source && <p className="text-[11px] text-brand-muted">Sumber: {mazmurOverride.source}</p>}
          {editButton}
        </div>
      );
    }
    return (
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: GOLD }}>{r.display}</p>
        <Verses verses={r.verses} />
        {p.reading !== "Injil" && <Dialogue text={"Pembaca: Demikianlah sabda Tuhan.\nUmat: Syukur kepada Allah."} />}
        {editButton}
      </div>
    );
  };

  const dsaBlock = () => {
    const t = dsaText[dsa];
    return (
      <div className="space-y-3">
        <div className="-mx-1 flex flex-wrap gap-1.5">
          {ROMAN.map((r, i) => (
            <button
              key={r}
              onClick={() => setDsa(i + 1)}
              className={`min-w-[2.5rem] rounded-full px-3 py-1.5 text-xs font-bold transition ${dsa === i + 1 ? "bg-brand-gold text-brand-dark" : "bg-[#1a1d24] text-brand-muted"}`}
            >
              {r}
            </button>
          ))}
        </div>
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: GOLD }}>Doa Syukur Agung {ROMAN[dsa - 1]}</p>
        {t === undefined || t === "loading" ? (
          <p className="text-sm text-brand-muted">Memuat…</p>
        ) : t === "none" ? (
          <p className="text-sm text-brand-muted">Teks Doa Syukur Agung {ROMAN[dsa - 1]} belum tersedia.</p>
        ) : (
          <>
            <Dialogue text={t} />
            <p className="text-[11px] text-brand-muted">Termasuk aklamasi anamnesis dan doksologi dengan Amin.</p>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6">
      <ActivityTimer kind="ekaristi" refId="mass" seconds={20} />
      <h1 className="text-2xl font-bold text-white" style={serif}>Perayaan Ekaristi</h1>
      <p className="mt-1 text-sm text-brand-muted">Urutan Misa dari awal sampai berkat penutup. Pilih masa liturgi untuk melihat perbedaannya.</p>

      <div className="-mx-4 mt-4 overflow-x-auto px-4 pb-2 hide-scrollbar md:mx-0 md:px-0" data-noswipe>
        <div className="flex min-w-max gap-2">
          {SEASONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSeasonId(s.id)}
              className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition ${s.id === seasonId ? "border-brand-gold bg-brand-gold text-brand-dark" : "border-[#333] text-brand-light hover:border-brand-gold/50"}`}
            >
              <span className="h-2.5 w-2.5 rounded-full border border-black/30" style={{ background: s.dot }} />
              {s.label}
            </button>
          ))}
        </div>
      </div>
      {celebration && seasonId === defaultSeason && <p className="mt-1 text-[11px] text-brand-muted">Hari ini: {celebration}</p>}

      <div className="mt-4 rounded-2xl border bg-[#14171c] p-4" style={{ borderColor: `${GOLD}33` }}>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full border border-black/30" style={{ background: season.dot }} />
          <p className="text-sm font-bold text-white">{season.label}</p>
          <span className="text-xs text-brand-muted">· warna liturgi: {season.color}</span>
        </div>
        <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-brand-light">
          <li>• Madah Kemuliaan: <b>{season.gloria ? "dinyanyikan" : "tidak dinyanyikan"}</b></li>
          <li>• Bait Pengantar Injil: <b>{season.acclamation}</b></li>
          <li>• {season.credo}</li>
          {season.notes.map((t) => <li key={t}>• {t}</li>)}
        </ul>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-brand-muted">
        {(["Imam", "Umat", "Pembaca", "Pemazmur"] as const).map((k) => (
          <span key={k} className="flex items-center gap-1.5"><span className={`rounded px-1.5 py-0.5 font-bold ${SPEAKERS[k].badge}`}>{k}</span></span>
        ))}
      </div>

      <div className="mt-4 space-y-6">
        {MASS.map((group) => (
          <section key={group.title}>
            <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: GOLD }}>{group.title}</h2>
            <div className="space-y-2">
              {group.parts.map((p) => {
                if (p.onlyIf === "gloria" && !season.gloria) return null;
                n += 1;
                const key = `${group.title}-${p.title}`;
                const isOpen = open === key;
                const hasMore = !!p.text || !!p.link || !!p.reading || !!p.dsa;
                return (
                  <div key={key} data-part className="scroll-mt-24 rounded-2xl border border-[#2a2d35] bg-[#14171c]">
                    <button
                      onClick={(e) => {
                        if (!hasMore) return;
                        const card = e.currentTarget.closest("[data-part]");
                        setOpen(isOpen ? null : key);
                        if (!isOpen) requestAnimationFrame(() => requestAnimationFrame(() => card?.scrollIntoView({ block: "start", behavior: "smooth" })));
                      }}
                      className="flex w-full items-start gap-3 p-3.5 text-left"
                      aria-expanded={isOpen}
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold" style={{ background: `${GOLD}1f`, color: GOLD }}>{n}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-white">{p.title}</span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-brand-muted">{p.what}</span>
                      </span>
                      {hasMore && <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-brand-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />}
                    </button>
                    {isOpen && (
                      <div className="border-t border-[#2a2d35] px-4 pb-4 pt-3">
                        {p.reading === "Bait" ? baitBlock(p) : p.reading === "Injil" && p.text ? (
                          <div className="space-y-3">
                            <Dialogue text={p.text.split("\n...\n")[0]} />
                            {readingBlock(p)}
                            <Dialogue text={p.text.split("\n...\n")[1] ?? ""} />
                          </div>
                        ) : p.reading ? readingBlock(p) : p.dsa ? dsaBlock() : p.text ? <Dialogue text={p.text} /> : null}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-6 flex items-start gap-2 rounded-xl bg-white/5 p-3 text-[11px] leading-relaxed text-brand-muted">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Teks dan urutan di sini adalah ringkasan untuk membantu umat mengikuti Misa. Rumusan resmi mengikuti Tata Perayaan Ekaristi yang dipakai di parokimu, dan bisa sedikit berbeda menurut edisi dan kebiasaan setempat.
      </p>

      {editing && <TextsEditor day={day} initial={texts} onClose={() => setEditing(false)} />}
    </div>
  );
}

function TextsEditor({ day, initial, onClose }: { day: string; initial: Override; onClose: () => void }) {
  const [v, setV] = useState({
    mazmur_ulangan: initial?.mazmur_ulangan ?? "", mazmur_text: initial?.mazmur_text ?? "",
    bacaan1_text: initial?.bacaan1_text ?? "", bacaan2_text: initial?.bacaan2_text ?? "",
    bait_text: initial?.bait_text ?? "", injil_text: initial?.injil_text ?? "", source: initial?.source ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const input = "w-full rounded-lg border border-[#333] bg-[#14171c] px-3 py-2.5 text-sm text-white focus:border-brand-gold focus:outline-none";
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => setV((x) => ({ ...x, [k]: e.target.value }));
  const fields: [keyof typeof v, string, number][] = [
    ["bacaan1_text", "Bacaan I", 7], ["mazmur_ulangan", "Mazmur: Ulangan (refren umat)", 2], ["mazmur_text", "Mazmur: ayat-ayat (satu bait per paragraf)", 8],
    ["bacaan2_text", "Bacaan II (jika ada)", 7], ["bait_text", "Bait Pengantar Injil", 3], ["injil_text", "Injil", 9],
  ];

  async function save() {
    setBusy(true);
    setErr(null);
    const supabase = createClient();
    const { data: u } = await supabase.auth.getUser();
    const row: Record<string, unknown> = { day, updated_by: u.user?.id, updated_at: new Date().toISOString() };
    for (const k of Object.keys(v) as (keyof typeof v)[]) row[k] = v[k].trim() || null;
    const { error } = await supabase.from("liturgy_texts" as any).upsert(row as any);
    setBusy(false);
    if (error) { setErr(error.message); return; }
    window.location.reload();
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/70 md:items-center" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="relative max-h-[90vh] w-full max-w-md space-y-3 overflow-y-auto rounded-t-3xl border border-[#333] bg-[#1a1d24] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:rounded-3xl">
        <button onClick={onClose} aria-label="Tutup" className="absolute right-3 top-3 rounded-full p-1.5 text-gray-400 hover:bg-white/10"><X className="h-5 w-5" /></button>
        <h3 className="text-lg font-bold text-white">Teks Misa hari ini</h3>
        <p className="text-xs text-brand-muted">Tanggal {day}. Isi hanya yang perlu. Bagian yang kosong memakai teks Alkitab (Terjemahan Baru).</p>
        {fields.map(([k, label, rows]) => (
          <div key={k}><label className="mb-1 block text-xs text-brand-muted">{label}</label><textarea className={input} rows={rows} value={v[k]} onChange={set(k)} /></div>
        ))}
        <div><label className="mb-1 block text-xs text-brand-muted">Sumber (opsional)</label><input className={input} value={v.source} onChange={set("source")} /></div>
        {err && <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{err}</p>}
        <button onClick={save} disabled={busy} className="w-full rounded-xl bg-brand-gold py-3 text-sm font-bold text-brand-dark disabled:opacity-60">{busy ? "Menyimpan…" : "Simpan"}</button>
      </div>
    </div>
  );
}
