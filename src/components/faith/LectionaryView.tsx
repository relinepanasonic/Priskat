import { BookOpen, ExternalLink, Sparkles } from "lucide-react";
import type { LectDay, LectItem } from "@/lib/mirifica";

const serif = { fontFamily: "'Lora', Georgia, serif" };

const COLORS: Record<string, string> = { hijau: "#22c55e", putih: "#f5f5f4", merah: "#ef4444", ungu: "#a855f7", "merah muda": "#f9a8d4", biru: "#60a5fa", hitam: "#737373" };

const TITLE: Record<LectItem["kind"], string> = {
  bacaan1: "Bacaan I", mazmur: "Mazmur Tanggapan", bacaan2: "Bacaan II", bait: "Bait Pengantar Injil", injil: "Bacaan Injil",
};

/**
 * Today's Mass readings laid out like the daily lectionary posts: the day and its saints, then Bacaan I,
 * Mazmur Tanggapan (refrain and verses), Bacaan II, Bait Pengantar Injil, Bacaan Injil, and Renungan Harian.
 */
export default function LectionaryView({ day }: { day: LectDay }) {
  const dot = COLORS[day.color.toLowerCase()] ?? "#D6B072";
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-brand-gold/30 bg-brand-gold/[0.07] p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">Hari ini dalam liturgi</p>
        <h2 className="mt-1 text-lg font-bold leading-snug text-white" style={serif}>{day.title}</h2>
        {day.celebrations.map((c) => (
          <p key={c} className="mt-0.5 text-sm font-medium text-brand-light">{c}</p>
        ))}
        {day.color && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-brand-muted">
            <span className="h-2.5 w-2.5 rounded-full border border-white/30" style={{ background: dot }} /> Warna liturgi: {day.color}
          </p>
        )}
      </div>

      {day.items.map((it, i) => (
        <section
          key={i}
          className={
            it.kind === "bait"
              ? "rounded-2xl border border-brand-gold/35 bg-gradient-to-br from-[#1e1b14] via-[#181a20] to-[#14171c] p-4"
              : "rounded-2xl border border-[#333] bg-[#1a1d24] p-4"
          }
        >
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">
            {it.kind === "bait" && <Sparkles className="h-3.5 w-3.5" />}
            {TITLE[it.kind]}
          </p>
          {it.ref && <h3 className="mt-0.5 text-base font-bold text-white" style={serif}>{it.ref}</h3>}
          {it.summary && it.kind !== "mazmur" && it.kind !== "bait" && (
            <p className="mt-2 text-[15px] italic leading-relaxed text-brand-gold/90" style={serif}>{it.summary}</p>
          )}

          {it.kind === "mazmur" && (
            <>
              {it.summary && (
                <p className="mt-2 rounded-xl bg-sky-400/10 px-3 py-2 text-[15px] italic leading-relaxed text-sky-200" style={serif}>
                  <span className="mr-1 text-[10px] font-bold not-italic uppercase tracking-wider text-sky-300">Refren{it.refren ? ` (${it.refren})` : ""}</span>
                  {it.summary}
                </p>
              )}
              <div className="mt-3 space-y-2.5">
                {it.verses.map((v, k) => (
                  <p key={k} className="text-[15px] leading-[1.8] text-[#EAE5D9]" style={serif}>{v}</p>
                ))}
                {it.paragraphs.map((p, k) => (
                  <p key={`p-${k}`} className="text-[15px] leading-[1.8] text-[#EAE5D9]" style={serif}>{p}</p>
                ))}
              </div>
            </>
          )}

          {it.kind === "bait" && (
            <div className="mt-2.5 space-y-2">
              {it.summary && (
                <p className="rounded-xl bg-brand-gold/10 px-3 py-2 text-[15px] italic leading-relaxed text-brand-gold" style={serif}>
                  {it.summary}
                </p>
              )}
              {it.intro && <p className="text-sm font-semibold text-white">{it.intro}</p>}
              {it.paragraphs.map((p, k) => (
                <p key={k} className="text-[15px] leading-[1.8] text-[#EAE5D9]" style={serif}>{p}</p>
              ))}
              {it.verses.map((v, k) => (
                <p key={`v-${k}`} className="text-[15px] leading-[1.8] text-[#EAE5D9]" style={serif}>{v}</p>
              ))}
            </div>
          )}

          {(it.kind === "bacaan1" || it.kind === "bacaan2" || it.kind === "injil") && (
            <div className="mt-3 space-y-2.5">
              {it.intro && <p className="text-sm font-semibold text-white">{it.intro}</p>}
              {it.paragraphs.map((p, k) => (
                <p key={k} className="text-[15px] leading-[1.85] text-[#EAE5D9]" style={serif}>{p}</p>
              ))}
              {it.closing && <p className="pt-1 text-sm font-semibold text-brand-gold">{it.closing}</p>}
            </div>
          )}
        </section>
      ))}

      {/* Renungan Harian (after Injil) */}
      {day.renungan && day.renungan.paragraphs.length > 0 && (
        <section className="card-lux p-5">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-brand-gold">
            <BookOpen className="h-3.5 w-3.5" />
            Renungan Harian
          </p>
          {day.renungan.title && day.renungan.title !== "Renungan Harian" && (
            <h3 className="mt-1 text-lg font-bold leading-snug text-white" style={serif}>
              {day.renungan.title}
            </h3>
          )}
          <div className="mt-3 space-y-3">
            {day.renungan.paragraphs.map((p, idx) => (
              <p key={idx} className="text-[15px] leading-[1.85] text-[#EAE5D9]" style={serif}>
                {p}
              </p>
            ))}
          </div>
        </section>
      )}

      <p className="flex flex-wrap items-center justify-center gap-x-1 text-center text-[11px] leading-relaxed text-brand-muted">
        Sumber bacaan & renungan: Komsos KWI, via{" "}
        <a href={day.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-brand-gold">
          mirifica.net <ExternalLink className="h-3 w-3" />
        </a>
      </p>
    </div>
  );
}
