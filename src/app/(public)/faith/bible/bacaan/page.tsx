import Link from "next/link";
import { ArrowLeft, ChevronDown, Church } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTodayReadings, jakartaParts } from "@/lib/bacaanHarian";
import { loadReadingVerses, readingTitle } from "@/lib/readingText";
import ActivityTimer from "@/components/home/ActivityTimer";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bacaan Hari Ini" };

const serif = { fontFamily: "'Lora', Georgia, serif" };

export default async function TodayReadingPage() {
  const day = await getTodayReadings();
  const supabase = await createClient();

  // The text of every reading, from our own Bible (TB; deuterocanonical books only exist in NRSV-CE)
  const verses = await Promise.all((day?.readings ?? []).map((r) => loadReadingVerses(supabase, r.segments)));

  // The lectionary wording an admin entered for today wins over the Bible text
  const { day: dd, month, year } = jakartaParts();
  const { data: own } = await supabase
    .from("liturgy_texts" as any)
    .select("mazmur_ulangan, mazmur_text, bacaan1_text, bacaan2_text, injil_text")
    .eq("day", `${year}-${String(month).padStart(2, "0")}-${String(dd).padStart(2, "0")}`)
    .maybeSingle();
  const lect = own as { mazmur_ulangan: string | null; mazmur_text: string | null; bacaan1_text: string | null; bacaan2_text: string | null; injil_text: string | null } | null;
  const ownText = (label: string) =>
    label === "Bacaan I" ? lect?.bacaan1_text : label === "Bacaan II" ? lect?.bacaan2_text : label === "Injil" ? lect?.injil_text : label === "Mazmur" ? lect?.mazmur_text : null;

  const today = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });

  return (
    <div className="w-full max-w-2xl space-y-5 p-4 pb-8 md:p-6">
      <ActivityTimer kind="reading" refId="today" seconds={20} />
      <Link href="/faith" className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Hari Ini
      </Link>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand-gold">Bacaan Hari Ini</p>
        <h1 className="mt-1 text-2xl font-bold text-white" style={serif}>{today}</h1>
        {day?.celebration && <p className="mt-1 text-sm text-brand-light">{day.celebration}</p>}
      </div>

      {!day ? (
        <div className="rounded-2xl border border-[#333] bg-[#1a1d24] p-6 text-center text-sm text-brand-muted">
          Bacaan hari ini belum bisa dimuat. Coba lagi sebentar lagi.
        </div>
      ) : (
        <div className="space-y-3">
          {day.readings.map((r, i) => (
            <details key={i} className="group rounded-2xl border border-[#333] bg-[#1a1d24] transition-colors open:border-brand-gold/40">
              <summary className="flex cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">{r.label}</p>
                  <p className="mt-0.5 font-semibold text-white">{readingTitle(r.display, r.book)}</p>
                </div>
                <ChevronDown className="h-5 w-5 shrink-0 text-brand-muted transition-transform group-open:rotate-180" />
              </summary>
              <div className="border-t border-[#2a2d35] px-4 pb-4 pt-3">
                {r.label === "Mazmur" && lect?.mazmur_ulangan && (
                  <p className="mb-3 rounded-xl bg-sky-400/10 px-3 py-2 text-[15px] italic text-sky-200" style={serif}>{lect.mazmur_ulangan}</p>
                )}
                {ownText(r.label) ? (
                  <p className="whitespace-pre-line text-[15px] leading-[1.85] text-[#EAE5D9]" style={serif}>{ownText(r.label)}</p>
                ) : verses[i].length ? (
                  <p className="text-[15px] leading-[1.85] text-[#EAE5D9]" style={serif}>
                    {verses[i].map((v) => (
                      <span key={`${v.chapter}-${v.verse}`}>
                        <sup className="mr-0.5 font-sans text-[10px] text-brand-muted">{v.verse}</sup>
                        {v.text}{" "}
                      </span>
                    ))}
                  </p>
                ) : (
                  <p className="text-sm text-brand-muted">Teks bacaan ini belum bisa dimuat.</p>
                )}
              </div>
            </details>
          ))}
          <Link href="/faith/prayers/ekaristi" className="flex items-center justify-center gap-2 pt-1 text-xs font-semibold text-brand-gold">
            <Church className="h-4 w-4" /> Ikuti urutan Misa lengkap
          </Link>
          <p className="text-center text-[11px] text-brand-muted">Bacaan Misa Gereja Katolik Indonesia</p>
        </div>
      )}
    </div>
  );
}
